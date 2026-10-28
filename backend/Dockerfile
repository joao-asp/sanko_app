# Imagem de produção da API (Node.js + Prisma/SQLite)
FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

# Dependências (inclui o Prisma CLI, usado no boot para criar/migrar o banco)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Generate do Prisma antes de copiar o restante do código
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

# O banco fica em /data (volume nomeado). `db push` é idempotente e roda a cada boot.
CMD ["sh", "-c", "npx prisma db push --skip-generate && exec node server.js"]
