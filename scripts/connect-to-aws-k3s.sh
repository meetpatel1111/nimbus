#!/bin/bash
# Connect local kubectl to AWS K3s cluster

if [ -z "$1" ]; then
  echo "Usage: $0 <aws-instance-ip>"
  echo "Example: $0 54.123.45.67"
  exit 1
fi

INSTANCE_IP=$1

echo "🔗 Connecting to K3s cluster at $INSTANCE_IP..."

# Copy kubeconfig from AWS instance
echo "📥 Downloading kubeconfig..."
ssh -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "sudo cat /etc/rancher/k3s/k3s.yaml" > ~/.kube/config-aws

# Replace localhost with actual IP
sed -i "s/127.0.0.1/$INSTANCE_IP/g" ~/.kube/config-aws

# Backup existing config
if [ -f ~/.kube/config ]; then
  cp ~/.kube/config ~/.kube/config.backup
  echo "📦 Backed up existing kubeconfig to ~/.kube/config.backup"
fi

# Use the AWS config
cp ~/.kube/config-aws ~/.kube/config
chmod 600 ~/.kube/config

echo ""
echo "✅ Connected to AWS K3s cluster!"
echo ""
echo "Test connection:"
echo "  kubectl get nodes"
echo ""
echo "To restore local config:"
echo "  cp ~/.kube/config.backup ~/.kube/config"
