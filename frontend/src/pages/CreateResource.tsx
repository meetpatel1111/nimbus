import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface ServiceTemplate {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'toggle';
  required: boolean;
  options?: string[];
  default?: any;
  placeholder?: string;
}

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'vm',
    name: 'Virtual Machine',
    icon: '🖥️',
    category: 'Compute',
    description: 'Create a new virtual machine',
    fields: [
      { name: 'name', label: 'VM Name', type: 'text', required: true, placeholder: 'my-vm' },
      { name: 'size', label: 'VM Size', type: 'select', required: true, options: ['Small (1 vCPU, 2GB RAM)', 'Medium (2 vCPU, 4GB RAM)', 'Large (4 vCPU, 8GB RAM)', 'XLarge (8 vCPU, 16GB RAM)'] },
      { name: 'os', label: 'Operating System', type: 'select', required: true, options: ['Ubuntu 22.04', 'Ubuntu 20.04', 'CentOS 8', 'Debian 11'] },
      { name: 'disk', label: 'Disk Size (GB)', type: 'number', required: true, default: 50 },
      { name: 'publicIp', label: 'Assign Public IP', type: 'toggle', required: false, default: true },
    ]
  },
  {
    id: 'database',
    name: 'Database',
    icon: '🗄️',
    category: 'Databases',
    description: 'Deploy a managed database',
    fields: [
      { name: 'name', label: 'Database Name', type: 'text', required: true, placeholder: 'my-database' },
      { name: 'type', label: 'Database Type', type: 'select', required: true, options: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'] },
      { name: 'version', label: 'Version', type: 'select', required: true, options: ['Latest', '14.x', '13.x', '12.x'] },
      { name: 'storage', label: 'Storage (GB)', type: 'number', required: true, default: 20 },
      { name: 'backup', label: 'Enable Backups', type: 'toggle', required: false, default: true },
    ]
  },
  {
    id: 'storage',
    name: 'Storage Account',
    icon: '💾',
    category: 'Storage',
    description: 'Create object storage',
    fields: [
      { name: 'name', label: 'Storage Name', type: 'text', required: true, placeholder: 'mystorageaccount' },
      { name: 'type', label: 'Storage Type', type: 'select', required: true, options: ['Object Storage (S3)', 'Block Storage', 'File Storage'] },
      { name: 'size', label: 'Initial Size (GB)', type: 'number', required: true, default: 100 },
      { name: 'redundancy', label: 'Redundancy', type: 'select', required: true, options: ['Locally Redundant', 'Zone Redundant', 'Geo Redundant'] },
    ]
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes Cluster',
    icon: '☸️',
    category: 'Compute',
    description: 'Managed Kubernetes service',
    fields: [
      { name: 'name', label: 'Cluster Name', type: 'text', required: true, placeholder: 'my-k8s-cluster' },
      { name: 'version', label: 'Kubernetes Version', type: 'select', required: true, options: ['1.28', '1.27', '1.26'] },
      { name: 'nodeCount', label: 'Node Count', type: 'number', required: true, default: 3 },
      { name: 'nodeSize', label: 'Node Size', type: 'select', required: true, options: ['Small', 'Medium', 'Large'] },
      { name: 'autoScale', label: 'Enable Auto-scaling', type: 'toggle', required: false, default: false },
    ]
  },
  {
    id: 'function',
    name: 'Function App',
    icon: '⚡',
    category: 'Compute',
    description: 'Serverless function',
    fields: [
      { name: 'name', label: 'Function Name', type: 'text', required: true, placeholder: 'my-function' },
      { name: 'runtime', label: 'Runtime', type: 'select', required: true, options: ['Node.js 18', 'Python 3.11', 'Go 1.21', 'Java 17'] },
      { name: 'memory', label: 'Memory (MB)', type: 'select', required: true, options: ['128', '256', '512', '1024', '2048'] },
      { name: 'timeout', label: 'Timeout (seconds)', type: 'number', required: true, default: 60 },
    ]
  },
  {
    id: 'loadbalancer',
    name: 'Load Balancer',
    icon: '⚖️',
    category: 'Networking',
    description: 'Distribute traffic across resources',
    fields: [
      { name: 'name', label: 'Load Balancer Name', type: 'text', required: true, placeholder: 'my-lb' },
      { name: 'type', label: 'Type', type: 'select', required: true, options: ['Application (HTTP/HTTPS)', 'Network (TCP/UDP)', 'Gateway'] },
      { name: 'scheme', label: 'Scheme', type: 'select', required: true, options: ['Internet-facing', 'Internal'] },
      { name: 'healthCheck', label: 'Health Check Path', type: 'text', required: false, placeholder: '/health' },
    ]
  },
];

export default function CreateResource() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select template, 2: Configure, 3: Review

  const handleTemplateSelect = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    // Initialize form data with defaults
    const initialData: any = { resourceGroup: 'default', region: 'us-east-1' };
    template.fields.forEach(field => {
      if (field.default !== undefined) {
        initialData[field.name] = field.default;
      }
    });
    setFormData(initialData);
    setStep(2);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        type: selectedTemplate?.id,
        name: formData.name,
        config: formData,
      };
      await api.post('/api/resources', payload);
      alert('Resource created successfully!');
      navigate('/resources');
    } catch (err: any) {
      alert('Failed to create resource: ' + err.message);
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
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
          <span> / </span>
          <span>Create a resource</span>
        </div>

        <h1 className="page-title">Create a resource</h1>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Configure</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        {/* Step 1: Select Template */}
        {step === 1 && (
          <div className="template-selection">
            <h2>Select a resource type</h2>
            <div className="templates-grid">
              {SERVICE_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <div className="template-category">{template.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && selectedTemplate && (
          <div className="resource-form">
            <div className="form-header">
              <h2>Create {selectedTemplate.name}</h2>
              <p>{selectedTemplate.description}</p>
            </div>

            <div className="form-sections">
              {/* Basics Section */}
              <div className="form-section">
                <h3>Basics</h3>
                <div className="form-group">
                  <label>Resource Group *</label>
                  <select
                    value={formData.resourceGroup || 'default'}
                    onChange={(e) => handleInputChange('resourceGroup', e.target.value)}
                  >
                    <option value="default">default</option>
                    <option value="production">production</option>
                    <option value="development">development</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Region *</label>
                  <select
                    value={formData.region || 'us-east-1'}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  </select>
                </div>
              </div>

              {/* Resource Configuration */}
              <div className="form-section">
                <h3>Configuration</h3>
                {selectedTemplate.fields.map(field => (
                  <div key={field.name} className="form-group">
                    <label>
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={formData[field.name] || field.default || ''}
                        onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                        required={field.required}
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                      >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'toggle' && (
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              {/* Tags Section */}
              <div className="form-section">
                <h3>Tags</h3>
                <div className="form-group">
                  <label>Environment</label>
                  <input
                    type="text"
                    placeholder="e.g., production"
                    value={formData.tagEnvironment || ''}
                    onChange={(e) => handleInputChange('tagEnvironment', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Owner</label>
                  <input
                    type="text"
                    placeholder="e.g., team-name"
                    value={formData.tagOwner || ''}
                    onChange={(e) => handleInputChange('tagOwner', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Review + Create
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && selectedTemplate && (
          <div className="review-section">
            <h2>Review + Create</h2>
            <div className="review-card">
              <h3>{selectedTemplate.name}</h3>
              <div className="review-details">
                <div className="review-item">
                  <span className="review-label">Resource Group:</span>
                  <span className="review-value">{formData.resourceGroup}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Region:</span>
                  <span className="review-value">{formData.region}</span>
                </div>
                {selectedTemplate.fields.map(field => (
                  formData[field.name] !== undefined && (
                    <div key={field.name} className="review-item">
                      <span className="review-label">{field.label}:</span>
                      <span className="review-value">
                        {typeof formData[field.name] === 'boolean' 
                          ? (formData[field.name] ? 'Yes' : 'No')
                          : formData[field.name]}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
