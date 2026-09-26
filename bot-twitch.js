import tmi from 'tmi.js';
import http from 'http';

// Servidor HTTP para manter o Render ativo
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

// Lista de modelos do Gemini em ordem de preferência/tentativa
const modelosGemini = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro'
];

// Função que tenta gerar a resposta alternando entre os modelos disponíveis
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
              role: "user",
              parts: [
                { 
                  text: `Você é um assistente bem-humorado, engraçado e direto no chat da Twitch. Responda em português em no máximo 200 caracteres.\n\nPergunta de ${usuario}: ${pergunta}` 
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        console.log(`Resposta gerada com sucesso usando o modelo: ${modelo}`);
        return data.candidates[0].content.parts[0].text.trim();
      } else {
        console.warn(`Modelo ${modelo} falhou ou não retornou texto. Tentando o próximo...`);
      }
    } catch (err) {
      console.error(`Erro ao tentar o modelo ${modelo}:`, err);
    }
  }

  // Se nenhum dos modelos funcionar:
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
      console.error('Erro na execução:', error);
      client.say(channel, `@${usuario} Erro ao processar o comando.`);
    }
  }
});
