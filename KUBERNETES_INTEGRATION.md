# 🎯 Kubernetes Integration Guide

This guide explains how to enable **real Kubernetes integration** so you can actually create and manage services on your k3s cluster.

## Current State

Right now, the platform uses **mock data** for demonstration purposes. This means:
- ✅ You can see all 21 pre-installed services
- ✅ You can create VMs, storage, networks (simulated)
- ✅ You can deploy infrastructure to AWS/Azure
- ⚠️ Service creation is simulated (not actually deployed to k8s)

## Enabling Real Kubernetes Integration

### Step 1: Ensure k3s is Running

After deploying to cloud and running the bootstrap script:

```bash
# SSH into your instance
ssh ubuntu@<your-instance-ip>

# Check k3s status
sudo systemctl status k3s

# Verify cluster is running
kubectl get nodes
kubectl get pods -A
```

### Step 2: Configure kubectl Access

**Option A: Run Backend on the Same Server**

If you run the Nimbus backend on the same server as k3s:

```bash
# The backend will automatically use /etc/rancher/k3s/k3s.yaml
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

**Option B: Remote Access (Recommended for Development)**

Copy the kubeconfig to your local machine:

```bash
# On your local machine
scp ubuntu@<instance-ip>:/etc/rancher/k3s/k3s.yaml ~/.kube/nimbus-config

# Edit the file and replace 127.0.0.1 with your instance IP
sed -i 's/127.0.0.1/<instance-ip>/g' ~/.kube/nimbus-config

# Set KUBECONFIG
export KUBECONFIG=~/.kube/nimbus-config

# Test connection
kubectl get nodes
```

### Step 3: Update Backend to Use Real Kubernetes

Replace the mock implementation in `backend/index.js` with real Kubernetes calls:

```javascript
// At the top of backend/index.js
const k8s = require('./kubernetes-client');

// Replace the mock service creation endpoint
app.post('/api/services/create', async (req, res) => {
  const { name, namespace, image, replicas, port, serviceType } = req.body;
  
  try {
    // Check cluster connection
    const clusterStatus = await k8s.checkClusterConnection();
    if (!clusterStatus.connected) {
      return res.status(503).json({
        error: 'Kubernetes cluster not accessible',
        details: clusterStatus.error
      });
    }

    // Create deployment
    const deployment = await k8s.createDeployment(
      namespace,
      name,
      image,
      replicas,
      port
    );

    if (!deployment.success) {
      return res.status(500).json({ error: deployment.error });
    }

    // Create service
    const service = await k8s.createService(
      namespace,
      name,
      port,
      port,
      serviceType
    );

    if (!service.success) {
      return res.status(500).json({ error: service.error });
    }

    res.json({
      ok: true,
      message: `Service ${name} deployed successfully`,
      deployment: deployment.output,
      service: service.output
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Step 4: Install Kubernetes Client (Optional)

For better integration, you can use the official Kubernetes JavaScript client:

```bash
cd backend
npm install @kubernetes/client-node
```

Then update `kubernetes-client.js` to use the official client instead of kubectl commands.

### Step 5: Test Service Creation

1. Start your backend with kubectl configured
2. Go to **Create Service** page
3. Fill in the form (e.g., nginx service)
4. Click "Deploy Service"
5. Verify it was created:

```bash
kubectl get deployments -n apps
kubectl get svc -n apps
kubectl get pods -n apps
```

## Real Kubernetes Integration Features

Once integrated, you'll be able to:

### ✅ Create Services
- Deploy any Docker image
- Configure replicas, ports, resources
- Choose service type (ClusterIP, NodePort, LoadBalancer)

### ✅ Manage Existing Services
- View real-time pod status
- Restart deployments
- Scale replicas up/down
- Delete services

### ✅ Storage Management
- Create PersistentVolumeClaims
- Attach volumes to pods
- View storage usage

### ✅ Network Management
- Create Kubernetes Services
- Configure Ingress rules
- Manage NetworkPolicies

## Example: Creating a Redis Service

Using the real Kubernetes integration:

```javascript
// This will actually deploy Redis to your cluster
POST /api/services/create
{
  "name": "redis",
  "namespace": "apps",
  "image": "redis:alpine",
  "replicas": 1,
  "port": 6379,
  "serviceType": "ClusterIP"
}
```

Verify:
```bash
kubectl get pods -n apps | grep redis
kubectl get svc -n apps | grep redis
```

## Advanced: Using Helm Charts

The `kubernetes-client.js` module includes Helm integration:

```javascript
// Install a Helm chart
const result = await k8s.installHelmChart(
  'my-redis',
  'bitnami/redis',
  'apps',
  {
    'auth.enabled': 'false',
    'replica.replicaCount': '2'
  }
);
```

## Troubleshooting

### "Kubernetes cluster not accessible"

```bash
# Check kubectl works
kubectl get nodes

# Check KUBECONFIG
echo $KUBECONFIG

# Verify backend can access kubectl
which kubectl
kubectl version
```

### "Permission denied"

```bash
# Ensure backend has access to kubeconfig
chmod 644 /etc/rancher/k3s/k3s.yaml

# Or run backend as root (not recommended for production)
sudo node index.js
```

### "Image pull errors"

```bash
# Check if image exists
docker pull <image-name>

# Check pod events
kubectl describe pod <pod-name> -n <namespace>
```

## Security Considerations

### Production Deployment

1. **Use RBAC**: Create a service account with limited permissions
2. **Secure kubeconfig**: Don't expose cluster admin credentials
3. **Network policies**: Restrict pod-to-pod communication
4. **Image scanning**: Only use trusted container images
5. **Resource limits**: Set CPU/memory limits on all pods

### Example Service Account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nimbus-backend
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: nimbus-backend-role
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "create", "update", "delete"]
- apiGroups: [""]
  resources: ["services", "pods"]
  verbs: ["get", "list", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: nimbus-backend-binding
subjects:
- kind: ServiceAccount
  name: nimbus-backend
  namespace: default
roleRef:
  kind: ClusterRole
  name: nimbus-backend-role
  apiGroup: rbac.authorization.k8s.io
```

## Next Steps

1. ✅ Deploy infrastructure using Terraform
2. ✅ Run bootstrap script to install k3s and all services
3. ✅ Configure kubectl access
4. ✅ Update backend to use real Kubernetes client
5. ✅ Test service creation
6. ✅ Implement additional features (scaling, logs, metrics)

---

**With real Kubernetes integration, your Nimbus platform becomes a fully functional cloud management system!** 🚀
