import React, { useEffect, useState } from 'react';
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
  createdAt: string;
}

export default function VirtualMachines() {
  const [vms, setVms] = useState<VM[]>([]);
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
      const res = await api.get('/api/vms');
      setVms(res.data);
    } catch (err) {
      console.error('Failed to load VMs:', err);
    }
  };

  const createVM = async () => {
    try {
      await api.post('/api/vms', formData);
      setShowModal(false);
      setFormData({ name: '', cpu: '2', memory: '4Gi', disk: '20Gi', image: 'ubuntu-22.04' });
      loadVMs();
    } catch (err: any) {
      alert('Failed to create VM: ' + err.message);
    }
  };

  const deleteVM = async (id: string) => {
    if (!confirm('Delete this VM?')) return;
    try {
      await api.delete(`/api/vms/${id}`);
      loadVMs();
    } catch (err: any) {
      alert('Failed to delete VM: ' + err.message);
    }
  };

  const vmAction = async (id: string, action: string) => {
    try {
      await api.post(`/api/vms/${id}/${action}`);
      loadVMs();
    } catch (err: any) {
      alert(`Failed to ${action} VM: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Virtual Machines</h1>
        <p>Provision and manage virtual machines</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Your VMs ({vms.length})</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create VM
          </button>
        </div>

        {vms.length === 0 ? (
          <div className="empty-state">
            <p>No virtual machines yet. Create your first VM to get started.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Disk</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vms.map(vm => (
                <tr key={vm.id}>
                  <td><strong>{vm.name}</strong></td>
                  <td><span className={`status-badge ${vm.status}`}>{vm.status}</span></td>
                  <td>{vm.ip}</td>
                  <td>{vm.cpu}</td>
                  <td>{vm.memory}</td>
                  <td>{vm.disk}</td>
                  <td>{vm.image}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {vm.status === 'running' ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => vmAction(vm.id, 'stop')}>
                          Stop
                        </button>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => vmAction(vm.id, 'start')}>
                          Start
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteVM(vm.id)}>
                        Delete
                      </button>
                    </div>
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
            <h2>Create Virtual Machine</h2>
            <div className="form-group">
              <label>VM Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-vm"
              />
            </div>
            <div className="form-group">
              <label>CPU Cores</label>
              <select value={formData.cpu} onChange={e => setFormData({ ...formData, cpu: e.target.value })}>
                <option value="1">1 Core</option>
                <option value="2">2 Cores</option>
                <option value="4">4 Cores</option>
                <option value="8">8 Cores</option>
              </select>
            </div>
            <div className="form-group">
              <label>Memory</label>
              <select value={formData.memory} onChange={e => setFormData({ ...formData, memory: e.target.value })}>
                <option value="2Gi">2 GB</option>
                <option value="4Gi">4 GB</option>
                <option value="8Gi">8 GB</option>
                <option value="16Gi">16 GB</option>
              </select>
            </div>
            <div className="form-group">
              <label>Disk Size</label>
              <select value={formData.disk} onChange={e => setFormData({ ...formData, disk: e.target.value })}>
                <option value="10Gi">10 GB</option>
                <option value="20Gi">20 GB</option>
                <option value="50Gi">50 GB</option>
                <option value="100Gi">100 GB</option>
              </select>
            </div>
            <div className="form-group">
              <label>OS Image</label>
              <select value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}>
                <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                <option value="ubuntu-20.04">Ubuntu 20.04 LTS</option>
                <option value="debian-11">Debian 11</option>
                <option value="centos-8">CentOS 8</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={createVM}>
                Create VM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
