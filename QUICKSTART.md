# ⚡ Nimbus Quick Start Guide

Get your mini-cloud platform running in 5 minutes!

## 🎯 What You'll Get

A complete cloud platform with:
- ✅ 21 integrated services (k3s, Longhorn, MinIO, OpenFaaS, n8n, Keycloak, Vault, NATS, RabbitMQ, Prometheus, Grafana, Loki, Velero, Gitea, Drone, and more)
- ✅ Web dashboard to manage everything
- ✅ VM provisioning
- ✅ Storage management
- ✅ Network configuration
- ✅ One-click cloud deployment to AWS or Azure

## 🚀 Quick Start (Local Development)

### Option 1: Using Start Scripts (Easiest)

**Linux/Mac:**
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

**Windows:**
```cmd
scripts\start-dev.bat
```

### Option 2: Manual Start

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Access the Dashboard

Open your browser to: **http://localhost:5173**

## 🌐 Deploy to Cloud

### Prerequisites
- AWS or Azure account
- Terraform installed
- Cloud credentials configured

### AWS Deployment

```bash
# Set credentials
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Deploy
cd infra/terraform/aws
terraform init
terraform apply -var="instance_name=nimbus-cloud" -var="aws_region=us-east-1"

# Get IP
terraform output public_ip

# SSH and run bootstrap
ssh ubuntu@<ip>
# Copy bootstrap script and run:
sudo bash full-mini-cloud-bootstrap-fixed.sh
```

### Azure Deployment

```bash
# Login
az login

# Deploy
cd infra/terraform/azure
terraform init
terraform apply -var="vm_name=nimbus-cloud" -var="location=eastus"

# Get IP
terraform output public_ip

# SSH and run bootstrap
ssh azureuser@<ip>
# Copy bootstrap script and run:
sudo bash full-mini-cloud-bootstrap-fixed.sh
```

## 📱 Using the Dashboard

### Dashboard Overview
- View real-time stats for all resources
- Monitor service health
- Quick actions for common tasks

### Services Page
- See all 21 services
- Filter by category (Platform, Storage, Security, etc.)
- Restart services
- Access service UIs

### Virtual Machines
- Create new VMs
- Start/stop VMs
- Delete VMs
- View VM details

### Storage
- Create volumes
- Manage Longhorn and MinIO storage
- View usage statistics

### Networks
- Create virtual networks
- Configure CIDR blocks
- Manage network connectivity

### Cloud Deploy
- Deploy infrastructure to AWS or Azure
- Select instance types
- Monitor deployment progress

## 🎓 Next Steps

1. **Explore the Dashboard** - Navigate through all pages
2. **Create a VM** - Go to Virtual Machines → Create VM
3. **Add Storage** - Go to Storage → Create Volume
4. **Deploy to Cloud** - Go to Cloud Deploy → Select Provider
5. **Check Services** - Go to Services → View all 21 services

## 📚 Documentation

- **Full README**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Changes Log**: [CHANGES.md](CHANGES.md)

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4000 (backend)
# Linux/Mac:
lsof -ti:4000 | xargs kill -9

# Windows:
netstat -ano | findstr :4000
taskkill /PID <pid> /F

# Kill process on port 5173 (frontend)
# Linux/Mac:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf backend/node_modules frontend/node_modules
cd backend && npm install
cd ../frontend && npm install
```

### TypeScript Errors

TypeScript errors are expected until dependencies are installed. Run `npm install` in both backend and frontend directories.

### Cannot Connect to Backend

1. Ensure backend is running on port 4000
2. Check backend logs for errors
3. Verify no firewall blocking localhost:4000

## 💡 Tips

- **Development**: Use the start scripts for easy local development
- **Production**: Deploy to cloud for full mini-cloud experience
- **Resources**: Minimum 16GB RAM recommended for all 21 services
- **Security**: Change default passwords after deployment
- **Monitoring**: Use Grafana for service monitoring
- **Backups**: Configure Velero for automated backups

## 🆘 Need Help?

1. Check the logs:
   - Backend: Terminal running `npm start`
   - Frontend: Terminal running `npm run dev`
   - Services: `kubectl logs <pod> -n <namespace>`

2. Review documentation:
   - [README.md](README.md) - Architecture overview
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
   - [CHANGES.md](CHANGES.md) - What's new

3. Common issues:
   - Port conflicts: Kill processes on ports 4000 and 5173
   - Dependencies: Run `npm install` in both directories
   - Cloud deployment: Verify credentials are set correctly

## 🎉 You're Ready!

Your Nimbus mini-cloud platform is ready to use. Start exploring the dashboard and deploy your first cloud infrastructure!

---

**Happy Cloud Building! 🌥️**
