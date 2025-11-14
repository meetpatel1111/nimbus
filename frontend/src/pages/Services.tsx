import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Service {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
  endpoint?: string;
  namespace: string;
}

const SERVICE_CATEGORIES = [
  { id: 'platform', name: 'Core Platform', icon: '🔧' },
  { id: 'storage', name: 'Storage Services', icon: '🗄️' },
  { id: 'serverless', name: 'Serverless & Compute', icon: '⚙️' },
  { id: 'workflow', name: 'Workflow Automation', icon: '🔄' },
  { id: 'security', name: 'Identity & Security', icon: '🔐' },
  { id: 'messaging', name: 'Messaging & Eventing', icon: '📬' },
  { id: 'observability', name: 'Monitoring & Observability', icon: '📊' },
  { id: 'backup', name: 'Backup & DR', icon: '💾' },
  { id: 'devtools', name: 'Development Tools', icon: '🧑‍💻' },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const restartService = async (id: string) => {
    try {
      await axios.post(`/api/services/${id}/restart`);
      loadServices();
    } catch (err: any) {
      alert('Failed to restart service: ' + err.message);
    }
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const getServicesByCategory = (category: string) => 
    services.filter(s => s.category === category);

  return (
    <div className="container">
      <div className="page-header">
        <h1>🌥 Mini-Cloud Services</h1>
        <p>Manage all 21 services running in your cloud platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{services.length}</div>
          <div className="stat-label">Total Services</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{services.filter(s => s.status === 'running').length}</div>
          <div className="stat-label">Running</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{services.filter(s => s.status === 'stopped').length}</div>
          <div className="stat-label">Stopped</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{SERVICE_CATEGORIES.length}</div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-tabs">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''} 
            onClick={() => setSelectedCategory('all')}
          >
            All Services
          </button>
          {SERVICE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? 'active' : ''}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name} ({getServicesByCategory(cat.id).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading services...</div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state">
            <p>No services found in this category.</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <span className={`status-badge ${service.status}`}>
                    {service.status}
                  </span>
                </div>
                <p className="service-description">{service.description}</p>
                <div className="service-meta">
                  <div><strong>Namespace:</strong> {service.namespace}</div>
                  {service.endpoint && (
                    <div><strong>Endpoint:</strong> <code>{service.endpoint}</code></div>
                  )}
                </div>
                <div className="service-actions">
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => restartService(service.id)}
                  >
                    Restart
                  </button>
                  {service.endpoint && (
                    <a 
                      href={service.endpoint} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Open
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
