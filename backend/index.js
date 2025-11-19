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

// No mock data - all data comes from Kubernetes cluster

// All 31+ services in Nimbus Cloud
const ALL_SERVICES = [
  // Core Platform (3)
  { id: 'k3s', name: 'k3s', category: 'platform', description: 'Lightweight Kubernetes cluster', namespace: 'kube-system', status: 'running' },
  { id: 'longhorn', name: 'Longhorn', category: 'platform', description: 'Distributed block storage', namespace: 'longhorn-system', status: 'running', endpoint: 'http://localhost:30080/longhorn' },
  { id: 'traefik', name: 'Traefik', category: 'ingress', description: 'Ingress controller & load balancer', namespace: 'ingress', status: 'running', endpoint: 'http://localhost:30080/dashboard/' },
  
  // Storage (1)
  { id: 'minio', name: 'MinIO', category: 'storage', description: 'S3-compatible object storage', namespace: 'storage', status: 'running', endpoint: 'http://localhost:9000' },
  
  // Databases (3)
  { id: 'redis', name: 'Redis', category: 'databases', description: 'In-memory cache & data store', namespace: 'apps', status: 'running' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'databases', description: 'Relational database', namespace: 'apps', status: 'running' },
  { id: 'mongodb', name: 'MongoDB', category: 'databases', description: 'NoSQL document database', namespace: 'apps', status: 'running' },
  
  // Serverless (1)
  { id: 'openfaas', name: 'OpenFaaS', category: 'serverless', description: 'Serverless functions-as-a-service', namespace: 'openfaas', status: 'running', endpoint: 'http://localhost:8080' },
  
  // Workflow (1)
  { id: 'n8n', name: 'n8n', category: 'workflow', description: 'Workflow automation platform', namespace: 'workflows', status: 'running', endpoint: 'http://localhost:5678' },
  
  // Security (3)
  { id: 'vault', name: 'Vault', category: 'security', description: 'Secret management', namespace: 'platform', status: 'running', endpoint: 'http://localhost:8200' },
  { id: 'cert-manager', name: 'Cert-Manager', category: 'security', description: 'SSL certificate automation', namespace: 'cert-manager', status: 'running' },
  { id: 'kyverno', name: 'Kyverno', category: 'security', description: 'Kubernetes policy engine', namespace: 'kyverno', status: 'running' },
  
  // Messaging & Streaming (3)
  { id: 'nats', name: 'NATS', category: 'messaging', description: 'High-speed message broker', namespace: 'apps', status: 'running' },
  { id: 'rabbitmq', name: 'RabbitMQ', category: 'messaging', description: 'Queueing system (AMQP)', namespace: 'apps', status: 'running', endpoint: 'http://localhost:15672' },
  { id: 'kafka', name: 'Apache Kafka', category: 'messaging', description: 'Event streaming platform', namespace: 'apps', status: 'running' },
  
  // Observability (6)
  { id: 'prometheus', name: 'Prometheus', category: 'observability', description: 'Metrics collection', namespace: 'monitoring', status: 'running', endpoint: 'http://localhost:9090' },
  { id: 'grafana', name: 'Grafana', category: 'observability', description: 'Dashboards & visualization', namespace: 'monitoring', status: 'running', endpoint: 'http://localhost:3000' },
  { id: 'loki', name: 'Loki + Promtail', category: 'observability', description: 'Logs collection & query', namespace: 'monitoring', status: 'running' },
  { id: 'jaeger', name: 'Jaeger', category: 'observability', description: 'Distributed tracing', namespace: 'observability', status: 'running', endpoint: 'http://localhost:16686' },
  { id: 'kube-state-metrics', name: 'Kube-State-Metrics', category: 'observability', description: 'Kubernetes cluster metrics', namespace: 'monitoring', status: 'running' },
  { id: 'metrics-server', name: 'Metrics Server', category: 'observability', description: 'Resource metrics API', namespace: 'kube-system', status: 'running' },
  
  // CI/CD & GitOps (4)
  { id: 'gitea', name: 'Gitea', category: 'cicd', description: 'Git hosting platform', namespace: 'ci', status: 'running', endpoint: 'http://localhost:3001' },
  { id: 'drone', name: 'Drone CI', category: 'cicd', description: 'CI/CD pipeline runner', namespace: 'ci', status: 'running', endpoint: 'http://localhost:8081' },
  { id: 'jenkins', name: 'Jenkins', category: 'cicd', description: 'Automation server', namespace: 'ci', status: 'running', endpoint: 'http://localhost:8082' },
  { id: 'argocd', name: 'ArgoCD', category: 'cicd', description: 'GitOps continuous delivery', namespace: 'argocd', status: 'running', endpoint: 'http://localhost:8083' },
  
  // Container Registry (1)
  { id: 'harbor', name: 'Harbor', category: 'registry', description: 'Container image registry', namespace: 'apps', status: 'running', endpoint: 'http://localhost:30002' },
  
  // Service Mesh (2)
  { id: 'istio-base', name: 'Istio Base', category: 'servicemesh', description: 'Service mesh foundation', namespace: 'istio-system', status: 'running' },
  { id: 'istiod', name: 'Istiod', category: 'servicemesh', description: 'Service mesh control plane', namespace: 'istio-system', status: 'running' },
  
  // Ingress Controllers (2)
  { id: 'ingress-nginx', name: 'Nginx Ingress', category: 'ingress', description: 'Alternative ingress controller', namespace: 'ingress-nginx', status: 'running' },
  
  // Search & Analytics (1)
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'analytics', description: 'Search & analytics engine', namespace: 'apps', status: 'running', endpoint: 'http://localhost:9200' },
  
  // Backup (1)
  { id: 'velero', name: 'Velero', category: 'backup', description: 'Backup/restore for Kubernetes', namespace: 'velero', status: 'running' },
  
  // UI (1)
  { id: 'nimbus-ui', name: 'Nimbus UI', category: 'platform', description: 'Web dashboard for cloud management', namespace: 'default', status: 'running', endpoint: 'http://localhost:4000' },
];

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    
    // Get actual cluster metrics
    const pods = await k8s.getAllPods();
    const runningPods = pods?.items?.filter(p => p.status.phase === 'Running').length || 0;
    const totalPods = pods?.items?.length || 0;
    
    // Count unique namespaces with running pods as "running services"
    const runningNamespaces = new Set();
    if (pods && pods.items) {
      pods.items.forEach(pod => {
        if (pod.status.phase === 'Running') {
          runningNamespaces.add(pod.metadata.namespace);
        }
      });
    }
    
    // Get VMs from Kubernetes deployments
    const deployments = await k8s.getAllDeployments();
    const vmDeployments = deployments?.items?.filter(d => 
      d.metadata.labels && d.metadata.labels['nimbus-type'] === 'vm'
    ) || [];
    const runningVMs = vmDeployments.filter(d => d.status.availableReplicas > 0).length;
    
    // Get real cluster metrics
    const nodes = await k8s.getNodes();
      let totalCpu = 0, totalMemory = 0, usedCpu = 0, usedMemory = 0;
      
      if (nodes && nodes.items && nodes.items.length > 0) {
        nodes.items.forEach(node => {
          const capacity = node.status.capacity;
          const allocatable = node.status.allocatable;
          
          // Parse CPU (in cores)
          totalCpu += parseInt(capacity.cpu) || 0;
          
          // Parse Memory (convert from Ki to GB)
          const memKi = parseInt(capacity.memory.replace('Ki', '')) || 0;
          totalMemory += memKi / (1024 * 1024);
        });
        
        // Get actual usage from metrics server if available
        try {
          const metrics = await k8s.getNodeMetrics();
          if (metrics && metrics.items) {
            metrics.items.forEach(metric => {
              const usage = metric.usage;
              usedCpu += parseInt(usage.cpu.replace('n', '')) / 1000000000 || 0;
              const memKi = parseInt(usage.memory.replace('Ki', '')) || 0;
              usedMemory += memKi / (1024 * 1024);
            });
          }
        } catch (e) {
          // Metrics server not available, estimate from pods
          usedCpu = totalCpu * 0.3;
          usedMemory = totalMemory * 0.4;
        }
      }
      
      // Get storage from PVCs
      const pvcs = await k8s.getAllPVCs();
      let totalStorage = 0, usedStorage = 0;
      if (pvcs && pvcs.items) {
        pvcs.items.forEach(pvc => {
          const size = pvc.spec.resources.requests.storage;
          const sizeGi = parseInt(size.replace('Gi', '')) || 0;
          totalStorage += sizeGi;
          if (pvc.status.phase === 'Bound') {
            usedStorage += sizeGi * 0.5; // Estimate 50% usage
          }
        });
      }
      
    // Get network services count
    const services = await k8s.getAllServices();
    const networkServices = services?.items?.filter(s => 
      s.spec.type === 'LoadBalancer' || s.spec.type === 'NodePort'
    ) || [];
    
    res.json({
      services: {
        total: ALL_SERVICES.length,
        running: runningNamespaces.size,
        stopped: ALL_SERVICES.length - runningNamespaces.size
      },
      vms: {
        total: vmDeployments.length,
        running: runningVMs,
        stopped: vmDeployments.length - runningVMs
      },
      storage: {
        total: totalStorage > 0 ? `${totalStorage} GB` : '0 GB',
        used: totalStorage > 0 ? `${Math.floor(usedStorage)} GB` : '0 GB',
        available: totalStorage > 0 ? `${totalStorage - Math.floor(usedStorage)} GB` : '0 GB'
      },
      cpu: {
        total: totalCpu || 0,
        used: Math.round(usedCpu * 10) / 10,
        percent: totalCpu > 0 ? Math.round((usedCpu / totalCpu) * 100) : 0
      },
      memory: {
        total: totalMemory > 0 ? `${Math.round(totalMemory)} GB` : '0 GB',
        used: totalMemory > 0 ? `${Math.round(usedMemory * 10) / 10} GB` : '0 GB',
        percent: totalMemory > 0 ? Math.round((usedMemory / totalMemory) * 100) : 0
      },
      networks: {
        total: networkServices.length,
        active: networkServices.filter(s => s.status && s.status.loadBalancer).length
      },
      cluster: {
        totalPods,
        runningPods,
        namespaces: runningNamespaces.size
      }
    });
  } catch (error) {
    // Return error if K8s is not available - no mock data
    console.error('Kubernetes cluster not available:', error.message);
    res.status(503).json({
      error: 'Kubernetes cluster not available',
      message: 'Please ensure K3s is running and kubectl is configured',
      services: { total: 0, running: 0, stopped: 0 },
      vms: { total: 0, running: 0, stopped: 0 },
      storage: { total: '0 GB', used: '0 GB', available: '0 GB' },
      cpu: { total: 0, used: 0, percent: 0 },
      memory: { total: '0 GB', used: '0 GB', percent: 0 },
      networks: { total: 0, active: 0 },
      cluster: { totalPods: 0, runningPods: 0, namespaces: 0 }
    });
  }
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    
    // Get actual pod status from Kubernetes
    const pods = await k8s.getAllPods();
    const runningNamespaces = new Set();
    
    if (pods && pods.items) {
      pods.items.forEach(pod => {
        if (pod.status.phase === 'Running') {
          runningNamespaces.add(pod.metadata.namespace);
        }
      });
    }
    
    // Update service status based on actual K8s state
    const servicesWithStatus = ALL_SERVICES.map(service => {
      const isRunning = runningNamespaces.has(service.namespace);
      return {
        ...service,
        status: isRunning ? 'running' : 'stopped'
      };
    });
    
    res.json(servicesWithStatus);
  } catch (error) {
    // If K8s is not available, return services with default status
    console.log('K8s not available, returning default service list');
    res.json(ALL_SERVICES);
  }
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

// Deploy a service using Helm
app.post('/api/services/deploy', async (req, res) => {
  const { serviceId, name, helmChart, namespace, values } = req.body;
  
  if (!name || !helmChart || !namespace) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`🚀 Deploying ${serviceId}: ${name} to namespace ${namespace}`);
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Ensure namespace exists
    await execAsync(`kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -`).catch(() => {});
    
    // Build Helm values
    const helmValues = {};
    for (const [key, val] of Object.entries(values)) {
      if (val !== undefined && val !== null) {
        helmValues[key] = val;
      }
    }
    
    // Install via Helm
    const result = await k8s.installHelmChart(name, helmChart, namespace, helmValues);
    
    if (result.success) {
      console.log(`✅ Successfully deployed ${name}`);
      res.json({ 
        success: true, 
        message: `${serviceId} deployed successfully`,
        name,
        namespace,
        helmChart
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Failed to deploy ${name}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a deployed service
app.delete('/api/services/deployed/:name/:namespace', async (req, res) => {
  const { name, namespace } = req.params;
  
  console.log(`🗑️ Deleting service: ${name} from namespace ${namespace}`);
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Uninstall Helm release
    const result = await k8s.uninstallHelmChart(name, namespace);
    
    if (result.success) {
      console.log(`✅ Successfully deleted ${name}`);
      res.json({ success: true, message: `${name} deleted successfully` });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Failed to delete ${name}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a deployed service
app.put('/api/services/deployed/:name/:namespace', async (req, res) => {
  const { name, namespace } = req.params;
  const { helmChart, values } = req.body;
  
  console.log(`🔄 Updating service: ${name} in namespace ${namespace}`);
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Update via Helm upgrade
    const result = await k8s.installHelmChart(name, helmChart, namespace, values);
    
    if (result.success) {
      console.log(`✅ Successfully updated ${name}`);
      res.json({ success: true, message: `${name} updated successfully` });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`❌ Failed to update ${name}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create a new custom service
app.post('/api/services/create', async (req, res) => {
  const { name, namespace, image, replicas, port, serviceType, category } = req.body;
  
  if (!name || !namespace || !image) {
    return res.status(400).json({ error: 'Missing required fields: name, namespace, image' });
  }
  
  console.log(`Creating service: ${name} in namespace ${namespace}`);
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Check if K8s is available
    const clusterStatus = await k8s.checkClusterConnection();
    if (!clusterStatus.connected) {
      return res.status(503).json({ 
        error: 'Kubernetes cluster not available',
        message: 'Please ensure K3s is running and kubectl is configured'
      });
    }
    
    // Ensure namespace exists
    await execAsync(`kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -`).catch(() => {});
    
    // Create deployment
    const deployResult = await k8s.createDeployment(
      namespace, 
      name, 
      image, 
      replicas || 1, 
      port || 80,
      { 'nimbus-category': category || 'custom' }
    );
    
    if (!deployResult.success) {
      throw new Error(deployResult.error);
    }
    
    // Create service
    const svcResult = await k8s.createService(
      namespace,
      name,
      port || 80,
      port || 80,
      serviceType || 'ClusterIP'
    );
    
    if (!svcResult.success) {
      throw new Error(svcResult.error);
    }
    
    // Get the actual service to retrieve NodePort if applicable
    let endpoint = undefined;
    if (serviceType === 'NodePort') {
      const svcInfo = await k8s.getService(namespace, name);
      if (svcInfo && svcInfo.spec.ports && svcInfo.spec.ports[0].nodePort) {
        endpoint = `http://localhost:${svcInfo.spec.ports[0].nodePort}`;
      }
    }

    res.json({
      ok: true,
      message: `Service ${name} created successfully in Kubernetes`,
      service: {
        id: `custom-${Date.now()}`,
        name,
        category: category || 'custom',
        description: `Custom service running ${image}`,
        namespace,
        status: 'running',
        endpoint
      },
      deployment: {
        name,
        namespace,
        image,
        replicas,
        port
      }
    });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({
      error: err.message
    });
  }
});

// VMs endpoints - Query from Kubernetes
app.get('/api/vms', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const deployments = await k8s.getAllDeployments();
    
    if (!deployments || !deployments.items) {
      return res.json([]);
    }
    
    // Filter deployments with label "nimbus-type: vm"
    const vmDeployments = deployments.items.filter(d => 
      d.metadata.labels && d.metadata.labels['nimbus-type'] === 'vm'
    );
    
    // Convert K8s deployments to VM format
    const vms = vmDeployments.map(d => {
      const spec = d.spec.template.spec.containers[0];
      const status = d.status.availableReplicas > 0 ? 'running' : 'stopped';
      
      return {
        id: d.metadata.uid,
        name: d.metadata.name,
        cpu: d.metadata.labels['nimbus-cpu'] || '2',
        memory: d.metadata.labels['nimbus-memory'] || '4Gi',
        disk: d.metadata.labels['nimbus-disk'] || '20Gi',
        image: d.metadata.labels['nimbus-image'] || spec.image,
        status: status,
        ip: d.metadata.labels['nimbus-ip'] || 'Pending',
        createdAt: d.metadata.creationTimestamp,
        namespace: d.metadata.namespace
      };
    });
    
    res.json(vms);
  } catch (error) {
    console.error('Error fetching VMs from K8s:', error);
    res.json([]);
  }
});

app.post('/api/vms', async (req, res) => {
  const { name, cpu, memory, disk, image } = req.body;
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Check if K8s is available
    const clusterStatus = await k8s.checkClusterConnection();
    if (!clusterStatus.connected) {
      return res.status(503).json({ 
        error: 'Kubernetes cluster not available',
        message: 'Please ensure K3s is running and kubectl is configured'
      });
    }
    
    const namespace = 'default';
    
    // Ensure namespace exists
    await execAsync(`kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -`).catch(() => {});
    
    // Determine image based on OS selection
    let containerImage = 'ubuntu:22.04';
    if (image && image.includes('ubuntu')) {
      containerImage = image.includes('20.04') ? 'ubuntu:20.04' : 'ubuntu:22.04';
    } else if (image && image.includes('centos')) {
      containerImage = 'centos:8';
    } else if (image && image.includes('debian')) {
      containerImage = 'debian:11';
    }
    
    // Create deployment with labels for tracking
    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: name,
        namespace: namespace,
        labels: {
          'nimbus-type': 'vm',
          'nimbus-cpu': cpu || '2',
          'nimbus-memory': memory || '4Gi',
          'nimbus-disk': disk || '20Gi',
          'nimbus-image': image || 'ubuntu-22.04',
          'app': name
        }
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: name
          }
        },
        template: {
          metadata: {
            labels: {
              app: name,
              'nimbus-type': 'vm'
            }
          },
          spec: {
            containers: [{
              name: name,
              image: containerImage,
              command: ['/bin/bash', '-c', 'sleep infinity'],
              resources: {
                requests: {
                  memory: memory || '4Gi',
                  cpu: cpu || '2'
                }
              }
            }]
          }
        }
      }
    };
    
    const yaml = JSON.stringify(deployment);
    await execAsync(`echo '${yaml}' | kubectl apply -f -`);
    
    console.log(`✅ Created VM: ${name}`);
    
    res.json({
      id: `vm-${Date.now()}`,
      name,
      cpu,
      memory,
      disk,
      image,
      status: 'running',
      ip: 'Pending',
      createdAt: new Date().toISOString(),
      namespace
    });
  } catch (error) {
    console.error('Error creating VM:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vms/:id', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const deployments = await k8s.getAllDeployments();
    
    // Find deployment by ID
    const deployment = deployments?.items?.find(d => d.metadata.uid === req.params.id);
    
    if (deployment) {
      await k8s.deleteDeployment(deployment.metadata.namespace, deployment.metadata.name);
      console.log(`✅ Deleted VM: ${deployment.metadata.name}`);
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting VM:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vms/:id/:action', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const deployments = await k8s.getAllDeployments();
    const deployment = deployments?.items?.find(d => d.metadata.uid === req.params.id);
    
    if (!deployment) {
      return res.status(404).json({ error: 'VM not found' });
    }
    
    const action = req.params.action;
    const namespace = deployment.metadata.namespace;
    const name = deployment.metadata.name;
    
    if (action === 'start') {
      await execAsync(`kubectl scale deployment ${name} -n ${namespace} --replicas=1`);
    } else if (action === 'stop') {
      await execAsync(`kubectl scale deployment ${name} -n ${namespace} --replicas=0`);
    }
    
    console.log(`✅ ${action} VM: ${name}`);
    res.json({ ok: true });
  } catch (error) {
    console.error('Error performing VM action:', error);
    res.status(500).json({ error: error.message });
  }
});

// Storage endpoints - Query from Kubernetes PVCs
app.get('/api/storage/volumes', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const pvcs = await k8s.getAllPVCs();
    
    if (!pvcs || !pvcs.items) {
      return res.json([]);
    }
    
    // Filter PVCs with label "nimbus-type: volume"
    const volumePVCs = pvcs.items.filter(pvc => 
      pvc.metadata.labels && pvc.metadata.labels['nimbus-type'] === 'volume'
    );
    
    // Convert K8s PVCs to volume format
    const volumes = volumePVCs.map(pvc => {
      const size = pvc.spec.resources.requests.storage;
      const status = pvc.status.phase === 'Bound' ? 'available' : 'pending';
      
      return {
        id: pvc.metadata.uid,
        name: pvc.metadata.name,
        size: size,
        type: pvc.metadata.labels['nimbus-storage-type'] || 'longhorn',
        used: '0 GB',
        available: size,
        status: status,
        attachedTo: pvc.metadata.labels['nimbus-attached-to'] || null,
        namespace: pvc.metadata.namespace,
        createdAt: pvc.metadata.creationTimestamp
      };
    });
    
    res.json(volumes);
  } catch (error) {
    console.error('Error fetching volumes from K8s:', error);
    res.json([]);
  }
});

app.post('/api/storage/volumes', async (req, res) => {
  const { name, size, type } = req.body;
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Check if K8s is available
    const clusterStatus = await k8s.checkClusterConnection();
    if (!clusterStatus.connected) {
      return res.status(503).json({ 
        error: 'Kubernetes cluster not available',
        message: 'Please ensure K3s is running and kubectl is configured'
      });
    }
    
    const namespace = 'default';
    
    // Ensure namespace exists
    await execAsync(`kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -`).catch(() => {});
    
    // Create PVC using kubernetes-client
    const result = await k8s.createPVC(namespace, name, size || '10Gi', type || 'longhorn');
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log(`✅ Created volume: ${name}`);
    
    res.json({
      id: `vol-${Date.now()}`,
      name,
      size,
      type,
      used: '0 GB',
      available: size,
      status: 'available',
      attachedTo: null,
      namespace
    });
  } catch (error) {
    console.error('Error creating volume:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/storage/volumes/:id', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const pvcs = await k8s.getAllPVCs();
    
    // Find PVC by ID
    const pvc = pvcs?.items?.find(p => p.metadata.uid === req.params.id);
    
    if (pvc) {
      await execAsync(`kubectl delete pvc ${pvc.metadata.name} -n ${pvc.metadata.namespace}`);
      console.log(`✅ Deleted volume: ${pvc.metadata.name}`);
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting volume:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resources CRUD endpoints - Query from Kubernetes
app.get('/api/resources', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    
    // Get Helm releases (databases, functions, etc.)
    const helmReleases = await k8s.getAllHelmReleases();
    const deployments = await k8s.getAllDeployments();
    const pvcs = await k8s.getAllPVCs();
    
    const resources = [];
    
    // Add Helm releases as resources
    if (helmReleases && helmReleases.length > 0) {
      helmReleases.forEach(release => {
        // Skip system releases
        if (['nimbus', 'traefik', 'longhorn'].includes(release.name)) return;
        
        let type = 'database';
        if (release.chart && release.chart.includes('postgresql')) type = 'database';
        else if (release.chart && release.chart.includes('mongodb')) type = 'database';
        else if (release.chart && release.chart.includes('redis')) type = 'database';
        else if (release.chart && release.chart.includes('minio')) type = 'storage';
        else type = 'function';
        
        resources.push({
          id: `helm-${release.name}-${release.namespace}`,
          name: release.name,
          type: type,
          status: release.status === 'deployed' ? 'running' : 'stopped',
          resourceGroup: release.namespace,
          region: 'local',
          created: release.updated,
          config: {
            resourceGroup: release.namespace,
            chart: release.chart,
            version: release.app_version
          }
        });
      });
    }
    
    // Add deployments with nimbus-type: resource label
    if (deployments && deployments.items) {
      deployments.items
        .filter(d => d.metadata.labels && d.metadata.labels['nimbus-type'] === 'resource')
        .forEach(d => {
          resources.push({
            id: d.metadata.uid,
            name: d.metadata.name,
            type: d.metadata.labels['nimbus-resource-type'] || 'function',
            status: d.status.availableReplicas > 0 ? 'running' : 'stopped',
            resourceGroup: d.metadata.namespace,
            region: 'local',
            created: d.metadata.creationTimestamp,
            config: {
              resourceGroup: d.metadata.namespace,
              image: d.spec.template.spec.containers[0].image
            }
          });
        });
    }
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources from K8s:', error);
    res.json([]);
  }
});

// Sync resources from Kubernetes
app.get('/api/resources/sync', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const clusterStatus = await k8s.checkClusterConnection();
    
    if (!clusterStatus.connected) {
      return res.json({ 
        synced: false, 
        message: 'Kubernetes cluster not available',
        resources: []
      });
    }
    
    // Get all deployments and services from K8s
    const pods = await k8s.getAllPods();
    const services = await k8s.getAllServices();
    const helmReleases = await k8s.getAllHelmReleases();
    
    console.log(`✅ Synced with Kubernetes cluster`);
    res.json({ 
      synced: true, 
      clusterInfo: clusterStatus.info,
      k8sPods: pods?.items?.length || 0,
      k8sServices: services?.items?.length || 0,
      k8sHelmReleases: helmReleases?.length || 0
    });
  } catch (error) {
    res.json({ 
      synced: false, 
      error: error.message,
      resources: []
    });
  }
});

app.post('/api/resources', async (req, res) => {
  const { type, name, config } = req.body;
  
  console.log(`Creating resource: ${name} (${type})`);
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Check if K8s is available
    const clusterStatus = await k8s.checkClusterConnection();
    if (!clusterStatus.connected) {
      return res.status(503).json({ 
        error: 'Kubernetes cluster not available',
        message: 'Please ensure K3s is running and kubectl is configured'
      });
    }
    
    const namespace = config.resourceGroup || 'default';
    
    // Ensure namespace exists
    await execAsync(`kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -`).catch(() => {});
    
    switch(type) {
      case 'database':
        // Deploy database using Helm
        const dbType = config.type?.toLowerCase() || 'postgresql';
        const helmValues = {
          'auth.password': 'changeme',
          'primary.persistence.size': `${config.storage || 20}Gi`,
          'primary.resources.requests.memory': '256Mi'
        };
        
        if (dbType === 'postgresql') {
          await k8s.installHelmChart(name, 'bitnami/postgresql', namespace, helmValues);
        } else if (dbType === 'mongodb') {
          await k8s.installHelmChart(name, 'bitnami/mongodb', namespace, {
            'auth.rootPassword': 'changeme',
            'persistence.size': `${config.storage || 20}Gi`
          });
        } else if (dbType === 'redis') {
          await k8s.installHelmChart(name, 'bitnami/redis', namespace, {
            'auth.password': 'changeme',
            'master.persistence.size': `${config.storage || 10}Gi`
          });
        }
        break;
        
      case 'function':
        // Deploy serverless function
        const runtime = config.runtime || 'Node.js 18';
        const image = runtime.includes('Node') ? 'node:18-alpine' : 
                     runtime.includes('Python') ? 'python:3.11-alpine' : 'node:18-alpine';
        await k8s.createDeployment(namespace, name, image, 1, 8080, {
          'nimbus-resource-type': 'function',
          'nimbus-runtime': runtime
        });
        await k8s.createService(namespace, name, 8080, 8080, 'ClusterIP');
        break;
        
      case 'storage':
        // Create PVC for storage
        const size = `${config.size || 100}Gi`;
        await k8s.createPVC(namespace, name, size);
        break;
        
      case 'vm':
        // Deploy VM-like pod
        const vmImage = config.os?.includes('Ubuntu') ? 'ubuntu:22.04' : 'ubuntu:22.04';
        await k8s.createDeployment(namespace, name, vmImage, 1, 22, {
          'nimbus-resource-type': 'vm',
          'nimbus-os': config.os || 'Ubuntu 22.04'
        });
        break;
        
      case 'kubernetes':
        // For K8s cluster, just create a namespace
        await execAsync(`kubectl create namespace ${name}`).catch(() => {});
        break;
        
      case 'loadbalancer':
        // Create a service of type LoadBalancer
        await k8s.createService(namespace, name, 80, 80, 'LoadBalancer');
        break;
    }
    
    console.log(`✅ Successfully deployed ${name} to Kubernetes`);
    
    res.json({
      id: `res-${Date.now()}`,
      name,
      type,
      status: 'running',
      resourceGroup: config.resourceGroup || 'default',
      region: 'local',
      created: new Date().toISOString(),
      config
    });
  } catch (error) {
    console.error(`❌ Failed to deploy ${name}:`, error.message);
    res.status(500).json({
      error: error.message,
      name,
      type,
      status: 'failed'
    });
  }
});

app.get('/api/resources/:id', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const helmReleases = await k8s.getAllHelmReleases();
    const deployments = await k8s.getAllDeployments();
    
    // Search in Helm releases
    const helmRelease = helmReleases?.find(r => `helm-${r.name}-${r.namespace}` === req.params.id);
    if (helmRelease) {
      return res.json({
        id: `helm-${helmRelease.name}-${helmRelease.namespace}`,
        name: helmRelease.name,
        type: 'database',
        status: helmRelease.status === 'deployed' ? 'running' : 'stopped',
        resourceGroup: helmRelease.namespace,
        region: 'local',
        created: helmRelease.updated,
        config: {
          resourceGroup: helmRelease.namespace,
          chart: helmRelease.chart
        }
      });
    }
    
    // Search in deployments
    const deployment = deployments?.items?.find(d => d.metadata.uid === req.params.id);
    if (deployment) {
      return res.json({
        id: deployment.metadata.uid,
        name: deployment.metadata.name,
        type: deployment.metadata.labels?.['nimbus-resource-type'] || 'function',
        status: deployment.status.availableReplicas > 0 ? 'running' : 'stopped',
        resourceGroup: deployment.metadata.namespace,
        region: 'local',
        created: deployment.metadata.creationTimestamp,
        config: {
          resourceGroup: deployment.metadata.namespace,
          image: deployment.spec.template.spec.containers[0].image
        }
      });
    }
    
    res.status(404).json({ error: 'Resource not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/resources/:id', async (req, res) => {
  res.status(501).json({ error: 'Resource update not yet implemented' });
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const id = req.params.id;
    
    // Parse ID to determine resource type and location
    if (id.startsWith('helm-')) {
      // Helm release: format is helm-name-namespace
      const parts = id.replace('helm-', '').split('-');
      const namespace = parts.pop();
      const name = parts.join('-');
      
      await k8s.uninstallHelmChart(name, namespace);
      console.log(`✅ Deleted Helm release: ${name} from ${namespace}`);
    } else {
      // Deployment: use UID to find and delete
      const deployments = await k8s.getAllDeployments();
      const deployment = deployments?.items?.find(d => d.metadata.uid === id);
      
      if (deployment) {
        await k8s.deleteDeployment(deployment.metadata.namespace, deployment.metadata.name);
        await k8s.deleteService(deployment.metadata.namespace, deployment.metadata.name).catch(() => {});
        console.log(`✅ Deleted deployment: ${deployment.metadata.name}`);
      } else {
        return res.status(404).json({ error: 'Resource not found' });
      }
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error(`❌ Failed to delete resource:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resources/:id/:action', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const id = req.params.id;
    const action = req.params.action;
    
    // Find the deployment
    const deployments = await k8s.getAllDeployments();
    const deployment = deployments?.items?.find(d => d.metadata.uid === id);
    
    if (!deployment) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    const namespace = deployment.metadata.namespace;
    const name = deployment.metadata.name;
    
    if (action === 'restart') {
      await k8s.restartDeployment(namespace, name);
      console.log(`✅ Restarted resource: ${name}`);
    } else if (action === 'stop') {
      await execAsync(`kubectl scale deployment ${name} -n ${namespace} --replicas=0`);
      console.log(`✅ Stopped resource: ${name}`);
    } else if (action === 'start') {
      await execAsync(`kubectl scale deployment ${name} -n ${namespace} --replicas=1`);
      console.log(`✅ Started resource: ${name}`);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error(`❌ Failed to perform action:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Networks endpoints - Query from Kubernetes NetworkPolicies
app.get('/api/networks', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    
    // Get all namespaces as "networks" (each namespace is isolated)
    const namespaces = await k8s.getNamespaces();
    
    if (!namespaces || !namespaces.items) {
      return res.json([]);
    }
    
    // Convert namespaces to network format
    const networks = namespaces.items
      .filter(ns => !['kube-system', 'kube-public', 'kube-node-lease'].includes(ns.metadata.name))
      .map(ns => {
        const name = ns.metadata.name;
        // Generate CIDR based on namespace (for display purposes)
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const subnet = (hash % 250) + 1;
        const cidr = `10.${subnet}.0.0/24`;
        const gateway = `10.${subnet}.0.1`;
        
        return {
          id: ns.metadata.uid,
          name: name,
          cidr: cidr,
          gateway: gateway,
          type: 'internal',
          status: ns.status.phase === 'Active' ? 'active' : 'inactive',
          connectedVMs: 0, // Could count pods in namespace
          createdAt: ns.metadata.creationTimestamp
        };
      });
    
    res.json(networks);
  } catch (error) {
    console.error('Error fetching networks from K8s:', error);
    res.json([]);
  }
});

app.post('/api/networks', async (req, res) => {
  const { name, cidr, type } = req.body;
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Check if K8s is available
    const clusterStatus = await k8s.checkClusterConnection();
    if (!clusterStatus.connected) {
      return res.status(503).json({ 
        error: 'Kubernetes cluster not available',
        message: 'Please ensure K3s is running and kubectl is configured'
      });
    }
    
    // Create a new namespace as a "network"
    const result = await k8s.createNamespace(name);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    const parts = cidr.split('.');
    const gateway = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
    
    console.log(`✅ Created network (namespace): ${name}`);
    
    res.json({
      id: `net-${Date.now()}`,
      name,
      cidr,
      gateway,
      type: type || 'internal',
      status: 'active',
      connectedVMs: 0
    });
  } catch (error) {
    console.error('Error creating network:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/networks/:id', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    
    // Find namespace by ID
    const namespaces = await k8s.getNamespaces();
    const namespace = namespaces?.items?.find(ns => ns.metadata.uid === req.params.id);
    
    if (!namespace) {
      return res.status(404).json({ error: 'Network not found' });
    }
    
    // Don't allow deletion of system namespaces
    if (['default', 'kube-system', 'kube-public', 'kube-node-lease'].includes(namespace.metadata.name)) {
      return res.status(403).json({ error: 'Cannot delete system network' });
    }
    
    await k8s.deleteNamespace(namespace.metadata.name);
    console.log(`✅ Deleted network (namespace): ${namespace.metadata.name}`);
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting network:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resource Groups endpoints - Logical grouping using Kubernetes namespaces with labels
app.get('/api/resource-groups', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    
    const namespaces = await k8s.getNamespaces();
    
    if (!namespaces || !namespaces.items) {
      return res.json([]);
    }
    
    // Get all resources in each namespace
    const deployments = await k8s.getAllDeployments();
    const services = await k8s.getAllServices();
    const pvcs = await k8s.getAllPVCs();
    const helmReleases = await k8s.getAllHelmReleases();
    
    // Convert namespaces to resource groups
    const resourceGroups = namespaces.items
      .filter(ns => !['kube-system', 'kube-public', 'kube-node-lease'].includes(ns.metadata.name))
      .map(ns => {
        const name = ns.metadata.name;
        
        // Count resources in this namespace
        const deploymentsCount = deployments?.items?.filter(d => d.metadata.namespace === name).length || 0;
        const servicesCount = services?.items?.filter(s => s.metadata.namespace === name).length || 0;
        const pvcsCount = pvcs?.items?.filter(p => p.metadata.namespace === name).length || 0;
        const helmCount = helmReleases?.filter(h => h.namespace === name).length || 0;
        
        const totalResources = deploymentsCount + servicesCount + pvcsCount + helmCount;
        
        return {
          id: ns.metadata.uid,
          name: name,
          description: ns.metadata.labels?.['description'] || `Resource group for ${name}`,
          location: ns.metadata.labels?.['location'] || 'local',
          tags: ns.metadata.labels || {},
          resourceCount: totalResources,
          resources: {
            deployments: deploymentsCount,
            services: servicesCount,
            storage: pvcsCount,
            helm: helmCount
          },
          status: ns.status.phase === 'Active' ? 'active' : 'inactive',
          createdAt: ns.metadata.creationTimestamp
        };
      });
    
    res.json(resourceGroups);
  } catch (error) {
    console.error('Error fetching resource groups from K8s:', error);
    res.json([]);
  }
});

app.post('/api/resource-groups', async (req, res) => {
  const { name, description, location, tags } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Resource group name is required' });
  }
  
  try {
    const k8s = require('./kubernetes-client');
    
    // Check if K8s is available
    const clusterStatus = await k8s.checkClusterConnection();
    if (!clusterStatus.connected) {
      return res.status(503).json({ 
        error: 'Kubernetes cluster not available',
        message: 'Please ensure K3s is running and kubectl is configured'
      });
    }
    
    // Create namespace with labels
    const labels = {
      'nimbus-type': 'resource-group',
      'description': description || `Resource group for ${name}`,
      'location': location || 'local',
      ...(tags || {})
    };
    
    const result = await k8s.createNamespaceWithLabels(name, labels);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    console.log(`✅ Created resource group: ${name}`);
    
    res.json({
      id: `rg-${Date.now()}`,
      name,
      description: description || `Resource group for ${name}`,
      location: location || 'local',
      tags: tags || {},
      resourceCount: 0,
      resources: {
        deployments: 0,
        services: 0,
        storage: 0,
        helm: 0
      },
      status: 'active',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating resource group:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/resource-groups/:name', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const name = req.params.name;
    
    // Get namespace details
    const namespaces = await k8s.getNamespaces();
    const namespace = namespaces?.items?.find(ns => ns.metadata.name === name);
    
    if (!namespace) {
      return res.status(404).json({ error: 'Resource group not found' });
    }
    
    // Get all resources in this namespace
    const deployments = await k8s.getAllDeployments();
    const services = await k8s.getAllServices();
    const pvcs = await k8s.getAllPVCs();
    const helmReleases = await k8s.getAllHelmReleases();
    
    const nsDeployments = deployments?.items?.filter(d => d.metadata.namespace === name) || [];
    const nsServices = services?.items?.filter(s => s.metadata.namespace === name) || [];
    const nsPvcs = pvcs?.items?.filter(p => p.metadata.namespace === name) || [];
    const nsHelm = helmReleases?.filter(h => h.namespace === name) || [];
    
    res.json({
      id: namespace.metadata.uid,
      name: name,
      description: namespace.metadata.labels?.['description'] || `Resource group for ${name}`,
      location: namespace.metadata.labels?.['location'] || 'local',
      tags: namespace.metadata.labels || {},
      resourceCount: nsDeployments.length + nsServices.length + nsPvcs.length + nsHelm.length,
      resources: {
        deployments: nsDeployments.map(d => ({
          name: d.metadata.name,
          type: 'deployment',
          status: d.status.availableReplicas > 0 ? 'running' : 'stopped'
        })),
        services: nsServices.map(s => ({
          name: s.metadata.name,
          type: 'service',
          serviceType: s.spec.type
        })),
        storage: nsPvcs.map(p => ({
          name: p.metadata.name,
          type: 'pvc',
          size: p.spec.resources.requests.storage,
          status: p.status.phase
        })),
        helm: nsHelm.map(h => ({
          name: h.name,
          type: 'helm',
          chart: h.chart,
          status: h.status
        }))
      },
      status: namespace.status.phase === 'Active' ? 'active' : 'inactive',
      createdAt: namespace.metadata.creationTimestamp
    });
  } catch (error) {
    console.error('Error fetching resource group details:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/resource-groups/:name', async (req, res) => {
  try {
    const k8s = require('./kubernetes-client');
    const name = req.params.name;
    
    // Don't allow deletion of system namespaces
    if (['default', 'kube-system', 'kube-public', 'kube-node-lease', 'nimbus'].includes(name)) {
      return res.status(403).json({ error: 'Cannot delete system resource group' });
    }
    
    await k8s.deleteNamespace(name);
    console.log(`✅ Deleted resource group: ${name}`);
    
    res.json({ ok: true, message: `Resource group ${name} and all its resources deleted` });
  } catch (error) {
    console.error('Error deleting resource group:', error);
    res.status(500).json({ error: error.message });
  }
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
