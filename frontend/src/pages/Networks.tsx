import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Network {
  id: string;
  name: string;
  cidr: string;
  gateway: string;
  type: string;
  status: string;
  connectedVMs: number;
}

export default function Networks() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cidr: '10.0.0.0/24',
    type: 'internal'
  });

  useEffect(() => {
    loadNetworks();
  }, []);

  const loadNetworks = async () => {
    try {
      const res = await axios.get('/api/networks');
      setNetworks(res.data);
    } catch (err) {
      console.error('Failed to load networks:', err);
    }
  };

  const createNetwork = async () => {
    try {
      await axios.post('/api/networks', formData);
      setShowModal(false);
      setFormData({ name: '', cidr: '10.0.0.0/24', type: 'internal' });
      loadNetworks();
    } catch (err: any) {
      alert('Failed to create network: ' + err.message);
    }
  };

  const deleteNetwork = async (id: string) => {
    if (!confirm('Delete this network?')) return;
    try {
      await axios.delete(`/api/networks/${id}`);
      loadNetworks();
    } catch (err: any) {
      alert('Failed to delete network: ' + err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Virtual Networks</h1>
        <p>Manage virtual networks and connectivity</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Networks ({networks.length})</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Network
          </button>
        </div>

        {networks.length === 0 ? (
          <div className="empty-state">
            <p>No networks configured yet. Create your first network to get started.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>CIDR</th>
                <th>Gateway</th>
                <th>Type</th>
                <th>Status</th>
                <th>Connected VMs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {networks.map(net => (
                <tr key={net.id}>
                  <td><strong>{net.name}</strong></td>
                  <td><code>{net.cidr}</code></td>
                  <td><code>{net.gateway}</code></td>
                  <td>{net.type}</td>
                  <td><span className={`status-badge ${net.status}`}>{net.status}</span></td>
                  <td>{net.connectedVMs}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => deleteNetwork(net.id)}
                      disabled={net.connectedVMs > 0}
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
            <h2>Create Virtual Network</h2>
            <div className="form-group">
              <label>Network Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-network"
              />
            </div>
            <div className="form-group">
              <label>CIDR Block</label>
              <input
                value={formData.cidr}
                onChange={e => setFormData({ ...formData, cidr: e.target.value })}
                placeholder="10.0.0.0/24"
              />
            </div>
            <div className="form-group">
              <label>Network Type</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="internal">Internal</option>
                <option value="external">External</option>
                <option value="isolated">Isolated</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createNetwork}>
                Create Network
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
