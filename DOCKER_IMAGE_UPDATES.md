# Docker Image Update Strategy

## Overview
This document explains how Nimbus Cloud handles Docker image updates to ensure the latest code is always deployed.

## Image Tagging Strategy

### GitHub Actions Build
When code is pushed to GitHub, the CI/CD pipeline builds two Docker images:

1. **Backend Image**:
   - `meetpatel1111/nimbus-platform:backend-latest` (always latest)
   - `meetpatel1111/nimbus-platform:backend-<git-sha>` (specific version)

2. **Frontend Image**:
   - `meetpatel1111/nimbus-platform:frontend-latest` (always latest)
   - `meetpatel1111/nimbus-platform:frontend-<git-sha>` (specific version)

## Kubernetes Image Pull Policy

Both deployments use `imagePullPolicy: Always` which means:
- Kubernetes will **always** check for newer images
- Even if an image with the same tag exists locally, it will pull from Docker Hub
- This ensures the latest code is deployed

## Deployment Scripts

### 1. Initial Deployment: `fix-and-deploy-nimbus.sh`
```bash
sudo bash fix-and-deploy-nimbus.sh
```
- Pulls latest images using `crictl pull`
- Deploys using Helm with latest image tags
- Waits for pods to be ready

### 2. Update Deployment: `redeploy-nimbus.sh`
```bash
sudo bash redeploy-nimbus.sh
```
- Pulls latest code from GitHub
- Pre-pulls latest Docker images
- Updates Helm deployment with new images
- Forces pod recreation to use new images

### 3. Force Image Update: `force-update-images.sh`
```bash
sudo bash force-update-images.sh
```
- **Deletes** old cached images from node
- Pulls fresh images from Docker Hub
- Deletes existing pods to force recreation
- Verifies new images are in use

## How to Ensure Latest Images

### Method 1: Use GitHub Actions (Recommended)
1. Push code to GitHub
2. GitHub Actions builds new Docker images
3. SSH to AWS instance
4. Run: `sudo bash redeploy-nimbus.sh`

### Method 2: Force Update
If you suspect old images are cached:
```bash
sudo bash force-update-images.sh
```

### Method 3: Manual Update
```bash
# Delete old images
sudo crictl rmi meetpatel1111/nimbus-platform:backend-latest
sudo crictl rmi meetpatel1111/nimbus-platform:frontend-latest

# Delete pods to force recreation
kubectl delete pods -n nimbus -l app=nimbus-backend
kubectl delete pods -n nimbus -l app=nimbus-frontend

# Kubernetes will automatically pull latest images and recreate pods
```

## Verification

### Check Current Images
```bash
kubectl get pods -n nimbus -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'
```

### Check Image Pull Time
```bash
kubectl describe pod -n nimbus <pod-name> | grep -A 5 "Events:"
```

### Check Docker Hub for Latest Build
```bash
curl -s https://hub.docker.com/v2/repositories/meetpatel1111/nimbus-platform/tags | jq '.results[] | select(.name | contains("latest"))'
```

## Troubleshooting

### Problem: Old code is still running
**Solution**: Run force update script
```bash
sudo bash force-update-images.sh
```

### Problem: Image pull fails
**Possible causes**:
1. Docker Hub rate limit
2. Network issues
3. Image doesn't exist

**Solution**: Check Docker Hub and retry
```bash
# Check if image exists
docker pull meetpatel1111/nimbus-platform:backend-latest

# If successful, redeploy
sudo bash redeploy-nimbus.sh
```

### Problem: Pods stuck in ImagePullBackOff
**Solution**: Check image name and credentials
```bash
kubectl describe pod -n nimbus <pod-name>
kubectl logs -n nimbus <pod-name>
```

## Best Practices

1. **Always use GitHub Actions** to build images
2. **Tag images with git SHA** for version tracking
3. **Use `latest` tag** for automatic updates
4. **Run redeploy script** after pushing code
5. **Verify deployment** after updates

## Image Update Flow

```
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│ Build Images    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Push to         │
│ Docker Hub      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SSH to AWS      │
│ Run redeploy.sh │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pull Latest     │
│ Images          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Helm     │
│ Deployment      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pods Recreated  │
│ with New Images │
└─────────────────┘
```

## Configuration Files

### Helm Values
- `helm/nimbus/values.yaml` - Default image tags
- `helm/nimbus/templates/deployment-*.yaml` - imagePullPolicy: Always

### GitHub Actions
- `.github/workflows/deploy.yml` - Image build and push

### Deployment Scripts
- `scripts/fix-and-deploy-nimbus.sh` - Initial deployment
- `scripts/redeploy-nimbus.sh` - Update deployment
- `scripts/force-update-images.sh` - Force image refresh
