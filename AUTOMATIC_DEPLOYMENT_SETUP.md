# Automatic Deployment Setup

## Overview
Enable automatic deployment so every push to main branch automatically updates your Nimbus Cloud deployment.

## Prerequisites
- AWS instance with Nimbus deployed
- GitHub repository with Nimbus code
- SSH access to AWS instance

## Setup Steps

### 1. Get AWS Instance IP
```bash
# From Terraform output
cd infra/terraform/aws
terraform output public_ip

# Or from AWS Console
# EC2 > Instances > Select your instance > Copy Public IPv4 address
```

### 2. Get SSH Private Key
```bash
# If you created the key with Terraform
cat ~/.ssh/id_rsa

# Or from AWS
# EC2 > Key Pairs > Actions > Export private key
```

### 3. Add GitHub Secrets

Go to your GitHub repository:
1. Click **Settings**
2. Click **Secrets and variables** > **Actions**
3. Click **New repository secret**

Add these secrets:

#### `AWS_INSTANCE_IP`
- **Name**: `AWS_INSTANCE_IP`
- **Value**: Your instance IP (e.g., `54.123.45.67`)

#### `SSH_PRIVATE_KEY`
- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Your SSH private key (entire content including `-----BEGIN` and `-----END`)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...
-----END OPENSSH PRIVATE KEY-----
```

#### `DOCKER_USERNAME`
- **Name**: `DOCKER_USERNAME`
- **Value**: Your Docker Hub username (e.g., `meetpatel1111`)

#### `DOCKER_PASSWORD`
- **Name**: `DOCKER_PASSWORD`
- **Value**: Your Docker Hub password or access token

### 4. Test Automatic Deployment

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test automatic deployment"
git push origin main

# Watch GitHub Actions
# Go to: GitHub > Actions tab
# You should see "Nimbus - Complete Deployment Pipeline" running
```

### 5. Verify Deployment

After GitHub Actions completes:
```bash
# Check your Nimbus instance
curl http://<your-instance-ip>:30400/api/dashboard/stats

# Or visit in browser
http://<your-instance-ip>:30400
```

## How It Works

### Workflow Diagram
```
┌─────────────────┐
│  Push to main   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│ Triggered       │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ Build & Test    │   │ Build Docker    │
│ Application     │   │ Images          │
└────────┬────────┘   └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Push to Docker Hub  │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ SSH to AWS Instance │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Copy Scripts        │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Run redeploy.sh     │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Pull Latest Images  │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Update Deployment   │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │ Verify & Complete   │
         └─────────────────────┘
```

### What Gets Deployed Automatically

When you push changes to these paths:
- `backend/**` - Backend API updates
- `frontend/**` - Frontend UI updates
- `helm/**` - Kubernetes configuration
- `scripts/**` - Deployment scripts
- `.github/workflows/deploy.yml` - Workflow updates

### What Doesn't Trigger Deployment

Changes to these files won't trigger deployment:
- Documentation files (`.md`)
- Infrastructure code (`infra/**`)
- Configuration files (unless in above paths)

## Troubleshooting

### Deployment Fails with "Permission denied"
**Problem**: SSH key not configured correctly

**Solution**:
1. Verify SSH key format (must include BEGIN/END lines)
2. Check key has correct permissions on instance
3. Test SSH manually: `ssh -i ~/.ssh/id_rsa ubuntu@<instance-ip>`

### Deployment Fails with "Host key verification failed"
**Problem**: Instance IP changed or not in known_hosts

**Solution**:
1. Update `AWS_INSTANCE_IP` secret with new IP
2. Workflow automatically handles host key verification

### Images Not Updating
**Problem**: Old images cached on instance

**Solution**:
1. SSH to instance
2. Run: `sudo bash ~/force-update-images.sh`
3. Or manually: `kubectl delete pods -n nimbus --all`

### Workflow Doesn't Run
**Problem**: Secrets not configured or push to wrong branch

**Solution**:
1. Verify all 4 secrets are set in GitHub
2. Ensure pushing to `main` branch
3. Check Actions tab for error messages

## Manual Override

If you need to deploy manually:

### Option 1: GitHub Actions UI
1. Go to **Actions** tab
2. Click **Nimbus - Complete Deployment Pipeline**
3. Click **Run workflow**
4. Select options and run

### Option 2: SSH to Instance
```bash
ssh ubuntu@<instance-ip>
sudo bash ~/redeploy-nimbus.sh
```

## Monitoring Deployments

### View Logs in GitHub Actions
1. Go to **Actions** tab
2. Click on the running/completed workflow
3. Click on job name to see logs

### View Logs on Instance
```bash
ssh ubuntu@<instance-ip>

# Check pod logs
kubectl logs -n nimbus -l app=nimbus-backend --tail=100

# Check deployment status
kubectl get pods -n nimbus

# Check recent events
kubectl get events -n nimbus --sort-by='.lastTimestamp'
```

## Best Practices

1. **Test locally first** before pushing to main
2. **Use feature branches** for development
3. **Merge to main** only when ready to deploy
4. **Monitor Actions tab** after pushing
5. **Verify deployment** after Actions complete
6. **Keep secrets secure** - never commit them

## Disabling Automatic Deployment

If you want to disable automatic deployment:

1. Edit `.github/workflows/deploy.yml`
2. Comment out the `push:` trigger:
```yaml
on:
  # push:
  #   branches: [ main ]
  workflow_dispatch:
    ...
```
3. Commit and push

Now deployment only runs when manually triggered.

## Re-enabling Automatic Deployment

1. Edit `.github/workflows/deploy.yml`
2. Uncomment the `push:` trigger:
```yaml
on:
  push:
    branches: [ main ]
  workflow_dispatch:
    ...
```
3. Commit and push

## Support

For issues:
- Check GitHub Actions logs
- Check instance logs: `kubectl logs -n nimbus -l app=nimbus-backend`
- Review `DEPLOYMENT_SCRIPTS_USAGE.md`
- Review `DOCKER_IMAGE_UPDATES.md`
