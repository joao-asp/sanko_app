#!/usr/bin/env bash
# Bootstrap único da instância: instala o SSM Agent (deploy via GitHub Actions)
# e o AWS CLI (login no ECR). Rodar uma vez, via SSH.
set -euo pipefail

echo "==> Instalando SSM Agent"
sudo snap install amazon-ssm-agent --classic
sudo systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service

echo "==> Instalando AWS CLI"
sudo snap install aws-cli --classic

echo "==> Status"
sudo systemctl --no-pager status snap.amazon-ssm-agent.amazon-ssm-agent.service | head -5
aws --version
