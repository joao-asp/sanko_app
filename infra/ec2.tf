variable "openrouter_api_key" {
  type      = string
  sensitive = true
}

variable "ami_id" {
  type = string
}

variable "instance_type" {
  type = string
}

resource "aws_eip" "sanko_eip" {
  domain = "vpc"
}

resource "aws_instance" "sanko_server" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  key_name = aws_key_pair.sanko_ssh_key.key_name
  vpc_security_group_ids = [aws_security_group.sanko_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io docker-compose-v2 git
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              # Pega o IP público dinamicamente direto da AWS na inicialização
              PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

              # Clona o repositório
              cd /home/ubuntu
              git clone https://github.com/joao-asp/sanko_app.git sanko
              chown -R ubuntu:ubuntu /home/ubuntu/sanko

              # Gera o arquivo .env usando a variável capturada em tempo de execução
              cat <<EOT > /home/ubuntu/sanko/.env
              PORT=3000
              CORS_ORIGIN=http://\$PUBLIC_IP

              OPENROUTER_API_KEY=${var.openrouter_api_key}
              OPENROUTER_MODEL=openai/gpt-4o-mini
              OPENROUTER_REFERER=http://\$PUBLIC_IP
              OPENROUTER_TITLE=Viva Rita de Cassia Validator

              S3_BUCKET_NAME=${aws_s3_bucket.sanko_storage.id}
              AWS_ACCESS_KEY_ID=${aws_iam_access_key.sanko_backend_key.id}
              AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.sanko_backend_key.secret}
              AWS_REGION=us-east-1
              EOT

              chown ubuntu:ubuntu /home/ubuntu/sanko/.env
              chmod 600 /home/ubuntu/sanko/.env

              cd /home/ubuntu/sanko
              docker compose up -d --build
              EOF

  tags = {
    Name = "Sanko-App"
  }
}

resource "aws_eip_association" "sanko_eip_assoc" {
  instance_id   = aws_instance.sanko_server.id
  allocation_id = aws_eip.sanko_eip.id
}

output "EC2_PUBLIC_IP" {
  value = aws_eip.sanko_eip.public_ip
}