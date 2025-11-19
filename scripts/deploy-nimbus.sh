#!/bin/bash
# Deploy Nimbus Cloud UI to K3s cluster

set -e

echo "🚀 Deploying Nimbus Cloud UI..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install K3s first."
    exit 1
fi

# Check if helm is available
if ! command -v helm &> /dev/null; then
    echo "❌ Helm not found. Installing Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# Create namespace
echo "📦 Creating nimbus namespace..."
kubectl create namespace nimbus --dry-run=client -o yaml | kubectl apply -f -

# Set default Docker images (can be overridden)
BACKEND_IMAGE="${BACKEND_IMAGE:-meetpatel1111/nimbus-platform:backend-latest}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-meetpatel1111/nimbus-platform:frontend-latest}"

echo "🐳 Using images:"
echo "  Backend:  $BACKEND_IMAGE"
echo "  Frontend: $FRONTEND_IMAGE"

# Deploy with Helm
echo "⚙️  Deploying Nimbus with Helm..."
cd /tmp
git clone https://github.com/meetpatel1111/nimbus.git || (cd nimbus && git pull)
cd nimbus

# Use helm with kubeconfig flag
helm upgrade --install nimbus ./helm/nimbus \
  --kubeconfig /etc/rancher/k3s/k3s.yaml \
  -n nimbus \
  --set backend.image="$BACKEND_IMAGE" \
  --set frontend.image="$FRONTEND_IMAGE" \
  --wait \
  --timeout 5m

echo ""
echo "✅ Nimbus Cloud UI deployed successfully!"
echo ""
echo "📊 Deployment Status:"
kubectl get all -n nimbus

echo ""
echo "🌐 Access URLs:"
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')
echo "  Frontend: http://$INSTANCE_IP:30401"
echo "  Backend:  http://$INSTANCE_IP:30400"
echo ""
echo "💡 Tip: Check pod logs with:"
echo "  kubectl logs -n nimbus -l app=nimbus-frontend"
echo "  kubectl logs -n nimbus -l app=nimbus-backend"
