import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ServiceCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  popular?: boolean;
  route?: string;
}

const CLOUD_SERVICES: ServiceCard[] = [
  // Compute
  { id: 'vms', name: 'Virtual Machines', icon: '🖥️', description: 'Deploy and manage VMs', category: 'Compute', popular: true, route: '/vms' },
  { id: 'kubernetes', name: 'Kubernetes Service', icon: '☸️', description: 'Managed Kubernetes clusters', category: 'Compute', popular: true, route: '/services' },
  { id: 'functions', name: 'Functions', icon: '⚡', description: 'Serverless compute', category: 'Compute', route: '/deploy-service?service=openfaas' },
  
  // Storage
  { id: 'storage', name: 'Storage Accounts', icon: '💾', description: 'Scalable cloud storage', category: 'Storage', popular: true, route: '/storage' },
  { id: 'disks', name: 'Disks', icon: '💿', description: 'Persistent block storage', category: 'Storage', route: '/storage' },
  { id: 'files', name: 'Files', icon: '📁', description: 'Managed file shares', category: 'Storage', route: '/deploy-service?service=minio' },
  
  // Databases
  { id: 'sql', name: 'SQL Database', icon: '🗄️', description: 'Managed PostgreSQL', category: 'Databases', popular: true, route: '/deploy-service?service=postgresql' },
  { id: 'nosql', name: 'NoSQL Database', icon: '📊', description: 'MongoDB service', category: 'Databases', route: '/deploy-service?service=mongodb' },
  { id: 'cache', name: 'Cache for Redis', icon: '⚡', description: 'In-memory cache', category: 'Databases', route: '/deploy-service?service=redis' },
  
  // Networking
  { id: 'vnet', name: 'Virtual Networks', icon: '🌐', description: 'Private networks', category: 'Networking', route: '/networks' },
  { id: 'loadbalancer', name: 'Load Balancer', icon: '⚖️', description: 'Distribute traffic', category: 'Networking', route: '/deploy-service?service=traefik' },
  { id: 'gateway', name: 'Application Gateway', icon: '🚪', description: 'Web traffic manager', category: 'Networking', route: '/deploy-service?service=ingress-nginx' },
  
  // Security
  { id: 'vault', name: 'Key Vault', icon: '🔐', description: 'Secrets management', category: 'Security', route: '/deploy-service?service=vault' },
  { id: 'identity', name: 'Identity', icon: '👤', description: 'Access management', category: 'Security', route: '/deploy-service?service=keycloak' },
  { id: 'security', name: 'Security Center', icon: '🛡️', description: 'Security monitoring', category: 'Security', route: '/deploy-service?service=kyverno' },
  
  // DevOps
  { id: 'repos', name: 'Repos', icon: '📦', description: 'Git repositories', category: 'DevOps', popular: true, route: '/deploy-service?service=gitea' },
  { id: 'pipelines', name: 'Pipelines', icon: '🔄', description: 'CI/CD automation', category: 'DevOps', popular: true, route: '/deploy-service?service=drone' },
  { id: 'artifacts', name: 'Artifacts', icon: '📦', description: 'Package management', category: 'DevOps', route: '/deploy-service?service=harbor' },
  
  // Monitoring
  { id: 'monitor', name: 'Monitor', icon: '📊', description: 'Application insights', category: 'Monitoring', route: '/deploy-service?service=prometheus' },
  { id: 'logs', name: 'Log Analytics', icon: '📝', description: 'Centralized logging', category: 'Monitoring', route: '/deploy-service?service=loki' },
  { id: 'alerts', name: 'Alerts', icon: '🔔', description: 'Alert management', category: 'Monitoring', route: '/deploy-service?service=grafana' },
  
  // AI + ML
  { id: 'ml', name: 'Machine Learning', icon: '🤖', description: 'ML model training', category: 'AI + ML', route: '/deploy-service' },
  { id: 'cognitive', name: 'Cognitive Services', icon: '🧠', description: 'AI APIs', category: 'AI + ML', route: '/deploy-service' },
  
  // Analytics
  { id: 'analytics', name: 'Analytics', icon: '📈', description: 'Data analytics', category: 'Analytics', route: '/deploy-service?service=elasticsearch' },
  { id: 'streaming', name: 'Event Streaming', icon: '🌊', description: 'Real-time data', category: 'Analytics', route: '/deploy-service?service=kafka' },
];

const CATEGORIES = [
  'All',
  'Compute',
  'Storage',
  'Databases',
  'Networking',
  'Security',
  'DevOps',
  'Monitoring',
  'AI + ML',
  'Analytics'
];

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
    <div className="azure-portal">
      {/* Top Navigation Bar */}
      <div className="portal-header">
        <div className="portal-header-left">
          <div className="portal-logo">
            <span className="logo-icon">☁️</span>
            <span className="logo-text">Nimbus Cloud</span>
          </div>
          <div className="portal-search">
            <input
              type="text"
              placeholder="Search services, resources, and docs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="portal-header-right">
          <button className="portal-icon-btn" title="Notifications">🔔</button>
          <button className="portal-icon-btn" title="Settings">⚙️</button>
          <button className="portal-icon-btn" title="Help">❓</button>
          <div className="portal-user">
            <div className="user-avatar">A</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="portal-content">
        {/* Sidebar */}
        <div className="portal-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Favorites</div>
            <Link to="/dashboard" className="sidebar-item">
              <span className="sidebar-icon">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/services" className="sidebar-item">
              <span className="sidebar-icon">🔧</span>
              <span>All Services</span>
            </Link>
            <Link to="/vms" className="sidebar-item">
              <span className="sidebar-icon">🖥️</span>
              <span>Virtual Machines</span>
            </Link>
            <Link to="/storage" className="sidebar-item">
              <span className="sidebar-icon">💾</span>
              <span>Storage</span>
            </Link>
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title">Resources</div>
            <Link to="/resource-groups" className="sidebar-item">
              <span className="sidebar-icon">📦</span>
              <span>Resource Groups</span>
            </Link>
            <Link to="/resources" className="sidebar-item">
              <span className="sidebar-icon">🏷️</span>
              <span>All Resources</span>
            </Link>
            <div className="sidebar-item">
              <span className="sidebar-icon">💰</span>
              <span>Cost Management</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Tools</div>
            <div className="sidebar-item">
              <span className="sidebar-icon">🔍</span>
              <span>Resource Explorer</span>
            </div>
            <div className="sidebar-item">
              <span className="sidebar-icon">📋</span>
              <span>Activity Log</span>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="portal-main">
          <div className="portal-hero">
            <h1>Welcome to Nimbus Cloud</h1>
            <p>Build, manage, and monitor all your cloud services in one place</p>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link to="/create-service" className="quick-action-card">
              <div className="quick-action-icon">➕</div>
              <div className="quick-action-content">
                <h3>Create a resource</h3>
                <p>Deploy VMs, databases, and more</p>
              </div>
            </Link>
            <Link to="/deploy" className="quick-action-card">
              <div className="quick-action-icon">🚀</div>
              <div className="quick-action-content">
                <h3>Deploy to cloud</h3>
                <p>AWS, Azure, or GCP</p>
              </div>
            </Link>
            <div className="quick-action-card">
              <div className="quick-action-icon">📚</div>
              <div className="quick-action-content">
                <h3>Documentation</h3>
                <p>Learn about Nimbus Cloud</p>
              </div>
            </div>
          </div>

          {/* Popular Services */}
          <div className="portal-section">
            <h2>Popular services</h2>
            <div className="services-grid-compact">
              {popularServices.map(service => (
                <Link 
                  key={service.id} 
                  to={service.route || '/deploy-service'} 
                  className="service-tile"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="service-tile-icon">{service.icon}</div>
                  <div className="service-tile-name">{service.name}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* All Services */}
          <div className="portal-section">
            <h2>All services</h2>
            
            {/* Category Filter */}
            <div className="category-filter">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="services-grid">
              {filteredServices.map(service => (
                <Link 
                  key={service.id} 
                  to={service.route || '/deploy-service'} 
                  className="service-card-azure"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="service-card-header">
                    <div className="service-card-icon">{service.icon}</div>
                    <div className="service-card-favorite">⭐</div>
                  </div>
                  <h3 className="service-card-title">{service.name}</h3>
                  <p className="service-card-description">{service.description}</p>
                  <div className="service-card-category">{service.category}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
