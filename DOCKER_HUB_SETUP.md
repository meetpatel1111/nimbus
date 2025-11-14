# 🐳 Docker Hub Setup Guide

Quick guide to set up Docker Hub for automated image builds and pushes.

## 📋 Prerequisites

You need a Docker Hub account. If you don't have one:
1. Go to https://hub.docker.com/signup
2. Create a free account
3. Verify your email

## 🔑 Step 1: Create Docker Hub Access Token

1. **Login to Docker Hub**: https://hub.docker.com
2. **Go to Account Settings**: Click your username → Account Settings
3. **Security**: Click "Security" in the left menu
4. **New Access Token**: Click "New Access Token"
5. **Configure**:
   - Description: `GitHub Actions - Nimbus`
   - Access permissions: `Read, Write, Delete`
6. **Generate**: Click "Generate"
7. **Copy Token**: Copy the token immediately (you won't see it again!)

## 🔐 Step 2: Add Secrets to GitHub

Go to your GitHub repository:

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**

Add these two secrets:

### Secret 1: DOCKER_USERNAME
```
Name: DOCKER_USERNAME
Value: your-dockerhub-username
```
Example: If your Docker Hub username is `johndoe`, enter `johndoe`

### Secret 2: DOCKER_PASSWORD
```
Name: DOCKER_PASSWORD
Value: your-access-token-from-step-1
```
Paste the access token you copied in Step 1

## ✅ Step 3: Verify Setup

After adding secrets, your workflow will:

1. ✅ Login to Docker Hub automatically
2. ✅ Build frontend image
3. ✅ Build backend image
4. ✅ Push to Docker Hub as:
   - `your-username/nimbus-platform:frontend-latest`
   - `your-username/nimbus-platform:frontend-<commit-sha>`
   - `your-username/nimbus-platform:backend-latest`
   - `your-username/nimbus-platform:backend-<commit-sha>`

## 🚀 Step 4: Push and Deploy

```bash
git push origin main
```

Go to **Actions** tab in GitHub to watch the deployment!

## 📦 Your Docker Images

After successful build, your images will be available at:

```
https://hub.docker.com/r/your-username/nimbus-platform
```

You can pull them with:
```bash
docker pull your-username/nimbus-platform:frontend-latest
docker pull your-username/nimbus-platform:backend-latest
```

## 🔍 Troubleshooting

### "unauthorized: incorrect username or password"
- ✅ Check DOCKER_USERNAME is your exact Docker Hub username
- ✅ Check DOCKER_PASSWORD is the access token (not your password!)
- ✅ Verify the access token has Read/Write permissions

### "denied: requested access to the resource is denied"
- ✅ Make sure the repository name matches your username
- ✅ Check if the repository exists on Docker Hub (it will be created automatically)

### Images not showing on Docker Hub
- ✅ Wait a few minutes after push
- ✅ Check GitHub Actions logs for errors
- ✅ Verify the workflow completed successfully

## 💡 Pro Tips

1. **Free Tier Limits**: Docker Hub free tier allows:
   - Unlimited public repositories
   - 1 private repository
   - 200 container pulls per 6 hours

2. **Image Tags**: The workflow creates two tags per image:
   - `latest` - Always points to the most recent build
   - `<commit-sha>` - Specific version for rollbacks

3. **Security**: 
   - ✅ Use access tokens (not passwords)
   - ✅ Limit token permissions to what's needed
   - ✅ Rotate tokens periodically
   - ✅ Never commit tokens to git

## 🎯 What Happens Next

Once configured, every push to `main` will:

1. Build your application
2. Create Docker images
3. Push to Docker Hub
4. Deploy infrastructure (if cloud provider selected)
5. Run bootstrap script
6. Deploy to Kubernetes

All automated! 🎉

## 📚 Additional Resources

- Docker Hub Docs: https://docs.docker.com/docker-hub/
- GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Docker Build Push Action: https://github.com/docker/build-push-action

---

**Ready to deploy? Add your secrets and push to GitHub!** 🚀
