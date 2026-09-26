import fs from "fs";
import path from "path";

const botsIgnorados = [
  "streamelements",
  "nightbot",
  "pokemoncommunitygame",
  "livepix",
  "twishgamebot",
  "sery_bot"
];

function limparNome(nome) {
  return String(nome || "")
    .replace(/^@/, "")
    .trim();
}

export default function handler(req, res) {

  const user = limparNome(req.query.user);
  const target = limparNome(req.query.target);

  if (!target) {
    return res
      .status(200)
      .send(
        `⚖️ @${user || "Alguém"}, você precisa marcar alguém para ser julgado!`
      );
  }

  // ==========================================
  // ESCOLHA DA SEGUNDA PESSOA
  // ==========================================

  const candidatos = [];

  for (let i = 1; i <= 10; i++) {

    const candidato =
      req.query[`target${i}`];

    if (candidato) {
      candidatos.push(
        limparNome(candidato)
      );
    }
  }

  const targetLower =
    target.toLowerCase();

  const candidatosValidos =
    candidatos.filter((candidato) => {

      const nome =
        candidato.toLowerCase();

      // Não pode ser a pessoa julgada
      if (nome === targetLower) {
        return false;
      }

      // Não pode ser bot
      if (
        botsIgnorados.includes(nome)
      ) {
        return false;
      }

      return true;
    });

  // ==========================================
  // SE NÃO ACHOU OUTRA PESSOA
  // ==========================================

  if (candidatosValidos.length === 0) {

    return res
      .status(200)
      .send(
        `⚖️ O tribunal tentou encontrar outra pessoa do chat para participar do julgamento de @${target}, mas não encontrou ninguém disponível.`
      );
  }

  const envolvido =
    candidatosValidos[
      Math.floor(
        Math.random() *
        candidatosValidos.length
      )
    ];

  // ==========================================
  // CARREGA OS JULGAMENTOS
  // ==========================================

  const arquivo =
    path.join(
      process.cwd(),
      "frases",
      "julgamentos.json"
    );

  if (!fs.existsSync(arquivo)) {

    return res
      .status(500)
      .send(
        "O arquivo de julgamentos não foi encontrado."
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
        "Nenhum julgamento foi cadastrado."
      );
  }

  // ==========================================
  // ESCOLHE O CRIME
  // ==========================================

  const julgamento =
    dados[
      Math.floor(
        Math.random() *
        dados.length
      )
    ];

  // ==========================================
  // CULPADO OU INOCENTE
  // ==========================================

  const culpado =
    Math.random() < 0.5;

  let texto;

  if (culpado) {

    texto =
      julgamento.culpado
        .replaceAll(
          "{julgado}",
          `@${target}`
        )
        .replaceAll(
          "{envolvido}",
          `@${envolvido}`
        );

  } else {

    texto =
      julgamento.inocente
        .replaceAll(
          "{julgado}",
          `@${target}`
        )
        .replaceAll(
          "{envolvido}",
          `@${envolvido}`
        );
  }

  return res
    .status(200)
    .send(texto);
}
