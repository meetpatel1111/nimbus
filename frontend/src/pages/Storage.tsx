import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface StorageVolume {
  id: string;
  name: string;
  size: string;
  used: string;
  available: string;
  type: string;
  status: string;
  attachedTo?: string;
}

export default function Storage() {
  const [volumes, setVolumes] = useState<StorageVolume[]>([]);
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
      const res = await axios.get('/api/storage/volumes');
      setVolumes(res.data);
    } catch (err) {
      console.error('Failed to load volumes:', err);
    }
  };

  const createVolume = async () => {
    try {
      await axios.post('/api/storage/volumes', formData);
      setShowModal(false);
      setFormData({ name: '', size: '10Gi', type: 'longhorn' });
      loadVolumes();
    } catch (err: any) {
      alert('Failed to create volume: ' + err.message);
    }
  };

  const deleteVolume = async (id: string) => {
    if (!confirm('Delete this volume? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/storage/volumes/${id}`);
      loadVolumes();
    } catch (err: any) {
      alert('Failed to delete volume: ' + err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Storage Volumes</h1>
        <p>Manage persistent storage volumes (Longhorn + MinIO)</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Volumes ({volumes.length})</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Volume
          </button>
        </div>

        {volumes.length === 0 ? (
          <div className="empty-state">
            <p>No storage volumes yet. Create your first volume to get started.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Used</th>
                <th>Available</th>
                <th>Status</th>
                <th>Attached To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volumes.map(vol => (
                <tr key={vol.id}>
                  <td><strong>{vol.name}</strong></td>
                  <td>{vol.type}</td>
                  <td>{vol.size}</td>
                  <td>{vol.used}</td>
                  <td>{vol.available}</td>
                  <td><span className={`status-badge ${vol.status}`}>{vol.status}</span></td>
                  <td>{vol.attachedTo || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => deleteVolume(vol.id)}
                      disabled={!!vol.attachedTo}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create Storage Volume</h2>
            <div className="form-group">
              <label>Volume Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-volume"
              />
            </div>
            <div className="form-group">
              <label>Size</label>
              <select value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })}>
                <option value="5Gi">5 GB</option>
                <option value="10Gi">10 GB</option>
                <option value="20Gi">20 GB</option>
                <option value="50Gi">50 GB</option>
                <option value="100Gi">100 GB</option>
              </select>
            </div>
            <div className="form-group">
              <label>Storage Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="longhorn">Longhorn (Block Storage)</option>
                <option value="minio">MinIO (Object Storage)</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createVolume}>
                Create Volume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
