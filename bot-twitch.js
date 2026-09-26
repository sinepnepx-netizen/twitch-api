import tmi from 'tmi.js';
import http from 'http';

// Servidor HTTP para o Render se manter ativo no plano gratuito
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Online!');
}).listen(port);

// Lista de canais da Twitch (iambekinha e soubolinho)
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

client.connect().then(() => console.log(`Bot conectado com sucesso aos canais: ${canais.join(', ')}`));

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  if (message.startsWith('!ia ')) {
    const pergunta = message.replace('!ia ', '').trim();
    const usuario = tags['display-name'];

    if (!pergunta) return;

    try {
      // Chamada direta para a API do Gemini (sem bibliotecas com erros de versão)
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      // AQUI VOCÊ PODE PERSONALIZAR A PERSONALIDADE DO BOT:
      const instrucaoSistema = "Você é um assistente bem-humorado e engraçado no chat da Twitch. Responda sempre em português, de forma sucinta em no máximo 200 caracteres.";

      const body = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${instrucaoSistema}\n\nPergunta do viewer ${usuario}: ${pergunta}` }
            ]
          }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const respostaIA = data.candidates[0].content.parts[0].text.trim();
        client.say(channel, `@${usuario} ${respostaIA}`);
      } else {
        console.error('Erro na resposta do Gemini:', data);
        client.say(channel, `@${usuario} Não consegui gerar uma resposta no momento.`);
      }
    } catch (error) {
      console.error('Erro ao conectar com a IA:', error);
      client.say(channel, `@${usuario} Ocorreu um erro ao processar a resposta.`);
    }
  }
});
