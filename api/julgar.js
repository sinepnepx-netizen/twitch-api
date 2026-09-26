function limparNome(nome) {
  return String(nome || "")
    .replace(/^@+/, "")
    .trim();
}

const botsIgnorados = [
  "streamelements",
  "nightbot",
  "pokemoncommunitygame",
  "livepix",
  "twishgamebot",
  "sery_bot"
];

function escolher(lista) {
  return lista[
    Math.floor(Math.random() * lista.length)
  ];
}

const julgamentos = [
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma joalheria. As provas mostram que @TARGET planejou o crime e @TERCEIRO ajudou na fuga. 💎",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE no caso do roubo de uma joalheria. @TARGET acabou sendo vítima de uma armação, enquanto @TERCEIRO foi identificado como envolvido no crime. 💎"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo assalto a um banco. @TERCEIRO foi identificado como cúmplice durante a investigação. 🏦",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE no assalto ao banco. As provas mostraram que @TARGET foi incriminado injustamente, enquanto @TERCEIRO apareceu ligado ao crime. 🏦"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo desaparecimento de uma coleção de videogames. @TERCEIRO ajudou a esconder os objetos roubados. 🎮",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo desaparecimento da coleção de videogames. @TARGET foi vítima de uma armação, e @TERCEIRO acabou sendo relacionado ao desaparecimento. 🎮"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela invasão de uma mansão. @TERCEIRO foi identificado como cúmplice do crime. 🏠",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão da mansão. A investigação mostrou que @TARGET foi acusado injustamente, enquanto @TERCEIRO estava envolvido no caso. 🏠"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo desaparecimento de um diamante. @TERCEIRO ajudou a esconder a joia. 💎",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo desaparecimento do diamante. @TARGET foi vítima de uma armação e @TERCEIRO acabou sendo apontado como envolvido no crime. 💎"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma obra de arte. @TERCEIRO foi identificado como cúmplice. 🖼️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da obra de arte. As provas mostraram que @TARGET foi incriminado, enquanto @TERCEIRO estava envolvido no caso. 🖼️"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por uma fraude milionária. @TERCEIRO participou do esquema. 💰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela fraude milionária. @TARGET foi vítima de uma armação e @TERCEIRO acabou ligado ao golpe. 💰"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por contrabando de objetos raros. @TERCEIRO ajudou no transporte. 📦",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo contrabando de objetos raros. A investigação mostrou que @TARGET foi incriminado, enquanto @TERCEIRO estava envolvido. 📦"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de um carro esportivo. @TERCEIRO ajudou na fuga. 🚗",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo do carro esportivo. @TARGET foi vítima de uma armação e @TERCEIRO acabou relacionado ao crime. 🚗"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo sequestro de uma celebridade. @TERCEIRO foi identificado como cúmplice. 🚨",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo sequestro. A investigação mostrou que @TARGET foi incriminado injustamente, enquanto @TERCEIRO estava envolvido no caso. 🚨"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de documentos secretos. @TERCEIRO forneceu acesso ao local. 📁",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo dos documentos. @TARGET foi vítima de uma armação e @TERCEIRO acabou relacionado ao desaparecimento. 📁"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela sabotagem de uma empresa. @TERCEIRO participou do plano. 💻",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela sabotagem. As provas mostraram que @TARGET foi incriminado e @TERCEIRO estava envolvido no caso. 💻"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de dinheiro de um cassino. @TERCEIRO participou do esquema. 🎰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo do cassino. @TARGET foi vítima de uma armação e @TERCEIRO acabou ligado ao crime. 🎰"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela invasão de um laboratório. @TERCEIRO ajudou durante a invasão. 🧪",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão do laboratório. @TARGET foi incriminado injustamente e @TERCEIRO apareceu ligado ao caso. 🧪"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma coroa real. @TERCEIRO ajudou no plano. 👑",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da coroa. @TARGET foi vítima de uma armação e @TERCEIRO acabou envolvido na investigação. 👑"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por falsificação de documentos. @TERCEIRO participou do esquema. 📜",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela falsificação. As provas mostraram que @TARGET foi incriminado e @TERCEIRO estava ligado ao caso. 📜"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma carga de ouro. @TERCEIRO ajudou a esconder o ouro. 🪙",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da carga de ouro. @TARGET foi vítima de uma armação e @TERCEIRO acabou relacionado ao crime. 🪙"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela destruição de uma obra histórica. @TERCEIRO foi cúmplice. 🏛️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela destruição da obra histórica. @TARGET foi incriminado injustamente e @TERCEIRO apareceu envolvido no caso. 🏛️"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma relíquia antiga. @TERCEIRO ajudou a esconder o artefato. 🗿",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da relíquia. @TARGET foi vítima de uma armação e @TERCEIRO acabou ligado ao desaparecimento. 🗿"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por espionagem. @TERCEIRO forneceu informações secretas. 🕵️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE por espionagem. A investigação mostrou que @TARGET foi incriminado, enquanto @TERCEIRO estava envolvido no caso. 🕵️"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma fórmula secreta. @TERCEIRO ajudou no crime. 🧪",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da fórmula. @TARGET foi vítima de uma armação e @TERCEIRO acabou relacionado ao caso. 🧪"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por extorsão. @TERCEIRO participou da execução do plano. 💰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE por extorsão. @TARGET foi vítima de uma armação e @TERCEIRO apareceu ligado ao caso. 💰"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela invasão de um cofre. @TERCEIRO ajudou durante o crime. 🔐",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão do cofre. As provas mostraram que @TARGET foi incriminado e @TERCEIRO estava envolvido. 🔐"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma fortuna. @TERCEIRO ajudou na fuga. 💰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da fortuna. @TARGET foi vítima de uma armação e @TERCEIRO acabou relacionado ao crime. 💰"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela sabotagem de um trem. @TERCEIRO participou do plano. 🚂",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela sabotagem do trem. @TARGET foi incriminado injustamente e @TERCEIRO apareceu ligado ao caso. 🚂"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma espada lendária. @TERCEIRO ajudou a escondê-la. ⚔️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da espada lendária. @TARGET foi vítima de uma armação e @TERCEIRO acabou envolvido no caso. ⚔️"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela invasão de uma fortaleza. @TERCEIRO participou do ataque. 🏰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão da fortaleza. As provas mostraram que @TARGET foi incriminado e @TERCEIRO estava envolvido. 🏰"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma pintura milionária. @TERCEIRO foi cúmplice. 🎨",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da pintura. @TARGET foi vítima de uma armação e @TERCEIRO acabou relacionado ao crime. 🎨"
  },

  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por manipular um campeonato. @TERCEIRO participou do esquema. 🏆",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela manipulação do campeonato. @TARGET foi incriminado injustamente e @TERCEIRO acabou envolvido no caso. 🏆"
  }
];

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

  const userLower = user.toLowerCase();
  const targetLower = target.toLowerCase();

  const candidatos = [];

  for (let i = 1; i <= 10; i++) {

    if (!req.query[`target${i}`]) {
      continue;
    }

    const nome =
      limparNome(req.query[`target${i}`]);

    const nomeLower =
      nome.toLowerCase();

    if (
      nomeLower !== userLower &&
      nomeLower !== targetLower &&
      !botsIgnorados.includes(nomeLower)
    ) {
      candidatos.push(nome);
    }
  }

  if (candidatos.length === 0) {
    return res
      .status(200)
      .send(
        `⚖️ Não encontrei outra pessoa válida no chat para participar do julgamento de @${target}.`
      );
  }

  const terceiro = escolher(candidatos);
  const julgamento = escolher(julgamentos);

  const culpado = Math.random() < 0.5;

  const texto = culpado
    ? julgamento.culpado
    : julgamento.inocente;

  const resultado = texto
    .replaceAll("@TARGET", `@${target}`)
    .replaceAll("@TERCEIRO", `@${terceiro}`);

  return res
    .status(200)
    .send(resultado);
}
