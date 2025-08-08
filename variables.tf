variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "az_suffixes" {
  type    = list(string)
  default = ["a", "b"]
}

variable "db_username" {
  type    = string
  default = "pos"
}

variable "db_password" {
  type      = string
  sensitive = true
  default   = "pospw12345"
}

variable "db_instance_class" {
  type    = string
  default = "db.serverless" # Aurora Serverless v2 style classes differ; can be changed to db.t3.small for non-Aurora
}

variable "jwt_secret" {
  type      = string
  sensitive = true
  default   = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET"
}

variable "stripe_secret_key" {
  type      = string
  sensitive = true
  default   = ""
}
