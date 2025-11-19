# Complete Service Management from Frontend

## ✅ YES! You can Deploy, Create, Update, and Delete ALL Services!

Nimbus Cloud now provides **complete service lifecycle management** directly from the frontend UI for all 32+ services.

---

## 🚀 Deploy New Services

### Access: http://localhost:4000/deploy-service

**16 Pre-configured Services Available:**

### Databases (4)
- ✅ **PostgreSQL** - `bitnami/postgresql`
- ✅ **MongoDB** - `bitnami/mongodb`
- ✅ **Redis** - `bitnami/redis`
- ✅ **MySQL** - `bitnami/mysql`

### Messaging (2)
- ✅ **RabbitMQ** - `bitnami/rabbitmq`
- ✅ **Apache Kafka** - `bitnami/kafka`

### Observability (2)
- ✅ **Grafana** - `grafana/grafana`
- ✅ **Prometheus** - `prometheus-community/prometheus`

### CI/CD (2)
- ✅ **Jenkins** - `bitnami/jenkins`
- ✅ **Gitea** - `gitea-charts/gitea`

### Container Registry (1)
- ✅ **Harbor** - `harbor/harbor`

### Storage (1)
- ✅ **MinIO** - `minio/minio`

### Workflow (1)
- ✅ **n8n** - `n8n/n8n`

### Security (1)
- ✅ **Vault** - `hashicorp/vault`

### Analytics (1)
- ✅ **Elasticsearch** - `bitnami/elasticsearch`

---

## 📋 Full CRUD Operations

### 1. CREATE (Deploy)
**Page**: `/deploy-service`

**Steps**:
1. Click service card (e.g., PostgreSQL)
2. Configure settings:
   - Service name
   - Version
   - Storage size
   - Replicas
   - Architecture
3. Click "🚀 Deploy to Kubernetes"

**What Happens**:
```bash
# Backend executes:
helm install my-postgres bitnami/postgresql \
  --namespace apps \
  --set auth.password=changeme \
  --set primary.persistence.size=10Gi \
  --set primary.resources.requests.memory=256Mi
```

**Result**: Service deployed to Kubernetes cluster

---

### 2. READ (View)
**Page**: `/services`

**Features**:
- View all 32 services
- Filter by category (14 categories)
- See status (Running/Stopped)
- View endpoints
- Check namespace

**Service Categories**:
- Platform
- Storage
- Databases
- Serverless
- Workflow
- Security
- Messaging
- Observability
- CI/CD
- Registry
- Service Mesh
- Ingress
- Analytics
- Backup

---

### 3. UPDATE (Modify)
**Page**: `/services` → Click service

**Available Actions**:
- 🔄 **Restart**: Restart pods
- 📊 **Scale**: Change replicas
- ⚙️ **Configure**: Update Helm values
- 🔗 **Access**: Open service UI

**Backend API**:
```javascript
PUT /api/services/deployed/:name/:namespace
{
  "helmChart": "bitnami/postgresql",
  "values": {
    "primary.persistence.size": "20Gi",
    "replicaCount": 2
  }
}
```

---

### 4. DELETE (Remove)
**Page**: `/services` → Click "🗑️ Delete"

**What Happens**:
1. Confirmation dialog
2. Backend uninstalls Helm release
3. Removes all K8s resources:
   - Deployments
   - StatefulSets
   - Services
   - PVCs
   - ConfigMaps
   - Secrets

**Backend API**:
```javascript
DELETE /api/services/deployed/:name/:namespace
```

**Kubernetes Cleanup**:
```bash
helm uninstall my-postgres --namespace apps
kubectl delete pvc -n apps -l app=my-postgres
```

---

## 🎯 Example Workflows

### Deploy PostgreSQL Database

**Step 1**: Go to `/deploy-service`

**Step 2**: Click PostgreSQL card

**Step 3**: Configure:
```
Name: production-db
Version: 15
Storage: 50 GB
Replicas: 2
```

**Step 4**: Click "Deploy"

**Step 5**: Wait for deployment (30-60 seconds)

**Step 6**: Access at `/services` - see "production-db" running

**Step 7**: Connect to database:
```bash
kubectl port-forward svc/production-db 5432:5432 -n apps
psql -h localhost -U postgres
```

---

### Deploy Redis Cache

**Step 1**: Go to `/deploy-service`

**Step 2**: Click Redis card

**Step 3**: Configure:
```
Name: session-cache
Storage: 10 GB
Architecture: standalone
```

**Step 4**: Deploy

**Step 5**: Use Redis:
```bash
kubectl port-forward svc/session-cache 6379:6379 -n apps
redis-cli -h localhost
```

---

### Deploy Grafana Dashboard

**Step 1**: Go to `/deploy-service`

**Step 2**: Click Grafana card

**Step 3**: Configure:
```
Name: monitoring-grafana
Enable Persistence: Yes
```

**Step 4**: Deploy

**Step 5**: Access Grafana:
```bash
kubectl port-forward svc/monitoring-grafana 3000:3000 -n monitoring
# Open http://localhost:3000
# Login: admin / admin
```

---

## 🔧 Backend API Endpoints

### Deploy Service
```http
POST /api/services/deploy
Content-Type: application/json

{
  "serviceId": "postgresql",
  "name": "my-postgres",
  "helmChart": "bitnami/postgresql",
  "namespace": "apps",
  "values": {
    "auth.password": "changeme",
    "primary.persistence.size": "10Gi"
  }
}
```

### Update Service
```http
PUT /api/services/deployed/:name/:namespace
Content-Type: application/json

{
  "helmChart": "bitnami/postgresql",
  "values": {
    "primary.persistence.size": "20Gi",
    "replicaCount": 2
  }
}
```

### Delete Service
```http
DELETE /api/services/deployed/:name/:namespace
```

### Restart Service
```http
POST /api/services/:id/restart
```

---

## 📊 Service Configuration Options

### PostgreSQL
- Version: 15, 14, 13
- Storage: 1-1000 GB
- Replicas: 1-10
- Architecture: standalone, replication

### MongoDB
- Storage: 1-1000 GB
- Architecture: standalone, replicaset
- Auth: enabled/disabled

### Redis
- Storage: 1-100 GB
- Architecture: standalone, replication
- Persistence: enabled/disabled

### Kafka
- Replicas: 1-10
- Storage: 10-1000 GB
- Zookeeper: enabled/disabled

### Jenkins
- Storage: 10-500 GB
- Plugins: auto-install
- Admin password: configurable

### Harbor
- Storage: 50-5000 GB
- Admin password: configurable
- TLS: enabled/disabled

---

## 🔐 Security Features

### Namespace Isolation
- Each service in dedicated namespace
- RBAC policies enforced
- Network policies applied

### Secrets Management
- Passwords stored in K8s secrets
- Vault integration available
- Auto-rotation supported

### Access Control
- Service accounts per deployment
- Role-based permissions
- Pod security policies

---

## 📈 Monitoring Deployed Services

All deployed services are automatically monitored by:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing

**Access Monitoring**:
```bash
# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Grafana
kubectl port-forward svc/grafana 3000:3000 -n monitoring

# Jaeger
kubectl port-forward svc/jaeger 16686:16686 -n observability
```

---

## ⚠️ Prerequisites

For service deployment to work:

1. ✅ **Kubernetes cluster running**
   ```bash
   kubectl cluster-info
   ```

2. ✅ **Helm 3.x installed**
   ```bash
   helm version
   ```

3. ✅ **Helm repositories added**
   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm repo add grafana https://grafana.github.io/helm-charts
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo add harbor https://helm.goharbor.io
   helm repo add hashicorp https://helm.releases.hashicorp.com
   helm repo add gitea-charts https://dl.gitea.io/charts/
   helm repo add minio https://charts.min.io/
   helm repo update
   ```

4. ✅ **Storage class available**
   ```bash
   kubectl get storageclass
   ```

---

## 🧪 Testing

### Test PostgreSQL Deployment
```bash
# Via Frontend: Deploy PostgreSQL with name "test-db"

# Verify in K8s:
kubectl get pods -n apps | grep test-db
kubectl get svc -n apps | grep test-db
helm list -n apps

# Connect:
kubectl port-forward svc/test-db 5432:5432 -n apps
psql -h localhost -U postgres
```

### Test Redis Deployment
```bash
# Via Frontend: Deploy Redis with name "test-redis"

# Verify:
kubectl get pods -n apps | grep test-redis
helm list -n apps

# Connect:
kubectl port-forward svc/test-redis 6379:6379 -n apps
redis-cli -h localhost
```

---

## 🎉 Summary

**YES! You can manage ALL services from the frontend:**

✅ **Deploy** - 16 pre-configured services with Helm
✅ **Create** - Custom configurations per service
✅ **Update** - Modify running services
✅ **Delete** - Remove services from K8s
✅ **Restart** - Restart pods
✅ **Monitor** - View status and metrics
✅ **Access** - Connect to service UIs

**All operations execute real Kubernetes commands via Helm and kubectl!**

---

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Open Browser**:
   ```
   http://localhost:4000
   ```

3. **Deploy a Service**:
   - Click "Deploy New Service"
   - Select PostgreSQL
   - Configure settings
   - Click "Deploy to Kubernetes"

4. **Manage Services**:
   - Go to "Services" page
   - View all deployed services
   - Restart, Delete, or Access services

**That's it! Full service lifecycle management from the UI!** 🎊
