import { useState, useEffect } from 'react';
import api from '../api';

interface VM {
  id: string;
  name: string;
  cpu: string;
  memory: string;
  disk: string;
  image: string;
  status: string;
  ip: string;
}

export default function VirtualMachines() {
  const [vms, setVMs] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpu: '2',
    memory: '4Gi',
    disk: '20Gi',
    image: 'ubuntu-22.04'
  });

  useEffect(() => {
    loadVMs();
  }, []);

  const loadVMs = async () => {
    try {
      const response = await api.get('/vms');
      setVMs(response.data);
    } catch (error) {
      console.error('Failed to load VMs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVM = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vms', formData);
      setShowModal(false);
      setFormData({ name: '', cpu: '2', memory: '4Gi', disk: '20Gi', image: 'ubuntu-22.04' });
      loadVMs();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create VM');
    }
  };

  const deleteVM = async (id: string) => {
    if (!confirm('Delete this VM?')) return;
    try {
      await api.delete(`/vms/${id}`);
      loadVMs();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete VM');
    }
  };

  const vmAction = async (id: string, action: string) => {
    try {
      await api.post(`/vms/${id}/${action}`);
      loadVMs();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${action} VM`);
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
          <h1 className="page-title">Virtual Machines</h1>
          <p className="page-subtitle">Deploy and manage virtual machines</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Create VM
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">🖥️</div>
          </div>
          <div className="stat-value">{vms.length}</div>
          <div className="stat-label">Total VMs</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">✅</div>
          </div>
          <div className="stat-value">
            {vms.filter(v => v.status === 'running').length}
          </div>
          <div className="stat-label">Running</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">⏸️</div>
          </div>
          <div className="stat-value">
            {vms.filter(v => v.status === 'stopped').length}
          </div>
          <div className="stat-label">Stopped</div>
        </div>
      </div>

      {/* VMs Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Virtual Machines</h2>
          <button className="btn btn-ghost" onClick={loadVMs}>🔄 Refresh</button>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Disk</th>
                <th>Image</th>
                <th>Status</th>
                <th>IP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vms.map((vm) => (
                <tr key={vm.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span style={{ fontSize: '1.25rem' }}>🖥️</span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{vm.name}</span>
                    </div>
                  </td>
                  <td>{vm.cpu} cores</td>
                  <td>{vm.memory}</td>
                  <td>{vm.disk}</td>
                  <td>
                    <span className="service-card-badge">{vm.image}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${vm.status}`}>{vm.status}</span>
                  </td>
                  <td>{vm.ip || 'Pending'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                      {vm.status === 'running' ? (
                        <button className="btn btn-ghost" onClick={() => vmAction(vm.id, 'stop')} title="Stop">
                          ⏹️
                        </button>
                      ) : (
                        <button className="btn btn-ghost" onClick={() => vmAction(vm.id, 'start')} title="Start">
                          ▶️
                        </button>
                      )}
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => deleteVM(vm.id)}
                        style={{ color: 'var(--danger)' }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vms.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🖥️</div>
                      <h3 className="empty-state-title">No virtual machines</h3>
                      <p className="empty-state-description">Create your first VM to get started</p>
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
              <h2 className="modal-title">Create Virtual Machine</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createVM}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">VM Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="my-vm"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">CPU Cores</label>
                    <select
                      className="form-input form-select"
                      value={formData.cpu}
                      onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    >
                      <option value="1">1 Core</option>
                      <option value="2">2 Cores</option>
                      <option value="4">4 Cores</option>
                      <option value="8">8 Cores</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Memory</label>
                    <select
                      className="form-input form-select"
                      value={formData.memory}
                      onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                    >
                      <option value="1Gi">1 GB</option>
                      <option value="2Gi">2 GB</option>
                      <option value="4Gi">4 GB</option>
                      <option value="8Gi">8 GB</option>
                      <option value="16Gi">16 GB</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Disk Size</label>
                  <select
                    className="form-input form-select"
                    value={formData.disk}
                    onChange={(e) => setFormData({ ...formData, disk: e.target.value })}
                  >
                    <option value="10Gi">10 GB</option>
                    <option value="20Gi">20 GB</option>
                    <option value="50Gi">50 GB</option>
                    <option value="100Gi">100 GB</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Operating System</label>
                  <select
                    className="form-input form-select"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  >
                    <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                    <option value="ubuntu-20.04">Ubuntu 20.04 LTS</option>
                    <option value="debian-11">Debian 11</option>
                    <option value="centos-8">CentOS 8</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create VM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
