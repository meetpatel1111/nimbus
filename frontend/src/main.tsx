import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import CreateService from './pages/CreateService';
import VirtualMachines from './pages/VirtualMachines';
import Storage from './pages/Storage';
import Networks from './pages/Networks';
import Deploy from './pages/Deploy';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/services">Services</Link>
          <Link to="/services/create">+ Create Service</Link>
          <Link to="/vms">VMs</Link>
          <Link to="/storage">Storage</Link>
          <Link to="/networks">Networks</Link>
          <Link to="/deploy">Deploy</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/create" element={<CreateService />} />
          <Route path="/vms" element={<VirtualMachines />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/networks" element={<Networks />} />
          <Route path="/deploy" element={<Deploy />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
