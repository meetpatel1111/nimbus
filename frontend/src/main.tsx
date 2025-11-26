import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import CreateService from './pages/CreateService';
import VirtualMachines from './pages/VirtualMachines';
import Storage from './pages/Storage';
import Networks from './pages/Networks';
import Deploy from './pages/Deploy';
import CloudPortal from './pages/CloudPortal';
import CreateResource from './pages/CreateResource';
import Resources from './pages/Resources';
import ResourceGroups from './pages/ResourceGroups';
import ServiceDeployment from './pages/ServiceDeployment';
import './styles/modern-ui.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CloudPortal />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resource-groups" element={<ResourceGroups />} />
          <Route path="/create-resource" element={<CreateResource />} />
          <Route path="/deploy-service" element={<ServiceDeployment />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/create" element={<CreateService />} />
          <Route path="/vms" element={<VirtualMachines />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/networks" element={<Networks />} />
          <Route path="/deploy" element={<Deploy />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
