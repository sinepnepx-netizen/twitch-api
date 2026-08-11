import fs from "fs";
import path from "path";

const ciclos = {
  violencia: [],
  sexo: []
};

function embaralhar(lista) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}

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

  let indice;

  if (
    (comando === "violencia" || comando === "sexo") &&
    frases.length > 1
  ) {

    if (ciclos[comando].length === 0) {
      ciclos[comando] = embaralhar(
        frases.map((_, index) => index)
      );
    }

    indice = ciclos[comando].shift();

  } else {

    indice =
      Math.floor(
        Math.random() * frases.length
      );
  }

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
