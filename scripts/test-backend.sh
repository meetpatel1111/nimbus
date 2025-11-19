#!/bin/bash
# Test Nimbus backend API endpoints

echo "🧪 Testing Nimbus Backend API"
echo "=============================="
echo ""

BACKEND_URL="http://localhost:30400"

echo "1️⃣ Testing dashboard stats..."
curl -s "$BACKEND_URL/api/dashboard/stats" | head -n 5
echo ""
echo ""

echo "2️⃣ Testing services list..."
curl -s "$BACKEND_URL/api/services" | head -n 10
echo ""
echo ""

echo "3️⃣ Testing VMs list..."
curl -s "$BACKEND_URL/api/vms"
echo ""
echo ""

echo "4️⃣ Testing resources list..."
curl -s "$BACKEND_URL/api/resources"
echo ""
echo ""

echo "5️⃣ Testing resource creation (POST)..."
curl -s -X POST "$BACKEND_URL/api/resources" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "storage",
    "name": "test-storage",
    "config": {
      "resourceGroup": "default",
      "region": "us-east-1",
      "type": "File Storage",
      "size": 100
    }
  }'
echo ""
echo ""

echo "6️⃣ Checking backend logs..."
kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml logs -n nimbus -l app=nimbus-backend --tail=20
echo ""

echo "✅ Test complete!"
