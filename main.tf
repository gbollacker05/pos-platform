terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    random = {
      source = "hashicorp/random"
      version = ">= 3.5"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}
data "aws_partition" "current" {}

# ---------------- VPC (2 AZs) ----------------
resource "aws_vpc" "main" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "pos-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public" {
  for_each = toset(var.az_suffixes)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 4, index(var.az_suffixes, each.key))
  availability_zone       = "${var.aws_region}${each.key}"
  map_public_ip_on_launch = true
  tags = { Name = "public-${each.key}" }
}

resource "aws_subnet" "private" {
  for_each = toset(var.az_suffixes)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 4, 16 + index(var.az_suffixes, each.key))
  availability_zone = "${var.aws_region}${each.key}"
  tags = { Name = "private-${each.key}" }
}

resource "aws_eip" "nat" {
  for_each = toset(var.az_suffixes)
  domain   = "vpc"
}

resource "aws_nat_gateway" "nat" {
  for_each      = toset(var.az_suffixes)
  allocation_id = aws_eip.nat[each.key].id
  subnet_id     = aws_subnet.public[each.key].id
  depends_on    = [aws_internet_gateway.igw]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public" {
  for_each       = toset(var.az_suffixes)
  subnet_id      = aws_subnet.public[each.key].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  for_each = toset(var.az_suffixes)
  vpc_id   = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[each.key].id
  }
}

resource "aws_route_table_association" "private" {
  for_each       = toset(var.az_suffixes)
  subnet_id      = aws_subnet.private[each.key].id
  route_table_id = aws_route_table.private[each.key].id
}

# ---------------- Route53 hosted zone ----------------
data "aws_route53_zone" "domain" {
  name         = "elevatedsitesolutions.com"
  private_zone = false
}

# ---------------- ACM certificates ----------------
# ALB cert (regional)
resource "aws_acm_certificate" "alb_cert" {
  domain_name       = "api.elevatedsitesolutions.com"
  validation_method = "DNS"
}

resource "aws_route53_record" "alb_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.alb_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }
  name    = each.value.name
  type    = each.value.type
  zone_id = data.aws_route53_zone.domain.zone_id
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "alb_cert_validation" {
  certificate_arn         = aws_acm_certificate.alb_cert.arn
  validation_record_fqdns = [for r in aws_route53_record.alb_cert_validation : r.fqdn]
}

# CloudFront cert must be in us-east-1
provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

resource "aws_acm_certificate" "cf_cert" {
  provider          = aws.virginia
  domain_name       = "pos.elevatedsitesolutions.com"
  validation_method = "DNS"
}

resource "aws_route53_record" "cf_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cf_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }
  name    = each.value.name
  type    = each.value.type
  zone_id = data.aws_route53_zone.domain.zone_id
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cf_cert_validation" {
  provider                 = aws.virginia
  certificate_arn         = aws_acm_certificate.cf_cert.arn
  validation_record_fqdns = [for r in aws_route53_record.cf_cert_validation : r.fqdn]
}

# ---------------- S3 + CloudFront (web) ----------------
resource "aws_s3_bucket" "web" {
  bucket = "pos-web-elevatedsitesolutions.com"
}

resource "aws_s3_bucket_ownership_controls" "web" {
  bucket = aws_s3_bucket.web.id
  rule { object_ownership = "BucketOwnerPreferred" }
}

resource "aws_s3_bucket_public_access_block" "web" {
  bucket = aws_s3_bucket.web.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls  = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "pos-web-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
  aliases = ["pos.elevatedsitesolutions.com"]
  origin {
    domain_name = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id   = "s3-web"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }
  default_cache_behavior {
    target_origin_id       = "s3-web"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET","HEAD"]
    cached_methods         = ["GET","HEAD"]
    forwarded_values {
      query_string = true
      cookies { forward = "none" }
    }
  }
  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cf_cert.arn
    ssl_support_method  = "sni-only"
  }
  default_root_object = "index.html"
}

resource "aws_route53_record" "web_alias" {
  zone_id = data.aws_route53_zone.domain.zone_id
  name    = "pos.elevatedsitesolutions.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

# ---------------- ECR ----------------
resource "aws_ecr_repository" "api" {
  name = "pos-api"
  image_scanning_configuration { scan_on_push = true }
}

# ---------------- RDS ----------------
resource "aws_security_group" "db" {
  name        = "pos-db-sg"
  description = "DB access"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "db" {
  name       = "pos-db-subnets"
  subnet_ids = [for s in aws_subnet.private : s.id]
}

resource "aws_rds_cluster" "pg" {
  engine         = "aurora-postgresql"
  engine_version = "15.4"
  database_name  = "posdb"
  master_username = var.db_username
  master_password = var.db_password
  db_subnet_group_name = aws_db_subnet_group.db.name
  vpc_security_group_ids = [aws_security_group.db.id]
  backup_retention_period = 7
  copy_tags_to_snapshot = true
  deletion_protection = false
} 

resource "aws_rds_cluster_instance" "pg" {
  identifier = "posdb-instance-1"
  cluster_identifier = aws_rds_cluster.pg.id
  instance_class = var.db_instance_class
  engine = aws_rds_cluster.pg.engine
  engine_version = aws_rds_cluster.pg.engine_version
  publicly_accessible = false
}

# ---------------- ECS (Fargate) for API ----------------
resource "aws_ecs_cluster" "main" {
  name = "pos-cluster"
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "pos-ecsTaskExecutionRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Effect="Allow", Principal={ Service="ecs-tasks.amazonaws.com" }, Action="sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "exec_attach" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_security_group" "alb" {
  name   = "pos-alb-sg"
  vpc_id = aws_vpc.main.id
  ingress { from_port=80, to_port=80, protocol="tcp", cidr_blocks=["0.0.0.0/0"] }
  egress  { from_port=0, to_port=0, protocol="-1", cidr_blocks=["0.0.0.0/0"] }
}

resource "aws_lb" "api" {
  name               = "pos-api-alb"
  load_balancer_type = "application"
  subnets            = [for s in aws_subnet.public : s.id]
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_lb_target_group" "api" {
  name        = "pos-api-tg"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
  health_check { path = "/" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_route53_record" "api_alias" {
  zone_id = data.aws_route53_zone.domain.zone_id
  name    = "api.elevatedsitesolutions.com"
  type    = "A"
  alias {
    name                   = aws_lb.api.dns_name
    zone_id                = aws_lb.api.zone_id
    evaluate_target_health = false
  }
}

resource "aws_security_group" "ecs_tasks" {
  name   = "pos-ecs-tasks-sg"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress  { from_port=0, to_port=0, protocol="-1", cidr_blocks=["0.0.0.0/0"] }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "pos-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions    = jsonencode([{
    name  = "api",
    image = "${aws_ecr_repository.api.repository_url}:latest",
    essential = true,
    portMappings = [{ containerPort=8000, hostPort=8000 }],
    environment = [
      { name="APP_ENV", value="prod" },
      { name="CORS_ORIGINS", value="https://pos.elevatedsitesolutions.com" },
      { name="JWT_SECRET", value=var.jwt_secret },
      { name="STRIPE_SECRET_KEY", value=var.stripe_secret_key },
      { name="DATABASE_URL", value=join("", ["postgresql+psycopg2://", var.db_username, ":", var.db_password, "@", aws_rds_cluster.pg.endpoint, ":", aws_rds_cluster.pg.port, "/", "posdb"]) }
    ],
    logConfiguration = {
      logDriver = "awslogs",
      options = {
        awslogs-group = "/ecs/pos-api",
        awslogs-region = var.aws_region,
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/pos-api"
  retention_in_days = 14
}

resource "aws_ecs_service" "api" {
  name            = "pos-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = [for s in aws_subnet.private : s.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8000
  }
  lifecycle { ignore_changes = [desired_count] }
}
