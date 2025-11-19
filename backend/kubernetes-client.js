// Kubernetes Client for Real Service Management
// This module provides functions to interact with a real k3s cluster

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Check if kubectl is available and cluster is accessible
 */
async function checkClusterConnection() {
  try {
    const { stdout } = await execAsync('kubectl cluster-info');
    return { connected: true, info: stdout };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

/**
 * Get all pods across all namespaces
 */
async function getAllPods() {
  try {
    const { stdout } = await execAsync('kubectl get pods -A -o json');
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting pods:', error);
    return null;
  }
}

/**
 * Get all services across all namespaces
 */
async function getAllServices() {
  try {
    const { stdout } = await execAsync('kubectl get svc -A -o json');
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting services:', error);
    return null;
  }
}

/**
 * Get all deployments across all namespaces
 */
async function getAllDeployments() {
  try {
    const { stdout } = await execAsync('kubectl get deployments -A -o json');
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting deployments:', error);
    return null;
  }
}

/**
 * Get all PVCs across all namespaces
 */
async function getAllPVCs() {
  try {
    const { stdout } = await execAsync('kubectl get pvc -A -o json');
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting PVCs:', error);
    return null;
  }
}

/**
 * Get all Helm releases
 */
async function getAllHelmReleases() {
  try {
    const { stdout } = await execAsync('helm list -A -o json');
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting Helm releases:', error);
    return [];
  }
}

/**
 * Create a new deployment (service)
 */
async function createDeployment(namespace, name, image, replicas = 1, port = 80, labels = {}) {
  const deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: name,
      namespace: namespace,
      labels: {
        app: name,
        'nimbus-type': 'resource',
        ...labels
      }
    },
    spec: {
      replicas: replicas,
      selector: {
        matchLabels: {
          app: name
        }
      },
      template: {
        metadata: {
          labels: {
            app: name,
            'nimbus-type': 'resource'
          }
        },
        spec: {
          containers: [{
            name: name,
            image: image,
            ports: [{
              containerPort: port
            }]
          }]
        }
      }
    }
  };

  try {
    const yaml = JSON.stringify(deployment);
    const { stdout } = await execAsync(`echo '${yaml}' | kubectl apply -f -`);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a service to expose a deployment
 */
async function createService(namespace, name, port, targetPort, type = 'ClusterIP') {
  const service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: name,
      namespace: namespace
    },
    spec: {
      type: type,
      selector: {
        app: name
      },
      ports: [{
        port: port,
        targetPort: targetPort
      }]
    }
  };

  try {
    const yaml = JSON.stringify(service);
    const { stdout } = await execAsync(`echo '${yaml}' | kubectl apply -f -`);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a deployment
 */
async function deleteDeployment(namespace, name) {
  try {
    const { stdout } = await execAsync(`kubectl delete deployment ${name} -n ${namespace}`);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a service
 */
async function deleteService(namespace, name) {
  try {
    const { stdout } = await execAsync(`kubectl delete svc ${name} -n ${namespace}`);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Restart a deployment (by deleting and recreating pods)
 */
async function restartDeployment(namespace, name) {
  try {
    const { stdout } = await execAsync(`kubectl rollout restart deployment/${name} -n ${namespace}`);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get deployment status
 */
async function getDeploymentStatus(namespace, name) {
  try {
    const { stdout } = await execAsync(`kubectl get deployment ${name} -n ${namespace} -o json`);
    return JSON.parse(stdout);
  } catch (error) {
    return null;
  }
}

/**
 * Create a PersistentVolumeClaim
 */
async function createPVC(namespace, name, size, storageClass = 'longhorn') {
  const pvc = {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata: {
      name: name,
      namespace: namespace
    },
    spec: {
      accessModes: ['ReadWriteOnce'],
      storageClassName: storageClass,
      resources: {
        requests: {
          storage: size
        }
      }
    }
  };

  try {
    const yaml = JSON.stringify(pvc);
    const { stdout } = await execAsync(`echo '${yaml}' | kubectl apply -f -`);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Install a Helm chart
 */
async function installHelmChart(name, chart, namespace, values = {}) {
  try {
    const valuesStr = Object.entries(values)
      .map(([key, val]) => `--set ${key}=${val}`)
      .join(' ');
    
    const { stdout } = await execAsync(
      `helm upgrade --install ${name} ${chart} -n ${namespace} --create-namespace ${valuesStr}`
    );
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Uninstall a Helm release
 */
async function uninstallHelmChart(name, namespace) {
  try {
    const { stdout } = await execAsync(`helm uninstall ${name} -n ${namespace}`);
    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all nodes in the cluster
 */
async function getNodes() {
  try {
    const { stdout } = await execAsync('kubectl get nodes -o json');
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting nodes:', error);
    return null;
  }
}

/**
 * Get node metrics (requires metrics-server)
 */
async function getNodeMetrics() {
  try {
    const { stdout } = await execAsync('kubectl get --raw /apis/metrics.k8s.io/v1beta1/nodes');
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting node metrics (metrics-server may not be installed):', error);
    return null;
  }
}

/**
 * Get a specific service
 */
async function getService(namespace, name) {
  try {
    const { stdout } = await execAsync(`kubectl get svc ${name} -n ${namespace} -o json`);
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting service:', error);
    return null;
  }
}

module.exports = {
  checkClusterConnection,
  getAllPods,
  getAllServices,
  getAllDeployments,
  getAllPVCs,
  getAllHelmReleases,
  createDeployment,
  createService,
  deleteDeployment,
  deleteService,
  restartDeployment,
  getDeploymentStatus,
  createPVC,
  installHelmChart,
  uninstallHelmChart,
  getNodes,
  getNodeMetrics,
  getService
};
