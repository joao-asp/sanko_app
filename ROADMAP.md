# 🗺️ Roadmap: Plataforma Rita de Cássia

## 🚨 Fase 1: Desbloqueios Imediatos
- [x] **Recarga da API:** US$ 25 inseridos no OpenRouter.
- [ ] **Testes de Rede Local:** Alterar o CORS no `server.js` (`Access-Control-Allow-Origin: '*'`) e o IP no `fetch` do `index.html` para testar via Wi-Fi.

## 🎨 Fase 2: Front-end e Identidade Visual
- [ ] **Divisão de Arquivos:** Separar lógica e estilo em `mapa.js`/`mapa.css` e `rpg.js`/`rpg.css`.
- [ ] **Tipografia:** Importar Google Fonts (*Courier Prime* e *Playfair Display*).
- [ ] **Texturas e Assets:** Adicionar fundo de textura *off-white* de jornal e trocar pinos do Leaflet por imagens PNG (fita crepe/alfinetes).

## 🎮 Fase 3: Estado Local (Mecânicas do RPG)
- [ ] **Persistência Local:** Implementar JS para salvar Força Comunitária (FC) e barras de exigências no `localStorage` do navegador.
- [ ] **Reset de Campanha:** Criar botão "Limpar Progresso" para limpar o cache.

## 💾 Fase 4: Persistência Global (Banco de Dados)
- [ ] **Estruturação:** Integrar um banco leve (SQLite + Prisma) ao backend Node.js.
- [ ] **Gravação:** Alterar `server.js` para persistir o JSON validado pela IA no banco.
- [ ] **Leitura:** Criar rota `/api/pins` para carregar as contribuições salvas ao abrir o mapa.

## 🛡️ Fase 5: Segurança e Anti-Spam
- [ ] **Honeypot no Front:** Criar input invisível via CSS para bloquear bots raspadores.
- [ ] **Rate Limiting no Nginx:** Configurar `limit_req` no Nginx para evitar spam de formulário por IP.

## 🤖 Fase 6: Automação Base (OpenClaude)
- [ ] **Exclusões:** Configurar agente para ignorar `.env`, `.tfvars`, `.tfstate`, `node_modules` e `.db`.
- [ ] **Controle Financeiro:** Estabelecer hard limit mensal na API Key dedicada à automação.

## ☁️ Fase 7: Infraestrutura e Segurança AWS (Terraform)
- [ ] **Proteção de Segredos:** Configurar `.gitignore` para barrar `.env`, `terraform.tfvars`, e `*.tfstate`.
- [ ] **Remote State:** Configurar bucket S3 e DynamoDB para armazenar o estado do Terraform fora do Github.
- [ ] **Provisionamento:** Criar scripts Terraform (`/infra`) para subir EC2 (t3.micro), Security Groups (portas 80/443) e Elastic IP.
- [ ] **Deploy:** Clonar o repo na instância, configurar o `.env` real e subir os containers via Docker.