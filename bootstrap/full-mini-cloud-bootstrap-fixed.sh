#!/usr/bin/env bash
set -euo pipefail
# full-mini-cloud-bootstrap-fixed.sh
# Single-node automated "mini-cloud" deployment for Ubuntu 22.04 LTS
# Installs: k3s, helm, longhorn, traefik, minio, openfaas, n8n, keycloak, vault(dev), nats, rabbitmq,
# prometheus+grafana+loki, gitea+drone, velero. Tuned for 16GB RAM single-node.
# Run as root: sudo ./full-mini-cloud-bootstrap-fixed.sh

### ---------------- CONFIGURATION ----------------
K3S_VERSION="v1.28.6+k3s1"
KUBECONFIG_PATH="/etc/rancher/k3s/k3s.yaml"
BACKUP_LOCAL_DIR="/var/backups/k8s"
HOSTNAME="$(hostname -f || hostname)"
MINIO_ACCESS_KEY=""
MINIO_SECRET_KEY=""
GITEA_ADMIN_USER="admin"
GITEA_ADMIN_PASS=""
OPENFAAS_PASSWORD=""
DRONE_RPC_SECRET=""
REGION="${REGION:-local}"         # used by Velero local/demo config; override by exporting REGION before running
HELM_WAIT_TIMEOUT="600s"  # Increased to 10 minutes for resource-constrained instances
# persistence scale tiers will be set automatically based on disk size
### ------------------------------------------------

# helper: random secret
rand() { head -c 48 /dev/urandom | base64 | tr -d '/+=' | cut -c1-24; }

# helper: cleanup stuck helm releases
cleanup_helm_release() {
  local release=$1
  local namespace=$2
  echo "Checking for stuck Helm release: $release in namespace $namespace"
  
  # Check if release exists
  if helm list -n "$namespace" 2>/dev/null | grep -q "$release"; then
    echo "Found existing release $release, attempting cleanup..."
    
    # Force delete any pending operations by deleting the secret
    kubectl delete secret -n "$namespace" -l owner=helm,name="$release",status=pending-upgrade 2>/dev/null || true
    kubectl delete secret -n "$namespace" -l owner=helm,name="$release",status=pending-install 2>/dev/null || true
    
    # Try to uninstall
    helm uninstall "$release" -n "$namespace" --wait --timeout=60s 2>/dev/null || true
    
    # Force delete any remaining resources
    kubectl delete statefulset -n "$namespace" "$release" --force --grace-period=0 2>/dev/null || true
    kubectl delete deployment -n "$namespace" "$release" --force --grace-period=0 2>/dev/null || true
    kubectl delete pvc -n "$namespace" -l app="$release" 2>/dev/null || true
    
    echo "Cleanup complete, waiting 10 seconds..."
    sleep 10
  fi
}

# Trap to print helpful message on failure
trap 'echo "ERROR: script failed at line $LINENO. Check logs above." >&2' ERR

# ensure running as root
if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root. Use sudo." >&2
  exit 1
fi

echo "STEP 0: prepare system"
export DEBIAN_FRONTEND=noninteractive

# Wait for apt locks to be released (common on new EC2 instances)
echo "Waiting for apt locks to be released..."
while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || \
      sudo fuser /var/lib/apt/lists/lock >/dev/null 2>&1 || \
      sudo fuser /var/lib/dpkg/lock >/dev/null 2>&1; do
  echo "Waiting for other apt processes to finish..."
  sleep 5
done

echo "Apt locks released, proceeding with installation..."
apt-get update -y
apt-get install -y curl wget git apt-transport-https ca-certificates gnupg lsb-release jq

# generate secrets if not provided
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-"minio$(rand | tr '[:upper:]' '[:lower:]' | cut -c1-8)"}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY:-"minio$(rand | tr '[:upper:]' '[:lower:]' | cut -c1-12)"}
GITEA_ADMIN_PASS=${GITEA_ADMIN_PASS:-$(rand)}
OPENFAAS_PASSWORD=${OPENFAAS_PASSWORD:-$(rand)}
DRONE_RPC_SECRET=${DRONE_RPC_SECRET:-$(rand)}

echo "Generated secrets (sensitive values are hidden):"
echo " MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}"
echo " MINIO_SECRET_KEY=(hidden)"
echo " GITEA_ADMIN_USER=${GITEA_ADMIN_USER}"
echo " GITEA_ADMIN_PASS=(hidden)"
echo " OPENFAAS_PASSWORD=(hidden)"
echo

echo "Detecting disk size to pick persistence tiers..."
ROOT_SIZE_GB=$(df --output=size -BG / | tail -1 | tr -dc '0-9')
if [ "$ROOT_SIZE_GB" -lt 150 ]; then
  echo "Detected small disk (<150GB). Using small persistence values."
  MINIO_SIZE="10Gi"
  GITEA_SIZE="2Gi"
  POSTGRES_SIZE="2Gi"
  KEYCLOAK_PV="2Gi"
  BACKUP_DIR_SIZE="20G"
elif [ "$ROOT_SIZE_GB" -lt 350 ]; then
  echo "Detected medium disk (<350GB)."
  MINIO_SIZE="30Gi"
  GITEA_SIZE="5Gi"
  POSTGRES_SIZE="4Gi"
  KEYCLOAK_PV="4Gi"
  BACKUP_DIR_SIZE="50G"
else
  echo "Detected large disk (>=350GB)."
  MINIO_SIZE="100Gi"
  GITEA_SIZE="10Gi"
  POSTGRES_SIZE="8Gi"
  KEYCLOAK_PV="8Gi"
  BACKUP_DIR_SIZE="120G"
fi

echo "STEP 1: Install k3s (disabled builtin traefik)"
export INSTALL_K3S_EXEC="--disable=traefik --write-kubeconfig-mode=644"
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=${K3S_VERSION} sh -
export KUBECONFIG=${KUBECONFIG_PATH}

echo "Waiting for Kubernetes to be ready..."
# Wait for node Ready (may take a little)
kubectl wait --for=condition=Ready nodes --all --timeout=180s || true

echo "STEP 2: Install helm if missing"
if ! command -v helm >/dev/null 2>&1; then
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

echo "Create namespaces"
for ns in ingress monitoring storage platform workflows openfaas openfaas-fn ci velero apps demo; do
  kubectl create namespace ${ns} --dry-run=client -o yaml | kubectl apply -f -
done

# Add all helm repos we'll use
echo "Adding/updating Helm repositories..."
helm repo add longhorn https://charts.longhorn.io || true
helm repo add traefik https://traefik.github.io/charts || true
helm repo add minio https://charts.min.io/ || true
helm repo add codecentric https://codecentric.github.io/helm-charts || true
helm repo add hashicorp https://helm.releases.hashicorp.com || true
helm repo add nats https://nats-io.github.io/k8s/helm/charts/ || true
helm repo add bitnami https://charts.bitnami.com/bitnami || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo add grafana https://grafana.github.io/helm-charts || true
helm repo add grafana-loki https://grafana.github.io/loki/charts || true
helm repo add openfaas https://openfaas.github.io/faas-netes/ || true
helm repo add n8n https://n8n-io.github.io/n8n/ || true
helm repo add gitea-charts https://dl.gitea.io/charts/ || true
helm repo add drone https://charts.drone.io || true
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts || true
helm repo update

echo "STEP 3: Install Longhorn for block storage"
kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.4.4/deploy/longhorn.yaml
echo "Waiting for longhorn-manager to become available (180s)..."
kubectl -n longhorn-system rollout status deploy/longhorn-manager --timeout=${HELM_WAIT_TIMEOUT} || true

echo "STEP 4: Install Traefik via Helm (NodePort for simplicity)"
helm upgrade --install traefik traefik/traefik   --namespace ingress   --set dashboard.enabled=true   --set service.type=NodePort   --set ports.web.nodePort=30080   --set ports.websecure.nodePort=30443   --set rbac.enabled=true   --wait --timeout=${HELM_WAIT_TIMEOUT}

echo "STEP 5: Install MinIO (S3-compatible)"
cleanup_helm_release "minio" "storage"
helm upgrade --install minio minio/minio --namespace storage   --set mode=standalone   --set replicas=1   --set accessKey=${MINIO_ACCESS_KEY}   --set secretKey=${MINIO_SECRET_KEY}   --set persistence.size=${MINIO_SIZE}   --set resources.requests.memory="512Mi"   --set resources.requests.cpu="300m"   --wait --timeout=${HELM_WAIT_TIMEOUT}

echo "STEP 6: Keycloak (identity) + Postgres"
cleanup_helm_release "keycloak" "platform"
helm upgrade --install keycloak codecentric/keycloak --namespace platform   --set replicaCount=1   --set postgresql.enabled=true   --set keycloak.persistence.size=${KEYCLOAK_PV}   --set resources.requests.memory="256Mi"   --set resources.requests.cpu="200m"   --wait --timeout=${HELM_WAIT_TIMEOUT} || echo "Keycloak installation failed, continuing..."

echo "STEP 7: Vault (dev-mode for bootstrap; change for prod)"
helm upgrade --install vault hashicorp/vault --namespace platform   --set "server.dev.enabled=true"   --set resources.requests.memory="128Mi"   --set resources.requests.cpu="100m"   --wait --timeout=${HELM_WAIT_TIMEOUT}
echo "NOTE: Vault is running in dev-mode for bootstrap. Do NOT use dev-mode in production."

echo "STEP 8: Messaging (NATS + RabbitMQ)"
helm upgrade --install nats nats/nats --namespace apps --set replicaCount=1 --set resources.requests.memory="64Mi" --set resources.requests.cpu="50m" --wait --timeout=${HELM_WAIT_TIMEOUT}
helm upgrade --install rabbitmq bitnami/rabbitmq --namespace apps   --set replicaCount=1   --set resources.requests.memory="128Mi"   --set resources.requests.cpu="100m"   --set auth.username=admin   --set auth.password=adminpassword   --wait --timeout=${HELM_WAIT_TIMEOUT}

echo "STEP 9: Observability (Prometheus + Grafana + Loki)"
helm upgrade --install kube-prometheus prometheus-community/kube-prometheus-stack --namespace monitoring   --set prometheus.prometheusSpec.replicas=1   --set prometheus.prometheusSpec.resources.requests.memory="256Mi"   --set prometheus.prometheusSpec.resources.requests.cpu="200m"   --set alertmanager.alertmanagerSpec.replicas=1   --set grafana.enabled=true   --set grafana.replicas=1   --set grafana.resources.requests.memory="256Mi"   --set grafana.resources.requests.cpu="200m"   --wait --timeout=${HELM_WAIT_TIMEOUT}

helm upgrade --install loki grafana/loki-stack --namespace monitoring   --set loki.replicas=1   --set promtail.enabled=true   --set promtail.resources.requests.memory="64Mi"   --set promtail.resources.requests.cpu="50m"   --wait --timeout=${HELM_WAIT_TIMEOUT}

echo "STEP 10: OpenFaaS (serverless)"
helm upgrade --install openfaas openfaas/openfaas --namespace openfaas   --set functionNamespace=openfaas-fn   --set basicAuth=true   --set gateway.replicas=1   --set ingress.enabled=false   --set faasnetes.imagePullPolicy=IfNotPresent   --wait --timeout=${HELM_WAIT_TIMEOUT}

# create basic-auth secret for OpenFaaS (change in prod)
kubectl -n openfaas create secret generic basic-auth   --from-literal=basic-auth-user=admin   --from-literal=basic-auth-password="${OPENFAAS_PASSWORD}" || true

echo "STEP 11: n8n (workflow automation)"
helm upgrade --install n8n n8n/n8n --namespace workflows   --set persistence.enabled=true   --set persistence.size=${POSTGRES_SIZE}   --set replicaCount=1   --set postgresql.enabled=true   --set resources.requests.memory="256Mi"   --set resources.requests.cpu="200m"   --wait --timeout=${HELM_WAIT_TIMEOUT}

echo "STEP 12: Gitea + Drone (Git + CI)"
helm upgrade --install gitea gitea-charts/gitea --namespace ci   --set replicaCount=1   --set persistence.size=${GITEA_SIZE}   --set resources.requests.memory="256Mi"   --set resources.requests.cpu="200m"   --set admin.user=${GITEA_ADMIN_USER}   --set admin.password=${GITEA_ADMIN_PASS}   --wait --timeout=${HELM_WAIT_TIMEOUT}

helm upgrade --install drone drone/drone --namespace ci   --set replicaCount=1   --set env.DRONE_GITEA_SERVER=http://gitea.ci.svc.cluster.local   --set env.DRONE_RPC_SECRET=${DRONE_RPC_SECRET}   --set resources.requests.memory="128Mi"   --set resources.requests.cpu="100m"   --wait --timeout=${HELM_WAIT_TIMEOUT}

echo "STEP 13: Velero (backup) - local demo configuration"
mkdir -p "${BACKUP_LOCAL_DIR}"
kubectl create namespace velero --dry-run=client -o yaml | kubectl apply -f -
# For a simple local demo, Velero can be configured with a hostPath via a custom BackupStorageLocation
# Production: configure S3 / Azure blob / or remote backend and credentials.
helm upgrade --install velero vmware-tanzu/velero --namespace velero   --set configuration.provider=aws   --set configuration.backupStorageLocation.name=local   --set configuration.backupStorageLocation.bucket=velero-local   --set configuration.backupStorageLocation.config.region=${REGION}   --wait --timeout=${HELM_WAIT_TIMEOUT} || true

echo "STEP 14: Sample demo app (nginx) to verify cluster"
kubectl create ns demo --dry-run=client -o yaml | kubectl apply -f -
kubectl -n demo apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hello-nginx
  template:
    metadata:
      labels:
        app: hello-nginx
    spec:
      containers:
      - name: nginx
        image: nginx:stable
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: hello-nginx
spec:
  selector:
    app: hello-nginx
  ports:
  - port: 80
    targetPort: 80
EOF

echo "Waiting a short moment for pods to initialize..."
sleep 15
kubectl get pods -A --no-headers | awk '{printf "%-40s %-20s %-12s
', $1"/"$2, $3, $4}' 2>/dev/null || kubectl get pods -A || true
echo

echo "Access notes (defaults):"
echo " - Traefik dashboard NodePort: http://<host-ip>:30080/dashboard/"
echo " - MinIO console: kubectl -n storage port-forward svc/minio 9000:9000  -> http://localhost:9000 (user: ${MINIO_ACCESS_KEY})"
echo " - Grafana port-forward: kubectl -n monitoring port-forward svc/kube-prometheus-grafana 3000:80"
echo

echo "Secrets stored in /root/.mini-cloud-secrets (permissions 600)"
cat > /root/.mini-cloud-secrets <<EOF
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
GITEA_ADMIN_USER=${GITEA_ADMIN_USER}
GITEA_ADMIN_PASS=${GITEA_ADMIN_PASS}
OPENFAAS_PASSWORD=${OPENFAAS_PASSWORD}
DRONE_RPC_SECRET=${DRONE_RPC_SECRET}
EOF
chmod 600 /root/.mini-cloud-secrets

echo "Bootstrap finished. Run: kubectl get all -A to inspect. Replace default passwords & secure Vault for production."
