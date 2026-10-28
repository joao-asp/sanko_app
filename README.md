<p align="center">
  <img src="frontend/assets/logo.png" alt="Logo do Sanko" width="300">
</p>

# Sanko

🌐 **Acesse o jogo online:** [sanko.app.br](https://sanko.app.br)

**Sanko** é uma aplicação web interativa desenvolvida como uma **tecnologia social** para atuar como o Painel do Mestre em uma experiência híbrida de RPG e jogo de tabuleiro. 

O projeto foi criado como parte do [Crialab do Minha Campinas](https://www.minhacampinas.org/crialab), com financiamento da **Fundação FEAC**. A ferramenta nasceu com o objetivo inicial de resgatar e preservar a história de luta da comunidade pela construção da Escola Estadual Profa. Rita de Cássia da Silva, no Parque São Jorge (Campinas-SP). No entanto, o Sanko foi arquitetado de forma aberta e personalizável, para que possa **acolher e contar as histórias de lutas e conquistas de qualquer outra comunidade**.

A interface adota um estilo inspirado em jornais antigos, projetada para ser exibida em um telão ou projetor, guiando os jogadores através de fases históricas, gerenciando recursos (Força Comunitária), cronometrando debates e lançando minigames dinâmicos.

---

## Sobre o Projeto

O jogo funciona como uma ferramenta de facilitação, jogo educacional e engajamento comunitário. Ele conduz os participantes por uma linha do tempo onde desafios do passado são apresentados, exigindo debate, união e tomada de decisão para que a comunidade (os jogadores) avance e garanta melhorias para o bairro.

---

## Funcionalidades

* **Mapa das Memórias:** Integração com Leaflet.js permitindo "cravar" marcadores no mapa com relatos da comunidade. Os dados são salvos localmente.
* **Narrativa Dinâmica:** Sistema de fases (timeline) carregado externamente via JSON, permitindo trocar toda a história do jogo sem alterar o código.
* **Controle de Mesa:** Timer integrado para debates e painel de contagem de "Força Comunitária".
* **Sorteio de Minigames:** 5 minigames embutidos para desafiar os jogadores:
    * *O Povo Tem Memória?* (Quiz com múltiplas escolhas).
    * *Onde Está o Ofício?* (Batalha Naval/Radar visual).
    * *Quem Sou Eu?* (Dinâmica de adivinhação).
    * *Decifre o Código* (Descoberta de palavra-chave).
    * *Memória Viva* (Jogo da Memória digital integrado no telão ou modo para suporte a cartas físicas).
* **Design Responsivo:** O layout se adapta bem a monitores ultrawide (para projeção) e possui um menu otimizado para uso mobile.

---

## Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (Variáveis, Flexbox, Grid) e JavaScript puro (Vanilla JS).
* **Mapas:** Leaflet.js + tiles do OpenStreetMap
* **Back-end:** Node.js, Prisma (SQLite) e OpenRouter (moderação/storytelling)
* **Infraestrutura:** Docker, Caddy e Terraform na AWS (EC2, S3, ECR)

---

## Estrutura do Projeto

```text

/sanko
│
├── index.html               # Estrutura principal da aplicação
├── docker-compose.yml       # Orquestração do container Nginx
├── fases.json               # Dados das narrativas e fases históricas
├── quiz.json                # Perguntas, opções e respostas do quiz
├── minigames.json           # Banco de palavras e personagens dos minigames
│
├── css/
│   └── style.css            # Estilização conforme Identidade Visual
│
├── js/
│   └── script.js            # Lógica principal, timers e minigames
│
└── assets/                  # Pasta para imagens, fotos do carrossel e logo
    └── logo.png             # Logo da aplicação
```

---

## Deploy e CI/CD

O deploy é automático: **todo push em `main` dispara o workflow** [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que:

1. autentica na AWS via **OIDC** (sem chaves estáticas no GitHub);
2. builda a imagem da API (`backend/Dockerfile`) e publica no **ECR** (`sanko-api`);
3. executa o deploy na instância EC2 via **SSM Run Command**;
4. roda um smoke test em `https://sanko.app.br/healthz`.

Na instância, [`scripts/deploy.sh`](scripts/deploy.sh) atualiza o código, baixa a imagem nova e recria os containers. O banco SQLite fica no volume `sanko_data` (persistente entre deploys).

A infraestrutura é gerenciada pelo Terraform em [`infra/`](infra/):

```bash
cd infra
terraform init
terraform plan
terraform apply
```

Recursos criados: repositório ECR, provider OIDC do GitHub, role de deploy (`sanko-gha-deploy`) e instance profile da EC2 (`sanko-ec2-profile`, com SSM + leitura do ECR).

Bootstrap de uma instância nova (uma vez, via SSH): `bash scripts/bootstrap.sh`.
