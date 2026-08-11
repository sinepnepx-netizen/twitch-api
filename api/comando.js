import fs from "fs";
import path from "path";

// Guarda as últimas frases usadas de cada comando
const historicoComandos = new Map();

const MAX_REPETICOES = 3;

export default function handler(req, res) {
  const {
    comando,
    user = "Alguém",
    target = "Alguém"
  } = req.query;

  if (!comando) {
    return res.status(400).send("Comando não informado.");
  }

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

  // Compatibilidade com comandos antigos
  const frases = Array.isArray(dados)
    ? dados
    : dados.frases;

  if (!Array.isArray(frases) || frases.length === 0) {
    return res.status(500).send("Nenhuma frase encontrada.");
  }

  // =========================
  // ANTI-REPETIÇÃO
  // =========================

  let historico = historicoComandos.get(comando) || [];

  // Remove as frases que apareceram nos últimos 3 usos
  let frasesDisponiveis = frases.filter(
    (_, index) => !historico.includes(index)
  );

  // Se não houver frases suficientes,
  // limpa o histórico e permite sortear novamente.
  if (frasesDisponiveis.length === 0) {
    historico = [];
    frasesDisponiveis = frases.map((_, index) => index);
  }

  // Sorteia uma frase entre as disponíveis
  const indice =
    frasesDisponiveis[
      Math.floor(Math.random() * frasesDisponiveis.length)
    ];

  // Atualiza histórico
  historico.push(indice);

  if (historico.length > MAX_REPETICOES) {
    historico.shift();
  }

  historicoComandos.set(comando, historico);

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
        Math.random() * (dados.max - dados.min + 1)
      ) + dados.min;
  }

  // =========================
  // RESPOSTA
  // =========================

  const frase = frases[indice]
    .replaceAll("{user}", user)
    .replaceAll("{target}", target)
    .replaceAll("{numero}", String(numero));

  res.setHeader(
    "Content-Type",
    "text/plain; charset=utf-8"
  );

  res.status(200).send(frase);
}
