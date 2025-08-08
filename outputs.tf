output "web_url" {
  value = aws_route53_record.web_alias.fqdn
}
output "api_url" {
  value = aws_route53_record.api_alias.fqdn
}
output "ecr_api_repo" {
  value = aws_ecr_repository.api.repository_url
}
output "rds_endpoint" {
  value = aws_rds_cluster.pg.endpoint
}
