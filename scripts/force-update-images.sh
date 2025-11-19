#!/bin/bash
# Force update Nimbus Docker images and redeploy

set -e

echo "🔄 Force Updating Nimbus Docker Images"
echo "======================================="
echo ""

# Configuration
if [ -z "$BACKEND_IMAGE" ]; then
  DOCKER_USER="${DOCKER_USERNAME:-meetpatel1111}"
  BACKEND_IMAGE="$DOCKER_USER/nimbus-platform:backend-latest"
fi

if [ -z "$FRONTEND_IMAGE" ]; then
  DOCKER_USER="${DOCKER_USERNAME:-meetpatel1111}"
  FRONTEND_IMAGE="$DOCKER_USER/nimbus-platform:frontend-latest"
fi

echo "📦 Target images:"
echo "   Backend:  $BACKEND_IMAGE"
echo "   Frontend: $FRONTEND_IMAGE"
echo ""

# Step 1: Delete old images from node
echo "1️⃣ Removing old cached images from node..."
sudo crictl rmi $BACKEND_IMAGE 2>/dev/null || echo "   Backend image not cached"
sudo crictl rmi $FRONTEND_IMAGE 2>/dev/null || echo "   Frontend image not cached"
echo ""

# Step 2: Pull fresh images
echo "2️⃣ Pulling fresh images from Docker Hub..."
echo "   Pulling backend..."
sudo crictl pull $BACKEND_IMAGE
echo "   Pulling frontend..."
sudo crictl pull $FRONTEND_IMAGE
echo ""

# Step 3: Delete existing pods to force recreation
echo "3️⃣ Deleting existing pods to force image update..."
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml delete pods -n nimbus -l app=nimbus-backend --ignore-not-found=true
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml delete pods -n nimbus -l app=nimbus-frontend --ignore-not-found=true
echo ""

# Step 4: Wait for new pods to be ready
echo "4️⃣ Waiting for new pods to start..."
sleep 5
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml wait --for=condition=Ready pods -n nimbus -l app=nimbus-backend --timeout=300s
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml wait --for=condition=Ready pods -n nimbus -l app=nimbus-frontend --timeout=300s
echo ""

# Step 5: Verify deployment
echo "5️⃣ Verifying deployment..."
echo ""
echo "Pods:"
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get pods -n nimbus -o wide
echo ""
echo "Images in use:"
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get pods -n nimbus -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'
echo ""

# Get instance IP
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')

echo "✅ Images Updated Successfully!"
echo ""
echo "🌐 Access Nimbus at:"
echo "   http://$INSTANCE_IP:30400"
echo ""
echo "💡 Verify the update:"
echo "   curl http://$INSTANCE_IP:30400/api/dashboard/stats"
