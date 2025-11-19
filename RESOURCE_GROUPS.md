# Resource Groups Feature

## Overview
Resource Groups provide logical grouping of resources and services in Nimbus Cloud. They map to Kubernetes namespaces with labels for organization.

## Architecture
- **Backend**: Kubernetes namespaces with custom labels
- **Frontend**: `/resource-groups` page
- **API Endpoints**: `/api/resource-groups`

## Features

### 1. List Resource Groups
- **Endpoint**: `GET /api/resource-groups`
- Shows all namespaces (excluding system ones)
- Displays resource counts per group
- Shows deployments, services, storage, and Helm charts

### 2. Create Resource Group
- **Endpoint**: `POST /api/resource-groups`
- Creates a new Kubernetes namespace
- Supports custom labels and tags
- Allows setting description and location

### 3. View Resource Group Details
- **Endpoint**: `GET /api/resource-groups/:name`
- Shows all resources in the group
- Lists deployments, services, PVCs, and Helm releases

### 4. Delete Resource Group
- **Endpoint**: `DELETE /api/resource-groups/:name`
- Deletes namespace and all resources
- Protected: Cannot delete system namespaces

## Usage

### Creating a Resource Group
```bash
curl -X POST http://localhost:4000/api/resource-groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "production",
    "description": "Production environment resources",
    "location": "us-east-1",
    "tags": {
      "env": "prod",
      "team": "backend"
    }
  }'
```

### Listing Resource Groups
```bash
curl http://localhost:4000/api/resource-groups
```

### Viewing Resource Group Details
```bash
curl http://localhost:4000/api/resource-groups/production
```

### Deleting a Resource Group
```bash
curl -X DELETE http://localhost:4000/api/resource-groups/production
```

## Frontend

Access the Resource Groups page at: `http://localhost:4000/resource-groups`

Features:
- View all resource groups
- See resource counts and breakdown
- Create new resource groups with tags
- Delete resource groups
- Visual stats dashboard

## Kubernetes Mapping

| Nimbus Concept | Kubernetes Resource |
|----------------|---------------------|
| Resource Group | Namespace |
| Tags | Namespace Labels |
| Resources | Deployments, Services, PVCs, Helm Releases |

## Best Practices

1. **Organize by Environment**: Create separate resource groups for dev, staging, prod
2. **Use Tags**: Add meaningful tags for filtering and organization
3. **Logical Grouping**: Group related services together
4. **Naming Convention**: Use lowercase with hyphens (e.g., `my-app-prod`)

## Examples

### Development Environment
```json
{
  "name": "development",
  "description": "Development environment",
  "location": "local",
  "tags": {
    "env": "dev",
    "team": "engineering"
  }
}
```

### Production Database Group
```json
{
  "name": "prod-databases",
  "description": "Production database services",
  "location": "us-east-1",
  "tags": {
    "env": "prod",
    "type": "database",
    "critical": "true"
  }
}
```

## Protected Namespaces

The following system namespaces cannot be deleted:
- `default`
- `kube-system`
- `kube-public`
- `kube-node-lease`
- `nimbus`
