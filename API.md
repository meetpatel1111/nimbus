# Nimbus Cloud Platform - API Documentation

REST API documentation for Nimbus Cloud Platform backend.

**Base URL:** `http://localhost:4000/api`

## Table of Contents

1. [Dashboard](#dashboard)
2. [Services](#services)
3. [Virtual Machines](#virtual-machines)
4. [Storage](#storage)
5. [Networks](#networks)
6. [Cloud Deployment](#cloud-deployment)

---

## Dashboard

### Get Platform Statistics

Get overview statistics for the entire platform.

**Endpoint:** `GET /dashboard/stats`

**Response:**
```json
{
  "vms": {
    "total": 5,
    "running": 3
  },
  "services": {
    "total": 21,
    "running": 21
  },
  "storage": {
    "total": "500Gi",
    "used": "120Gi",
    "available": "380Gi"
  },
  "cpu": {
    "total": 16,
    "used": 8.5,
    "percent": 53
  },
  "memory": {
    "total": "32Gi",
    "used": "18Gi",
    "percent": 56
  }
}
```

---

## Services

### List All Services

Get list of all 21 platform services.

**Endpoint:** `GET /services`

**Response:**
```json
[
  {
    "id": "k3s",
    "name": "Kubernetes (k3s)",
    "category": "platform",
    "status": "running",
    "cpu": "2",
    "memory": "4Gi"
  },
  {
    "id": "minio",
    "name": "MinIO (S3)",
    "category": "storage",
    "status": "running",
    "cpu": "0.3",
    "memory": "512Mi"
  }
]
```

### Get Service Details

Get details for a specific service.

**Endpoint:** `GET /services/:id`

**Parameters:**
- `id` (path) - Service ID (e.g., "minio", "prometheus")

**Response:**
```json
{
  "id": "minio",
  "name": "MinIO (S3)",
  "category": "storage",
  "status": "running",
  "cpu": "0.3",
  "memory": "512Mi"
}
```

### Start Service

Start a stopped service.

**Endpoint:** `POST /services/:id/start`

**Parameters:**
- `id` (path) - Service ID

**Response:**
```json
{
  "success": true,
  "service": {
    "id": "minio",
    "name": "MinIO (S3)",
    "status": "running"
  }
}
```

### Stop Service

Stop a running service.

**Endpoint:** `POST /services/:id/stop`

**Parameters:**
- `id` (path) - Service ID

**Response:**
```json
{
  "success": true,
  "service": {
    "id": "minio",
    "name": "MinIO (S3)",
    "status": "stopped"
  }
}
```

### Restart Service

Restart a service.

**Endpoint:** `POST /services/:id/restart`

**Parameters:**
- `id` (path) - Service ID

**Response:**
```json
{
  "success": true,
  "service": {
    "id": "minio",
    "name": "MinIO (S3)",
    "status": "running"
  }
}
```

---

## Virtual Machines

### List VMs

Get all virtual machines.

**Endpoint:** `GET /vms`

**Response:**
```json
[
  {
    "id": "vm-1234567890",
    "name": "web-server",
    "cpu": "2",
    "memory": "4Gi",
    "disk": "20Gi",
    "image": "ubuntu-22.04",
    "status": "running",
    "ip": "10.42.123.45",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Create VM

Provision a new virtual machine.

**Endpoint:** `POST /vms`

**Request Body:**
```json
{
  "name": "my-vm",
  "cpu": "2",
  "memory": "4Gi",
  "disk": "20Gi",
  "image": "ubuntu-22.04"
}
```

**Parameters:**
- `name` (required) - VM name
- `cpu` (optional) - CPU cores (default: "2")
- `memory` (optional) - Memory size (default: "4Gi")
- `disk` (optional) - Disk size (default: "20Gi")
- `image` (optional) - OS image (default: "ubuntu-22.04")

**Available Images:**
- `ubuntu-22.04` - Ubuntu 22.04 LTS
- `ubuntu-20.04` - Ubuntu 20.04 LTS
- `debian-11` - Debian 11
- `centos-8` - CentOS 8

**Response:**
```json
{
  "id": "vm-1234567890",
  "name": "my-vm",
  "cpu": "2",
  "memory": "4Gi",
  "disk": "20Gi",
  "image": "ubuntu-22.04",
  "status": "creating",
  "ip": "10.42.123.45",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Delete VM

Delete a virtual machine.

**Endpoint:** `DELETE /vms/:id`

**Parameters:**
- `id` (path) - VM ID

**Response:**
```json
{
  "success": true
}
```

### Start VM

Start a stopped VM.

**Endpoint:** `POST /vms/:id/start`

**Parameters:**
- `id` (path) - VM ID

**Response:**
```json
{
  "id": "vm-1234567890",
  "name": "my-vm",
  "status": "running"
}
```

### Stop VM

Stop a running VM.

**Endpoint:** `POST /vms/:id/stop`

**Parameters:**
- `id` (path) - VM ID

**Response:**
```json
{
  "id": "vm-1234567890",
  "name": "my-vm",
  "status": "stopped"
}
```

---

## Storage

### List Volumes

Get all storage volumes.

**Endpoint:** `GET /storage/volumes`

**Response:**
```json
[
  {
    "id": "vol-1234567890",
    "name": "data-volume",
    "size": "50Gi",
    "type": "block",
    "status": "available",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Create Volume

Create a new storage volume.

**Endpoint:** `POST /storage/volumes`

**Request Body:**
```json
{
  "name": "my-volume",
  "size": "50Gi",
  "type": "block"
}
```

**Parameters:**
- `name` (required) - Volume name
- `size` (optional) - Volume size (default: "10Gi")
- `type` (optional) - Storage type (default: "block")

**Storage Types:**
- `block` - Block storage (Longhorn)
- `file` - File storage
- `object` - Object storage (S3)

**Response:**
```json
{
  "id": "vol-1234567890",
  "name": "my-volume",
  "size": "50Gi",
  "type": "block",
  "status": "available",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Delete Volume

Delete a storage volume.

**Endpoint:** `DELETE /storage/volumes/:id`

**Parameters:**
- `id` (path) - Volume ID

**Response:**
```json
{
  "success": true
}
```

---

## Networks

### List Networks

Get all virtual networks.

**Endpoint:** `GET /networks`

**Response:**
```json
[
  {
    "id": "default",
    "name": "default",
    "cidr": "10.42.0.0/16",
    "type": "cluster",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Create Network

Create a new virtual network.

**Endpoint:** `POST /networks`

**Request Body:**
```json
{
  "name": "my-network",
  "cidr": "10.43.0.0/16"
}
```

**Parameters:**
- `name` (required) - Network name
- `cidr` (optional) - CIDR block (default: "10.43.0.0/16")

**Response:**
```json
{
  "id": "net-1234567890",
  "name": "my-network",
  "cidr": "10.43.0.0/16",
  "type": "custom",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## Cloud Deployment

### Deploy to Cloud

Deploy infrastructure to AWS or Azure using Terraform.

**Endpoint:** `POST /deploy`

**Request Body:**
```json
{
  "provider": "aws",
  "name": "nimbus-ec2",
  "region": "us-east-1"
}
```

**Parameters:**
- `provider` (required) - Cloud provider ("aws" or "azure")
- `name` (required) - Instance/VM name
- `region` (required) - Cloud region

**AWS Regions:**
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - EU (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

**Azure Regions:**
- `eastus` - East US
- `westus2` - West US 2
- `westeurope` - West Europe
- `southeastasia` - Southeast Asia

**Response (Success):**
```json
{
  "ok": true,
  "out": "Terraform output...\nApply complete! Resources: 3 added, 0 changed, 0 destroyed.\n\nOutputs:\npublic_ip = \"54.123.45.67\""
}
```

**Response (Error):**
```json
{
  "error": "Terraform error message..."
}
```

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request parameters"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error message"
}
```

---

## Examples

### cURL Examples

```bash
# Get dashboard stats
curl http://localhost:4000/api/dashboard/stats

# List all services
curl http://localhost:4000/api/services

# Start a service
curl -X POST http://localhost:4000/api/services/minio/start

# Create a VM
curl -X POST http://localhost:4000/api/vms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "web-server",
    "cpu": "4",
    "memory": "8Gi",
    "disk": "50Gi",
    "image": "ubuntu-22.04"
  }'

# Create storage volume
curl -X POST http://localhost:4000/api/storage/volumes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "data-vol",
    "size": "100Gi",
    "type": "block"
  }'

# Deploy to AWS
curl -X POST http://localhost:4000/api/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "aws",
    "name": "nimbus-prod",
    "region": "us-east-1"
  }'
```

### JavaScript/Axios Examples

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

// Get stats
const stats = await axios.get(`${API_BASE}/dashboard/stats`);
console.log(stats.data);

// Create VM
const vm = await axios.post(`${API_BASE}/vms`, {
  name: 'web-server',
  cpu: '4',
  memory: '8Gi',
  disk: '50Gi',
  image: 'ubuntu-22.04'
});
console.log(vm.data);

// Stop service
await axios.post(`${API_BASE}/services/minio/stop`);
```

---

**Nimbus Cloud Platform API** - Version 1.0
