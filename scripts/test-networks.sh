#!/bin/bash
# Test script to validate Kubernetes networks (namespaces)

echo "🔍 Testing Nimbus Networks (Kubernetes Namespaces)"
echo "=================================================="
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install K3s first."
    exit 1
fi

echo "1️⃣ Listing all namespaces (networks):"
echo "--------------------------------------"
kubectl get namespaces
echo ""

echo "2️⃣ Testing API endpoint:"
echo "------------------------"
curl -s http://localhost:4000/api/networks | jq '.'
echo ""

echo "3️⃣ Network details:"
echo "-------------------"
for ns in $(kubectl get namespaces -o jsonpath='{.items[*].metadata.name}'); do
  if [[ ! "$ns" =~ ^(kube-|default) ]]; then
    echo "Network: $ns"
    echo "  Pods: $(kubectl get pods -n $ns --no-headers 2>/dev/null | wc -l)"
    echo "  Services: $(kubectl get svc -n $ns --no-headers 2>/dev/null | wc -l)"
    echo ""
  fi
done

echo "✅ Network validation complete!"
echo ""
echo "💡 To test locally (without K8s):"
echo "   curl http://localhost:4000/api/networks"
echo "   # Should return empty array []"
echo ""
echo "💡 To test on AWS (with K3s):"
echo "   ssh ubuntu@<instance-ip> 'curl -s http://localhost:4000/api/networks | jq .'"
