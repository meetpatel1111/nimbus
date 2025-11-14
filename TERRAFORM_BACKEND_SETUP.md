# 🗄️ Terraform Remote State Backend Setup

Guide to set up remote state storage for Terraform to enable team collaboration and state locking.

## 🎯 Why Remote State?

**Benefits:**
- ✅ **Team Collaboration** - Multiple people can work on infrastructure
- ✅ **State Locking** - Prevents concurrent modifications
- ✅ **State History** - Versioning for rollback capability
- ✅ **Security** - Encrypted storage
- ✅ **CI/CD Ready** - Works seamlessly with GitHub Actions

## 📋 Prerequisites

- AWS or Azure credentials configured
- Terraform installed locally

## 🔧 AWS Backend Setup

### Step 1: Create Backend Infrastructure

```bash
cd infra/terraform/backend-setup

# Initialize Terraform
terraform init

# Create S3 bucket and DynamoDB table
terraform apply -var="bucket_name=nimbus-terraform-state" \
                -var="region=us-east-1"
```

This creates:
- **S3 Bucket**: `nimbus-terraform-state` (encrypted, versioned)
- **DynamoDB Table**: `nimbus-terraform-locks` (for state locking)

### Step 2: Enable Backend in main.tf

Uncomment the backend block in `infra/terraform/aws/main.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "nimbus-terraform-state"
    key            = "aws/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "nimbus-terraform-locks"
  }
}
```

### Step 3: Migrate Existing State (if any)

```bash
cd infra/terraform/aws

# Reinitialize with backend
terraform init -migrate-state

# Verify state is in S3
aws s3 ls s3://nimbus-terraform-state/aws/
```

### Step 4: Update GitHub Actions (Optional)

The workflow already saves state as artifacts. With remote backend, state is automatically managed.

## 🔧 Azure Backend Setup

### Step 1: Create Backend Infrastructure

```bash
cd infra/terraform/backend-setup

# Initialize Terraform
terraform init

# Create Storage Account
terraform apply -var="storage_account_name=nimbusterraformstate" \
                -var="location=eastus"
```

This creates:
- **Resource Group**: `nimbus-terraform-state-rg`
- **Storage Account**: `nimbusterraformstate` (with versioning)
- **Container**: `tfstate`

### Step 2: Enable Backend in main.tf

Uncomment the backend block in `infra/terraform/azure/main.tf`:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "nimbus-terraform-state-rg"
    storage_account_name = "nimbusterraformstate"
    container_name       = "tfstate"
    key                  = "azure/terraform.tfstate"
  }
}
```

### Step 3: Migrate Existing State (if any)

```bash
cd infra/terraform/azure

# Reinitialize with backend
terraform init -migrate-state

# Verify state is in Azure Storage
az storage blob list \
  --account-name nimbusterraformstate \
  --container-name tfstate
```

## 🔐 Security Best Practices

### AWS
1. **Bucket Encryption**: ✅ Enabled by default (AES256)
2. **Versioning**: ✅ Enabled for state history
3. **Public Access**: ✅ Blocked
4. **IAM Permissions**: Restrict to necessary users/roles

### Azure
1. **Storage Encryption**: ✅ Enabled by default
2. **Versioning**: ✅ Enabled for blob versioning
3. **Private Access**: ✅ Container is private
4. **RBAC**: Assign appropriate roles

## 🚀 Using Remote State in CI/CD

### GitHub Actions (Already Configured)

The workflow automatically uses remote state when backend is configured:

```yaml
- name: Terraform Init
  run: |
    cd infra/terraform/aws
    terraform init  # Automatically uses S3 backend
```

No changes needed! Just ensure AWS/Azure credentials are set.

## 🔍 Verifying Remote State

### AWS
```bash
# List state files
aws s3 ls s3://nimbus-terraform-state/aws/

# Download state (for inspection only)
aws s3 cp s3://nimbus-terraform-state/aws/terraform.tfstate ./state-backup.tfstate

# Check DynamoDB locks
aws dynamodb scan --table-name nimbus-terraform-locks
```

### Azure
```bash
# List state files
az storage blob list \
  --account-name nimbusterraformstate \
  --container-name tfstate \
  --output table

# Download state (for inspection only)
az storage blob download \
  --account-name nimbusterraformstate \
  --container-name tfstate \
  --name azure/terraform.tfstate \
  --file state-backup.tfstate
```

## 🔄 State Locking

### How It Works

**AWS (DynamoDB):**
- Terraform acquires lock before operations
- Lock prevents concurrent modifications
- Automatically released after operation

**Azure (Blob Lease):**
- Azure Storage uses blob leasing
- Automatic lock management
- 60-second lease duration

### If Lock Gets Stuck

**AWS:**
```bash
# List locks
aws dynamodb scan --table-name nimbus-terraform-locks

# Force unlock (use with caution!)
terraform force-unlock <LOCK_ID>
```

**Azure:**
```bash
# Force unlock (use with caution!)
terraform force-unlock <LOCK_ID>
```

## 💰 Cost Considerations

### AWS
- **S3 Storage**: ~$0.023/GB/month
- **S3 Requests**: Minimal (few cents/month)
- **DynamoDB**: Free tier covers most usage
- **Estimated**: < $1/month for typical usage

### Azure
- **Storage Account**: ~$0.02/GB/month
- **Transactions**: Minimal
- **Estimated**: < $1/month for typical usage

## 🔧 Troubleshooting

### "Error acquiring state lock"
- Another process is running Terraform
- Wait for it to complete or force-unlock (carefully)

### "Backend configuration changed"
- Run `terraform init -reconfigure`
- Or `terraform init -migrate-state` to migrate

### "Access Denied" errors
- Verify AWS/Azure credentials
- Check IAM/RBAC permissions
- Ensure bucket/storage account exists

## 📚 Advanced: Multiple Environments

Use different state files for different environments:

```hcl
# Production
backend "s3" {
  key = "aws/production/terraform.tfstate"
}

# Staging
backend "s3" {
  key = "aws/staging/terraform.tfstate"
}

# Development
backend "s3" {
  key = "aws/development/terraform.tfstate"
}
```

## ✅ Checklist

- [ ] Create backend infrastructure (S3/Storage Account)
- [ ] Uncomment backend block in main.tf
- [ ] Run `terraform init -migrate-state`
- [ ] Verify state is in remote storage
- [ ] Test with `terraform plan`
- [ ] Update team documentation
- [ ] Configure access permissions

## 🎉 Benefits After Setup

1. ✅ **Safe Collaboration** - Team can work together
2. ✅ **State History** - Can rollback if needed
3. ✅ **Automatic Locking** - No conflicts
4. ✅ **Encrypted Storage** - Secure by default
5. ✅ **CI/CD Ready** - Works with GitHub Actions

---

**Your Terraform state is now production-ready!** 🚀
