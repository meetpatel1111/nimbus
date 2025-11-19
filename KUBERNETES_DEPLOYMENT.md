# Kubernetes Deployment from Frontend

## ✅ Real Service Deployment Enabled!

Nimbus Cloud now supports **real Kubernetes deployments** directly from the frontend UI. When you create resources through the web interface, they are actually deployed to your Kubernetes cluster.

## 🚀 Supported Resource Types

### 1. **Databases**
When you create a database resource, Nimbus deploys it using Helm charts:
- **PostgreSQL**: `bitnami/postgresql` chart
- **MongoDB**: `bitnami/mongodb` chart  
- **Redis**: `bitnami/redis` chart
- **MySQL**: `bitnami/mysql` chart

**Features**:
- Configurable storage size
- Automatic password generation
- Persistent volumes via Longhorn
- Resource limits (256Mi memory)

### 2. **Virtual Machines**
Deploys pod-based VMs with:
- Ubuntu 22.04 or other OS images
- SSH access on port 22
- Configurable disk size
- Public IP assignment (via LoadBalancer service)

### 3. **Functions (Serverless)**
Creates serverless function deployments:
- Node.js, Python, Go, or Java runtimes
- Configurable memory (128MB - 2GB)
- Timeout settings
- ClusterIP service for internal access

### 4. **Storage Accounts**
Creates PersistentVolumeClaims:
- Object, Block, or File storage
- Longhorn storage class
- Configurable size (10GB - 1TB)
- Redundancy options

### 5. **Kubernetes Clusters**
Creates isolated namespaces for multi-tenancy:
- Separate namespace per cluster
- Resource quotas
- Network policies
- RBAC configuration

### 6. **Load Balancers**
Deploys Kubernetes LoadBalancer services:
- Application (HTTP/HTTPS)
- Network (TCP/UDP)
- Gateway mode
- Health check configuration

## 🔧 How It Works

### Create Flow
1. User fills out form in frontend (`/create-resource`)
2. Frontend sends POST to `/api/resources`
3. Backend creates resource record
4. Backend deploys to Kubernetes:
   - Helm charts for databases
   - Deployments for VMs/functions
   - PVCs for storage
   - Services for networking
5. Resource status updated to "running"

### Delete Flow
1. User clicks delete in frontend
2. Frontend sends DELETE to `/api/resources/:id`
3. Backend removes from Kubernetes:
   - Uninstalls Helm releases
   - Deletes deployments
   - Removes PVCs
   - Cleans up services
4. Resource removed from database

### Update Flow
1. User modifies resource
2. Frontend sends PUT to `/api/resources/:id`
3. Backend updates Kubernetes resources
4. Changes applied with zero downtime

## 📊 Kubernetes Integration

### Cluster Connection
```javascript
// Check if K8s cluster is available
GET /api/resources/sync

Response:
{
  "synced": true,
  "clusterInfo": "Kubernetes control plane is running...",
  "resources": [...],
  "k8sPods": 45,
  "k8sServices": 32
}
```

### Resource Actions
```javascript
// Start/Stop/Restart resources
POST /api/resources/:id/start
POST /api/resources/:id/stop
POST /api/resources/:id/restart
```

## 🎯 Frontend Features

### Resource Management Page (`/resources`)
- **K8s Status Indicator**: Shows cluster connection status
- **Sync Button**: Refresh from Kubernetes
- **Real-time Status**: Running, Stopped, Creating, Failed
- **Bulk Operations**: Select multiple resources
- **Action Buttons**: View, Edit, Delete per resource

### Create Resource Page (`/create-resource`)
- **3-Step Wizard**: Select → Configure → Review
- **6 Resource Templates**: Pre-configured options
- **Form Validation**: Required fields checked
- **Resource Groups**: Organize by namespace
- **Region Selection**: Multi-region support
- **Tags**: Environment, Owner, Custom tags

## 🔐 Security

### Namespace Isolation
- Each resource group maps to a K8s namespace
- RBAC policies per namespace
- Network policies for isolation

### Secrets Management
- Passwords stored in K8s secrets
- Vault integration for sensitive data
- Automatic rotation support

### Resource Limits
- Memory and CPU limits enforced
- Storage quotas per namespace
- Pod security policies

## 📝 Example Deployments

### Deploy PostgreSQL Database
```bash
# Via Frontend:
1. Go to /create-resource
2. Select "Database"
3. Choose PostgreSQL
4. Set storage: 20GB
5. Click "Create"

# What happens in K8s:
helm install my-postgres bitnami/postgresql \
  --namespace default \
  --set auth.password=changeme \
  --set primary.persistence.size=20Gi
```

### Deploy Function App
```bash
# Via Frontend:
1. Select "Function App"
2. Choose Node.js 18
3. Set memory: 512MB
4. Click "Create"

# What happens in K8s:
kubectl create deployment my-function \
  --image=node:18-alpine \
  --namespace=default
kubectl expose deployment my-function \
  --port=8080 \
  --type=ClusterIP
```

## 🔄 Sync with Kubernetes

The frontend automatically syncs with Kubernetes to show:
- Real pod status
- Service endpoints
- Resource usage
- Health checks
- Recent events

Click the **🔄 Sync** button to refresh from cluster.

## ⚠️ Prerequisites

For real deployments to work, you need:
1. ✅ Kubernetes cluster running (k3s, k8s, etc.)
2. ✅ `kubectl` configured and accessible
3. ✅ Helm 3.x installed
4. ✅ Longhorn storage class available
5. ✅ Required Helm repos added:
   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo update
   ```

## 🧪 Testing

### Test Database Deployment
```bash
# Create via API
curl -X POST http://localhost:4000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "type": "database",
    "name": "test-db",
    "config": {
      "type": "PostgreSQL",
      "storage": 10,
      "resourceGroup": "default"
    }
  }'

# Verify in K8s
kubectl get pods -n default
kubectl get svc -n default
helm list -n default
```

### Test Function Deployment
```bash
# Create via API
curl -X POST http://localhost:4000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "type": "function",
    "name": "my-function",
    "config": {
      "runtime": "Node.js 18",
      "memory": "512",
      "resourceGroup": "default"
    }
  }'

# Verify
kubectl get deployment my-function -n default
kubectl get svc my-function -n default
```

## 📈 Monitoring

Resources deployed from frontend are monitored by:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing

Access monitoring at:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Jaeger: http://localhost:16686

## 🎉 Summary

**Yes, you can now deploy real services from the frontend!**

- ✅ Create databases, VMs, functions, storage
- ✅ Real Kubernetes deployments via Helm/kubectl
- ✅ Full CRUD operations
- ✅ Start/Stop/Restart actions
- ✅ Cluster sync and status
- ✅ Azure-style UI
- ✅ Production-ready

The Nimbus Cloud platform provides a complete cloud management experience with real infrastructure provisioning!
