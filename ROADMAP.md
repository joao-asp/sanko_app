# 🗺️ Roadmap: Plataforma Rita de Cássia

## 🚨 Fase 1: Desbloqueios Imediatos
- [x] **Recarga da API:** US$ 25 inseridos no OpenRouter.
- [x] **Testes de Rede Local:** Bypassado totalmente pelo uso do Cloudflare Tunnel.

## 🎨 Fase 2: Front-end e Identidade Visual
- [x] **Divisão de Arquivos:** Lógica e estilo extraídos com sucesso para `style.css` e `script.js`.
- [x] **Tipografia:** Google Fonts (*Courier Prime*, *Playfair Display* e *Anton*) importadas e renderizando.
- [x] **Texturas e Assets:** Fundo *off-white* radial e identidade amarela/vermelha aplicados.

## 🎮 Fase 3: Estado Local (Mecânicas do RPG)
- [x] **Persistência Local:** Força Comunitária (FC), frentes de demandas e estado das fases travados no `localStorage`.
- [x] **Reset de Campanha:** Função de limpeza de cache (`resetCampanha`) implementada na lógica básica.

## 💾 Fase 4: Persistência Global (Banco de Dados)
- [ ] **Estruturação:** Integrar um banco leve (SQLite + Prisma) ao backend Node.js.
- [ ] **Gravação:** Alterar `server.js` para persistir o JSON validado pela IA no banco.
- [ ] **Leitura:** Criar rota `/api/pins` para carregar as contribuições salvas ao abrir o mapa.

## 🛡️ Fase 5: Segurança e Anti-Spam
- [ ] **Honeypot no Front:** Criar input invisível via CSS para bloquear bots raspadores no formulário do mapa.
- [ ] **Rate Limiting no Nginx:** Configurar `limit_req` no Nginx para evitar spam de formulário por IP.

## 🎲 Fase 6: Gameplay, Conteúdo e Imersão (Foco no Usuário)
- [ ] **Dinamização dos Minigames:** Implementar variações de regras mecânicas (ex: multiplicadores de crise baseados no dado, rodadas com tempo reduzido ou bônus duplos).
- [ ] **Banco de Questões Evolutivo (IA):** Criar uma integração para alimentar o Quiz e os desafios com perguntas inéditas geradas por IA, contextualizadas com a história real do bairro.
- [ ] **Substituição de Mídias Reais:** Trocar os placeholders ("FOTO 1", "FOTO 2") por fotografias históricas reais, digitalizações de jornais da época e cópias dos antigos ofícios burocráticos.
- [ ] **Carga Inicial do Mapa:** Alimentar o mapa com os primeiros pins históricos fixos (locais das antigas associações, ponto de bloqueio do aterro e a própria escola) para que o site já abra com conteúdo rico.
- [ ] **Identidade de Áudio (Sound Design):** Adicionar efeitos sonoros sutis (tic-tac de aviso nos últimos 10 segundos do cronômetro, som de dado rolando e alertas de vitória/derrota nos testes).
- [ ] **Ajuste de Responsividade Fina:** Garantir que o Painel do Mestre e os modais de minigames fiquem confortáveis e perfeitamente legíveis em telas de celulares e tablets durante as sessões de jogo presenciais.

## 🤖 Fase 7: Automação Base (OpenClaude)
- [ ] **Exclusões:** Configurar agente para ignorar `.env`, `.tfvars`, `.tfstate`, `node_modules` e `.db`.
- [ ] **Controle Financeiro:** Estabelecer hard limit mensal na API Key dedicada à automação.

## ☁️ Fase 8: Infraestrutura e Segurança AWS (Terraform)
- [ ] **Proteção de Segredos:** Configurar `.gitignore` para barrar `.env`, `terraform.tfvars`, e `*.tfstate`.
- [ ] **Remote State:** Configurar bucket S3 e DynamoDB para armazenar o estado do Terraform fora do Github.
- [ ] **Provisionamento:** Criar scripts Terraform (`/infra`) para subir EC2 (t3.micro), Security Groups (portas 80/443) e Elastic IP.
- [ ] **Deploy:** Clonar o repo na instância, configurar o `.env` real e subir os containers via Docker.