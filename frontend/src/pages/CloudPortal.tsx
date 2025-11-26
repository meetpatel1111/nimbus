import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ServiceCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  popular?: boolean;
  route: string;
}

const CLOUD_SERVICES: ServiceCard[] = [
  // Compute
  { id: 'vms', name: 'Virtual Machines', icon: '🖥️', description: 'Deploy and manage VMs', category: 'Compute', popular: true, route: '/vms' },
  { id: 'kubernetes', name: 'Kubernetes', icon: '☸️', description: 'Managed K8s clusters', category: 'Compute', popular: true, route: '/services' },
  { id: 'functions', name: 'Functions', icon: '⚡', description: 'Serverless compute', category: 'Compute', route: '/deploy-service?service=openfaas' },
  
  // Storage
  { id: 'storage', name: 'Storage', icon: '💾', description: 'Scalable cloud storage', category: 'Storage', popular: true, route: '/storage' },
  { id: 'files', name: 'File Storage', icon: '📁', description: 'Managed file shares', category: 'Storage', route: '/deploy-service?service=minio' },
  
  // Databases
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', description: 'Managed PostgreSQL', category: 'Databases', popular: true, route: '/deploy-service?service=postgresql' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', description: 'NoSQL database', category: 'Databases', route: '/deploy-service?service=mongodb' },
  { id: 'redis', name: 'Redis', icon: '🔴', description: 'In-memory cache', category: 'Databases', popular: true, route: '/deploy-service?service=redis' },
  
  // Networking
  { id: 'networks', name: 'Networks', icon: '🌐', description: 'Virtual networks', category: 'Networking', route: '/networks' },
  { id: 'loadbalancer', name: 'Load Balancer', icon: '⚖️', description: 'Traffic distribution', category: 'Networking', route: '/deploy-service?service=traefik' },
  
  // Security
  { id: 'vault', name: 'Vault', icon: '🔐', description: 'Secrets management', category: 'Security', route: '/deploy-service?service=vault' },
  { id: 'keycloak', name: 'Keycloak', icon: '👤', description: 'Identity management', category: 'Security', route: '/deploy-service?service=keycloak' },
  
  // DevOps
  { id: 'gitea', name: 'Gitea', icon: '📦', description: 'Git repositories', category: 'DevOps', popular: true, route: '/deploy-service?service=gitea' },
  { id: 'drone', name: 'Drone CI', icon: '🔄', description: 'CI/CD pipelines', category: 'DevOps', route: '/deploy-service?service=drone' },
  { id: 'harbor', name: 'Harbor', icon: '🐳', description: 'Container registry', category: 'DevOps', route: '/deploy-service?service=harbor' },
  
  // Monitoring
  { id: 'prometheus', name: 'Prometheus', icon: '📊', description: 'Metrics collection', category: 'Monitoring', route: '/deploy-service?service=prometheus' },
  { id: 'grafana', name: 'Grafana', icon: '📈', description: 'Dashboards', category: 'Monitoring', popular: true, route: '/deploy-service?service=grafana' },
  { id: 'loki', name: 'Loki', icon: '📝', description: 'Log aggregation', category: 'Monitoring', route: '/deploy-service?service=loki' },
  
  // Messaging
  { id: 'rabbitmq', name: 'RabbitMQ', icon: '🐰', description: 'Message broker', category: 'Messaging', route: '/deploy-service?service=rabbitmq' },
  { id: 'kafka', name: 'Kafka', icon: '🌊', description: 'Event streaming', category: 'Messaging', route: '/deploy-service?service=kafka' },
];

const CATEGORIES = ['All', 'Compute', 'Storage', 'Databases', 'Networking', 'Security', 'DevOps', 'Monitoring', 'Messaging'];

export default function CloudPortal() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = CLOUD_SERVICES.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularServices = CLOUD_SERVICES.filter(s => s.popular);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div style={{
        background: 'var(--gradient-card)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-xl)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)'
        }}></div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
          Welcome to Nimbus Cloud ☁️
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', maxWidth: '600px' }}>
          Deploy and manage your cloud infrastructure with ease. Choose from 30+ services to build your perfect stack.
        </p>
        
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <Link to="/deploy-service" className="btn btn-primary">
            🚀 Deploy a Service
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            📊 View Dashboard
          </Link>
          <Link to="/resource-groups" className="btn btn-secondary">
            📦 Resource Groups
          </Link>
        </div>
      </div>

      {/* Popular Services */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--spacing-lg)' }}>
          ⭐ Popular Services
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 'var(--spacing-md)'
        }}>
          {popularServices.map(service => (
            <Link
              key={service.id}
              to={service.route}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                textDecoration: 'none',
                color: 'inherit',
                textAlign: 'center',
                transition: 'all var(--transition-fast)'
              }}
              className="service-card"
            >
              <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>{service.icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{service.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Services */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            All Services
          </h2>
          
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '250px' }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-sm)', 
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: 'var(--spacing-xs) var(--spacing-md)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="service-grid">
          {filteredServices.map(service => (
            <Link key={service.id} to={service.route} className="service-card">
              <div className="service-card-icon">{service.icon}</div>
              <h3 className="service-card-title">{service.name}</h3>
              <p className="service-card-description">{service.description}</p>
              <span className="service-card-badge">{service.category}</span>
            </Link>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No services found</h3>
            <p className="empty-state-description">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
