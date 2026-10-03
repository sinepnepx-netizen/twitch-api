import fs from "fs";
import path from "path";
import { createClient } from "redis";

let redisClient = null;
let redisConnecting = null;

const FILA_KEY = "biscoito:fila";
const LOCK_KEY = "biscoito:criando-ciclo";

async function getRedis() {
  if (redisClient && redisClient.isReady) {
    return redisClient;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on("error", (err) => {
      console.error("Redis Error:", err);
    });
  }

  if (!redisClient.isReady) {
    if (!redisConnecting) {
      redisConnecting = redisClient.connect();
    }

    await redisConnecting;
    redisConnecting = null;
  }

  return redisClient;
}

function limparNome(nome) {
  return String(nome || "")
    .replace(/^@/, "")
    .trim();
}

function embaralhar(lista) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copia[i], copia[j]] = [
      copia[j],
      copia[i]
    ];
  }

  return copia;
}

async function pegarFrase(redis, quantidade) {
  let indice = await redis.lPop(FILA_KEY);

  if (indice !== null) {
    return Number(indice);
  }

  const lock = await redis.set(
    LOCK_KEY,
    "1",
    {
      NX: true,
      EX: 5
    }
  );

  if (lock === "OK") {
    try {
      // Outra requisição pode ter criado a fila
      // enquanto esta esperava pelo lock.
      indice = await redis.lPop(FILA_KEY);

      if (indice !== null) {
        return Number(indice);
      }

      const indices = Array.from(
        { length: quantidade },
        (_, i) => i
      );

      const novoCiclo = embaralhar(indices);

      await redis.rPush(
        FILA_KEY,
        novoCiclo.map(String)
      );

      indice = await redis.lPop(FILA_KEY);

      return Number(indice);
    } finally {
      await redis.del(LOCK_KEY);
    }
  }

  // Espera um pouco e tenta novamente.
  await new Promise((resolve) =>
    setTimeout(resolve, 100)
  );

  return pegarFrase(redis, quantidade);
}

export default async function handler(req, res) {
  try {
    const arquivo = path.join(
      process.cwd(),
      "frases",
      "biscoitos.json"
    );

    if (!fs.existsSync(arquivo)) {
      return res.status(500).send(
        "O arquivo de biscoitos não foi encontrado."
      );
    }

    const dados = JSON.parse(
      fs.readFileSync(
        arquivo,
        "utf8"
      )
    );

    if (
      !Array.isArray(dados) ||
      dados.length === 0
    ) {
      return res.status(500).send(
        "Nenhum biscoito da sorte foi cadastrado."
      );
    }

    const redis = await getRedis();

    const indice = await pegarFrase(
      redis,
      dados.length
    );

    const frase = dados[indice];

    if (!frase) {
      return res.status(500).send(
        "Não foi possível encontrar o biscoito da sorte."
      );
    }

    const user = limparNome(
      req.query.user || req.query.sender
    );

    const nome = user
      ? `@${user}`
      : "Você";

    const resposta = String(frase)
      .replaceAll("{user}", nome);

    return res
      .status(200)
      .setHeader(
        "Content-Type",
        "text/plain; charset=utf-8"
      )
      .send(
        `🍪 ${nome}, seu biscoito da sorte diz: ${resposta}`
      );

  } catch (erro) {
    console.error(
      "Erro no comando biscoito:",
      erro
    );

    return res.status(500).send(
      "O biscoito da sorte caiu no chão. Tente novamente. 🍪"
    );
  }
}
