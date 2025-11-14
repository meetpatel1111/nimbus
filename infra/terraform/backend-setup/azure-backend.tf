# Terraform Backend Setup for Azure
# Run this ONCE to create Storage Account for state management
# Usage: terraform init && terraform apply

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  type        = string
  description = "Azure location for backend resources"
  default     = "eastus"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group for Terraform state"
  default     = "nimbus-terraform-state-rg"
}

variable "storage_account_name" {
  type        = string
  description = "Storage account name (must be globally unique, lowercase, no hyphens)"
  default     = "nimbusterraformstate"
}

variable "container_name" {
  type        = string
  description = "Container name for state files"
  default     = "tfstate"
}

# Resource group for backend
resource "azurerm_resource_group" "terraform_state" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = "Infrastructure"
    ManagedBy   = "Nimbus"
  }
}

# Storage account for Terraform state
resource "azurerm_storage_account" "terraform_state" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.terraform_state.name
  location                 = azurerm_resource_group.terraform_state.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true
  }

  tags = {
    Environment = "Infrastructure"
    ManagedBy   = "Nimbus"
  }
}

# Container for state files
resource "azurerm_storage_container" "terraform_state" {
  name                  = var.container_name
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}

# Outputs
output "resource_group_name" {
  value       = azurerm_resource_group.terraform_state.name
  description = "Name of the resource group"
}

output "storage_account_name" {
  value       = azurerm_storage_account.terraform_state.name
  description = "Name of the storage account"
}

output "container_name" {
  value       = azurerm_storage_container.terraform_state.name
  description = "Name of the storage container"
}

output "backend_config" {
  value = <<-EOT
    
    Add this to your terraform block in main.tf:
    
    backend "azurerm" {
      resource_group_name  = "${azurerm_resource_group.terraform_state.name}"
      storage_account_name = "${azurerm_storage_account.terraform_state.name}"
      container_name       = "${azurerm_storage_container.terraform_state.name}"
      key                  = "azure/terraform.tfstate"
    }
  EOT
  description = "Backend configuration to add to main.tf"
}
