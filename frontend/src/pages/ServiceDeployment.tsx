import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ServiceConfig {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  helmChart?: string;
  namespace: string;
  defaultValues: any;
  configFields: ConfigField[];
}

interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle';
  default?: any;
  options?: string[];
  required?: boolean;
}

const ALL_DEPLOYABLE_SERVICES: ServiceConfig[] = [
  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: '🐘',
    category: 'Databases',
    description: 'Relational database',
    helmChart: 'bitnami/postgresql',
    namespace: 'apps',
    defaultValues: { 'auth.password': 'changeme', 'primary.persistence.size': '10Gi' },
    configFields: [
      { name: 'version', label: 'Version', type: 'select', options: ['15', '14', '13'], default: '15' },
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 10 },
      { name: 'replicas', label: 'Replicas', type: 'number', default: 1 },
    ]
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: '🍃',
    category: 'Databases',
    description: 'NoSQL document database',
    helmChart: 'bitnami/mongodb',
    namespace: 'apps',
    defaultValues: { 'auth.rootPassword': 'changeme', 'persistence.size': '10Gi' },
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 10 },
      { name: 'architecture', label: 'Architecture', type: 'select', options: ['standalone', 'replicaset'], default: 'standalone' },
    ]
  },
  {
    id: 'redis',
    name: 'Redis',
    icon: '🔴',
    category: 'Databases',
    description: 'In-memory cache',
    helmChart: 'bitnami/redis',
    namespace: 'apps',
    defaultValues: { 'auth.password': 'changeme', 'master.persistence.size': '5Gi' },
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 5 },
      { name: 'architecture', label: 'Architecture', type: 'select', options: ['standalone', 'replication'], default: 'standalone' },
    ]
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: '🐬',
    category: 'Databases',
    description: 'Relational database',
    helmChart: 'bitnami/mysql',
    namespace: 'apps',
    defaultValues: { 'auth.rootPassword': 'changeme', 'primary.persistence.size': '10Gi' },
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 10 },
    ]
  },
  
  // Messaging
  {
    id: 'rabbitmq',
    name: 'RabbitMQ',
    icon: '🐰',
    category: 'Messaging',
    description: 'Message broker',
    helmChart: 'bitnami/rabbitmq',
    namespace: 'apps',
    defaultValues: { 'auth.username': 'admin', 'auth.password': 'changeme' },
    configFields: [
      { name: 'replicas', label: 'Replicas', type: 'number', default: 1 },
    ]
  },
  {
    id: 'kafka',
    name: 'Apache Kafka',
    icon: '📨',
    category: 'Messaging',
    description: 'Event streaming',
    helmChart: 'bitnami/kafka',
    namespace: 'apps',
    defaultValues: { 'replicaCount': 1 },
    configFields: [
      { name: 'replicas', label: 'Replicas', type: 'number', default: 1 },
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 10 },
    ]
  },
  
  // Observability
  {
    id: 'grafana',
    name: 'Grafana',
    icon: '📊',
    category: 'Observability',
    description: 'Visualization platform',
    helmChart: 'grafana/grafana',
    namespace: 'monitoring',
    defaultValues: { 'adminPassword': 'admin' },
    configFields: [
      { name: 'persistence', label: 'Enable Persistence', type: 'toggle', default: true },
    ]
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    icon: '🔥',
    category: 'Observability',
    description: 'Metrics collection',
    helmChart: 'prometheus-community/prometheus',
    namespace: 'monitoring',
    defaultValues: {},
    configFields: [
      { name: 'retention', label: 'Retention Days', type: 'number', default: 15 },
    ]
  },
  
  // CI/CD
  {
    id: 'jenkins',
    name: 'Jenkins',
    icon: '🔧',
    category: 'CI/CD',
    description: 'Automation server',
    helmChart: 'bitnami/jenkins',
    namespace: 'ci',
    defaultValues: { 'jenkinsPassword': 'admin' },
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 10 },
    ]
  },
  {
    id: 'gitea',
    name: 'Gitea',
    icon: '🦊',
    category: 'CI/CD',
    description: 'Git hosting',
    helmChart: 'gitea-charts/gitea',
    namespace: 'ci',
    defaultValues: {},
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 10 },
    ]
  },
  
  // Container Registry
  {
    id: 'harbor',
    name: 'Harbor',
    icon: '⚓',
    category: 'Registry',
    description: 'Container registry',
    helmChart: 'harbor/harbor',
    namespace: 'apps',
    defaultValues: { 'harborAdminPassword': 'Harbor12345' },
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 50 },
    ]
  },
  
  // Storage
  {
    id: 'minio',
    name: 'MinIO',
    icon: '💾',
    category: 'Storage',
    description: 'S3-compatible storage',
    helmChart: 'minio/minio',
    namespace: 'storage',
    defaultValues: { 'mode': 'standalone', 'replicas': 1 },
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 100 },
    ]
  },
  
  // Workflow
  {
    id: 'n8n',
    name: 'n8n',
    icon: '🔄',
    category: 'Workflow',
    description: 'Workflow automation',
    helmChart: 'n8n/n8n',
    namespace: 'workflows',
    defaultValues: {},
    configFields: [
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 5 },
    ]
  },
  
  // Security
  {
    id: 'vault',
    name: 'HashiCorp Vault',
    icon: '🔐',
    category: 'Security',
    description: 'Secrets management',
    helmChart: 'hashicorp/vault',
    namespace: 'platform',
    defaultValues: { 'server.dev.enabled': true },
    configFields: [
      { name: 'mode', label: 'Mode', type: 'select', options: ['dev', 'ha', 'standalone'], default: 'dev' },
    ]
  },
  
  // Analytics
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    icon: '🔍',
    category: 'Analytics',
    description: 'Search engine',
    helmChart: 'bitnami/elasticsearch',
    namespace: 'apps',
    defaultValues: {},
    configFields: [
      { name: 'replicas', label: 'Replicas', type: 'number', default: 1 },
      { name: 'storage', label: 'Storage (GB)', type: 'number', default: 20 },
    ]
  },
];

export default function ServiceDeployment() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleServiceSelect = (service: ServiceConfig) => {
    setSelectedService(service);
    setServiceName(`${service.id}-${Date.now()}`);
    const initialConfig: any = {};
    service.configFields.forEach(field => {
      initialConfig[field.name] = field.default;
    });
    setConfig(initialConfig);
    setStep(2);
  };

  const handleDeploy = async () => {
    if (!selectedService) return;
    
    setLoading(true);
    try {
      await axios.post('/api/services/deploy', {
        serviceId: selectedService.id,
        name: serviceName,
        helmChart: selectedService.helmChart,
        namespace: selectedService.namespace,
        values: {
          ...selectedService.defaultValues,
          ...config
        }
      });
      alert(`${selectedService.name} deployed successfully!`);
      navigate('/services');
    } catch (err: any) {
      alert('Deployment failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="azure-portal">
      <div className="portal-header">
        <div className="portal-header-left">
          <div className="portal-logo">
            <span className="logo-icon">☁️</span>
            <span className="logo-text">Nimbus Cloud</span>
          </div>
        </div>
      </div>

      <div className="create-resource-container">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
          <span> / </span>
          <span>Deploy Service</span>
        </div>

        <h1 className="page-title">Deploy Service to Kubernetes</h1>

        {step === 1 && (
          <div className="template-selection">
            <h2>Select a service to deploy</h2>
            <p>All services will be deployed to your Kubernetes cluster using Helm</p>
            
            <div className="templates-grid">
              {ALL_DEPLOYABLE_SERVICES.map(service => (
                <div
                  key={service.id}
                  className="template-card"
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="template-icon">{service.icon}</div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="template-category">{service.category}</div>
                  {service.helmChart && (
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                      📦 {service.helmChart}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedService && (
          <div className="resource-form">
            <div className="form-header">
              <h2>Deploy {selectedService.name}</h2>
              <p>{selectedService.description}</p>
            </div>

            <div className="form-sections">
              <div className="form-section">
                <h3>Basic Configuration</h3>
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="my-service"
                  />
                </div>
                <div className="form-group">
                  <label>Namespace</label>
                  <input
                    type="text"
                    value={selectedService.namespace}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Helm Chart</label>
                  <input
                    type="text"
                    value={selectedService.helmChart}
                    disabled
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Service Configuration</h3>
                {selectedService.configFields.map(field => (
                  <div key={field.name} className="form-group">
                    <label>{field.label}</label>
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={config[field.name] || field.default}
                        onChange={(e) => setConfig({ ...config, [field.name]: parseInt(e.target.value) })}
                      />
                    )}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={config[field.name] || field.default}
                        onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={config[field.name] || field.default}
                        onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'toggle' && (
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={config[field.name] || field.default}
                          onChange={(e) => setConfig({ ...config, [field.name]: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleDeploy}
                disabled={loading || !serviceName}
              >
                {loading ? 'Deploying...' : '🚀 Deploy to Kubernetes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
