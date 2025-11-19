import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  resourceGroup: string;
  region: string;
  created: string;
}

export default function Resources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [k8sStatus, setK8sStatus] = useState<any>(null);

  useEffect(() => {
    loadResources();
    syncWithK8s();
  }, []);

  const syncWithK8s = async () => {
    try {
      const res = await api.get('/api/resources/sync');
      setK8sStatus(res.data);
    } catch (err) {
      console.error('Failed to sync with K8s:', err);
    }
  };

  const loadResources = async () => {
    try {
      const res = await api.get('/api/resources');
      setResources(res.data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    try {
      await api.delete(`/api/resources/${resource.id}`);
      alert('Resource deleted successfully');
      loadResources();
      setShowDeleteModal(false);
    } catch (err: any) {
      alert('Failed to delete resource: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedResources.length} resources?`)) return;
    try {
      await Promise.all(selectedResources.map(id => api.delete(`/api/resources/${id}`)));
      alert('Resources deleted successfully');
      setSelectedResources([]);
      loadResources();
    } catch (err: any) {
      alert('Failed to delete resources: ' + err.message);
    }
  };

  const toggleSelectResource = (id: string) => {
    setSelectedResources(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredResources = filterType === 'all'
    ? resources
    : resources.filter(r => r.type === filterType);

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

      <div className="resources-container">
        <div className="resources-header">
          <h1>All Resources</h1>
          <div className="resources-actions">
            {k8sStatus && (
              <div className="k8s-status">
                {k8sStatus.synced ? (
                  <span className="status-badge running">
                    ☸️ K8s Connected ({k8sStatus.k8sPods} pods)
                  </span>
                ) : (
                  <span className="status-badge stopped">
                    ☸️ K8s Offline
                  </span>
                )}
              </div>
            )}
            <button className="btn btn-secondary" onClick={syncWithK8s}>
              🔄 Sync
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/create-resource')}>
              + Create Resource
            </button>
            {selectedResources.length > 0 && (
              <button className="btn btn-danger" onClick={handleBulkDelete}>
                Delete ({selectedResources.length})
              </button>
            )}
          </div>
        </div>

        <div className="resources-filters">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="vm">Virtual Machines</option>
            <option value="database">Databases</option>
            <option value="storage">Storage</option>
            <option value="kubernetes">Kubernetes</option>
            <option value="function">Functions</option>
            <option value="loadbalancer">Load Balancers</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading resources...</div>
        ) : (
          <div className="resources-table-container">
            <table className="resources-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedResources.length === resources.length && resources.length > 0}
                      onChange={(e) => setSelectedResources(e.target.checked ? resources.map(r => r.id) : [])}
                    />
                  </th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Resource Group</th>
                  <th>Region</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map(resource => (
                  <tr key={resource.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource.id)}
                        onChange={() => toggleSelectResource(resource.id)}
                      />
                    </td>
                    <td className="resource-name">{resource.name}</td>
                    <td>{resource.type}</td>
                    <td>
                      <span className={`status-badge ${resource.status}`}>
                        {resource.status}
                      </span>
                    </td>
                    <td>{resource.resourceGroup}</td>
                    <td>{resource.region}</td>
                    <td>{new Date(resource.created).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View">👁️</button>
                        <button className="btn-icon" title="Edit">✏️</button>
                        <button 
                          className="btn-icon" 
                          title="Delete"
                          onClick={() => {
                            setResourceToDelete(resource);
                            setShowDeleteModal(true);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && resourceToDelete && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Resource</h2>
              <p>Are you sure you want to delete <strong>{resourceToDelete.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(resourceToDelete)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
