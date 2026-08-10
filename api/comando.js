import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { comando, user = "Alguém", target = "Alguém" } = req.query;

  const arquivo = path.join(
    process.cwd(),
    "frases",
    `${comando}.json`
  );

  if (!fs.existsSync(arquivo)) {
    return res.status(404).send("Comando não encontrado.");
  }

  const frases = JSON.parse(
    fs.readFileSync(arquivo, "utf8")
  );

  const frase =
    frases[Math.floor(Math.random() * frases.length)]
      .replaceAll("{user}", user)
      .replaceAll("{target}", target);

  res.setHeader(
    "Content-Type",
    "text/plain; charset=utf-8"
  );

  res.status(200).send(frase);
}
