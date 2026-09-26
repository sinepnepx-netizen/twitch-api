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

client.connect().then(() => console.log(`Bot conectado nos canais: ${canais.join(', ')}`));

// Array para guardar até 10 mensagens anteriores no histórico
const historicoChat = [];

function adicionarAoHistorico(usuario, pergunta, resposta) {
  historicoChat.push({
    role: 'user',
    content: `${usuario} disse: ${pergunta}`
  });
  historicoChat.push({
    role: 'assistant',
    content: resposta
  });

  if (historicoChat.length > 20) {
    historicoChat.splice(0, 2);
  }
}

// Modelos ATUAIS e ATIVOS na Groq (sem nenhum antigo/descontinuado)
const modelosGroq = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768'
];

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  if (message.startsWith('!ia ')) {
    const pergunta = message.replace('!ia ', '').trim();
    const usuario = tags['display-name'];

    if (!pergunta) return;

    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';

    const systemPrompt = {
      role: 'system',
      content: `Você é um participante zoeiro, humanizado, sarcástico e engraçado no chat da Twitch. 
Instruções:
1. Responda em português do Brasil.
2. Seja direto e curto (máximo 160 caracteres).
3. Seja engraçado e zoeiro de leve com o usuário.
4. Use o histórico da conversa se for relevante.`
    };

    const mensagensParaEnvio = [
      systemPrompt,
      ...historicoChat,
      {
        role: 'user',
        content: `${usuario} perguntou: ${pergunta}`
      }
    ];

    let respostaGerada = null;

    // Tenta os modelos válidos em sequência
    for (const modelo of modelosGroq) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelo,
            messages: mensagensParaEnvio,
            temperature: 0.8
          })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
          respostaGerada = data.choices[0].message.content.trim();
          console.log(`Sucesso com o modelo Groq: ${modelo}`);
          break;
        } else {
          console.warn(`Modelo ${modelo} falhou:`, JSON.stringify(data));
        }
      } catch (err) {
        console.error(`Erro no modelo ${modelo}:`, err);
      }
    }

    if (respostaGerada) {
      adicionarAoHistorico(usuario, pergunta, respostaGerada);
      client.say(channel, `@${usuario} ${respostaGerada}`);
    } else {
      client.say(channel, `@${usuario} Foi mal, viajei aqui e não ouvi.`);
    }
  }
});
