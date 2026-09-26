import tmi from 'tmi.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import http from 'http';

const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Online');
}).listen(port);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Usando o modelo v1beta estável para não dar erro 404
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

client.connect().then(() => console.log('Bot conectado'));

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  if (message.startsWith('!ia ')) {
    const pergunta = message.replace('!ia ', '').trim();
    const usuario = tags['display-name'];

    if (!pergunta) return;

    try {
      const prompt = `Você é um assistente no chat da Twitch. Responda em português de forma sucinta alegre descontraida  zoeira em no máximo 500 caracteres.\n\nPergunta de ${usuario}: ${pergunta}`;
      const result = await model.generateContent(prompt);
      client.say(channel, `@${usuario} ${result.response.text()}`);
    } catch (error) {
      console.error(error);
      client.say(channel, `@${usuario} Erro ao responder.`);
    }
  }
});
