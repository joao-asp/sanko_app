output "S3_BUCKET_NAME" {
  value = aws_s3_bucket.sanko_storage.id
}

output "AWS_ACCESS_KEY_ID" {
  value     = aws_iam_access_key.sanko_backend_key.id
  sensitive = true
}

output "AWS_SECRET_ACCESS_KEY" {
  value     = aws_iam_access_key.sanko_backend_key.secret
  sensitive = true
}