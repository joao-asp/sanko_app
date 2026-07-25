resource "aws_instance" "sanko_server" {
  ami           = "ami-0d7405d05f836d0d4" 
  instance_type = "t3.micro"            
  
  # Se a sua máquina manual não usa essa key_name do Terraform, remova ou comente esta linha por enquanto:
  # key_name = aws_key_pair.sanko_ssh_key.key_name

  tags = {
    Name = "Sanko-App"
  }
}

output "EC2_PUBLIC_IP" {
  value = aws_instance.sanko_server.public_ip
}