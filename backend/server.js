const http = require('node:http');
const { URL } = require('node:url');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PORT = Number(process.env.PORT || 3000);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const ALLOWED_ORIGINS = new Set([
  process.env.CORS_ORIGIN || 'http://localhost',
  'http://127.0.0.1',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

function isAllowedOrigin(origin) {
  return Boolean(origin) && ALLOWED_ORIGINS.has(origin);
}

function withCorsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }

  return headers;
}

function sendJson(res, statusCode, payload, origin) {
  res.writeHead(statusCode, withCorsHeaders(origin));
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });

    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function extractJsonText(text) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('Resposta sem JSON');
    }
    return JSON.parse(match[0]);
  }
}

function buildPrompt(titulo, descricao) {
  return [
    'Você é um curador de memórias da comunidade do Parque São Jorge, Fazendinha e região (Campinas).',
    'Avalie se o texto relata memórias locais, lutas por infraestrutura, mutirões, escola Rita de Cássia ou vivências do bairro.',
    '',
    '⚠️ REGRA DE OURO (Linguagem):',
    'Os textos são escritos por moradores. ACEITE TOTALMENTE linguagem coloquial, erros gramaticais, abreviações (ex: "pq", "pra", "vó", "tbm"), gírias e tom informal. Isso é sinal de um relato autêntico e DEVE ser aprovado.',
    '',
    'Regras de rejeição (aprovado: false):',
    '- Textos puramente aleatórios sem sentido (ex: "asdfg", "teste").',
    '- Ofensas diretas, racismo ou discurso de ódio.',
    '- Propaganda comercial ou assuntos que não tem absolutamente nada a ver com a região.',
    '',
    'Responda ESTRITAMENTE com um JSON válido e sem explicações adicionais.',
    'Formato obrigatório:',
    '{ "aprovado": boolean, "motivo": "String curta de até 15 palavras explicando a decisão" }',
    '',
    `Título: ${titulo}`,
    `Descrição: ${descricao}`
  ].join('\n');
}

async function validateWithOpenRouter(titulo, descricao) {
  if (!OPENROUTER_API_KEY) {
    const error = new Error('OPENROUTER_API_KEY ausente');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost',
      'X-Title': process.env.OPENROUTER_TITLE || 'Viva Rita de Cássia Validator'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'Você é um moderador compreensivo de um mapa histórico colaborativo do bairro Parque São Jorge. Retorne exclusivamente JSON.'
        },
        {
          role: 'user',
          content: buildPrompt(titulo, descricao)
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const error = new Error(`OpenRouter respondeu com status ${response.status}`);
    error.statusCode = 502;
    error.details = body;
    throw error;
  }

  const data = await response.json();
  const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

  if (typeof content !== 'string') {
    const error = new Error('Resposta da OpenRouter sem conteúdo textual');
    error.statusCode = 502;
    throw error;
  }

  const parsed = extractJsonText(content);
  return {
    aprovado: Boolean(parsed.aprovado),
    motivo: typeof parsed.motivo === 'string' ? parsed.motivo.slice(0, 240) : 'Motivo não retornado pela IA'
  };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const requestUrl = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      ...withCorsHeaders(origin),
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  if (requestUrl.pathname === '/healthz') {
    sendJson(res, 200, { ok: true }, origin);
    return;
  }

  // --- ROTA GET: CARREGAR O MAPA ---
  if (requestUrl.pathname === '/api/pins' && req.method === 'GET') {
    try {
      const salvos = await prisma.pin.findMany({
        orderBy: { data: 'desc' }
      });
      sendJson(res, 200, salvos, origin);
    } catch (error) {
      console.error("[ERRO GET PINS]", error);
      sendJson(res, 500, { error: 'Erro ao ler banco de dados' }, origin);
    }
    return;
  }

  // --- ROTA POST: VALIDAR E SALVAR NOVA HISTÓRIA ---
  if (requestUrl.pathname === '/api/pins' && req.method === 'POST') {
    try {
      const rawBody = await readBody(req);
      let payload = JSON.parse(rawBody || '{}');

      const titulo = typeof payload.titulo === 'string' ? payload.titulo.trim() : '';
      const descricao = typeof payload.descricao === 'string' ? payload.descricao.trim() : '';

      if (!titulo || !descricao) {
        sendJson(res, 400, { error: 'titulo e descricao são obrigatórios' }, origin);
        return;
      }

      if (titulo.length > 180 || descricao.length > 15000) {
        sendJson(res, 400, { error: 'titulo ou descricao excede o tamanho permitido' }, origin);
        return;
      }

      // Validação da IA
      const result = await validateWithOpenRouter(titulo, descricao);
      console.log(`\n[VALIDAÇÃO] Título: "${titulo}" | Aprovado: ${result.aprovado} | Motivo: ${result.motivo}`);

      // Se a IA rejeitou, devolve erro 400 para o frontend mostrar o Toast vermelho
      if (!result.aprovado) {
        sendJson(res, 400, { error: 'História rejeitada pela moderação', motivo: result.motivo }, origin);
        return;
      }

      // Salva no SQLite via Prisma
      const novoPin = await prisma.pin.create({
        data: {
          titulo: titulo,
          descricao: descricao,
          lat: payload.lat || 0,
          lng: payload.lng || 0,
          cor: payload.cor || '#ffd500'
        }
      });
      
      result.pinSalvo = novoPin;
      sendJson(res, 201, result, origin);
    } catch (error) {
      console.error("\n[ERRO NA API]", error.message);
      sendJson(res, error.statusCode || 500, {
        error: 'Falha ao validar ou salvar contribuição',
        detalhe: error.message
      }, origin);
    }
    return;
  }

  // --- ROTA POST: GERAR HISTÓRIA COM IA ---
  if (requestUrl.pathname === '/api/generate-story' && req.method === 'POST') {
    try {
      const rawBody = await readBody(req);
      let payload = JSON.parse(rawBody || '{}');
      const topicos = typeof payload.topicos === 'string' ? payload.topicos.trim() : '';

      if (!topicos) {
        sendJson(res, 400, { error: 'Os tópicos base são obrigatórios' }, origin);
        return;
      }

      const promptGeracao = [
        'Você é um redator comunitário apaixonado pela história do Parque São Jorge e região (Campinas).',
        'Sua missão é transformar os tópicos fornecidos pelo usuário em um relato envolvente, heroico e respeitoso.',
        '',
        'REGRAS DE FORMATAÇÃO:',
        '1. Use Markdown para formatar o texto (use **negrito** para nomes e lugares, crie listas se necessário).',
        '2. Mantenha um tom humano, quente e informal, como alguém contando uma história em uma roda de conversa.',
        '3. Não invente fatos, apenas conecte e embeleze os tópicos fornecidos.',
        '4. O texto final deve ter no máximo 3 parágrafos curtos.',
        '',
        'Tópicos fornecidos pelo morador:',
        topicos
      ].join('\n');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost',
          'X-Title': process.env.OPENROUTER_TITLE || 'Sanko Story Generator'
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          temperature: 0.7, 
          messages: [{ role: 'user', content: promptGeracao }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Falha OpenRouter: ${response.status} - ${errText}`);
      }
      
      const data = await response.json();
      const historiaGerada = data.choices[0].message.content;

      console.log(`\n[GERAÇÃO IA] Nova história gerada a partir dos tópicos: "${topicos.substring(0, 30)}..."`);
      sendJson(res, 200, { historia: historiaGerada }, origin);
    } catch (error) {
      console.error("[ERRO GERAÇÃO IA]", error);
      sendJson(res, 500, { error: 'Erro ao gerar história', detalhe: error.message }, origin);
    }
    return;
  }

  // Fallback para qualquer outra rota
  sendJson(res, 404, { error: 'Not Found' }, origin);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`api-validator listening on ${PORT}`);
});