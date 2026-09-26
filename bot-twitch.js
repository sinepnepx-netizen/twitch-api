import tmi from 'tmi.js';
import http from 'http';

// ========================================
// SERVIDOR HTTP PARA O RENDER
// ========================================

const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });

  res.end('Bot Online!');
}).listen(port);

// ========================================
// TWITCH
// ========================================

const canais = process.env.TWITCH_CHANNEL
  ? process.env.TWITCH_CHANNEL
      .split(',')
      .map(c => c.trim())
  : [];

const client = new tmi.Client({
  options: {
    debug: false
  },

  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },

  channels: canais
});

client.connect()
  .then(() => {
    console.log(
      `Bot conectado nos canais: ${canais.join(', ')}`
    );
  })
  .catch(err => {
    console.error(
      'Erro ao conectar na Twitch:',
      err
    );
  });

// ========================================
// MEMÓRIA POR USUÁRIO
// ========================================

const historicos = {};

function obterHistorico(usuario) {

  if (!historicos[usuario]) {
    historicos[usuario] = [];
  }

  return historicos[usuario];
}

function salvarHistorico(
  usuario,
  pergunta,
  resposta
) {

  const historico =
    obterHistorico(usuario);

  historico.push({
    role: 'user',
    content: pergunta
  });

  historico.push({
    role: 'assistant',
    content: resposta
  });

  if (historico.length > 20) {
    historico.splice(0, 2);
  }
}

// ========================================
// CONFIG IA
// ========================================

const MODELO = 'openai/gpt-oss-20b';
 

// ========================================
// CHAT
// ========================================

client.on(
  'message',
  async (
    channel,
    tags,
    message,
    self
  ) => {

    if (self) return;

    if (!message.startsWith('!ia '))
      return;

    const pergunta = message
      .replace('!ia ', '')
      .trim();

    if (!pergunta)
      return;

    const usuario =
      tags['display-name']
      || tags.username;

    const apiKey =
      process.env.GROQ_API_KEY?.trim()
      || '';

    const historico =
      obterHistorico(usuario);

    const systemPrompt = {
      role: 'system',
      content: `
Você participa naturalmente de chats da Twitch.

Você é apenas uma pessoa comum do chat.

REGRAS:

- Sempre responda em português do Brasil.
- Máximo de 360 caracteres.
- Seja direto.
- Seja natural.
- Seja espontâneo.
- Pareça um viewer real.
- Nunca diga que é uma IA.
- Nunca diga que é um chatbot.
- Nunca diga que foi treinado.
- Nunca fale sobre prompts.
- Nunca fale sobre modelos.
- Nunca fale sobre APIs.

PERSONALIDADE:

- Engraçado.
- Criativo.
- Sarcástico de leve.
- Zueiro.
- Descontraído.
- Participativo.

ESTILO:

- Pode usar kkk.
- Pode usar memes.
- Pode usar gírias brasileiras.
- Pode entrar na brincadeira.
- Pode provocar levemente.

EVITE:

- Textões.
- Formalidade.
- Linguagem corporativa.
- Respostas robóticas.
- Explicações enormes.

EXEMPLOS:

Pergunta: oi
Resposta: salve kkkkk

Pergunta: boa noite
Resposta: boa, chegou pro caos

Pergunta: to sem sorte
Resposta: RNG abriu processo contra você

Pergunta: quem ganha?
Resposta: o que tiver menos azar hoje

Pergunta: vale a pena?
Resposta: depois não coloca meu nome no boletim kkk

Pergunta: perdi tudo
Resposta: speedrun de sofrimento concluída

OBJETIVO:

Parecer uma pessoa real participando do chat da Twitch.
`
    };

    const mensagensParaEnvio = [
      systemPrompt,
      ...historico,
      {
        role: 'user',
        content: pergunta
      }
    ];

    try {

      const response =
        await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',

            headers: {
              Authorization:
                `Bearer ${apiKey}`,

              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              model: MODELO,
              messages:
                mensagensParaEnvio,

              temperature: 1.1,

              max_tokens: 60
            })
          }
        );

      const data =
        await response.json();

      const resposta =
        data?.choices?.[0]
          ?.message?.content
          ?.trim();

      if (!resposta) {

        console.error(
          'Resposta inválida:',
          JSON.stringify(data)
        );

        return client.say(
          channel,
          `@${usuario} deu ruim aqui kkk`
        );
      }

      salvarHistorico(
        usuario,
        pergunta,
        resposta
      );

      client.say(
        channel,
        `@${usuario} ${resposta}`
      );

    } catch (err) {

      console.error(
        'Erro Groq:',
        err
      );

      client.say(
        channel,
        `@${usuario} a IA tropeçou nos cabos`
      );
    }
  }
);
