# core
variable "region" {
  description = "The AWS region to create resources in."
  default     = "ap-northeast-1"
}


# Network
variable "public_subnet_1_cidr" {
  description = "CIDR Block for Public Subnet q"
  default     = "10.0.1.0/24"
}
variable "public_subnet_2_cidr" {
  description = "CIDR Block for Public Subnet 2"
  default     = "10.0.2.0/24"
}


variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}


# load balancer
variable "health_check_path" {
  description = "Health check path for the default target group"
  default     = "/ping/"
}


# Logs
variable "log_retention_in_days" {
  default = 30
}


# Keypair
variable "ssh_pubkey_file" {
  description = "Path to an SSH public key"
  default     = "~/.ssh/id_rsa.pub"
}


#ecs
variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  default     = "production"
}
variable "amis" {
  description = "Which AMI to spawn."
  default = {
    ap-northeast-1 = "ami-08dd79a478ef2a81c"
  }
}
variable "instance_type" {
  default = "t2.micro"
}
variable "docker_image_url_django" {
  description = "docker image to run in the ECS cluster"
  default     = "976089396058.dkr.ecr.ap-northeast-1.amazonaws.com/django-app:latest"
}
variable "app_count" {
  description = "Number of Docker containers to run"
  default     = 1
}
variable "docker_image_url_nginx" {
  description = "Docker image to run in the ECS cluster"
  default     = "976089396058.dkr.ecr.ap-northeast-1.amazonaws.com/nginx:latest"
}


# Auto scaling
variable "autoscale_min" {
  description = "minimum autoscale (number of EC2)"
  default     = "1"
}

variable "autoscale_max" {
  description = "Maximum autoscale (number of EC2)"
  default     = "4"
}
variable "autoscale_desired" {
  description = "Desired autoscale (number of EC2)"
  default     = "2"
}


# Domain
variable "certificate_arn" {
  description = "AWS Certificate Manager ARN for validated domain"
  default     = "arn:aws:acm:ap-northeast-1:976089396058:certificate/1bc7a5a0-4393-470d-87cc-673413eeae1f"
}
