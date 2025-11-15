# Terraform Backend Setup

This directory contains Terraform configuration to create the S3 bucket and DynamoDB table required for remote state management.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform installed

## Setup Instructions

1. Initialize Terraform:
```bash
cd infra/terraform/backend-setup
terraform init
```

2. Review the plan:
```bash
terraform plan
```

3. Apply the configuration:
```bash
terraform apply
```

This will create:
- S3 bucket: `nimbus-tfstate-meetpatel1111`
- DynamoDB table: `nimbus-terraform-locks`

## After Setup

Once these resources are created, you can use the remote backend in your AWS and Azure Terraform configurations.

## Cleanup

To destroy these resources (only do this if you no longer need remote state):
```bash
terraform destroy
```

**Warning**: Destroying these resources will make your Terraform state inaccessible!
