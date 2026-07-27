terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1" # Mude para sa-east-1 se preferir os servidores em São Paulo
}

resource "aws_key_pair" "sanko_ssh_key" {
  key_name   = "sanko-prod-key"
  public_key = file("~/.ssh/sanko_ec2_key.pub")
}