#!/bin/bash
# Check Nimbus deployment status

echo "🔍 Checking Nimbus Cloud Status..."
echo ""

# Check if K3s is running
echo "1️⃣ Checking K3s status..."
if systemctl is-active --quiet k3s; then
    echo "   ✅ K3s is running"
else
    echo "   ❌ K3s is NOT running"
    echo "   💡 Start it with: sudo systemctl start k3s"
fi
echo ""

# Check if kubectl works
echo "2️⃣ Checking kubectl access..."
if sudo kubectl get nodes &>/dev/null; then
    echo "   ✅ kubectl is working"
    sudo kubectl get nodes
else
    echo "   ❌ kubectl is not accessible"
fi
echo ""

# Check if nimbus namespace exists
echo "3️⃣ Checking nimbus namespace..."
if sudo kubectl get namespace nimbus &>/dev/null; then
    echo "   ✅ Nimbus namespace exists"
else
    echo "   ❌ Nimbus namespace does NOT exist"
    echo "   💡 Nimbus has not been deployed yet"
fi
echo ""

# Check nimbus pods
echo "4️⃣ Checking Nimbus pods..."
sudo kubectl get pods -n nimbus 2>/dev/null || echo "   ❌ No pods found in nimbus namespace"
echo ""

# Check nimbus services
echo "5️⃣ Checking Nimbus services..."
sudo kubectl get svc -n nimbus 2>/dev/null || echo "   ❌ No services found in nimbus namespace"
echo ""

# Check what's listening on ports
echo "6️⃣ Checking ports 30400 and 30401..."
if command -v netstat &>/dev/null; then
    sudo netstat -tlnp | grep -E ':(30400|30401)' || echo "   ❌ Nothing listening on ports 30400 or 30401"
elif command -v ss &>/dev/null; then
    sudo ss -tlnp | grep -E ':(30400|30401)' || echo "   ❌ Nothing listening on ports 30400 or 30401"
fi
echo ""

# Check all services in cluster
echo "7️⃣ All services with NodePort..."
sudo kubectl get svc -A | grep NodePort || echo "   ❌ No NodePort services found"
echo ""

echo "📊 Summary:"
echo "   To deploy Nimbus, run: curl -sSL https://raw.githubusercontent.com/meetpatel1111/nimbus/main/scripts/deploy-nimbus.sh | sudo bash"
