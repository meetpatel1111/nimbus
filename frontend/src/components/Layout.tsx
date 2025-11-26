import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { section: 'Overview', items: [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  ]},
  { section: 'Compute', items: [
    { path: '/vms', icon: '🖥️', label: 'Virtual Machines' },
    { path: '/services', icon: '☸️', label: 'Services' },
  ]},
  { section: 'Storage', items: [
    { path: '/storage', icon: '💾', label: 'Storage' },
  ]},
  { section: 'Networking', items: [
    { path: '/networks', icon: '🌐', label: 'Networks' },
  ]},
  { section: 'Management', items: [
    { path: '/resource-groups', icon: '📦', label: 'Resource Groups' },
    { path: '/resources', icon: '🗂️', label: 'All Resources' },
  ]},
  { section: 'Deploy', items: [
    { path: '/deploy-service', icon: '🚀', label: 'Deploy Service' },
    { path: '/create-resource', icon: '➕', label: 'Create Resource' },
  ]},
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">☁️</div>
            <span className="sidebar-logo-text">Nimbus</span>
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-bar">
            <span style={{ marginRight: '8px', color: 'var(--text-muted)' }}>🔍</span>
            <input type="text" placeholder="Search resources, services, and more..." />
          </div>
          
          <div className="header-actions">
            <button className="header-btn" title="Notifications">🔔</button>
            <button className="header-btn" title="Settings">⚙️</button>
            <button className="header-btn" title="Help">❓</button>
            <div className="user-avatar">A</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
