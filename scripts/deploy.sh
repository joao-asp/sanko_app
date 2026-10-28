#!/usr/bin/env bash
# Deploy da aplicação na instância. Executado pelo GitHub Actions via SSM
# (ou manualmente por SSH), sempre como o usuário ubuntu.
set -euo pipefail

cd "$(dirname "$0")/.."

REGION="us-east-1"
REGISTRY="459742122840.dkr.ecr.${REGION}.amazonaws.com"
IMAGE="${REGISTRY}/sanko-api:latest"

echo "==> Atualizando código"
git fetch --prune origin main
git reset --hard origin/main

echo "==> Autenticando no ECR"
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY" >/dev/null

echo "==> Baixando imagem e subindo containers"
export API_IMAGE="$IMAGE"
docker compose pull api
docker compose up -d --remove-orphans

echo "==> Recarregando Caddy"
docker compose exec -T web caddy reload --config /etc/caddy/Caddyfile

echo "==> Limpando imagens antigas"
docker image prune -f >/dev/null 2>&1 || true

echo "==> Deploy concluído: $(git rev-parse --short HEAD)"
