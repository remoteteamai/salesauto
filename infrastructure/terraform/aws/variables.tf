variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "melioro.ai"
}

variable "docker_image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "ecr_backend_url" {
  description = "ECR URL for backend image"
  type        = string
}

variable "ecr_frontend_url" {
  description = "ECR URL for frontend image"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
}