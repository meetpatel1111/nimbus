#!/bin/bash
# Complete fix and deployment script for Nimbus Cloud UI

set -e

echo "🔧 Nimbus Cloud - Complete Setup & Deployment"
echo "=============================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# 1. Check and start K3s
echo "1️⃣ Checking K3s..."
if ! command_exists kubectl; then
    echo "   ❌ K3s not installed. Installing K3s..."
    curl -sfL https://get.k3s.io | sh -
    echo "   ⏳ Waiting for K3s to be ready..."
    sleep 10
    sudo kubectl wait --for=condition=Ready nodes --all --timeout=300s
else
    echo "   ✅ K3s is installed"
    if ! systemctl is-active --quiet k3s; then
        echo "   🔄 Starting K3s..."
        sudo systemctl start k3s
        sleep 5
    fi
fi
echo ""

# 2. Install Helm if needed
echo "2️⃣ Checking Helm..."
if ! command_exists helm; then
    echo "   📦 Installing Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
else
    echo "   ✅ Helm is installed"
fi
echo ""

# 3. Create namespace
echo "3️⃣ Creating nimbus namespace..."
sudo kubectl create namespace nimbus --dry-run=client -o yaml | sudo kubectl apply -f -
echo "   ✅ Namespace ready"
echo ""

# 4. Clone/update repo
echo "4️⃣ Getting Nimbus code..."
cd /tmp
if [ -d "nimbus" ]; then
    echo "   🔄 Updating existing repo..."
    cd nimbus
    git pull
else
    echo "   📥 Cloning repo..."
    git clone https://github.com/meetpatel1111/nimbus.git
    cd nimbus
fi
echo ""

# 5. Deploy with Helm
echo "5️⃣ Deploying Nimbus with Helm..."
BACKEND_IMAGE="${BACKEND_IMAGE:-meetpatel1111/nimbus-platform:backend-latest}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-meetpatel1111/nimbus-platform:frontend-latest}"

echo "   🐳 Backend:  $BACKEND_IMAGE"
echo "   🐳 Frontend: $FRONTEND_IMAGE"

# Set KUBECONFIG for helm to use K3s config
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

sudo -E helm upgrade --install nimbus ./helm/nimbus \
  -n nimbus \
  --set backend.image="$BACKEND_IMAGE" \
  --set frontend.image="$FRONTEND_IMAGE" \
  --wait \
  --timeout 10m

echo "   ✅ Helm deployment complete"
echo ""

# 6. Wait for pods to be ready
echo "6️⃣ Waiting for pods to be ready..."
sudo kubectl wait --for=condition=Ready pods -n nimbus --all --timeout=300s || true
echo ""

# 7. Show status
echo "7️⃣ Deployment Status:"
echo ""
echo "📦 Pods:"
sudo kubectl get pods -n nimbus
echo ""
echo "🌐 Services:"
sudo kubectl get svc -n nimbus
echo ""

# 8. Get access URLs
echo "8️⃣ Access Information:"
echo ""
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || hostname -I | awk '{print $1}')
echo "   🌐 Frontend UI: http://$INSTANCE_IP:30401"
echo "   🔌 Backend API: http://$INSTANCE_IP:30400"
echo ""

# 9. Test connectivity
echo "9️⃣ Testing local connectivity..."
sleep 5
if curl -s http://localhost:30401 > /dev/null; then
    echo "   ✅ Frontend is responding locally"
else
    echo "   ⚠️  Frontend not responding yet (may still be starting)"
fi

if curl -s http://localhost:30400 > /dev/null; then
    echo "   ✅ Backend is responding locally"
else
    echo "   ⚠️  Backend not responding yet (may still be starting)"
fi
echo ""

echo "✅ Deployment Complete!"
echo ""
echo "📝 Troubleshooting commands:"
echo "   Check pods:     sudo kubectl get pods -n nimbus"
echo "   Check logs:     sudo kubectl logs -n nimbus -l app=nimbus-frontend"
echo "   Check services: sudo kubectl get svc -n nimbus"
echo "   Restart:        sudo kubectl rollout restart deployment -n nimbus"
