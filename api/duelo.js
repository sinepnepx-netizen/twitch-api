import fs from "fs";
import path from "path";
import { createClient } from "redis";

let redisClient = null;
let redisConnecting = null;

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

export default async function handler(req, res) {

  const acao = req.query.acao;

  const user = limparNome(req.query.user);
  const target = limparNome(req.query.target);

  if (!user) {
    return res.status(400).send("Não consegui identificar quem está fazendo o duelo.");
  }

  const redis = await getRedis();

  // ==========================================
  // DESAFIAR
  // ==========================================

  if (acao === "desafiar") {

    if (!target) {
      return res
        .status(200)
        .send(`@${user}, você precisa mencionar alguém para desafiar! ⚔️`);
    }

    if (user.toLowerCase() === target.toLowerCase()) {
      return res
        .status(200)
        .send(`@${user}, você não pode desafiar a si mesmo! 😂`);
    }

    const alvoKey =
      `duelo:pendente:${target.toLowerCase()}`;

    const desafianteKey =
      `duelo:desafiante:${user.toLowerCase()}`;

    const alvoOcupado =
      await redis.exists(alvoKey);

    if (alvoOcupado) {
      return res
        .status(200)
        .send(`@${target} já tem um duelo pendente! ⚔️`);
    }

    const desafianteOcupado =
      await redis.exists(desafianteKey);

    if (desafianteOcupado) {
      return res
        .status(200)
        .send(`@${user}, você já tem um duelo pendente! ⚔️`);
    }

    const duelo = JSON.stringify({
      desafiante: user,
      desafiado: target
    });

    await redis.set(
      alvoKey,
      duelo,
      {
        EX: 30,
        NX: true
      }
    );

    await redis.set(
      desafianteKey,
      alvoKey,
      {
        EX: 30,
        NX: true
      }
    );

    return res
      .status(200)
      .send(
        `⚔️ @${user} desafiou @${target} para um duelo! @${target}, digite !aceitar em até 30 segundos!`
      );
  }

  // ==========================================
  // ACEITAR
  // ==========================================

  if (acao === "aceitar") {

    const alvoKey =
      `duelo:pendente:${user.toLowerCase()}`;

    const dueloSalvo =
      await redis.get(alvoKey);

    if (!dueloSalvo) {
      return res
        .status(200)
        .send(
          `@${user}, não existe nenhum duelo pendente para você. ⚔️`
        );
    }

    const duelo = JSON.parse(dueloSalvo);

    if (
      duelo.desafiado.toLowerCase() !==
      user.toLowerCase()
    ) {
      return res
        .status(200)
        .send(
          `@${user}, você não pode aceitar esse duelo.`
        );
    }

    await redis.del(alvoKey);

    await redis.del(
      `duelo:desafiante:${duelo.desafiante.toLowerCase()}`
    );

    // ==========================================
    // ESCOLHE A SITUAÇÃO
    // ==========================================

    const arquivo = path.join(
      process.cwd(),
      "frases",
      "duelos.json"
    );

    if (!fs.existsSync(arquivo)) {
      return res
        .status(500)
        .send("O arquivo de situações do duelo não foi encontrado.");
    }

    const dados = JSON.parse(
      fs.readFileSync(arquivo, "utf8")
    );

    if (!Array.isArray(dados) || dados.length === 0) {
      return res
        .status(500)
        .send("Nenhuma situação de duelo foi cadastrada.");
    }

    const situacao =
      dados[
        Math.floor(
          Math.random() * dados.length
        )
      ];

    const vencedor =
      situacao.vencedor === "user"
        ? duelo.desafiante
        : duelo.desafiado;

    const perdedor =
      situacao.vencedor === "user"
        ? duelo.desafiado
        : duelo.desafiante;

    const texto =
      situacao.texto
        .replaceAll("{user}", `@${duelo.desafiante}`)
        .replaceAll("{target}", `@${duelo.desafiado}`)
        .replaceAll("{vencedor}", `@${vencedor}`)
        .replaceAll("{perdedor}", `@${perdedor}`);

    return res
      .status(200)
      .send(texto);
  }

  return res
    .status(400)
    .send("Ação de duelo inválida.");
}
