# Nimbus Cloud Platform - Setup Guide

Complete installation and configuration guide for Nimbus Cloud Platform.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Bootstrap Installation](#bootstrap-installation)
4. [Manual Installation](#manual-installation)
5. [Development Setup](#development-setup)
6. [Production Deployment](#production-deployment)
7. [Configuration](#configuration)
8. [Verification](#verification)

## System Requirements

### Minimum Requirements
- **OS:** Ubuntu 22.04 LTS (recommended) or compatible Linux
- **CPU:** 4 cores
- **RAM:** 16 GB
- **Disk:** 150 GB free space
- **Network:** Internet connection for initial setup

### Recommended Requirements
- **CPU:** 8+ cores
- **RAM:** 32 GB
- **Disk:** 500 GB SSD
- **Network:** 1 Gbps

### Software Prerequisites
- Root or sudo access
- curl, wget, git
- Node.js 18+ (for dashboard)
- Docker (optional, for containerized deployment)

## Installation Methods

### Method 1: Automated Bootstrap (Recommended)

The fastest way to get Nimbus running with all 21 services.

```bash
# Clone or download Nimbus
cd nimbus-final

# Run bootstrap script
sudo ./bootstrap/full-mini-cloud-bootstrap-fixed.sh
```

**What it installs:**
- k3s Kubernetes cluster
- All 21 platform services
- Configured networking
- Storage backends
- Monitoring stack
- Security services

**Installation time:** 15-20 minutes

### Method 2: Docker Compose

Quick start with Docker (services run in containers):

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Method 3: Kubernetes Deployment

Deploy to existing Kubernetes cluster:

```bash
# Install with Helm
helm install nimbus ./helm/nimbus -n nimbus --create-namespace \
  --set backend.image=your-registry/nimbus-backend:latest \
  --set frontend.image=your-registry/nimbus-frontend:latest
```

## Bootstrap Installation

### Step 1: Prepare System

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y curl wget git apt-transport-https ca-certificates
```

### Step 2: Configure (Optional)

Edit bootstrap script to customize:

```bash
vim bootstrap/full-mini-cloud-bootstrap-fixed.sh
```

Key variables:
- `K3S_VERSION` - Kubernetes version
- `MINIO_ACCESS_KEY` - MinIO credentials
- `GITEA_ADMIN_USER` - Gitea admin username
- `REGION` - Cloud region for Velero

### Step 3: Run Bootstrap

```bash
sudo ./bootstrap/full-mini-cloud-bootstrap-fixed.sh
```

Monitor the installation. It will:
1. Install k3s
2. Install Helm
3. Create namespaces
4. Deploy all services
5. Generate secrets
6. Verify installation

### Step 4: Save Credentials

Secrets are saved to `/root/.mini-cloud-secrets`:

```bash
sudo cat /root/.mini-cloud-secrets
```

**Important:** Back up this file securely!

## Development Setup

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Access at: http://localhost:3000

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start API server
node index.js
```

API runs on: http://localhost:4000

### Full Stack Development

Use the quick start script:

```bash
# Linux/Mac
chmod +x scripts/start-nimbus.sh
./scripts/start-nimbus.sh

# Windows
scripts\start-nimbus.bat
```

## Production Deployment

### Build for Production

```bash
# Build frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend is ready as-is
cd ../backend
```

### Deploy with Docker

```bash
# Build images
docker build -t nimbus-frontend:latest ./frontend
docker build -t nimbus-backend:latest ./backend

# Run backend
docker run -d \
  --name nimbus-backend \
  -p 4000:4000 \
  -v /etc/rancher/k3s/k3s.yaml:/root/.kube/config \
  nimbus-backend:latest

# Run frontend
docker run -d \
  --name nimbus-frontend \
  -p 80:80 \
  nimbus-frontend:latest
```

### Deploy with Kubernetes

```bash
# Push images to registry
docker tag nimbus-frontend:latest your-registry/nimbus-frontend:latest
docker tag nimbus-backend:latest your-registry/nimbus-backend:latest
docker push your-registry/nimbus-frontend:latest
docker push your-registry/nimbus-backend:latest

# Deploy with Helm
helm install nimbus ./helm/nimbus \
  -n nimbus \
  --create-namespace \
  --set backend.image=your-registry/nimbus-backend:latest \
  --set frontend.image=your-registry/nimbus-frontend:latest \
  --set backend.replicaCount=2 \
  --set frontend.replicaCount=2
```

### Deploy to Cloud (AWS/Azure)

```bash
# AWS
cd infra/terraform/aws
terraform init
terraform apply \
  -var="aws_region=us-east-1" \
  -var="instance_name=nimbus-prod"

# Azure
cd infra/terraform/azure
terraform init
terraform apply \
  -var="vm_name=nimbus-prod" \
  -var="location=eastus"
```

## Configuration

### Environment Variables

Backend (`backend/.env`):
```env
PORT=4000
NODE_ENV=production
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000
```

### Kubernetes Access

Ensure backend can access Kubernetes:

```bash
# Copy kubeconfig
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Test access
kubectl get nodes
```

### Service Configuration

Configure individual services via Helm values:

```bash
# Edit values
vim helm/nimbus/values.yaml

# Apply changes
helm upgrade nimbus ./helm/nimbus -n nimbus
```

## Verification

### Check Kubernetes Cluster

```bash
# Node status
kubectl get nodes

# All pods
kubectl get pods -A

# Services
kubectl get svc -A
```

### Check Individual Services

```bash
# Longhorn storage
kubectl -n longhorn-system get pods

# MinIO
kubectl -n storage get pods

# Prometheus
kubectl -n monitoring get pods

# Gitea
kubectl -n ci get pods
```

### Access Services

```bash
# Traefik Dashboard
# http://<host-ip>:30080/dashboard/

# Grafana
kubectl -n monitoring port-forward svc/kube-prometheus-grafana 3000:80
# http://localhost:3000

# MinIO Console
kubectl -n storage port-forward svc/minio 9000:9000
# http://localhost:9000
```

### Test Nimbus Dashboard

```bash
# Start dashboard
./scripts/start-nimbus.sh

# Access
# http://localhost:3000
```

### Verify API

```bash
# Health check
curl http://localhost:4000/api/dashboard/stats

# List services
curl http://localhost:4000/api/services

# List VMs
curl http://localhost:4000/api/vms
```

## Troubleshooting

### Bootstrap Failed

```bash
# Check logs
sudo journalctl -u k3s -f

# Restart k3s
sudo systemctl restart k3s

# Re-run bootstrap
sudo ./bootstrap/full-mini-cloud-bootstrap-fixed.sh
```

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -A

# Describe pod
kubectl describe pod <pod-name> -n <namespace>

# Check logs
kubectl logs <pod-name> -n <namespace>
```

### Storage Issues

```bash
# Check PVCs
kubectl get pvc -A

# Check Longhorn
kubectl -n longhorn-system get pods
```

### Dashboard Not Loading

```bash
# Check backend
curl http://localhost:4000/api/dashboard/stats

# Check frontend build
cd frontend && npm run build

# Check Node.js version
node --version  # Should be 18+
```

### Permission Issues

```bash
# Fix kubeconfig permissions
sudo chmod 644 /etc/rancher/k3s/k3s.yaml

# Add user to docker group (if using Docker)
sudo usermod -aG docker $USER
newgrp docker
```

## Next Steps

After successful installation:

1. **Change default passwords** - Update all service credentials
2. **Configure TLS** - Enable HTTPS for production
3. **Set up backups** - Configure Velero backup schedules
4. **Configure monitoring** - Set up Grafana dashboards
5. **Enable authentication** - Configure Keycloak SSO
6. **Review security** - Apply network policies and RBAC

## Support

- Documentation: See README.md
- Issues: GitHub Issues
- Community: Join our Discord/Slack

---

**Nimbus Cloud Platform** - Complete private cloud infrastructure 🌥️
