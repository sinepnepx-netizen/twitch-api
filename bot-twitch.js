import tmi from 'tmi.js';
import http from 'http';

// Servidor HTTP simples para manter o Render ativo
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Online!');
}).listen(port);

// Canais da Twitch
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

client.connect().then(() => console.log(`Bot conectado aos canais: ${canais.join(', ')}`));

// Array para guardar até 10 mensagens anteriores no histórico do chat
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

  // Mantém apenas os últimos 10 pares de trocas (20 mensagens no total)
  if (historicoChat.length > 20) {
    historicoChat.splice(0, 2);
  }
}

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  if (message.startsWith('!ia ')) {
    const pergunta = message.replace('!ia ', '').trim();
    const usuario = tags['display-name'];

    if (!pergunta) return;

    try {
      // Monta o prompt do sistema com a personalidade
      const systemPrompt = {
        role: 'system',
        content: `Você é um participante zoeiro, humanizado, sarcástico e engraçado no chat da Twitch. 
Instruções de comportamento:
1. Responda em português.
2. Seja direto e sem enrolação. Curto e certeiro (máximo 350 caracteres). Só se alongue levemente se for estritamente necessário.
3. Se sacanear o usuário de forma bem-humorada, faça isso. Use gírias leves de chat da Twitch quando fizer sentido.
4. Você tem memória das conversas anteriores no chat. Use isso para zoar, dar continuidade ou citar o que outros usuários disseram se for relevante.`
      };

      // Junta o sistema + histórico das últimas conversas + nova pergunta
      const mensagensParaEnvio = [
        systemPrompt,
        ...historicoChat,
        {
          role: 'user',
          content: `${usuario} perguntou: ${pergunta}`
        }
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: mensagensParaEnvio,
          temperature: 0.8 // Aumenta levemente a criatividade e zoeira
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const respostaIA = data.choices[0].message.content.trim();
        
        // Salva na memória do bot
        adicionarAoHistorico(usuario, pergunta, respostaIA);

        client.say(channel, `@${usuario} ${respostaIA}`);
      } else {
        console.error('Erro no retorno:', data);
        client.say(channel, `@${usuario} Foi mal, viajei aqui e não ouvi.`);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      client.say(channel, `@${usuario} Deu um teto preto aqui, tenta de novo.`);
    }
  }
});
