# 🌥 Nimbus Mini-Cloud Platform

A complete cloud platform running on a single VM/EC2 instance with 21 integrated services. Deploy your own private cloud infrastructure to AWS or Azure with one click.

## 🎯 What is Nimbus?

Nimbus is a full-stack cloud management platform that deploys a complete "mini-cloud" environment with all the essential services you'd find in a production cloud setup - but optimized to run on a single powerful VM.

## 🚀 Features

- **Web Dashboard**: Modern React UI to manage all services, VMs, storage, and networks
- **Multi-Cloud Deployment**: Deploy to AWS or Azure via Terraform
- **21 Core Services**: Complete cloud stack in one deployment
- **Single-Node Architecture**: Everything runs on one VM (16GB+ RAM recommended)
- **Automated Bootstrap**: One-command installation of all services

## 📦 Complete Service Inventory (21 Services)

### 🔧 Core Platform (3 services)
- **k3s** - Lightweight Kubernetes cluster
- **Longhorn** - Distributed block storage for Kubernetes
- **Traefik** - Ingress controller & load balancer

### 🗄️ Storage Services (1 service)
- **MinIO** - S3-compatible object storage

### ⚙️ Serverless & Compute (1 service)
- **OpenFaaS** - Serverless functions-as-a-service (FaaS)

### 🔄 Workflow Automation (1 service)
- **n8n** - Workflow automation (like Logic Apps / Step Functions)

### 🔐 Identity & Security (2 services)
- **Keycloak** - Identity provider (SSO, RBAC, OAuth2, OpenID Connect)
- **Vault** - Secret management (like AWS Secrets Manager)

### 📬 Messaging & Eventing (2 services)
- **NATS** - High-speed message broker (pub/sub)
- **RabbitMQ** - Queueing system (AMQP)

### 📊 Monitoring & Observability (3 services)
- **Prometheus** - Metrics collection
- **Grafana** - Dashboards & visualization
- **Loki + Promtail** - Logs collection & query system

### 💾 Backup & Disaster Recovery (1 service)
- **Velero** - Backup/restore for Kubernetes resources & volumes

### 🧑‍💻 Development Tools (2 services)
- **Gitea** - Git hosting (like GitHub / GitLab)
- **Drone CI** - CI/CD pipeline runner

### 🌐 Frontend Control Panel (1 service)
- **Nimbus UI** - Web dashboard to manage all services

### 🧪 Demo Services (1 service)
- **Nginx Demo** - Confirm cluster functionality

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nimbus Web UI                        │
│              (React + TypeScript + Vite)                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (Node.js)                  │
│         Manages VMs, Storage, Networks, Services        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Single VM/EC2 Instance                     │
│                  (16GB+ RAM, 100GB Disk)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │           k3s Kubernetes Cluster                  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  21 Services Running in Pods/Deployments   │  │  │
│  │  │  - Platform: k3s, Longhorn, Traefik        │  │  │
│  │  │  - Storage: MinIO                           │  │  │
│  │  │  - Serverless: OpenFaaS                     │  │  │
│  │  │  - Workflow: n8n                            │  │  │
│  │  │  - Security: Keycloak, Vault                │  │  │
│  │  │  - Messaging: NATS, RabbitMQ                │  │  │
│  │  │  - Observability: Prometheus, Grafana, Loki │  │  │
│  │  │  - Backup: Velero                           │  │  │
│  │  │  - DevOps: Gitea, Drone                     │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Axios (API client)
- React Router (navigation)

**Backend:**
- Node.js + Express
- Terraform execution for cloud deployment
- REST API for resource management

**Infrastructure:**
- Terraform (AWS & Azure)
- Kubernetes (k3s)
- Helm charts
- Docker containers

**CI/CD:**
- GitHub Actions
- Docker build & push
- Helm deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for containerization)
- Terraform (for cloud deployment)
- AWS or Azure credentials (for cloud deployment)

### Local Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run backend
cd backend && npm start

# Run frontend (in another terminal)
cd frontend && npm run dev
```

### Deploy to Cloud

1. **Configure Cloud Credentials**
   - AWS: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - Azure: Set `ARM_SUBSCRIPTION_ID`, `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`

2. **Deploy via Web UI**
   - Open http://localhost:5173
   - Navigate to "Cloud Deploy"
   - Select provider (AWS or Azure)
   - Configure instance settings
   - Click "Deploy Mini-Cloud"

3. **Or Deploy via Terraform CLI**

   **AWS:**
   ```bash
   cd infra/terraform/aws
   terraform init
   terraform apply -var="instance_name=nimbus-cloud" -var="aws_region=us-east-1"
   ```

   **Azure:**
   ```bash
   cd infra/terraform/azure
   terraform init
   terraform apply -var="vm_name=nimbus-cloud" -var="location=eastus"
   ```

4. **Run Bootstrap Script**
   ```bash
   # SSH into the instance
   ssh ubuntu@<public-ip>  # or azureuser@<public-ip> for Azure
   
   # Copy and run bootstrap script
   sudo ./bootstrap/full-mini-cloud-bootstrap-fixed.sh
   ```

## 📋 Recommended Instance Sizes

### AWS
- **Minimum**: t2.large (2 vCPU, 8 GB RAM)
- **Recommended**: t2.xlarge (4 vCPU, 16 GB RAM)
- **High Performance**: t2.2xlarge (8 vCPU, 32 GB RAM)

### Azure
- **Minimum**: Standard_B2s (2 vCPU, 4 GB RAM)
- **Recommended**: Standard_D2s_v3 (2 vCPU, 8 GB RAM)
- **High Performance**: Standard_D4s_v3 (4 vCPU, 16 GB RAM)

## 🔒 Security Notes

- Review and change default passwords in `/root/.mini-cloud-secrets` after deployment
- Vault runs in dev-mode by default - configure for production use
- Update security group rules to restrict access
- Enable HTTPS with proper certificates
- Rotate credentials regularly

## 📚 Documentation

- **Frontend**: React components in `frontend/src/pages/`
- **Backend**: API endpoints in `backend/index.js`
- **Infrastructure**: Terraform configs in `infra/terraform/`
- **Bootstrap**: Full installation script in `bootstrap/full-mini-cloud-bootstrap-fixed.sh`
- **Helm**: Kubernetes charts in `helm/nimbus/`

## 🤝 Contributing

This is a starter template. Customize it for your needs:
- Add more services to the bootstrap script
- Extend the UI with new pages
- Add authentication/authorization
- Implement monitoring dashboards
- Add backup automation

## ⚠️ Important Notes

- This is designed for development/testing environments
- For production, review security settings, enable HTTPS, and configure proper backups
- The single-node architecture has limitations - consider multi-node for production
- Monitor resource usage - 21 services require adequate RAM and CPU

## 📄 License

Review and customize for your organization's needs.

---

**Built with ❤️ for developers who want their own cloud**
