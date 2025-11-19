# Kubernetes Integration - Fully Dynamic Implementation

## ✅ What's Now Dynamic from Kubernetes

All data is now queried directly from your Kubernetes cluster. No more in-memory storage that gets lost on restart!

### 1. **Virtual Machines** (`/api/vms`)
- **GET**: Queries K8s deployments with label `nimbus-type: vm`
- **POST**: Creates K8s deployment with proper labels
- **DELETE**: Deletes K8s deployment
- **Actions (start/stop)**: Scales deployment replicas (0 or 1)

**Labels used:**
- `nimbus-type: vm`
- `nimbus-cpu`, `nimbus-memory`, `nimbus-disk`, `nimbus-image`

### 2. **Storage Volumes** (`/api/storage/volumes`)
- **GET**: Queries K8s PVCs with label `nimbus-type: volume`
- **POST**: Creates PersistentVolumeClaim
- **DELETE**: Deletes PVC

**Labels used:**
- `nimbus-type: volume`
- `nimbus-storage-type` (longhorn, etc.)

### 3. **Resources** (`/api/resources`)
- **GET**: Queries:
  - Helm releases (databases, services)
  - K8s deployments with label `nimbus-type: resource`
- **POST**: Deploys to K8s based on type:
  - **Database** → Helm chart (PostgreSQL, MongoDB, Redis)
  - **Function** → K8s Deployment + Service
  - **Storage** → PVC
  - **VM** → K8s Deployment
  - **Load Balancer** → K8s Service (LoadBalancer type)
- **DELETE**: Uninstalls Helm release or deletes deployment

**Labels used:**
- `nimbus-type: resource`
- `nimbus-resource-type` (function, vm, etc.)

### 4. **Services** (`/api/services`)
- **GET**: Queries K8s pods to check which services are running
- Updates status dynamically based on namespace activity

### 5. **Dashboard Stats** (`/api/dashboard/stats`)
- Queries K8s for:
  - Total pods
  - Running pods
  - Active namespaces
  - Service counts

## 🔄 Data Persistence

**Before:**
- Data stored in memory arrays (`let vms = []`)
- Lost on backend restart
- Not synced with actual K8s state

**After:**
- All data queried from Kubernetes
- Survives backend restarts
- Always reflects actual cluster state
- Resources deployed to K8s are tracked via labels

## 🏷️ Label Strategy

All Nimbus-created resources use labels for identification:

```yaml
metadata:
  labels:
    nimbus-type: vm|volume|resource
    nimbus-resource-type: function|vm|database
    nimbus-cpu: "2"
    nimbus-memory: "4Gi"
    # ... other metadata
```

This allows:
- Filtering Nimbus resources from system resources
- Querying specific resource types
- Storing metadata without external database

## 📊 What Happens Now

### Creating a VM:
1. User clicks "Create VM" in UI
2. Frontend calls `POST /api/vms`
3. Backend creates K8s Deployment with labels
4. VM appears in K8s cluster
5. Next time you refresh, it queries K8s and shows the VM

### Backend Restart:
1. Backend restarts (pod restart, code update, etc.)
2. User refreshes UI
3. Backend queries K8s for all resources
4. All VMs, storage, resources appear (nothing lost!)

## 🚀 Benefits

1. **Persistent**: Data survives backend restarts
2. **Accurate**: Always shows actual cluster state
3. **No Database Needed**: Uses K8s as the source of truth
4. **Scalable**: Can query from any K8s cluster
5. **Portable**: Works across different environments

## 🔧 Deployment

To apply these changes:

```bash
# SSH into your instance
ssh ubuntu@100.26.58.65

# Pull latest code
cd /tmp/nimbus
git pull

# Restart backend to pick up changes
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml rollout restart deployment nimbus-backend -n nimbus

# Wait for it to be ready
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml rollout status deployment nimbus-backend -n nimbus
```

## 📝 Testing

Test the dynamic integration:

```bash
# Create a VM via UI
# Then check K8s:
kubectl get deployments -l nimbus-type=vm

# Create storage via UI
# Then check K8s:
kubectl get pvc -l nimbus-type=volume

# Restart backend
kubectl rollout restart deployment nimbus-backend -n nimbus

# Refresh UI - everything should still be there!
```

## 🎯 Result

Your Nimbus Cloud platform now has full Kubernetes integration with persistent, dynamic data that reflects the actual state of your cluster!
