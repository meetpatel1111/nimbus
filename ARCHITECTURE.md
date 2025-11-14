# Nimbus Cloud Platform - Architecture

Complete architecture documentation for Nimbus Cloud Platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Nimbus Dashboard (React + TypeScript)            │  │
│  │                                                          │  │
│  │  • Dashboard    • Services    • Virtual Machines        │  │
│  │  • Storage      • Networks    • Cloud Deploy            │  │
│  │                                                          │  │
│  │  Port: 3000 (dev) / 80 (production)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP/REST API
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                        API LAYER                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Backend API (Node.js + Express)                  │  │
│  │                                                          │  │
│  │  • Dashboard Stats    • VM Management                   │  │
│  │  • Service Control    • Storage Management              │  │
│  │  • Network Config     • Cloud Deployment                │  │
│  │                                                          │  │
│  │  Port: 4000                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ kubectl / Terraform
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                   ORCHESTRATION LAYER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Kubernetes Cluster (k3s)                    │  │
│  │                                                          │  │
│  │  Control Plane:                                         │  │
│  │  • API Server      • Scheduler      • Controller        │  │
│  │  • etcd            • Cloud Controller                   │  │
│  │                                                          │  │
│  │  Worker Nodes:                                          │  │
│  │  • kubelet         • kube-proxy     • Container Runtime │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│   PLATFORM     │    │     SERVICES        │    │   WORKLOADS     │
│   SERVICES     │    │     LAYER           │    │   LAYER         │
└────────────────┘    └─────────────────────┘    └─────────────────┘
```

## Component Architecture

### 1. Frontend Layer (React Dashboard)

```
┌─────────────────────────────────────────┐
│         React Application               │
├─────────────────────────────────────────┤
│                                         │
│  Components:                            │
│  ├── Dashboard.tsx                      │
│  │   └── Stats Cards                    │
│  │   └── Quick Actions                  │
│  │   └── Platform Overview              │
│  │                                      │
│  ├── Services.tsx                       │
│  │   └── Service Grid                   │
│  │   └── Category Filter                │
│  │   └── Control Actions                │
│  │                                      │
│  ├── VirtualMachines.tsx                │
│  │   └── VM Table                       │
│  │   └── Create Modal                   │
│  │   └── VM Actions                     │
│  │                                      │
│  ├── Storage.tsx                        │
│  │   └── Volume List                    │
│  │   └── Create Modal                   │
│  │   └── Storage Stats                  │
│  │                                      │
│  ├── Networks.tsx                       │
│  │   └── Network Table                  │
│  │   └── Create Modal                   │
│  │   └── Network Features               │
│  │                                      │
│  └── Deploy.tsx                         │
│      └── Provider Selection             │
│      └── Configuration Form             │
│      └── Deployment Status              │
│                                         │
│  State Management: React Hooks          │
│  HTTP Client: Axios                     │
│  Routing: React Router                  │
│  Styling: CSS3                          │
└─────────────────────────────────────────┘
```

### 2. Backend Layer (Node.js API)

```
┌─────────────────────────────────────────┐
│         Express API Server              │
├─────────────────────────────────────────┤
│                                         │
│  Routes:                                │
│  ├── /api/dashboard/stats               │
│  ├── /api/services                      │
│  ├── /api/services/:id/start            │
│  ├── /api/services/:id/stop        