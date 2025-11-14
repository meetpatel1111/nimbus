import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Stats {
  vms: { total: number; running: number };
  services: { total: number; running: number };
  storage: { total: string; used: string; available: string };
  cpu: { total: number; used: number; percent: number };
  memory: { total: string; used: string; percent: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!stats) return <div className="container">Failed to load dashboard</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>🌥️ Nimbus Cloud Platform</h1>
        <p>Your private cloud infrastructure dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Virtual Machines</h3>
          <div className="value">{stats.vms.running}/{stats.vms.total}</div>
          <div className="subtext">Running / Total</div>
        </div>

        <div className="stat-card">
          <h3>Services</h3>
          <div className="value">{stats.services.running}/{stats.services.total}</div>
          <div className="subtext">Active Services</div>
        </div>

        <div className="stat-card">
          <h3>CPU Usage</h3>
          <div className="value">{stats.cpu.percent}%</div>
          <div className="subtext">{stats.cpu.used} / {stats.cpu.total} cores</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.cpu.percent}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Memory Usage</h3>
          <div className="value">{stats.memory.percent}%</div>
          <div className="subtext">{stats.memory.used} / {stats.memory.total}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.memory.percent}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Storage</h3>
          <div className="value">{stats.storage.used}</div>
          <div className="subtext">Used of {stats.storage.total}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '24%' }}></div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Available Storage</h3>
          <div className="value">{stats.storage.available}</div>
          <div className="subtext">Free space remaining</div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => window.location.href = '/vms'}>
            Create VM
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/storage'}>
            Add Storage
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/services'}>
            Manage Services
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/deploy'}>
            Deploy to Cloud
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Platform Overview</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
          Nimbus provides a complete cloud platform with 21 integrated services including compute, 
          storage, networking, observability, security, and DevOps tools.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Platform Services</strong>
            <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>Kubernetes, Storage, Ingress</p>
          </div>
          <div>
            <strong>Compute</strong>
            <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>VMs, Serverless Functions</p>
          </div>
          <div>
            <strong>Observability</strong>
            <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>Metrics, Logs, Dashboards</p>
          </div>
          <div>
            <strong>Security</strong>
            <p style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>IAM, Secrets, Encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}