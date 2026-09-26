import tmi from 'tmi.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import http from 'http';

// Servidor HTTP simples para o Render ficar satisfeito
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot da Twitch rodando perfeitamente!');
}).listen(port, () => {
  console.log(`Servidor de status ouvindo na porta ${port}`);
});

// Configuração da IA Gemini (usando o modelo atualizado gemini-2.5-flash)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Lista de canais da Twitch
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
      const prompt = `Você é um assistente bem-humorado no chat da Twitch. Responda em português, de forma sucinta e direta em no máximo 200 caracteres.\n\nPergunta do viewer ${usuario}: ${pergunta}`;
      
      const result = await model.generateContent(prompt);
      const respostaIA = result.response.text();

      client.say(channel, `@${usuario} ${respostaIA}`);
    } catch (error) {
      console.error('Erro na IA:', error);
      client.say(channel, `@${usuario} Erro ao processar a resposta.`);
    }
  }
});
