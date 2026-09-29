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

    try {
      await redisConnecting;
    } finally {
      redisConnecting = null;
    }
  }

  return redisClient;
}

/*
==================================================
CONFIGURAÇÃO
==================================================
*/

const TEMPO_RODADA = 120;
const MAX_HISTORICO = 30;
const MAX_TENTATIVAS = 2;

/*
==================================================
ARQUIVO DE MÚSICAS
==================================================
*/

function carregarMusicas() {
  const arquivo = path.join(
    process.cwd(),
    "frases",
    "musicas.json"
  );

  if (!fs.existsSync(arquivo)) {
    throw new Error("ARQUIVO_NAO_ENCONTRADO");
  }

  const dados = JSON.parse(
    fs.readFileSync(arquivo, "utf8")
  );

  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error("NENHUMA_MUSICA");
  }

  return dados;
}

/*
==================================================
NORMALIZAÇÃO
==================================================
*/

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"`´’‘]/g, "")
    .replace(/[-–—_/|+&]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
==================================================
NOME DO USUÁRIO
==================================================
*/

function limparNome(nome) {
  return String(nome || "")
    .replace(/^@+/, "")
    .trim();
}

/*
==================================================
ESCOLHA ALEATÓRIA
==================================================
*/

function escolherAleatorio(lista) {
  if (!lista.length) {
    return null;
  }

  return lista[
    Math.floor(
      Math.random() * lista.length
    )
  ];
}

/*
==================================================
HISTÓRICO
==================================================
*/

async function obterHistorico(redis) {
  const historico =
    await redis.lRange(
      "musica:historico",
      0,
      -1
    );

  return historico || [];
}

async function adicionarHistorico(redis, id) {
  await redis.lRem(
    "musica:historico",
    0,
    String(id)
  );

  await redis.lPush(
    "musica:historico",
    String(id)
  );

  await redis.lTrim(
    "musica:historico",
    0,
    MAX_HISTORICO - 1
  );
}

/*
==================================================
ESCOLHER MÚSICA
==================================================
*/

async function escolherMusica(redis, musicas, categoria) {
  let disponiveis = [...musicas];

  if (categoria) {
    const categoriaNormalizada =
      normalizarTexto(categoria);

    disponiveis =
      disponiveis.filter((musica) =>
        Array.isArray(musica.categorias) &&
        musica.categorias.some(
          (item) =>
            normalizarTexto(item) ===
            categoriaNormalizada
        )
      );
  }

  if (!disponiveis.length) {
    return null;
  }

  let historico =
    await obterHistorico(redis);

  let candidatas =
    disponiveis.filter(
      (musica) =>
        !historico.includes(
          String(musica.id)
        )
    );

  /*
   * Se todas as músicas da categoria
   * estiverem no histórico, reinicia
   * o ciclo daquela categoria.
   */
  if (!candidatas.length) {
    const idsDisponiveis =
      new Set(
        disponiveis.map(
          (musica) =>
            String(musica.id)
        )
      );

    const novoHistorico =
      historico.filter(
        (id) =>
          !idsDisponiveis.has(id)
      );

    await redis.del(
      "musica:historico"
    );

    if (novoHistorico.length) {
      await redis.rPush(
        "musica:historico",
        novoHistorico
      );
    }

    historico = novoHistorico;

    candidatas = [...disponiveis];
  }

  return escolherAleatorio(
    candidatas
  );
}

/*
==================================================
VALIDAÇÃO DA RESPOSTA
==================================================
*/

function respostaCorreta(
  resposta,
  musica,
  musicas
) {
  const tentativa =
    normalizarTexto(resposta);

  if (!tentativa) {
    return false;
  }

  const artista =
    normalizarTexto(
      musica.artista
    );

  const titulo =
    normalizarTexto(
      musica.titulo
    );

  /*
   * A resposta precisa conter artista
   * e título, mas o separador é opcional.
   *
   * Exemplos aceitos:
   *
   * Linkin Park Numb
   * Linkin Park - Numb
   * Numb Linkin Park
   * linkin park – numb
   */

  const forma1 =
    normalizarTexto(
      `${musica.artista} ${musica.titulo}`
    );

  const forma2 =
    normalizarTexto(
      `${musica.titulo} ${musica.artista}`
    );

  if (
    tentativa === forma1 ||
    tentativa === forma2
  ) {
    return true;
  }

  /*
   * Também permite que o usuário
   * repita palavras sem querer ou use
   * espaços diferentes.
   */

  const palavrasTentativa =
    tentativa.split(" ");

  const palavrasArtista =
    artista.split(" ");

  const palavrasTitulo =
    titulo.split(" ");

  const possuiArtista =
    palavrasArtista.every(
      (palavra) =>
        palavrasTentativa.includes(
          palavra
        )
    );

  const possuiTitulo =
    palavrasTitulo.every(
      (palavra) =>
        palavrasTentativa.includes(
          palavra
        )
    );

  /*
   * Se o título for único na base,
   * também permite responder somente
   * com o título.
   */

  if (possuiTitulo) {
    const mesmoTitulo =
      musicas.filter(
        (item) =>
          normalizarTexto(
            item.titulo
          ) === titulo
      );

    if (
      mesmoTitulo.length === 1
    ) {
      return true;
    }
  }

  return (
    possuiArtista &&
    possuiTitulo
  );
}

/*
==================================================
CATEGORIAS
==================================================
*/

function obterCategorias(musicas) {
  const categorias = new Set();

  for (const musica of musicas) {
    if (
      Array.isArray(
        musica.categorias
      )
    ) {
      for (const categoria of musica.categorias) {
        categorias.add(
          String(categoria)
        );
      }
    }
  }

  return [...categorias].sort(
    (a, b) =>
      a.localeCompare(
        b,
        "pt-BR"
      )
  );
}

/*
==================================================
HANDLER
==================================================
*/

export default async function handler(req, res) {
  res.setHeader(
    "Content-Type",
    "text/plain; charset=utf-8"
  );

  try {
    const redis =
      await getRedis();

    const acao =
      String(
        req.query.acao || ""
      ).toLowerCase();

    const user =
      limparNome(
        req.query.user ||
        req.query.sender
      );

    /*
    ==============================================
    CARREGAR MÚSICAS
    ==============================================
    */

    let musicas;

    try {
      musicas =
        carregarMusicas();
    } catch (erro) {
      if (
        erro.message ===
        "ARQUIVO_NAO_ENCONTRADO"
      ) {
        return res
          .status(500)
          .send(
            "O arquivo de músicas não foi encontrado."
          );
      }

      if (
        erro.message ===
        "NENHUMA_MUSICA"
      ) {
        return res
          .status(500)
          .send(
            "Nenhuma música cadastrada."
          );
      }

      throw erro;
    }

    /*
    ==============================================
    INICIAR
    ==============================================
    */

    if (
      acao === "iniciar" ||
      acao === "jogar"
    ) {
      const rodadaExistente =
        await redis.get(
          "musica:rodada"
        );

      if (rodadaExistente) {
        return res
          .status(200)
          .send(
            "🎵 Já existe uma música em andamento! Tentem adivinhar primeiro!"
          );
      }

      const categoria =
        String(
          req.query.categoria || ""
        ).trim();

      if (categoria) {
        const categoriaNormalizada =
          normalizarTexto(
            categoria
          );

        const existeCategoria =
          musicas.some(
            (musica) =>
              Array.isArray(
                musica.categorias
              ) &&
              musica.categorias.some(
                (item) =>
                  normalizarTexto(
                    item
                  ) ===
                  categoriaNormalizada
              )
          );

        if (!existeCategoria) {
          return res
            .status(200)
            .send(
              `❌ A categoria "${categoria}" não existe.`
            );
        }
      }

      const musica =
        await escolherMusica(
          redis,
          musicas,
          categoria
        );

      if (!musica) {
        return res
          .status(200)
          .send(
            "❌ Não encontrei músicas disponíveis nessa categoria."
          );
      }

      const rodada = {
        id: String(musica.id),
        titulo: musica.titulo,
        artista: musica.artista,
        refrao: musica.refrao,
        dicas: Array.isArray(
          musica.dicas
        )
          ? musica.dicas
          : [],
        categorias:
          Array.isArray(
            musica.categorias
          )
            ? musica.categorias
            : [],
        dicaRevelada: false,
        criadaEm: Date.now()
      };

      await redis.set(
        "musica:rodada",
        JSON.stringify(
          rodada
        ),
        {
          EX: TEMPO_RODADA,
          NX: true
        }
      );

      const rodadaConfirmada =
        await redis.get(
          "musica:rodada"
        );

      if (!rodadaConfirmada) {
        return res
          .status(200)
          .send(
            "🎵 Outra rodada acabou de ser iniciada. Tente participar dela!"
          );
      }

      return res
        .status(200)
        .send(
          `🎵 TRECHO:\n${rodada.refrao}\n\n💡 Dica:\n${rodada.dicas[0] || "Tente reconhecer o refrão!"}\n\n🎤 Quem descobrir primeiro, use !resposta artista música!`
        );
    }

    /*
    ==============================================
    DICA
    ==============================================
    */

    if (
      acao === "dica"
    ) {
      const rodadaJSON =
        await redis.get(
          "musica:rodada"
        );

      if (!rodadaJSON) {
        return res
          .status(200)
          .send(
            "🎵 Não existe nenhuma rodada ativa."
          );
      }

      const rodada =
        JSON.parse(
          rodadaJSON
        );

      if (
        rodada.dicaRevelada
      ) {
        return res
          .status(200)
          .send(
            "💡 A segunda dica já foi revelada! Agora é só tentar adivinhar."
          );
      }

      if (
        !rodada.dicas ||
        !rodada.dicas[1]
      ) {
        rodada.dicaRevelada = true;

        await redis.set(
          "musica:rodada",
          JSON.stringify(
            rodada
          ),
          {
            EX: TEMPO_RODADA
          }
        );

        return res
          .status(200)
          .send(
            "💡 Não há uma segunda dica cadastrada para esta música."
          );
      }

      rodada.dicaRevelada =
        true;

      const ttl =
        await redis.ttl(
          "musica:rodada"
        );

      await redis.set(
        "musica:rodada",
        JSON.stringify(
          rodada
        ),
        {
          EX:
            ttl > 0
              ? ttl
              : TEMPO_RODADA
        }
      );

      return res
        .status(200)
        .send(
          `💡 Dica extra:\n${rodada.dicas[1]}`
        );
    }

    /*
    ==============================================
    RESPOSTA
    ==============================================
    */

    if (
      acao === "resposta"
    ) {
      if (!user) {
        return res
          .status(200)
          .send(
            "❌ Não consegui identificar quem está respondendo."
          );
      }

      const rodadaJSON =
        await redis.get(
          "musica:rodada"
        );

      if (!rodadaJSON) {
        return res
          .status(200)
          .send(
            "🎵 Não existe nenhuma rodada ativa."
          );
      }

      const rodada =
        JSON.parse(
          rodadaJSON
        );

      const resposta =
        String(
          req.query.resposta ||
          ""
        ).trim();

      if (!resposta) {
        return res
          .status(200)
          .send(
            `❓ @${user}, escreva o artista e a música.`
          );
      }

      const chaveTentativas =
        `musica:tentativas:${normalizarTexto(user)}`;

      const tentativasRaw =
        await redis.get(
          chaveTentativas
        );

      const tentativas =
        Number(
          tentativasRaw || 0
        );

      if (
        tentativas >=
        MAX_TENTATIVAS
      ) {
        return res
          .status(200)
          .send(
            `❌ @${user}, você já esgotou suas 2 tentativas nesta rodada.`
          );
      }

      /*
       * Conta a tentativa antes da
       * validação para evitar abuso.
       */

      const novasTentativas =
        tentativas + 1;

      await redis.set(
        chaveTentativas,
        String(
          novasTentativas
        ),
        {
          EX: TEMPO_RODADA
        }
      );

      const acertou =
        respostaCorreta(
          resposta,
          rodada,
          musicas
        );

      if (!acertou) {
        if (
          novasTentativas >=
          MAX_TENTATIVAS
        ) {
          return res
            .status(200)
            .send(
              `❌ @${user} errou! Você esgotou suas 2 tentativas.`
            );
        }

        return res
          .status(200)
          .send(
            `❌ @${user} errou! Você ainda tem 1 tentativa.`
          );
      }

      /*
       * LOCK DO VENCEDOR
       *
       * Impede duas pessoas que acertarem
       * praticamente ao mesmo tempo de
       * vencerem simultaneamente.
       */

      const vencedorKey =
        "musica:vencedor";

      const lock =
        await redis.set(
          vencedorKey,
          user,
          {
            NX: true,
            EX: TEMPO_RODADA
          }
        );

      if (lock !== "OK") {
        return res
          .status(200)
          .send(
            `🎵 @${user}, alguém acabou de acertar a música primeiro!`
          );
      }

      /*
       * Registrar no histórico.
       */

      await adicionarHistorico(
        redis,
        rodada.id
      );

      /*
       * Apagar rodada.
       */

      await redis.del(
        "musica:rodada"
      );

      /*
       * Apagar tentativas da pessoa
       * vencedora.
       */

      await redis.del(
        chaveTentativas
      );

      return res
        .status(200)
        .send(
          `🎉 @${user} acertou!\n🎵 Música: ${rodada.titulo}\n🎤 Artista: ${rodada.artista}`
        );
    }

    /*
    ==============================================
    PULAR
    ==============================================
    */

    if (
      acao === "pular"
    ) {
      const rodadaJSON =
        await redis.get(
          "musica:rodada"
        );

      if (!rodadaJSON) {
        return res
          .status(200)
          .send(
            "🎵 Não existe nenhuma rodada ativa."
          );
      }

      const rodada =
        JSON.parse(
          rodadaJSON
        );

      await adicionarHistorico(
        redis,
        rodada.id
      );

      await redis.del(
        "musica:rodada"
      );

      await redis.del(
        "musica:vencedor"
      );

      return res
        .status(200)
        .send(
          `⏭️ A resposta era:\n🎵 ${rodada.titulo}\n🎤 ${rodada.artista}`
        );
    }

    /*
    ==============================================
    STATUS
    ==============================================
    */

    if (
      acao === "status"
    ) {
      const rodada =
        await redis.exists(
          "musica:rodada"
        );

      if (!rodada) {
        return res
          .status(200)
          .send(
            "🎵 Não existe nenhuma rodada ativa."
          );
      }

      return res
        .status(200)
        .send(
          "🎵 Existe uma rodada musical ativa! Tentem adivinhar!"
        );
    }

    /*
    ==============================================
    CATEGORIAS
    ==============================================
    */

    if (
      acao === "categorias"
    ) {
      const categorias =
        obterCategorias(
          musicas
        );

      if (!categorias.length) {
        return res
          .status(200)
          .send(
            "❌ Nenhuma categoria cadastrada."
          );
      }

      return res
        .status(200)
        .send(
          `🎵 Categorias disponíveis:\n${categorias.join(", ")}`
        );
    }

    /*
    ==============================================
    AÇÃO INVÁLIDA
    ==============================================
    */

    return res
      .status(400)
      .send(
        "Ação de música inválida."
      );

  } catch (erro) {
    console.error(
      "Erro no sistema de música:",
      erro
    );

    return res
      .status(500)
      .send(
        "❌ Ocorreu um erro no jogo de música."
      );
  }
}
