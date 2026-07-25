resource "aws_instance" "sanko_server" {
  ami           = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-20260610" 
  instance_type = "t3.micro" # Altere se sua instância usar outro tipo (ex: t2.micro, t3.small)
  
  key_name = aws_key_pair.sanko_ssh_key.key_name

  tags = {
    Name = "sanko-app-server"
  }
}

output "EC2_PUBLIC_IP" {
  value = aws_instance.sanko_server.public_ip
}