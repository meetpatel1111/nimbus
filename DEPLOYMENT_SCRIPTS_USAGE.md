# Deployment Scripts Usage Guide

## Overview
GitHub Actions automatically deploys Nimbus Cloud when you push code to the main branch. The workflow builds Docker images and updates your AWS instance automatically.

## Automatic Deployment

### How It Works
1. **Push code to main branch**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **GitHub Actions automatically**:
   - Builds new Docker images
   - Pushes to Docker Hub
   - Copies scripts to AWS instance
   - Runs `redeploy-nimbus.sh` automatically
   - Updates deployment with latest images

3. **Your deployment is updated** - No manual intervention needed!

### Triggers
Automatic deployment runs when you push changes to:
- `backend/**` - Backend code changes
- `frontend/**` - Frontend code changes
- `helm/**` - Helm chart changes
- `scripts/**` - Deployment script changes
- `.github/workflows/deploy.yml` - Workflow changes

### Requirements
Set these GitHub Secrets for automatic deployment:
- `AWS_INSTANCE_IP` - Your AWS instance IP address
- `SSH_PRIVATE_KEY` - SSH private key for instance access
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password

## Manual Deployment Scripts
These scripts are also available on your instance for manual operations:

## Available Scripts

### 1. `fix-and-deploy-nimbus.sh` - Initial Deployment
**Purpose**: Complete setup and deployment of Nimbus Cloud

**When to use**: 
- First time deployment
- After infrastructure changes
- When you need a fresh deployment

**Usage**:
```bash
ssh ubuntu@<instance-ip>
sudo bash ~/fix-and-deploy-nimbus.sh
```

**What it does**:
- Checks/starts K3s
- Installs Helm if needed
- Creates nimbus namespace
- Pulls latest Docker images
- Deploys using Helm
- Waits for pods to be ready

### 2. `redeploy-nimbus.sh` - Update Deployment
**Purpose**: Update Nimbus with latest Docker images

**When to use**:
- After pushing code changes to GitHub
- After GitHub Actions builds new images
- Regular updates

**Usage**:
```bash
ssh ubuntu@<instance-ip>
sudo bash ~/redeploy-nimbus.sh
```

**What it does**:
- Pulls latest code from GitHub
- Pre-pulls latest Docker images
- Updates Helm deployment
- Forces pod recreation
- Verifies deployment

### 3. `force-update-images.sh` - Force Image Refresh
**Purpose**: Forcefully update Docker images (nuclear option)

**When to use**:
- When old images are cached
- When redeploy doesn't pull new images
- Troubleshooting image issues

**Usage**:
```bash
ssh ubuntu@<instance-ip>
sudo bash ~/force-update-images.sh
```

**What it does**:
- **Deletes** old cached images
- Pulls fresh images from Docker Hub
- Deletes existing pods
- Forces recreation with new images
- Verifies images in use

### 4. `check-nimbus-status.sh` - Check Status
**Purpose**: Verify Nimbus deployment status

**When to use**:
- After deployment
- Troubleshooting
- Regular health checks

**Usage**:
```bash
ssh ubuntu@<instance-ip>
sudo bash ~/check-nimbus-status.sh
```

**What it shows**:
- K3s cluster status
- Nimbus namespace status
- Pod status
- Service endpoints
- Port availability

## Typical Workflow

### Initial Deployment
```bash
# 1. Run GitHub Actions workflow to deploy infrastructure
# 2. SSH to instance
ssh ubuntu@<instance-ip>

# 3. Scripts are already there, just run fix-and-deploy
sudo bash ~/fix-and-deploy-nimbus.sh

# 4. Check status
sudo bash ~/check-nimbus-status.sh
```

### Update After Code Changes
```bash
# 1. Push code to GitHub
git add .
git commit -m "Update feature"
git push

# 2. Wait for GitHub Actions to build images (check Actions tab)

# 3. SSH to instance and redeploy
ssh ubuntu@<instance-ip>
sudo bash ~/redeploy-nimbus.sh

# 4. Verify update
sudo bash ~/check-nimbus-status.sh
```

### Troubleshooting Image Issues
```bash
# If you suspect old images are cached
ssh ubuntu@<instance-ip>
sudo bash ~/force-update-images.sh
```

## Environment Variables

All scripts support custom Docker images via environment variables:

```bash
# Use custom images
export BACKEND_IMAGE="myuser/nimbus:backend-v2"
export FRONTEND_IMAGE="myuser/nimbus:frontend-v2"
sudo -E bash ~/redeploy-nimbus.sh
```

## GitHub Actions Integration

The deployment workflow automatically:
1. Builds Docker images with tags:
   - `meetpatel1111/nimbus-platform:backend-latest`
   - `meetpatel1111/nimbus-platform:frontend-latest`
   - `meetpatel1111/nimbus-platform:backend-<git-sha>`
   - `meetpatel1111/nimbus-platform:frontend-<git-sha>`

2. Copies scripts to instance:
   - `~/fix-and-deploy-nimbus.sh`
   - `~/redeploy-nimbus.sh`
   - `~/force-update-images.sh`
   - `~/check-nimbus-status.sh`

3. Runs initial deployment with latest images

4. Shows summary with script usage instructions

## Quick Reference

| Task | Command |
|------|---------|
| Initial deploy | `sudo bash ~/fix-and-deploy-nimbus.sh` |
| Update deployment | `sudo bash ~/redeploy-nimbus.sh` |
| Force image refresh | `sudo bash ~/force-update-images.sh` |
| Check status | `sudo bash ~/check-nimbus-status.sh` |
| View pods | `kubectl get pods -n nimbus` |
| View services | `kubectl get svc -n nimbus` |
| View logs | `kubectl logs -n nimbus -l app=nimbus-backend` |
| Access UI | `http://<instance-ip>:30400` |

## Troubleshooting

### Script not found
```bash
# Re-copy scripts from GitHub
cd /tmp
git clone https://github.com/meetpatel1111/nimbus.git
cd nimbus
cp scripts/*.sh ~/
chmod +x ~/*.sh
```

### Permission denied
```bash
# Always use sudo
sudo bash ~/script-name.sh
```

### Old images still running
```bash
# Use force update
sudo bash ~/force-update-images.sh
```

### Pods not starting
```bash
# Check pod status
kubectl describe pod -n nimbus <pod-name>

# Check logs
kubectl logs -n nimbus <pod-name>

# Restart deployment
kubectl rollout restart deployment -n nimbus
```

## Best Practices

1. **Always check status** after deployment
2. **Use redeploy script** for updates (not manual kubectl)
3. **Keep scripts updated** by re-running GitHub Actions
4. **Monitor logs** during deployment
5. **Verify images** are correct after update

## Support

For issues or questions:
- Check logs: `kubectl logs -n nimbus -l app=nimbus-backend`
- Check events: `kubectl get events -n nimbus`
- Check pod details: `kubectl describe pod -n nimbus <pod-name>`
- Review documentation: `DOCKER_IMAGE_UPDATES.md`
