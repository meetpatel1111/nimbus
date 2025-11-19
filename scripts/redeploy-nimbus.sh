#!/bin/bash
# Redeploy Nimbus with latest Docker images

echo "🔄 Redeploying Nimbus Cloud with latest images..."
echo ""

# Set Docker image names
if [ -z "$BACKEND_IMAGE" ]; then
  DOCKER_USER="${DOCKER_USERNAME:-meetpatel1111}"
  BACKEND_IMAGE="$DOCKER_USER/nimbus-platform:backend-latest"
fi

if [ -z "$FRONTEND_IMAGE" ]; then
  DOCKER_USER="${DOCKER_USERNAME:-meetpatel1111}"
  FRONTEND_IMAGE="$DOCKER_USER/nimbus-platform:frontend-latest"
fi

echo "📦 Using images:"
echo "   Backend:  $BACKEND_IMAGE"
echo "   Frontend: $FRONTEND_IMAGE"
echo ""

# Pull latest code for Helm chart
echo "1️⃣ Pulling latest Helm chart from GitHub..."
cd /tmp/nimbus 2>/dev/null || cd /tmp
if [ -d "nimbus" ]; then
    cd nimbus
    git pull
else
    git clone https://github.com/meetpatel1111/nimbus.git
    cd nimbus
fi
echo ""

# Force pull latest Docker images on the node
echo "2️⃣ Pulling latest Docker images..."
sudo crictl pull $BACKEND_IMAGE
sudo crictl pull $FRONTEND_IMAGE
echo ""

# Update deployment with new images using Helm
echo "3️⃣ Updating Nimbus deployment with latest images..."
sudo helm upgrade nimbus ./helm/nimbus \
  --kubeconfig /etc/rancher/k3s/k3s.yaml \
  -n nimbus \
  --set backend.image="$BACKEND_IMAGE" \
  --set frontend.image="$FRONTEND_IMAGE" \
  --set backend.imagePullPolicy=Always \
  --set frontend.imagePullPolicy=Always \
  --wait \
  --timeout 5m
echo ""

# Wait for rollout to complete
echo "4️⃣ Waiting for deployments to be ready..."
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml rollout status deployment nimbus-backend -n nimbus --timeout=300s
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml rollout status deployment nimbus-frontend -n nimbus --timeout=300s
echo ""

# Show deployment status
echo "6️⃣ Deployment Status:"
echo ""
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get pods -n nimbus
echo ""
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get svc -n nimbus
echo ""

# Get instance IP
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')

echo "✅ Redeployment Complete!"
echo ""
echo "🌐 Access Nimbus at:"
echo "   Backend (recommended): http://$INSTANCE_IP:30400"
echo "   Frontend only:         http://$INSTANCE_IP:30401"
echo ""
echo "💡 Note: The backend serves both UI and API, so use port 30400 for full functionality"
