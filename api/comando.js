import fs from "fs";
import path from "path";

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

  // Compatibilidade com os comandos antigos
  // que usam apenas um array de frases.
  const frases = Array.isArray(dados)
    ? dados
    : dados.frases;

  if (!Array.isArray(frases) || frases.length === 0) {
    return res.status(500).send("Nenhuma frase encontrada.");
  }

  // Só gera número se o comando tiver
  // "min" e "max" configurados no JSON.
  let numero = "";

  if (
    !Array.isArray(dados) &&
    typeof dados.min === "number" &&
    typeof dados.max === "number"
  ) {
    numero =
      Math.floor(
        Math.random() * (dados.max - dados.min + 1)
      ) + dados.min;
  }

  const frase =
    frases[Math.floor(Math.random() * frases.length)]
      .replaceAll("{user}", user)
      .replaceAll("{target}", target)
      .replaceAll("{numero}", String(numero));

  res.setHeader(
    "Content-Type",
    "text/plain; charset=utf-8"
  );

  res.status(200).send(frase);
}
