# 1. Criação do Bucket
resource "aws_s3_bucket" "sanko_storage" {
  bucket = "sanko-memorias-storage-prod" # Lembrete: este nome precisa ser globalmente único
}

# 2. Configuração de CORS (Permite que o navegador envie o arquivo)
resource "aws_s3_bucket_cors_configuration" "sanko_cors" {
  bucket = aws_s3_bucket.sanko_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["*"] # Em produção, substitua "*" por "https://sanko.app.br"
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# 3. Usuário IAM e Políticas para o Backend
resource "aws_iam_user" "sanko_backend_user" {
  name = "sanko-backend-s3-user"
}

resource "aws_iam_access_key" "sanko_backend_key" {
  user = aws_iam_user.sanko_backend_user.name
}

resource "aws_iam_user_policy" "sanko_s3_policy" {
  name = "sanko-s3-presigned-policy"
  user = aws_iam_user.sanko_backend_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.sanko_storage.arn}/*"
      }
    ]
  })
}