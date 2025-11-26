# 🌥 Nimbus Mini-Cloud Platform

## Project Overview

Nimbus is a full-stack cloud management platform designed to deploy a complete "mini-cloud" environment. It integrates 21 essential cloud services, optimized to run on a single VM/EC2 instance. The platform supports multi-cloud deployment to AWS or Azure via Terraform and features a modern React UI for managing services, VMs, storage, and networks.

**Key Technologies:**
*   **Frontend:** React 18, TypeScript, Vite, Axios, React Router
*   **Backend:** Node.js, Express, Terraform execution
*   **Infrastructure:** Terraform (AWS & Azure), Kubernetes (k3s), Helm charts, Docker containers
*   **CI/CD:** GitHub Actions

**Architecture:**
The platform features a React-based web UI that communicates with a Node.js backend API. This backend manages VMs, storage, networks, and services on a single VM/EC2 instance running a k3s Kubernetes cluster, which hosts the 21 integrated services.

## Building and Running

### Prerequisites
*   Node.js 18+
*   Docker
*   Terraform
*   AWS or Azure credentials (for cloud deployment)

### Local Development

To set up and run the project locally:

1.  **Install dependencies for backend and frontend:**
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```

2.  **Run backend (in one terminal):**
    ```bash
    cd backend && npm start
    ```

3.  **Run frontend (in another terminal):**
    ```bash
    cd frontend && npm run dev
    ```
    The frontend will typically be available at `http://localhost:5173`.

### Deploy to Cloud

**1. Configure Cloud Credentials:**
*   **AWS:** Set environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
*   **Azure:** Set environment variables `ARM_SUBSCRIPTION_ID`, `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`.

**2. Deploy via Web UI:**
*   Open `http://localhost:5173`.
*   Navigate to "Cloud Deploy".
*   Select your desired cloud provider (AWS or Azure).
*   Configure instance settings and click "Deploy Mini-Cloud".

**3. Deploy via Terraform CLI:**
    *   **AWS:**
        ```bash
        cd infra/terraform/aws
        terraform init
        terraform apply -var="instance_name=nimbus-cloud" -var="aws_region=us-east-1"
        ```
    *   **Azure:**
        ```bash
        cd infra/terraform/azure
        terraform init
        terraform apply -var="vm_name=nimbus-cloud" -var="location=eastus"
        ```

**4. Run Bootstrap Script (after instance is deployed):**
    *   SSH into the deployed instance:
        ```bash
        ssh ubuntu@<public-ip>  # For AWS
        ssh azureuser@<public-ip> # For Azure
        ```
    *   Copy and execute the bootstrap script:
        ```bash
        sudo ./bootstrap/full-mini-cloud-bootstrap-fixed.sh
        ```

## Development Conventions

*   **Code Structure:** Frontend components are in `frontend/src/pages/`, backend API endpoints in `backend/index.js`, Terraform configurations in `infra/terraform/`, and Kubernetes charts in `helm/nimbus/`.
*   **Contribution:** The project is a starter template, encouraging customization by adding services, extending the UI, implementing authentication, etc.
*   **Security:** Emphasizes reviewing and changing default passwords, configuring Vault for production, restricting access via security group rules, enabling HTTPS, and regularly rotating credentials. It notes that the default setup is for development/testing environments.
*   **Resource Management:** Recommends adequate RAM and CPU for the single-node architecture running 21 services and suggests considering a multi-node setup for production environments.