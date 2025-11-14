# 🚀 Nimbus Deployment Guide

Complete guide to deploying your Nimbus Mini-Cloud platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [AWS Deployment](#aws-deployment)
4. [Azure Deployment](#azure-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Accessing Services](#accessing-services)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Terraform** 1.5+ ([Download](https://www.terraform.io/downloads))
- **Git** ([Download](https://git-scm.com/downloads))

### Cloud Provider Credentials

#### AWS
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

#### Azure
```bash
export ARM_SUBSCRIPTION_ID="your-subscription-id"
export ARM_CLIENT_ID="your-client-id"
export ARM_CLIENT_SECRET="your-client-secret"
export ARM_TENANT_ID="your-tenant-id"
```

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd nimbus-final

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Backend runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Access the Dashboard

Open your browser to: http://localhost:5173

## AWS Deployment

### Step 1: Configure AWS Credentials

```bash
# Option 1: Environment variables
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Option 2: AWS CLI
aws configure
```

### Step 2: Deploy Infrastructure

```bash
cd infra/terraform/aws

# Initialize Terraform
terraform init

# Review the plan
terraform plan \
  -var="instance_name=nimbus-cloud" \
  -var="aws_region=us-east-1" \
  -var="instance_type=t2.xlarge"

# Apply the configuration
terraform apply \
  -var="instance_name=nimbus-cloud" \
  -var="aws_region=us-east-1" \
  -var="instance_type=t2.xlarge"
```

### Step 3: Get Instance IP

```bash
# Get the public IP
terraform output public_ip

# Get SSH command
terraform output ssh_command
```

### Step 4: Run Bootstrap Script

```bash
# SSH into the instance
ssh ubuntu@<public-ip>

# Copy bootstrap script to instance (from your local machine)
scp ../../../bootstrap/full-mini-cloud-bootstrap-fixed.sh ubuntu@<public-ip>:~/

# On the instance, run the bootstrap
sudo bash full-mini-cloud-bootstrap-fixed.sh
```

This will take 10-15 minutes to install all 21 services.

## Azure Deployment

### Step 1: Configure Azure Credentials

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "your-subscription-id"

# Create service principal (if needed)
az ad sp create-for-rbac --name "nimbus-terraform" --role="Contributor"
```

### Step 2: Deploy Infrastructure

```bash
cd infra/terraform/azure

# Initialize Terraform
terraform init

# Review the plan
terraform plan \
  -var="vm_name=nimbus-cloud" \
  -var="location=eastus" \
  -var="vm_size=Standard_D2s_v3"

# Apply the configuration
terraform apply \
  -var="vm_name=nimbus-cloud" \
  -var="location=eastus" \
  -var="vm_size=Standard_D2s_v3"
```

### Step 3: Get Instance IP

```bash
# Get the public IP
terraform output public_ip

# Get SSH command
terraform output ssh_command
```

### Step 4: Run Bootstrap Script

```bash
# SSH into the instance
ssh azureuser@<public-ip>

# Copy bootstrap script to instance (from your local machine)
scp ../../../bootstrap/full-mini-cloud-bootstrap-fixed.sh azureuser@<public-ip>:~/

# On the instance, run the bootstrap
sudo bash full-mini-cloud-bootstrap-fixed.sh
```

## Post-Deployment Configuration

### 1. Retrieve Secrets

After bootstrap completes, retrieve the generated secrets:

```bash
# On the instance
sudo cat /root/.mini-cloud-secrets
```

Save these credentials securely! They include:
- MinIO access keys
- Gitea admin password
- OpenFaaS password
- Drone RPC secret

### 2. Configure DNS (Optional)

Point your domain to the instance public IP:

```
nimbus.yourdomain.com -> <public-ip>
```

### 3. Enable HTTPS (Recommended)

```bash
# Install cert-bot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d nimbus.yourdomain.com
```

## Accessing Services

### Via NodePort (Default)

All services are accessible via NodePort on the instance IP:

| Service | URL |
|---------|-----|
| Nimbus UI | `http://<ip>:4000` |
| Traefik Dashboard | `http://<ip>:30080/dashboard/` |
| Grafana | Port-forward: `kubectl -n monitoring port-forward svc/kube-prometheus-grafana 3000:80` |
| MinIO | Port-forward: `kubectl -n storage port-forward svc/minio 9000:9000` |
| Prometheus | Port-forward: `kubectl -n monitoring port-forward svc/prometheus 9090:9090` |

### Via Port Forwarding

```bash
# Example: Access Grafana
kubectl -n monitoring port-forward svc/kube-prometheus-grafana 3000:80

# Then open: http://localhost:3000
```

### Via Ingress (Advanced)

Configure Traefik ingress rules for each service with proper hostnames.

## Troubleshooting

### Bootstrap Script Fails

```bash
# Check logs
sudo journalctl -xe

# Verify k3s is running
sudo systemctl status k3s

# Check pods
kubectl get pods -A
```

### Services Not Starting

```bash
# Check pod status
kubectl get pods -A

# Describe problematic pod
kubectl describe pod <pod-name> -n <namespace>

# Check logs
kubectl logs <pod-name> -n <namespace>
```

### Out of Memory

If services are crashing due to memory:

1. Upgrade instance size:
   - AWS: Use t2.2xlarge (32 GB RAM)
   - Azure: Use Standard_D4s_v3 (16 GB RAM)

2. Reduce service replicas in bootstrap script

### Terraform Errors

```bash
# Destroy and recreate
terraform destroy
terraform apply

# Check state
terraform show

# Refresh state
terraform refresh
```

### Cannot Access Services

1. Check security groups allow traffic
2. Verify services are running: `kubectl get svc -A`
3. Check firewall rules on the instance
4. Verify NodePort services are exposed

## Maintenance

### Update Services

```bash
# Update Helm repos
helm repo update

# Upgrade a service
helm upgrade <release-name> <chart> -n <namespace>
```

### Backup

```bash
# Use Velero for backups
velero backup create my-backup --include-namespaces=*

# List backups
velero backup get
```

### Monitoring

```bash
# Check cluster health
kubectl get nodes
kubectl get pods -A

# Check resource usage
kubectl top nodes
kubectl top pods -A
```

## Scaling Considerations

### Single-Node Limitations

- No high availability
- Limited by single VM resources
- No automatic failover

### When to Scale Out

Consider multi-node cluster when:
- Need high availability
- Require more than 32 GB RAM
- Running production workloads
- Need geographic distribution

## Security Hardening

1. **Change default passwords** from `/root/.mini-cloud-secrets`
2. **Enable HTTPS** with Let's Encrypt
3. **Restrict security groups** to known IPs
4. **Enable authentication** on all services
5. **Configure Vault** for production (disable dev mode)
6. **Set up backup automation** with Velero
7. **Enable audit logging** in Kubernetes
8. **Implement network policies**

## Cost Optimization

### AWS
- Use Spot Instances for dev/test
- Stop instances when not in use
- Use t3 instances for better price/performance

### Azure
- Use B-series for burstable workloads
- Deallocate VMs when not in use
- Use Reserved Instances for long-term

## Support

For issues and questions:
1. Check logs: `kubectl logs <pod> -n <namespace>`
2. Review Kubernetes events: `kubectl get events -A`
3. Check service status: `kubectl get svc -A`
4. Verify resource usage: `kubectl top nodes`

---

**Happy Cloud Building! 🌥️**
