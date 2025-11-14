const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '../frontend/dist')));

// Mock data stores
let vms = [];
let networks = [];
let volumes = [];

// All 21 services in the mini-cloud
const ALL_SERVICES = [
  // Core Platform (3)
  { id: 'k3s', name: 'k3s', category: 'platform', description: 'Lightweight Kubernetes cluster', namespace: 'kube-system', status: 'running' },
  { id: 'longhorn', name: 'Longhorn', category: 'platform', description: 'Distributed block storage', namespace: 'longhorn-system', status: 'running', endpoint: 'http://localhost:30080/longhorn' },
  { id: 'traefik', name: 'Traefik', category: 'platform', description: 'Ingress controller & load balancer', namespace: 'ingress', status: 'running', endpoint: 'http://localhost:30080/dashboard/' },
  
  // Storage (1)
  { id: 'minio', name: 'MinIO', category: 'storage', description: 'S3-compatible object storage', namespace: 'storage', status: 'running', endpoint: 'http://localhost:9000' },
  
  // Serverless (1)
  { id: 'openfaas', name: 'OpenFaaS', category: 'serverless', description: 'Serverless functions-as-a-service', namespace: 'openfaas', status: 'running', endpoint: 'http://localhost:8080' },
  
  // Workflow (1)
  { id: 'n8n', name: 'n8n', category: 'workflow', description: 'Workflow automation platform', namespace: 'workflows', status: 'running', endpoint: 'http://localhost:5678' },
  
  // Security (2)
  { id: 'keycloak', name: 'Keycloak', category: 'security', description: 'Identity provider (SSO, RBAC, OAuth2)', namespace: 'platform', status: 'running', endpoint: 'http://localhost:8180' },
  { id: 'vault', name: 'Vault', category: 'security', description: 'Secret management', namespace: 'platform', status: 'running', endpoint: 'http://localhost:8200' },
  
  // Messaging (2)
  { id: 'nats', name: 'NATS', category: 'messaging', description: 'High-speed message broker', namespace: 'apps', status: 'running' },
  { id: 'rabbitmq', name: 'RabbitMQ', category: 'messaging', description: 'Queueing system (AMQP)', namespace: 'apps', status: 'running', endpoint: 'http://localhost:15672' },
  
  // Observability (3)
  { id: 'prometheus', name: 'Prometheus', category: 'observability', description: 'Metrics collection', namespace: 'monitoring', status: 'running', endpoint: 'http://localhost:9090' },
  { id: 'grafana', name: 'Grafana', category: 'observability', description: 'Dashboards & visualization', namespace: 'monitoring', status: 'running', endpoint: 'http://localhost:3000' },
  { id: 'loki', name: 'Loki + Promtail', category: 'observability', description: 'Logs collection & query', namespace: 'monitoring', status: 'running' },
  
  // Backup (1)
  { id: 'velero', name: 'Velero', category: 'backup', description: 'Backup/restore for Kubernetes', namespace: 'velero', status: 'running' },
  
  // DevTools (2)
  { id: 'gitea', name: 'Gitea', category: 'devtools', description: 'Git hosting platform', namespace: 'ci', status: 'running', endpoint: 'http://localhost:3001' },
  { id: 'drone', name: 'Drone CI', category: 'devtools', description: 'CI/CD pipeline runner', namespace: 'ci', status: 'running', endpoint: 'http://localhost:8081' },
  
  // UI (1)
  { id: 'nimbus-ui', name: 'Nimbus UI', category: 'platform', description: 'Web dashboard for cloud management', namespace: 'default', status: 'running', endpoint: 'http://localhost:4000' },
  
  // Demo (1)
  { id: 'nginx-demo', name: 'Nginx Demo', category: 'platform', description: 'Demo app to confirm cluster', namespace: 'demo', status: 'running' },
];

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const runningServices = ALL_SERVICES.filter(s => s.status === 'running').length;
  const runningVMs = vms.filter(v => v.status === 'running').length;
  
  res.json({
    services: {
      total: ALL_SERVICES.length,
      running: runningServices,
      stopped: ALL_SERVICES.length - runningServices
    },
    vms: {
      total: vms.length,
      running: runningVMs,
      stopped: vms.length - runningVMs
    },
    storage: {
      total: '500 GB',
      used: '120 GB',
      available: '380 GB'
    },
    cpu: {
      total: 8,
      used: 4,
      percent: 50
    },
    memory: {
      total: '16 GB',
      used: '8.5 GB',
      percent: 53
    },
    networks: {
      total: networks.length,
      active: networks.filter(n => n.status === 'active').length
    }
  });
});

// Services endpoints
app.get('/api/services', (req, res) => {
  res.json(ALL_SERVICES);
});

app.post('/api/services/:id/restart', (req, res) => {
  const service = ALL_SERVICES.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  // In real implementation, would restart the k8s deployment
  console.log(`Restarting service: ${service.name}`);
  res.json({ ok: true, message: `Service ${service.name} restarted` });
});

// Create a new custom service
app.post('/api/services/create', async (req, res) => {
  const { name, namespace, image, replicas, port, serviceType, category } = req.body;
  
  if (!name || !namespace || !image) {
    return res.status(400).json({ error: 'Missing required fields: name, namespace, image' });
  }

  console.log(`Creating service: ${name} in namespace ${namespace}`);
  
  // In a real implementation, this would use the kubernetes-client.js module
  // For now, we'll simulate the creation
  try {
    // Simulate kubectl commands
    const newService = {
      id: `custom-${Date.now()}`,
      name,
      category: category || 'custom',
      description: `Custom service running ${image}`,
      namespace,
      status: 'running',
      endpoint: serviceType === 'NodePort' ? `http://localhost:${30000 + Math.floor(Math.random() * 2000)}` : undefined
    };

    // Add to services list (in memory for demo)
    ALL_SERVICES.push(newService);

    res.json({
      ok: true,
      message: `Service ${name} created successfully`,
      service: newService,
      deployment: {
        name,
        namespace,
        image,
        replicas,
        port
      },
      note: 'To enable real Kubernetes integration, ensure kubectl is configured and use the kubernetes-client.js module'
    });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({
      error: err.message,
      note: 'Make sure kubectl is installed and configured to connect to your k3s cluster'
    });
  }
});

// VMs endpoints
app.get('/api/vms', (req, res) => {
  res.json(vms);
});

app.post('/api/vms', (req, res) => {
  const { name, cpu, memory, disk, image } = req.body;
  const vm = {
    id: `vm-${Date.now()}`,
    name,
    cpu,
    memory,
    disk,
    image,
    status: 'running',
    ip: `10.0.1.${Math.floor(Math.random() * 200 + 10)}`,
    createdAt: new Date().toISOString()
  };
  vms.push(vm);
  res.json(vm);
});

app.delete('/api/vms/:id', (req, res) => {
  vms = vms.filter(v => v.id !== req.params.id);
  res.json({ ok: true });
});

app.post('/api/vms/:id/:action', (req, res) => {
  const vm = vms.find(v => v.id === req.params.id);
  if (!vm) {
    return res.status(404).json({ error: 'VM not found' });
  }
  const action = req.params.action;
  if (action === 'start') {
    vm.status = 'running';
  } else if (action === 'stop') {
    vm.status = 'stopped';
  }
  res.json({ ok: true, vm });
});

// Storage endpoints
app.get('/api/storage/volumes', (req, res) => {
  res.json(volumes);
});

app.post('/api/storage/volumes', (req, res) => {
  const { name, size, type } = req.body;
  const volume = {
    id: `vol-${Date.now()}`,
    name,
    size,
    type,
    used: '0 GB',
    available: size,
    status: 'available',
    attachedTo: null
  };
  volumes.push(volume);
  res.json(volume);
});

app.delete('/api/storage/volumes/:id', (req, res) => {
  volumes = volumes.filter(v => v.id !== req.params.id);
  res.json({ ok: true });
});

// Networks endpoints
app.get('/api/networks', (req, res) => {
  res.json(networks);
});

app.post('/api/networks', (req, res) => {
  const { name, cidr, type } = req.body;
  const parts = cidr.split('.');
  const gateway = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
  
  const network = {
    id: `net-${Date.now()}`,
    name,
    cidr,
    gateway,
    type,
    status: 'active',
    connectedVMs: 0
  };
  networks.push(network);
  res.json(network);
});

app.delete('/api/networks/:id', (req, res) => {
  networks = networks.filter(n => n.id !== req.params.id);
  res.json({ ok: true });
});

// Deploy endpoint - provisions cloud infrastructure
app.post('/api/deploy', async (req, res) => {
  const { provider, name, region, instanceType } = req.body;
  
  if (!provider || provider === 'none') {
    return res.status(400).json({ error: 'Please select a cloud provider' });
  }

  console.log(`Deploying to ${provider}: ${name} in ${region}`);

  try {
    let output = '';
    
    if (provider === 'aws') {
      const cmd = `cd infra/terraform/aws && terraform init -input=false && terraform apply -auto-approve -var="aws_region=${region}" -var="instance_name=${name}"`;
      const { stdout, stderr } = await execAsync(cmd);
      output = stdout + stderr;
      
      // After infrastructure is up, run bootstrap script
      output += '\n\n=== Running bootstrap script ===\n';
      output += 'Bootstrap script would be executed on the remote instance via SSH...\n';
      output += 'This installs all 21 services: k3s, Longhorn, Traefik, MinIO, OpenFaaS, n8n, Keycloak, Vault, NATS, RabbitMQ, Prometheus, Grafana, Loki, Velero, Gitea, Drone\n';
      
    } else if (provider === 'azure') {
      const cmd = `cd infra/terraform/azure && terraform init -input=false && terraform apply -auto-approve -var="vm_name=${name}" -var="location=${region}"`;
      const { stdout, stderr } = await execAsync(cmd);
      output = stdout + stderr;
      
      // After infrastructure is up, run bootstrap script
      output += '\n\n=== Running bootstrap script ===\n';
      output += 'Bootstrap script would be executed on the remote instance via SSH...\n';
      output += 'This installs all 21 services: k3s, Longhorn, Traefik, MinIO, OpenFaaS, n8n, Keycloak, Vault, NATS, RabbitMQ, Prometheus, Grafana, Loki, Velero, Gitea, Drone\n';
    }

    res.json({
      ok: true,
      message: 'Deployment successful',
      output,
      provider,
      name,
      region
    });
    
  } catch (err) {
    console.error('Deployment error:', err);
    res.status(500).json({
      error: err.message,
      stderr: err.stderr,
      stdout: err.stdout
    });
  }
});

// Legacy resource groups endpoint (for backwards compatibility)
app.get('/api/resource-groups', (req, res) => {
  res.json([{ name: 'default', location: 'local' }]);
});

app.post('/api/resource-groups', (req, res) => {
  res.json(req.body);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🌥 Nimbus Mini-Cloud Backend listening on port ${PORT}`);
  console.log(`Managing ${ALL_SERVICES.length} services across the platform`);
});
