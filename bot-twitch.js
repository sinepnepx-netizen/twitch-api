import tmi from 'tmi.js';
import http from 'http';

// Servidor HTTP simples para manter o Render ativo
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Online!');
}).listen(port);

const canais = process.env.TWITCH_CHANNEL
  ? process.env.TWITCH_CHANNEL.split(',').map(c => c.trim())
  : [];

const client = new tmi.Client({
  options: { debug: false },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: canais
});

client.connect()
  .then(() => {
    console.log(`Bot conectado nos canais: ${canais.join(', ')}`);
  })
  .catch(err => {
    console.error('Erro ao conectar na Twitch:', err);
  });


// ==========================
// MEMÓRIA POR USUÁRIO
// ==========================

const historicoUsuarios = {};

function obterHistorico(usuario) {
  if (!historicoUsuarios[usuario]) {
    historicoUsuarios[usuario] = [];
  }

  return historicoUsuarios[usuario];
}

function adicionarAoHistorico(usuario, pergunta, resposta) {
  const historico = obterHistorico(usuario);

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


// ==========================
// MODELO GROQ
// ==========================

let modeloAtivo = 'llama-3.1-8b-instant';

async function obterModeloValido(apiKey) {
  try {
    const res = await fetch(
      'https://api.groq.com/openai/v1/models',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const data = await res.json();

    if (data?.data?.length) {
      const modeloEncontrado = data.data[0].id;

      console.log(
        `Modelo ativo detectado: ${modeloEncontrado}`
      );

      return modeloEncontrado;
    }
  } catch (err) {
    console.error(
      'Erro ao consultar modelos:',
      err
    );
  }

  return 'llama-3.1-8b-instant';
}

(async () => {
  const apiKey =
    process.env.GROQ_API_KEY?.trim() || '';

  modeloAtivo =
    await obterModeloValido(apiKey);
})();


// ==========================
// IA
// ==========================

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
      tags['display-name'] || tags.username;

    const apiKey =
      process.env.GROQ_API_KEY?.trim() || '';

    const historico =
      obterHistorico(usuario);

    const systemPrompt = {
      role: 'system',
      content: `
Você participa naturalmente de chats da Twitch.

Você é apenas mais uma pessoa do chat.

REGRAS:

- Fale sempre em português do Brasil.
- Responda de forma curta.
- Máximo de 120 caracteres.
- No máximo 2 frases.
- Seja natural.
- Pareça um viewer real.
- Não pareça um assistente virtual.
- Não diga que é uma IA.
- Não diga que foi treinado.
- Não diga que é um chatbot.
- Não mencione prompts.
- Não mencione modelos.
- Não mencione APIs.

PERSONALIDADE:

- Engraçado.
- Criativo.
- Espontâneo.
- Sarcástico de leve.
- Participativo.
- Zueiro sem exagerar.

ESTILO:

- Pode usar kkk.
- Pode usar memes.
- Pode usar gírias brasileiras.
- Pode entrar na brincadeira.
- Pode provocar levemente.

EVITE:

- Textões.
- Respostas formais.
- Explicações enormes.
- Linguagem robótica.
- Respostas repetitivas.

OBJETIVO:

Parecer um usuário real participando do chat da Twitch.
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

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            model: modeloAtivo,
            messages: mensagensParaEnvio,
            temperature: 1.1,
            max_tokens: 60
          })
        }
      );

      const data =
        await response.json();

      if (
        data?.choices?.[0]?.message?.content
      ) {

        const respostaGerada =
          data.choices[0]
            .message.content
            .trim();

        adicionarAoHistorico(
          usuario,
          pergunta,
          respostaGerada
        );

        client.say(
          channel,
          `@${usuario} ${respostaGerada}`
        );

      } else {

        console.error(
          'Resposta inválida:',
          JSON.stringify(data)
        );

        client.say(
          channel,
          `@${usuario} deu ruim aqui kkk`
        );
      }

    } catch (err) {

      console.error(
        'Erro ao chamar Groq:',
        err
      );

      client.say(
        channel,
        `@${usuario} a IA tropeçou nos cabos`
      );
    }
  }
);
