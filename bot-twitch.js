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

const historicoChat = [];

function adicionarAoHistorico(usuario, pergunta, resposta) {
  historicoChat.push({ role: 'user', content: `${usuario} disse: ${pergunta}` });
  historicoChat.push({ role: 'assistant', content: resposta });
  if (historicoChat.length > 20) {
    historicoChat.splice(0, 2);
  }
}

// Função para descobrir qual modelo está 100% ativo na sua conta Groq
async function obterModeloValido(apiKey) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await res.json();
    if (data && data.data && data.data.length > 0) {
      // Pega o primeiro modelo da lista retornada pela própria Groq
      const modeloEncontrado = data.data[0].id;
      console.log(`Modelo ativo detectado na sua conta: ${modeloEncontrado}`);
      return modeloEncontrado;
    }
  } catch (err) {
    console.error('Erro ao consultar lista de modelos:', err);
  }
  // Fallback padrão se a consulta falhar
  return 'llama-3.1-8b-instant';
}

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
3. Seja engraçado e zoeiro de leve com o usuário.`
    };

    const mensagensParaEnvio = [
      systemPrompt,
      ...historicoChat,
      { role: 'user', content: `${usuario} perguntou: ${pergunta}` }
    ];

    try {
      // Descobre dinamicamente um modelo válido liberado na sua API Key
      const modeloAtivo = await obterModeloValido(apiKey);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modeloAtivo,
          messages: mensagensParaEnvio,
          temperature: 0.8
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const respostaGerada = data.choices[0].message.content.trim();
        adicionarAoHistorico(usuario, pergunta, respostaGerada);
        client.say(channel, `@${usuario} ${respostaGerada}`);
      } else {
        console.error('Erro na resposta da Groq:', JSON.stringify(data));
        client.say(channel, `@${usuario} Deu ruim na IA, tenta de novo.`);
      }
    } catch (err) {
      console.error('Erro ao chamar a Groq:', err);
      client.say(channel, `@${usuario} Mídia travou aqui.`);
    }
  }
});
