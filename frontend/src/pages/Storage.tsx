import { useState, useEffect } from 'react';
import api from '../api';

interface Volume {
  id: string;
  name: string;
  size: string;
  type: string;
  used: string;
  available: string;
  status: string;
  attachedTo: string | null;
}

export default function Storage() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: '10Gi',
    type: 'longhorn'
  });

  useEffect(() => {
    loadVolumes();
  }, []);

  const loadVolumes = async () => {
    try {
      const response = await api.get('/storage/volumes');
      setVolumes(response.data);
    } catch (error) {
      console.error('Failed to load volumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/storage/volumes', formData);
      setShowModal(false);
      setFormData({ name: '', size: '10Gi', type: 'longhorn' });
      loadVolumes();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create volume');
    }
  };

  const deleteVolume = async (id: string) => {
    if (!confirm('Delete this volume?')) return;
    try {
      await api.delete(`/storage/volumes/${id}`);
      loadVolumes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete volume');
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
          <h1 className="page-title">Storage</h1>
          <p className="page-subtitle">Manage persistent volumes and storage</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Create Volume
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon cyan">💾</div>
          </div>
          <div className="stat-value">{volumes.length}</div>
          <div className="stat-label">Total Volumes</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">✅</div>
          </div>
          <div className="stat-value">
            {volumes.filter(v => v.status === 'available' || v.status === 'Bound').length}
          </div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">🔗</div>
          </div>
          <div className="stat-value">
            {volumes.filter(v => v.attachedTo).length}
          </div>
          <div className="stat-label">Attached</div>
        </div>
      </div>

      {/* Volumes Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Volumes</h2>
          <button className="btn btn-ghost" onClick={loadVolumes}>🔄 Refresh</button>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Type</th>
                <th>Status</th>
                <th>Attached To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volumes.map((volume) => (
                <tr key={volume.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span style={{ fontSize: '1.25rem' }}>💾</span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{volume.name}</span>
                    </div>
                  </td>
                  <td>{volume.size}</td>
                  <td>
                    <span className="service-card-badge">{volume.type}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${volume.status === 'available' || volume.status === 'Bound' ? 'running' : 'pending'}`}>
                      {volume.status}
                    </span>
                  </td>
                  <td>{volume.attachedTo || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => deleteVolume(volume.id)}
                      style={{ color: 'var(--danger)' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {volumes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">💾</div>
                      <h3 className="empty-state-title">No volumes</h3>
                      <p className="empty-state-description">Create your first storage volume</p>
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
              <h2 className="modal-title">Create Volume</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createVolume}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Volume Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="my-volume"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Size</label>
                  <select
                    className="form-input form-select"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  >
                    <option value="1Gi">1 GB</option>
                    <option value="5Gi">5 GB</option>
                    <option value="10Gi">10 GB</option>
                    <option value="20Gi">20 GB</option>
                    <option value="50Gi">50 GB</option>
                    <option value="100Gi">100 GB</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Storage Type</label>
                  <select
                    className="form-input form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="longhorn">Longhorn (Distributed)</option>
                    <option value="local-path">Local Path</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Volume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
