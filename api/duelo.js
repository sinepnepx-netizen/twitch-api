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

/*
==========================================
ESCOLHE SITUAÇÕES SEM REPETIR
==========================================

Temos 50 situações.

A cada ciclo:
- escolhe 30 diferentes
- usa cada uma apenas uma vez
- quando acabam, cria outro ciclo
*/

async function escolherDuelo(redis, quantidade) {

  const filaKey = "duelo:fila";

  let indice = await redis.lPop(filaKey);

  if (indice !== null) {
    return Number(indice);
  }

  const lockKey = "duelo:criando-ciclo";

  const lock = await redis.set(
    lockKey,
    "1",
    {
      NX: true,
      EX: 5
    }
  );

  if (lock === "OK") {

    try {

      indice = await redis.lPop(filaKey);

      if (indice !== null) {
        return Number(indice);
      }

      const todos = Array.from(
        { length: quantidade },
        (_, i) => i
      );

      const novoCiclo = embaralhar(todos)
        .slice(
          0,
          Math.min(30, quantidade)
        );

      await redis.rPush(
        filaKey,
        novoCiclo.map(String)
      );

      indice = await redis.lPop(filaKey);

      return Number(indice);

    } finally {

      await redis.del(lockKey);
    }
  }

  await new Promise((resolve) =>
    setTimeout(resolve, 100)
  );

  return escolherDuelo(
    redis,
    quantidade
  );
}

export default async function handler(req, res) {

  const acao = req.query.acao;

  const user = limparNome(
    req.query.user
  );

  const target = limparNome(
    req.query.target
  );

  if (!user) {
    return res
      .status(400)
      .send(
        "Não consegui identificar quem está fazendo o duelo."
      );
  }

  const redis = await getRedis();

  /*
  ==========================================
  DESAFIAR
  ==========================================
  */

  if (acao === "desafiar") {

    if (!target) {
      return res
        .status(200)
        .send(
          `@${user}, você precisa mencionar alguém para desafiar! ⚔️`
        );
    }

    if (
      user.toLowerCase() ===
      target.toLowerCase()
    ) {
      return res
        .status(200)
        .send(
          `@${user}, você não pode desafiar a si mesmo! 😂`
        );
    }

    /*
    Cada desafio agora possui sua própria chave.

    Isso permite que várias pessoas desafiem
    várias pessoas ao mesmo tempo.
    */

    const idDesafio =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    const desafioKey =
      `duelo:desafio:${target.toLowerCase()}:${idDesafio}`;

    const dados = JSON.stringify({
      desafiante: user,
      desafiado: target
    });

    /*
    O desafio dura exatamente 60 segundos.
    */

    await redis.set(
      desafioKey,
      dados,
      {
        EX: 60
      }
    );

    /*
    Lista de desafios pendentes daquela pessoa.
    */

    const listaKey =
      `duelo:lista:${target.toLowerCase()}`;

    await redis.rPush(
      listaKey,
      desafioKey
    );

    await redis.expire(
      listaKey,
      60
    );

    return res
      .status(200)
      .send(
        `⚔️ @${user} desafiou @${target} para um duelo! @${target}, digite !yd em até 60 segundos!`
      );
  }

  /*
  ==========================================
  ACEITAR / !YD
  ==========================================
  */

  if (acao === "aceitar") {

    const listaKey =
      `duelo:lista:${user.toLowerCase()}`;

    /*
    Pega todos os desafios dessa pessoa.
    */

    const desafios =
      await redis.lRange(
        listaKey,
        0,
        -1
      );

    /*
    Remove da lista os desafios que
    já expiraram.
    */

    const validos = [];

    for (const chave of desafios) {

      const existe =
        await redis.exists(chave);

      if (existe) {
        validos.push(chave);
      }
    }

    if (validos.length === 0) {

      await redis.del(listaKey);

      return res
        .status(200)
        .send(
          `@${user}, não existe nenhum duelo pendente para você. ⚔️`
        );
    }

    /*
    Se houver vários desafios,
    escolhe um aleatoriamente.
    */

    const chaveEscolhida =
      validos[
        Math.floor(
          Math.random() *
          validos.length
        )
      ];

    const dueloSalvo =
      await redis.get(
        chaveEscolhida
      );

    if (!dueloSalvo) {

      await redis.lRem(
        listaKey,
        0,
        chaveEscolhida
      );

      return res
        .status(200)
        .send(
          `@${user}, esse desafio acabou de expirar. Tente !yd novamente. ⚔️`
        );
    }

    const duelo =
      JSON.parse(dueloSalvo);

    /*
    Remove somente o desafio aceito.
    Os outros continuam pendentes.
    */

    await redis.del(
      chaveEscolhida
    );

    await redis.lRem(
      listaKey,
      0,
      chaveEscolhida
    );

    /*
    ==========================================
    CARREGA AS 50 SITUAÇÕES
    ==========================================
    */

    const arquivo =
      path.join(
        process.cwd(),
        "frases",
        "duelos.json"
      );

    if (!fs.existsSync(arquivo)) {
      return res
        .status(500)
        .send(
          "O arquivo de situações do duelo não foi encontrado."
        );
    }

    const dados =
      JSON.parse(
        fs.readFileSync(
          arquivo,
          "utf8"
        )
      );

    if (
      !Array.isArray(dados) ||
      dados.length === 0
    ) {
      return res
        .status(500)
        .send(
          "Nenhuma situação de duelo foi cadastrada."
        );
    }

    /*
    ==========================================
    ESCOLHE SITUAÇÃO
    ==========================================
    */

    const indice =
      await escolherDuelo(
        redis,
        dados.length
      );

    const situacao =
      dados[indice];

    /*
    ==========================================
    VENCEDOR 50/50
    ==========================================
    */

    const desafianteGanha =
      Math.random() < 0.5;

    const vencedor =
      desafianteGanha
        ? duelo.desafiante
        : duelo.desafiado;

    const perdedor =
      desafianteGanha
        ? duelo.desafiado
        : duelo.desafiante;

    /*
    ==========================================
    MONTA A FRASE
    ==========================================
    */

    const texto =
      situacao.texto
        .replaceAll(
          "{user}",
          `@${duelo.desafiante}`
        )
        .replaceAll(
          "{target}",
          `@${duelo.desafiado}`
        )
        .replaceAll(
          "{vencedor}",
          `@${vencedor}`
        )
        .replaceAll(
          "{perdedor}",
          `@${perdedor}`
        );

    return res
      .status(200)
      .send(texto);
  }

  return res
    .status(400)
    .send(
      "Ação de duelo inválida."
    );
}
