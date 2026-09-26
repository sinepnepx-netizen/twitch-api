import tmi from 'tmi.js';
import http from 'http';

// Servidor HTTP para o Render se manter ativo
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

client.connect().then(() => console.log(`Bot conectado aos canais: ${canais.join(', ')}`));

// Lista de modelos suportados pela API v1beta
const modelosGemini = [
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

async function gerarRespostaComFallback(apiKey, usuario, pergunta) {
  for (const modelo of modelosGemini) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: `Instrução: Você é um assistente bem-humorado no chat da Twitch. Responda em português em no máximo 200 caracteres.\n\nPergunta de ${usuario}: ${pergunta}` 
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        console.log(`Sucesso com o modelo: ${modelo}`);
        return data.candidates[0].content.parts[0].text.trim();
      } else {
        console.error(`Erro no modelo ${modelo}:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error(`Falha na requisição para ${modelo}:`, err);
    }
  }
  return null;
}

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  if (message.startsWith('!ia ')) {
    const pergunta = message.replace('!ia ', '').trim();
    const usuario = tags['display-name'];

    if (!pergunta) return;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const respostaIA = await gerarRespostaComFallback(apiKey, usuario, pergunta);

      if (respostaIA) {
        client.say(channel, `@${usuario} ${respostaIA}`);
      } else {
        client.say(channel, `@${usuario} Erro ao comunicar com a API do Gemini. Verifique a chave GEMINI_API_KEY.`);
      }
    } catch (error) {
      console.error('Erro geral:', error);
      client.say(channel, `@${usuario} Erro ao processar o comando.`);
    }
  }
});
