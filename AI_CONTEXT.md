# AI Context

Este repositório mantém um protótipo monolítico de frontend em um único HTML, servido de forma estática por Nginx, enquanto um backend Node.js atua apenas como proxy seguro para validação de contribuições com a OpenRouter.

## Topologia
- `web`: container Nginx alpine na porta 80.
- `api-validator`: container Node.js na porta 3000.
- O navegador acessa o frontend via Nginx e chama o backend apenas para validar `titulo` e `descricao`.
- A chave da OpenRouter nunca deve ser exposta ao cliente; ela permanece somente no backend via variável de ambiente.

## Responsabilidade atual do backend
- Expor apenas `POST /api/validate-pin`.
- Receber JSON com `titulo` e `descricao`.
- Consultar a OpenRouter com um prompt de validação e retornar apenas `{ "aprovado": boolean, "motivo": "string curta" }`.
- Permitir CORS para o origin local do serviço web.

## Escopo intencionalmente limitado
- Não há persistência, banco de dados ou autenticação neste passo.
- O frontend não foi segmentado nem refatorado.
- A primeira meta é manter a infraestrutura simples, segura e previsível.
