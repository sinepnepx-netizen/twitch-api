import tmi from 'tmi.js';
import http from 'http';

// Servidor HTTP para manter o Render ativo no plano gratuito
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

// Lista de modelos atualizados com fallback automático
const modelosGemini = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

async function gerarRespostaComFallback(apiKey, usuario, pergunta) {
  for (const modelo of modelosGemini) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { 
                  text: `Você é um assistente engraçado e bem-humorado no chat da Twitch. Responda em português em no máximo 180 caracteres.\n\nPergunta de ${usuario}: ${pergunta}` 
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        console.log(`Sucesso ao responder com o modelo: ${modelo}`);
        return data.candidates[0].content.parts[0].text.trim();
      } else {
        console.warn(`Modelo ${modelo} não retornou texto. Detalhe:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error(`Erro de conexão com o modelo ${modelo}:`, err);
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
        client.say(channel, `@${usuario} Não consegui gerar uma resposta no momento. Tente novamente em instantes.`);
      }
    } catch (error) {
      console.error('Erro na execução do comando:', error);
      client.say(channel, `@${usuario} Erro ao processar o comando.`);
    }
  }
});
