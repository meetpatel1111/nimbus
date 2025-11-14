terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_name" {
  type    = string
  default = "nimbus-minicloud"
}

variable "instance_type" {
  type    = string
  default = "t2.xlarge"  # 4 vCPU, 16 GB RAM - needed for 21 services
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key for instance access"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_security_group" "nimbus" {
  name        = "${var.instance_name}-sg"
  description = "Security group for Nimbus mini-cloud"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  ingress {
    from_port   = 30080
    to_port     = 30080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Traefik HTTP NodePort"
  }

  ingress {
    from_port   = 30443
    to_port     = 30443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Traefik HTTPS NodePort"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create SSH key pair for instance access
resource "aws_key_pair" "nimbus" {
  key_name   = "${var.instance_name}-key"
  public_key = var.ssh_public_key

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_instance" "nimbus" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.nimbus.id]
  key_name               = aws_key_pair.nimbus.key_name
  
  root_block_device {
    volume_size = 100  # 100 GB for all services
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y curl wget git
              # Bootstrap script will be copied and executed here
              EOF

  tags = {
    Name        = var.instance_name
    Environment = "mini-cloud"
    ManagedBy   = "Nimbus"
  }
}

output "public_ip" {
  value       = aws_instance.nimbus.public_ip
  description = "Public IP address of the Nimbus mini-cloud instance"
}

output "instance_id" {
  value       = aws_instance.nimbus.id
  description = "EC2 instance ID"
}

output "ssh_command" {
  value       = "ssh ubuntu@${aws_instance.nimbus.public_ip}"
  description = "SSH command to connect to the instance"
}
