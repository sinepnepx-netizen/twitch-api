import tmi from 'tmi.js';
import http from 'http';

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
    console.error('Erro ao conectar:', err);
  });

const historicos = {};

function obterHistorico(usuario) {
  if (!historicos[usuario]) {
    historicos[usuario] = [];
  }

  return historicos[usuario];
}

function salvarHistorico(usuario, pergunta, resposta) {
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

const MODELO = 'openai/gpt-oss-20b';

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  if (!message.startsWith('!ia ')) return;

  const pergunta = message.replace('!ia ', '').trim();

  if (!pergunta) return;

  const usuario =
    tags['display-name'] ||
    tags.username ||
    'usuario';

  const historico = obterHistorico(usuario);

  const systemPrompt = {
    role: 'system',
    content: `
Você é um usuário comum do chat da Twitch.

Regras:
- Responda em português do Brasil.
- Máximo de 120 caracteres.
- Máximo de 2 frases.
- Seja natural.
- Seja engraçado quando fizer sentido.
- Pode usar gírias.
- Pode usar kkk.
- Não diga que é IA.
- Não faça textão.
- Não seja formal.
- Pareça um viewer real.

Exemplos:

Pergunta: oi
Resposta: salve kkk

Pergunta: boa noite
Resposta: chegou pro caos

Pergunta: perdi tudo
Resposta: speedrun de tristeza concluída

Pergunta: quem ganha?
Resposta: o menos azarado hoje
`
  };

  try {

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODELO,
          messages: [
            systemPrompt,
            ...historico,
            {
              role: 'user',
              content: pergunta
            }
          ],
          temperature: 1.0,
          max_tokens: 60
        })
      }
    );

    const data = await response.json();

    console.log(
      'RESPOSTA GROQ:',
      JSON.stringify(data, null, 2)
    );

    let resposta = '';

    if (
      data?.choices?.[0]?.message?.content
    ) {
      resposta =
        data.choices[0].message.content;
    }

    if (Array.isArray(resposta)) {
      resposta = resposta
        .map(item => item.text || '')
        .join(' ');
    }

    resposta = String(resposta || '').trim();

    if (!resposta) {
      client.say(
        channel,
        `@${usuario} não consegui pensar em nada kkk`
      );
      return;
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
      'Erro ao chamar Groq:',
      err
    );

    client.say(
      channel,
      `@${usuario} deu ruim aqui kkk`
    );
  }
});
