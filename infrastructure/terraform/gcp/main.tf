# ============================================
# Melioro AI - GCP Infrastructure
# ============================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "melioro-terraform-state"
    prefix = "melioro/gcp"
  }
}

provider "google" {
  project = var.project_id
  region  = var.gcp_region
}

# ============================================
# Variables
# ============================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# ============================================
# VPC Network
# ============================================

resource "google_compute_network" "main" {
  name                    = "melioro-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "main" {
  name          = "melioro-subnet"
  network       = google_compute_network.main.id
  ip_cidr_range = "10.0.0.0/24"
  region        = var.gcp_region

  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/20"
  }
}

# ============================================
# Cloud SQL (PostgreSQL)
# ============================================

resource "google_sql_database_instance" "main" {
  name             = "melioro-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier              = "db-custom-2-8192"
    availability_type = "REGIONAL"
    disk_size         = 100
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.main.id
      require_ssl     = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
    }

    maintenance_window {
      day          = 7
      hour         = 4
      update_track = "stable"
    }
  }

  deletion_protection = var.environment == "production"
}

resource "google_sql_database" "main" {
  name     = "melioro"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "main" {
  name     = "melioro"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# ============================================
# Memorystore (Redis)
# ============================================

resource "google_redis_instance" "main" {
  name           = "melioro-cache-${var.environment}"
  memory_size_gb = 1
  region         = var.gcp_region

  redis_version  = "redis_7_0"
  tier           = "BASIC"

  location_id       = var.gcp_region
  alternative_location_id = "${var.gcp_region}2"

  network         = google_compute_network.main.id

  auth_enabled    = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  maintenance_policy {
    day_of_week = "SUNDAY"
    start_time {
      hours = 4
      minutes = 0
    }
  }
}

# ============================================
# Cloud Run
# ============================================

resource "google_cloud_run_v2_service" "backend" {
  name     = "melioro-backend"
  location = var.gcp_region

  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.backend.email

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    containers {
      image = "ghcr.io/melioro-ai/backend:${var.docker_image_tag}"
      ports {
        container_port = 4000
        name           = "http1"
      }

      resources {
        limits = {
          cpu    = "2000m"
          memory = "1Gi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.redis_url.secret_id
            version = "latest"
          }
        }
      }

      startup_probe {
        http_get {
          path = "/api/v1/health"
          port = 4000
        }
        initial_delay_seconds = 10
        period_seconds        = 5
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/api/v1/health"
          port = 4000
        }
        period_seconds    = 30
        failure_threshold = 3
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.main.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "melioro-frontend"
  location = var.gcp_region

  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.frontend.email

    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    containers {
      image = "ghcr.io/melioro-ai/frontend:${var.docker_image_tag}"
      ports {
        container_port = 3000
        name           = "http1"
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
        cpu_idle          = true
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.main.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }
}

# ============================================
# VPC Access Connector
# ============================================

resource "google_vpc_access_connector" "main" {
  name          = "melioro-vpc-connector"
  region        = var.gcp_region
  network       = google_compute_network.main.name
  ip_cidr_range = "10.8.0.0/28"
  min_instances = 2
  max_instances = 10
}

# ============================================
# Load Balancer
# ============================================

resource "google_compute_global_address" "main" {
  name         = "melioro-ip"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}

resource "google_compute_managed_ssl_certificate" "main" {
  name = "melioro-cert"

  managed {
    domains = ["melioro.ai", "api.melioro.ai"]
  }
}

resource "google_compute_url_map" "frontend" {
  name            = "melioro-frontend-url-map"
  default_service = google_compute_backend_service.frontend.id

  host_rule {
    hosts        = ["melioro.ai"]
    path_matcher = "frontend-paths"
  }

  path_matcher {
    name            = "frontend-paths"
    default_service = google_compute_backend_service.frontend.id
  }
}

resource "google_compute_url_map" "api" {
  name            = "melioro-api-url-map"
  default_service = google_compute_backend_service.backend.id

  host_rule {
    hosts        = ["api.melioro.ai"]
    path_matcher = "api-paths"
  }

  path_matcher {
    name            = "api-paths"
    default_service = google_compute_backend_service.backend.id
  }
}

resource "google_compute_target_https_proxy" "frontend" {
  name             = "melioro-frontend-https-proxy"
  url_map          = google_compute_url_map.frontend.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main.id]
}

resource "google_compute_target_https_proxy" "api" {
  name             = "melioro-api-https-proxy"
  url_map          = google_compute_url_map.api.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main.id]
}

resource "google_compute_global_forwarding_rule" "frontend" {
  name       = "melioro-frontend-https"
  target     = google_compute_target_https_proxy.frontend.id
  port_range = "443"
  ip_address = google_compute_global_address.main.id
}

resource "google_compute_global_forwarding_rule" "frontend-http" {
  name       = "melioro-frontend-http"
  target     = google_compute_target_https_proxy.frontend.id
  port_range = "80"
  ip_address = google_compute_global_address.main.id
}

resource "google_compute_backend_service" "frontend" {
  name        = "melioro-frontend-backend"
  port_name   = "http1"
  protocol    = "HTTP"
  timeout_sec = 30

  cloud_run {
    service = google_cloud_run_v2_service.frontend.name
  }
}

resource "google_compute_backend_service" "backend" {
  name        = "melioro-backend-backend"
  port_name   = "http1"
  protocol    = "HTTP"
  timeout_sec = 60

  cloud_run {
    service = google_cloud_run_v2_service.backend.name
  }

  health_checks = [google_compute_health_check.backend.id]
}

resource "google_compute_health_check" "backend" {
  name               = "melioro-backend-health"
  check_interval_sec = 30
  timeout_sec        = 10

  https_health_check {
    port         = 4000
    request_path = "/api/v1/health"
  }
}

# ============================================
# Secret Manager
# ============================================

resource "google_secret_manager_secret" "database_url" {
  secret_id = "melioro-database-url"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://melioro:${var.db_password}@/melioro?host=/cloudsql/${var.project_id}:${var.gcp_region}:melioro-db"
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "melioro-redis-url"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = google_redis_instance.main.host
}

# ============================================
# Service Accounts
# ============================================

resource "google_service_account" "backend" {
  account_id   = "melioro-backend-sa"
  display_name = "Melioro Backend Service Account"
}

resource "google_service_account" "frontend" {
  account_id   = "melioro-frontend-sa"
  display_name = "Melioro Frontend Service Account"
}

# ============================================
# IAM
# ============================================

resource "google_project_iam_member" "backend_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  project  = var.project_id
  name     = google_cloud_run_v2_service.backend.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  project  = var.project_id
  name     = google_cloud_run_v2_service.frontend.name
  location = var.gcp_region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ============================================
# Firewall Rules
# ============================================

resource "google_compute_firewall" "allow_internal" {
  name    = "melioro-allow-internal"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  source_ranges = ["10.0.0.0/8"]
}

# ============================================
# Outputs
# ============================================

output "frontend_url" {
  value = "https://melioro.ai"
}

output "api_url" {
  value = "https://api.melioro.ai"
}

output "db_connection" {
  value = google_sql_database_instance.main.connection_name
}

output "redis_host" {
  value = google_redis_instance.main.host
}