import { useState, useEffect } from 'react';
import api from '../api';

interface ResourceGroup {
  id: string;
  name: string;
  description: string;
  location: string;
  tags: Record<string, string>;
  resourceCount: number;
  resources: {
    deployments: number;
    services: number;
    storage: number;
    helm: number;
  };
  status: string;
  createdAt: string;
}

export default function ResourceGroups() {
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: 'local',
    tags: ''
  });

  useEffect(() => {
    fetchResourceGroups();
  }, []);

  const fetchResourceGroups = async () => {
    try {
      const response = await api.get('/resource-groups');
      setResourceGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch resource groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags: Record<string, string> = {};
      if (formData.tags) {
        formData.tags.split(',').forEach(tag => {
          const [key, value] = tag.trim().split('=');
          if (key && value) tags[key] = value;
        });
      }

      await api.post('/resource-groups', {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        tags
      });

      setShowModal(false);
      setFormData({ name: '', description: '', location: 'local', tags: '' });
      fetchResourceGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create resource group');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete resource group "${name}" and all its resources?`)) return;
    
    try {
      await api.delete(`/resource-groups/${name}`);
      fetchResourceGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete resource group');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Resource Groups</h1>
          <p className="page-subtitle">Organize and manage your cloud resources</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Create Resource Group
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">📦</div>
          </div>
          <div className="stat-value">{resourceGroups.length}</div>
          <div className="stat-label">Total Groups</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">🗂️</div>
          </div>
          <div className="stat-value">
            {resourceGroups.reduce((sum, rg) => sum + rg.resourceCount, 0)}
          </div>
          <div className="stat-label">Total Resources</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">✅</div>
          </div>
          <div className="stat-value">
            {resourceGroups.filter(rg => rg.status === 'active').length}
          </div>
          <div className="stat-label">Active Groups</div>
        </div>
      </div>

      {/* Resource Groups Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Resource Groups</h2>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Resources</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resourceGroups.map((rg) => (
                <tr key={rg.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span style={{ fontSize: '1.25rem' }}>📦</span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{rg.name}</span>
                    </div>
                  </td>
                  <td>{rg.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                      <span title="Deployments">📦 {rg.resources.deployments}</span>
                      <span title="Services">🔌 {rg.resources.services}</span>
                      <span title="Storage">💾 {rg.resources.storage}</span>
                      <span title="Helm">⎈ {rg.resources.helm}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${rg.status}`}>{rg.status}</span>
                  </td>
                  <td>{new Date(rg.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => handleDelete(rg.name)}
                      style={{ color: 'var(--danger)' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {resourceGroups.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <h3 className="empty-state-title">No resource groups</h3>
                      <p className="empty-state-description">Create your first resource group to organize resources</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Resource Group</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="my-resource-group"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Resources for my application"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <select
                    className="form-input form-select"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  >
                    <option value="local">Local</option>
                    <option value="us-east-1">US East 1</option>
                    <option value="us-west-2">US West 2</option>
                    <option value="eu-west-1">EU West 1</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (key=value, comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="env=prod,team=backend"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
