import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface DashboardStats {
  services: { total: number; running: number; stopped: number };
  vms: { total: number; running: number; stopped: number };
  storage: { total: string; used: string; available: string };
  cpu: { total: number; used: number; percent: number };
  memory: { total: string; used: string; percent: number };
  cluster?: { totalPods: number; runningPods: number; namespaces: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
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
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your Nimbus Cloud infrastructure</p>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--danger)'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">☸️</div>
          </div>
          <div className="stat-value">{stats?.services.running || 0}/{stats?.services.total || 0}</div>
          <div className="stat-label">Services Running</div>
          <div className={`stat-change ${stats?.services.running === stats?.services.total ? 'positive' : 'negative'}`}>
            {stats?.services.stopped || 0} stopped
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">🖥️</div>
          </div>
          <div className="stat-value">{stats?.vms.running || 0}/{stats?.vms.total || 0}</div>
          <div className="stat-label">Virtual Machines</div>
          <div className="stat-change positive">
            {stats?.vms.total || 0} total
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon cyan">💾</div>
          </div>
          <div className="stat-value">{stats?.storage.used || '0 GB'}</div>
          <div className="stat-label">Storage Used</div>
          <div className="stat-change">
            of {stats?.storage.total || '0 GB'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">⚡</div>
          </div>
          <div className="stat-value">{stats?.cpu.percent || 0}%</div>
          <div className="stat-label">CPU Usage</div>
          <div className="progress-bar" style={{ marginTop: 'var(--spacing-sm)' }}>
            <div className="progress-fill" style={{ width: `${stats?.cpu.percent || 0}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">🧠</div>
          </div>
          <div className="stat-value">{stats?.memory.percent || 0}%</div>
          <div className="stat-label">Memory Usage</div>
          <div className="progress-bar" style={{ marginTop: 'var(--spacing-sm)' }}>
            <div className="progress-fill" style={{ width: `${stats?.memory.percent || 0}%` }}></div>
          </div>
        </div>

        {stats?.cluster && (
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">📦</div>
            </div>
            <div className="stat-value">{stats.cluster.runningPods}/{stats.cluster.totalPods}</div>
            <div className="stat-label">Pods Running</div>
            <div className="stat-change positive">
              {stats.cluster.namespaces} namespaces
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            <Link to="/deploy-service" className="btn btn-primary">
              🚀 Deploy Service
            </Link>
            <Link to="/vms" className="btn btn-secondary">
              🖥️ Create VM
            </Link>
            <Link to="/storage" className="btn btn-secondary">
              💾 Add Storage
            </Link>
            <Link to="/resource-groups" className="btn btn-secondary">
              📦 Resource Groups
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">System Status</h2>
          <button className="btn btn-ghost" onClick={fetchStats}>🔄 Refresh</button>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>CPU Cores</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{stats?.cpu.total || 0} cores</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Total Memory</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{stats?.memory.total || '0 GB'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Available Storage</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{stats?.storage.available || '0 GB'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>Cluster Status</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: stats?.cluster ? 'var(--success)' : 'var(--warning)' }}>
                {stats?.cluster ? '✅ Connected' : '⚠️ Offline'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
