import fs from "fs";
import path from "path";

const historico = {
  violencia: [],
  sexo: []
};

export default function handler(req, res) {

  const {
    comando,
    user = "Alguém",
    target = "Alguém"
  } = req.query;

  const arquivo = path.join(
    process.cwd(),
    "frases",
    `${comando}.json`
  );

  if (!fs.existsSync(arquivo)) {
    return res.status(404).send("Comando não encontrado.");
  }

  const dados = JSON.parse(
    fs.readFileSync(arquivo, "utf8")
  );

  const frases = Array.isArray(dados)
    ? dados
    : dados.frases;

  if (!Array.isArray(frases) || frases.length === 0) {
    return res.status(500).send("Nenhuma frase encontrada.");
  }

  // =========================
  // NÚMERO ALEATÓRIO
  // =========================

  let numero = "";

  if (
    !Array.isArray(dados) &&
    typeof dados.min === "number" &&
    typeof dados.max === "number"
  ) {
    numero =
      Math.floor(
        Math.random() *
        (dados.max - dados.min + 1)
      ) + dados.min;
  }

  // =========================
  // ESCOLHA DA FRASE
  // =========================

  let indice;

  if (
    (comando === "violencia" || comando === "sexo") &&
    frases.length > 1
  ) {

    let ultimas = historico[comando];

    let disponiveis = frases
      .map((_, i) => i)
      .filter(i => !ultimas.includes(i));

    // Se todas estiverem bloqueadas,
    // libera novamente as frases.
    if (disponiveis.length === 0) {
      ultimas = [];
      historico[comando] = [];
      disponiveis = frases.map((_, i) => i);
    }

    indice =
      disponiveis[
        Math.floor(
          Math.random() * disponiveis.length
        )
      ];

    ultimas.push(indice);

    // Não deixa repetir nenhuma das últimas 5
    if (ultimas.length > 5) {
      ultimas.shift();
    }

    historico[comando] = ultimas;

  } else {

    indice =
      Math.floor(
        Math.random() * frases.length
      );
  }

  // =========================
  // RESPOSTA
  // =========================

  const frase =
    frases[indice]
      .replaceAll("{user}", user)
      .replaceAll("{target}", target)
      .replaceAll("{numero}", String(numero));

  res.setHeader(
    "Content-Type",
    "text/plain; charset=utf-8"
  );

  res.status(200).send(frase);
}
