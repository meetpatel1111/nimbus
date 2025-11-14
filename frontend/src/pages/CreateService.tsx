import React, { useState } from 'react';
import axios from 'axios';

export default function CreateService() {
  const [formData, setFormData] = useState({
    name: '',
    namespace: 'apps',
    image: 'nginx:latest',
    replicas: 1,
    port: 80,
    serviceType: 'ClusterIP',
    category: 'custom'
  });
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setResult(null);

    try {
      const res = await axios.post('/api/services/create', formData);
      setResult({ success: true, data: res.data });
    } catch (err: any) {
      setResult({ success: false, error: err.response?.data?.error || err.message });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Create Custom Service</h1>
        <p>Deploy a new service to your Kubernetes cluster</p>
      </div>

      <div className="card">
        <h2>Service Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="my-service"
              required
            />
            <small>Lowercase letters, numbers, and hyphens only</small>
          </div>

          <div className="form-group">
            <label>Namespace</label>
            <select
              value={formData.namespace}
              onChange={e => setFormData({ ...formData, namespace: e.target.value })}
            >
              <option value="apps">apps</option>
              <option value="default">default</option>
              <option value="demo">demo</option>
              <option value="platform">platform</option>
            </select>
            <small>Kubernetes namespace for the service</small>
          </div>

          <div className="form-group">
            <label>Container Image</label>
            <input
              type="text"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              placeholder="nginx:latest"
              required
            />
            <small>Docker image to deploy (e.g., nginx:latest, redis:alpine)</small>
          </div>

          <div className="form-group">
            <label>Replicas</label>
            <select
              value={formData.replicas}
              onChange={e => setFormData({ ...formData, replicas: parseInt(e.target.value) })}
            >
              <option value="1">1 Replica</option>
              <option value="2">2 Replicas</option>
              <option value="3">3 Replicas</option>
              <option value="5">5 Replicas</option>
            </select>
            <small>Number of pod replicas</small>
          </div>

          <div className="form-group">
            <label>Container Port</label>
            <input
              type="number"
              value={formData.port}
              onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })}
              placeholder="80"
              required
            />
            <small>Port the container listens on</small>
          </div>

          <div className="form-group">
            <label>Service Type</label>
            <select
              value={formData.serviceType}
              onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
            >
              <option value="ClusterIP">ClusterIP (Internal only)</option>
              <option value="NodePort">NodePort (External access)</option>
              <option value="LoadBalancer">LoadBalancer (Cloud LB)</option>
            </select>
            <small>How the service should be exposed</small>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="custom">Custom</option>
              <option value="platform">Platform</option>
              <option value="storage">Storage</option>
              <option value="messaging">Messaging</option>
              <option value="observability">Observability</option>
            </select>
            <small>Service category for organization</small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={deploying}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {deploying ? 'Deploying Service...' : 'Deploy Service'}
          </button>
        </form>

        {result && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            background: result.success ? '#d4edda' : '#f8d7da',
            color: result.success ? '#155724' : '#721c24'
          }}>
            {result.success ? (
              <>
                <strong>✓ Service Deployed Successfully</strong>
                <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </>
            ) : (
              <>
                <strong>✗ Deployment Failed</strong>
                <p style={{ marginTop: '0.5rem' }}>{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Popular Service Templates</h2>
        <div className="services-grid">
          <div className="service-card" onClick={() => setFormData({
            name: 'redis',
            namespace: 'apps',
            image: 'redis:alpine',
            replicas: 1,
            port: 6379,
            serviceType: 'ClusterIP',
            category: 'storage'
          })}>
            <h3>Redis</h3>
            <p>In-memory data store</p>
            <small>redis:alpine</small>
          </div>

          <div className="service-card" onClick={() => setFormData({
            name: 'postgres',
            namespace: 'apps',
            image: 'postgres:15-alpine',
            replicas: 1,
            port: 5432,
            serviceType: 'ClusterIP',
            category: 'storage'
          })}>
            <h3>PostgreSQL</h3>
            <p>Relational database</p>
            <small>postgres:15-alpine</small>
          </div>

          <div className="service-card" onClick={() => setFormData({
            name: 'mongodb',
            namespace: 'apps',
            image: 'mongo:latest',
            replicas: 1,
            port: 27017,
            serviceType: 'ClusterIP',
            category: 'storage'
          })}>
            <h3>MongoDB</h3>
            <p>NoSQL database</p>
            <small>mongo:latest</small>
          </div>

          <div className="service-card" onClick={() => setFormData({
            name: 'nginx',
            namespace: 'apps',
            image: 'nginx:alpine',
            replicas: 2,
            port: 80,
            serviceType: 'NodePort',
            category: 'platform'
          })}>
            <h3>Nginx</h3>
            <p>Web server</p>
            <small>nginx:alpine</small>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Prerequisites</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#7f8c8d' }}>
          <li>Kubernetes cluster must be running (k3s installed via bootstrap script)</li>
          <li>kubectl must be configured and accessible</li>
          <li>Sufficient resources available in the cluster</li>
          <li>Container image must be publicly accessible or in your registry</li>
        </ul>
      </div>
    </div>
  );
}
