import { useState, useEffect } from 'react';
import { Plus, Folder, Trash2, Package, Database, Box } from 'lucide-react';
import api from '../api';

interface ResourceGroup {
  id: string;
  name: string;
  description: string;
  location: string;
  tags: Record<string, string>;
  resourceCount: number;
  resources: {
    deployments: number;
    services: number;
    storage: number;
    helm: number;
  };
  status: string;
  createdAt: string;
}

export default function ResourceGroups() {
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: 'local',
    tags: ''
  });

  useEffect(() => {
    fetchResourceGroups();
  }, []);

  const fetchResourceGroups = async () => {
    try {
      const response = await api.get('/resource-groups');
      setResourceGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch resource groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags: Record<string, string> = {};
      if (formData.tags) {
        formData.tags.split(',').forEach(tag => {
          const [key, value] = tag.trim().split('=');
          if (key && value) tags[key] = value;
        });
      }

      await api.post('/resource-groups', {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        tags
      });

      setShowCreateModal(false);
      setFormData({ name: '', description: '', location: 'local', tags: '' });
      fetchResourceGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create resource group');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete resource group "${name}" and all its resources?`)) return;
    
    try {
      await api.delete(`/resource-groups/${name}`);
      fetchResourceGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete resource group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading resource groups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Resource Groups</h1>
          <p className="text-gray-400 mt-2">Logical grouping of resources and services</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Resource Group
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Groups</p>
              <p className="text-3xl font-bold text-white mt-2">{resourceGroups.length}</p>
            </div>
            <Folder className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Resources</p>
              <p className="text-3xl font-bold text-white mt-2">
                {resourceGroups.reduce((sum, rg) => sum + rg.resourceCount, 0)}
              </p>
            </div>
            <Package className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Groups</p>
              <p className="text-3xl font-bold text-white mt-2">
                {resourceGroups.filter(rg => rg.status === 'active').length}
              </p>
            </div>
            <Box className="w-12 h-12 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Resources/Group</p>
              <p className="text-3xl font-bold text-white mt-2">
                {resourceGroups.length > 0 
                  ? Math.round(resourceGroups.reduce((sum, rg) => sum + rg.resourceCount, 0) / resourceGroups.length)
                  : 0}
              </p>
            </div>
            <Database className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Resource Groups List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Resources</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {resourceGroups.map((rg) => (
                <tr key={rg.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{rg.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{rg.description}</td>
                  <td className="px-6 py-4 text-gray-300">{rg.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-300" title="Deployments">
                        📦 {rg.resources.deployments}
                      </span>
                      <span className="text-gray-300" title="Services">
                        🔌 {rg.resources.services}
                      </span>
                      <span className="text-gray-300" title="Storage">
                        💾 {rg.resources.storage}
                      </span>
                      <span className="text-gray-300" title="Helm Charts">
                        ⎈ {rg.resources.helm}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      rg.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {rg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {new Date(rg.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(rg.name)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete resource group"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Resource Group</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="my-resource-group"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Resources for my application"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="local">Local</option>
                  <option value="us-east-1">US East 1</option>
                  <option value="us-west-2">US West 2</option>
                  <option value="eu-west-1">EU West 1</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated, key=value)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="env=prod,team=backend"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
