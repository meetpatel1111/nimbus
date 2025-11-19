#!/bin/bash
# Redeploy Nimbus with latest code changes

echo "🔄 Redeploying Nimbus Cloud with latest changes..."
echo ""

# Pull latest code
echo "1️⃣ Pulling latest code from GitHub..."
cd /tmp/nimbus 2>/dev/null || cd /tmp
if [ -d "nimbus" ]; then
    cd nimbus
    git pull
else
    git clone https://github.com/meetpatel1111/nimbus.git
    cd nimbus
fi
echo ""

# Restart backend deployment
echo "2️⃣ Restarting backend deployment..."
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml rollout restart deployment nimbus-backend -n nimbus
echo ""

# Wait for backend to be ready
echo "3️⃣ Waiting for backend to be ready..."
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml rollout status deployment nimbus-backend -n nimbus --timeout=300s
echo ""

# Restart frontend deployment
echo "4️⃣ Restarting frontend deployment..."
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml rollout restart deployment nimbus-frontend -n nimbus
echo ""

# Wait for frontend to be ready
echo "5️⃣ Waiting for frontend to be ready..."
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
