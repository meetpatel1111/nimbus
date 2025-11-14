import React, { useState } from 'react';
import axios from 'axios';

export default function Deploy() {
  const [provider, setProvider] = useState('none');
  const [name, setName] = useState('nimbus-vm');
  const [region, setRegion] = useState('us-east-1');
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const deploy = async () => {
    if (provider === 'none') {
      alert('Please select a cloud provider');
      return;
    }
    
    setDeploying(true);
    setResult(null);
    
    try {
      const r = await axios.post('/api/deploy', { provider, name, region });
      setResult({ success: true, data: r.data });
    } catch (e: any) {
      setResult({ success: false, error: e.message });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Cloud Deployment</h1>
        <p>Deploy Nimbus infrastructure to AWS or Azure</p>
      </div>

      <div className="card">
        <h2>Deploy to Public Cloud</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          Use Terraform to provision cloud infrastructure on AWS or Azure. This will create VMs and networking resources.
        </p>

        <div className="form-group">
          <label>Cloud Provider</label>
          <select value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="none">Select Provider</option>
            <option value="aws">Amazon Web Services (AWS)</option>
            <option value="azure">Microsoft Azure</option>
          </select>
        </div>

        <div className="form-group">
          <label>Instance Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="nimbus-vm"
          />
        </div>

        <div className="form-group">
          <label>Region</label>
          {provider === 'aws' ? (
            <select value={region} onChange={e => setRegion(e.target.value)}>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          ) : provider === 'azure' ? (
            <select value={region} onChange={e => setRegion(e.target.value)}>
              <option value="eastus">East US</option>
              <option value="westus2">West US 2</option>
              <option value="westeurope">West Europe</option>
              <option value="southeastasia">Southeast Asia</option>
            </select>
          ) : (
            <input value={region} onChange={e => setRegion(e.target.value)} disabled />
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={deploy}
          disabled={deploying || provider === 'none'}
        >
          {deploying ? 'Deploying...' : 'Deploy Infrastructure'}
        </button>

        {result && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            background: result.success ? '#d4edda' : '#f8d7da',
            color: result.success ? '#155724' : '#721c24'
          }}>
            {result.success ? (
              <>
                <strong>✓ Deployment Successful</strong>
                <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </>
            ) : (
              <>
                <strong>✗ Deployment Failed</strong>
                <p style={{ marginTop: '0.5rem' }}>{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Prerequisites</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#7f8c8d' }}>
          <li>Terraform must be installed on the server</li>
          <li>AWS credentials configured (for AWS deployment)</li>
          <li>Azure credentials configured (for Azure deployment)</li>
          <li>Appropriate IAM permissions for resource creation</li>
        </ul>
      </div>

      <div className="card">
        <h2>What Gets Deployed</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>AWS</strong>
            <ul style={{ paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
              <li>EC2 Instance (t2.micro)</li>
              <li>Ubuntu 22.04 LTS</li>
              <li>Security Groups</li>
              <li>Public IP</li>
            </ul>
          </div>
          <div>
            <strong>Azure</strong>
            <ul style={{ paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
              <li>Virtual Machine (Standard_B1s)</li>
              <li>Ubuntu 22.04 LTS</li>
              <li>Virtual Network</li>
              <li>Network Interface</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

