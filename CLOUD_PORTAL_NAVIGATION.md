# Cloud Portal Navigation Map

## Service Tiles - Click Destinations

### Compute
- **Virtual Machines** → `/vms` - Manage VMs page
- **Kubernetes Service** → `/services` - All services page
- **Functions** → `/deploy-service?service=openfaas` - Deploy OpenFaaS

### Storage
- **Storage Accounts** → `/storage` - Storage management
- **Disks** → `/storage` - Storage management (PVCs)
- **Files** → `/deploy-service?service=minio` - Deploy MinIO

### Databases
- **SQL Database** → `/deploy-service?service=postgresql` - Deploy PostgreSQL
- **NoSQL Database** → `/deploy-service?service=mongodb` - Deploy MongoDB
- **Cache for Redis** → `/deploy-service?service=redis` - Deploy Redis

### Networking
- **Virtual Networks** → `/networks` - Network management
- **Load Balancer** → `/deploy-service?service=traefik` - Deploy Traefik
- **Application Gateway** → `/deploy-service?service=ingress-nginx` - Deploy Nginx Ingress

### Security
- **Key Vault** → `/deploy-service?service=vault` - Deploy Vault
- **Identity** → `/deploy-service?service=keycloak` - Deploy Keycloak
- **Security Center** → `/deploy-service?service=kyverno` - Deploy Kyverno

### DevOps
- **Repos** → `/deploy-service?service=gitea` - Deploy Gitea
- **Pipelines** → `/deploy-service?service=drone` - Deploy Drone CI
- **Artifacts** → `/deploy-service?service=harbor` - Deploy Harbor

### Monitoring
- **Monitor** → `/deploy-service?service=prometheus` - Deploy Prometheus
- **Log Analytics** → `/deploy-service?service=loki` - Deploy Loki
- **Alerts** → `/deploy-service?service=grafana` - Deploy Grafana

### AI + ML
- **Machine Learning** → `/deploy-service` - Service deployment page
- **Cognitive Services** → `/deploy-service` - Service deployment page

### Analytics
- **Analytics** → `/deploy-service?service=elasticsearch` - Deploy Elasticsearch
- **Event Streaming** → `/deploy-service?service=kafka` - Deploy Kafka

## Sidebar Navigation

### Favorites
- Dashboard → `/dashboard`
- All Services → `/services`
- Virtual Machines → `/vms`
- Storage → `/storage`

### Resources
- Resource Groups → `/resource-groups`
- All Resources → `/resources`
- Cost Management → (Coming soon)

### Quick Actions
- Create a resource → `/create-service`
- Deploy to cloud → `/deploy`
- Documentation → (Coming soon)

## URL Parameters

When navigating to `/deploy-service`, you can pass a `service` parameter to pre-select a service:
- `/deploy-service?service=postgresql`
- `/deploy-service?service=redis`
- `/deploy-service?service=mongodb`
- etc.

## User Flow Examples

### Deploy a Database
1. Click "SQL Database" tile
2. Lands on `/deploy-service?service=postgresql`
3. Configure PostgreSQL settings
4. Click "Deploy"
5. Service deployed to K8s

### Create a VM
1. Click "Virtual Machines" tile
2. Lands on `/vms` page
3. Click "+ Create VM"
4. Fill VM details
5. VM created as K8s deployment

### Set up CI/CD
1. Click "Repos" tile → Deploy Gitea
2. Click "Pipelines" tile → Deploy Drone CI
3. Click "Artifacts" tile → Deploy Harbor
4. Complete DevOps stack ready
