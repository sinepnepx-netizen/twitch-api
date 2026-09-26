import tmi from 'tmi.js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new tmi.Client({
  options: { debug: false },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [process.env.TWITCH_CHANNEL]
});

client.connect().then(() => console.log('Bot conectado à Twitch!'));

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  if (message.startsWith('!ia ')) {
    const pergunta = message.replace('!ia ', '').trim();
    const usuario = tags['display-name'];

    if (!pergunta) return;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: pergunta,
        config: {
          systemInstruction: 'Você é um assistente bem-humorado no chat da Twitch. Responda em português, de forma sucinta e direta em no máximo 250 caracteres.',
        }
      });

      const respostaIA = response.text;
      client.say(channel, `@${usuario} ${respostaIA}`);
    } catch (error) {
      console.error('Erro na IA:', error);
    }
  }
});
