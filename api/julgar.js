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

function escolher(lista) {
  return lista[
    Math.floor(Math.random() * lista.length)
  ];
}

const julgamentos = [
  {
    crime: "roubo de uma joalheria",
    culpado: "@{target} foi considerado culpado por planejar o roubo da joalheria junto com @{terceiro}. 💎",
    inocente: "@{target} foi considerado inocente no roubo da joalheria. A verdadeira vítima foi @{terceiro}, que estava no local na hora do crime. 💎"
  },
  {
    crime: "assalto a um banco",
    culpado: "@{target} foi considerado culpado pelo assalto ao banco e @{terceiro} acabou sendo identificado como cúmplice. 🏦",
    inocente: "@{target} foi considerado inocente pelo assalto ao banco. @{terceiro} acabou sendo a verdadeira vítima do crime. 🏦"
  },
  {
    crime: "furto de uma coleção de videogames",
    culpado: "@{target} foi considerado culpado por roubar uma coleção inteira de videogames com ajuda de @{terceiro}. 🎮",
    inocente: "@{target} foi considerado inocente pelo furto da coleção de videogames. @{terceiro} foi quem acabou levando a culpa injustamente. 🎮"
  },
  {
    crime: "invasão de uma mansão",
    culpado: "@{target} foi considerado culpado pela invasão da mansão. @{terceiro} estava envolvido como cúmplice. 🏠",
    inocente: "@{target} foi considerado inocente pela invasão da mansão. @{terceiro} era a pessoa que estava dentro da casa durante o crime. 🏠"
  },
  {
    crime: "desaparecimento de um diamante",
    culpado: "@{target} foi considerado culpado pelo desaparecimento do diamante, enquanto @{terceiro} ajudou a esconder a joia. 💎",
    inocente: "@{target} foi considerado inocente pelo desaparecimento do diamante. @{terceiro} foi a pessoa que encontrou a joia primeiro. 💎"
  },
  {
    crime: "roubo de uma obra de arte",
    culpado: "@{target} foi considerado culpado pelo roubo da obra de arte e @{terceiro} foi seu cúmplice. 🖼️",
    inocente: "@{target} foi considerado inocente pelo roubo da obra de arte. @{terceiro} acabou sendo a vítima que estava no museu. 🖼️"
  },
  {
    crime: "fraude milionária",
    culpado: "@{target} foi considerado culpado por aplicar uma fraude milionária com a ajuda de @{terceiro}. 💰",
    inocente: "@{target} foi considerado inocente pela fraude milionária. @{terceiro} foi quem caiu no golpe. 💰"
  },
  {
    crime: "contrabando de objetos raros",
    culpado: "@{target} foi considerado culpado por contrabandear objetos raros junto com @{terceiro}. 📦",
    inocente: "@{target} foi considerado inocente pelo contrabando. @{terceiro} era quem transportava os objetos. 📦"
  },
  {
    crime: "roubo de um carro esportivo",
    culpado: "@{target} foi considerado culpado pelo roubo do carro esportivo. @{terceiro} ajudou na fuga. 🚗",
    inocente: "@{target} foi considerado inocente pelo roubo do carro esportivo. @{terceiro} foi quem encontrou o carro abandonado. 🚗"
  },
  {
    crime: "sequestro de uma celebridade",
    culpado: "@{target} foi considerado culpado pelo sequestro e @{terceiro} foi identificado como cúmplice. 🚨",
    inocente: "@{target} foi considerado inocente pelo sequestro. @{terceiro} era a pessoa que estava sendo mantida como vítima. 🚨"
  },
  {
    crime: "roubo de documentos secretos",
    culpado: "@{target} foi considerado culpado pelo roubo de documentos secretos. @{terceiro} forneceu acesso ao local. 📁",
    inocente: "@{target} foi considerado inocente pelo roubo dos documentos. @{terceiro} foi encontrado com os documentos. 📁"
  },
  {
    crime: "sabotagem de uma empresa",
    culpado: "@{target} foi considerado culpado pela sabotagem da empresa junto com @{terceiro}. 💻",
    inocente: "@{target} foi considerado inocente pela sabotagem. @{terceiro} foi quem descobriu o problema primeiro. 💻"
  },
  {
    crime: "roubo de dinheiro de um cassino",
    culpado: "@{target} foi considerado culpado pelo roubo do cassino e @{terceiro} participou do plano. 🎰",
    inocente: "@{target} foi considerado inocente pelo roubo do cassino. @{terceiro} foi a pessoa que perdeu dinheiro no golpe. 🎰"
  },
  {
    crime: "invasão de um laboratório",
    culpado: "@{target} foi considerado culpado pela invasão do laboratório com a ajuda de @{terceiro}. 🧪",
    inocente: "@{target} foi considerado inocente pela invasão do laboratório. @{terceiro} foi encontrado dentro do laboratório. 🧪"
  },
  {
    crime: "roubo de uma coroa real",
    culpado: "@{target} foi considerado culpado por roubar a coroa real. @{terceiro} ajudou no plano. 👑",
    inocente: "@{target} foi considerado inocente pelo roubo da coroa. @{terceiro} era quem estava protegendo o objeto. 👑"
  },
  {
    crime: "falsificação de documentos",
    culpado: "@{target} foi considerado culpado por falsificar documentos com ajuda de @{terceiro}. 📜",
    inocente: "@{target} foi considerado inocente pela falsificação. @{terceiro} foi quem apresentou os documentos falsos. 📜"
  },
  {
    crime: "roubo de uma carga de ouro",
    culpado: "@{target} foi considerado culpado pelo roubo da carga de ouro. @{terceiro} ajudou a esconder o ouro. 🪙",
    inocente: "@{target} foi considerado inocente pelo roubo da carga. @{terceiro} foi encontrado perto do esconderijo. 🪙"
  },
  {
    crime: "destruição de uma obra histórica",
    culpado: "@{target} foi considerado culpado por destruir a obra histórica junto com @{terceiro}. 🏛️",
    inocente: "@{target} foi considerado inocente pela destruição. @{terceiro} foi a pessoa que testemunhou tudo. 🏛️"
  },
  {
    crime: "roubo de uma relíquia antiga",
    culpado: "@{target} foi considerado culpado pelo roubo da relíquia e @{terceiro} ajudou a esconder o artefato. 🗿",
    inocente: "@{target} foi considerado inocente pelo roubo da relíquia. @{terceiro} foi quem encontrou o artefato. 🗿"
  },
  {
    crime: "espionagem",
    culpado: "@{target} foi considerado culpado por espionagem e @{terceiro} forneceu informações secretas. 🕵️",
    inocente: "@{target} foi considerado inocente por espionagem. @{terceiro} era quem estava sendo investigado. 🕵️"
  },
  {
    crime: "roubo de uma fórmula secreta",
    culpado: "@{target} foi considerado culpado pelo roubo da fórmula secreta com ajuda de @{terceiro}. 🧪",
    inocente: "@{target} foi considerado inocente pelo roubo da fórmula. @{terceiro} foi quem encontrou a fórmula desaparecida. 🧪"
  },
  {
    crime: "extorsão",
    culpado: "@{target} foi considerado culpado por extorsão e @{terceiro} ajudou a executar o plano. 💰",
    inocente: "@{target} foi considerado inocente pela extorsão. @{terceiro} foi quem recebeu as ameaças. 💰"
  },
  {
    crime: "roubo de uma relíquia de museu",
    culpado: "@{target} foi considerado culpado pelo roubo da relíquia do museu. @{terceiro} foi cúmplice. 🏺",
    inocente: "@{target} foi considerado inocente pelo roubo da relíquia. @{terceiro} era o segurança que estava no local. 🏺"
  },
  {
    crime: "invasão de um cofre",
    culpado: "@{target} foi considerado culpado por invadir o cofre junto com @{terceiro}. 🔐",
    inocente: "@{target} foi considerado inocente pela invasão do cofre. @{terceiro} foi encontrado perto do cofre. 🔐"
  },
  {
    crime: "roubo de uma fortuna",
    culpado: "@{target} foi considerado culpado por roubar uma fortuna e @{terceiro} ajudou na fuga. 💰",
    inocente: "@{target} foi considerado inocente pelo roubo da fortuna. @{terceiro} foi quem perdeu todo o dinheiro. 💰"
  },
  {
    crime: "sabotagem de um trem",
    culpado: "@{target} foi considerado culpado pela sabotagem do trem. @{terceiro} participou do plano. 🚂",
    inocente: "@{target} foi considerado inocente pela sabotagem do trem. @{terceiro} era um passageiro envolvido no caso. 🚂"
  },
  {
    crime: "roubo de uma espada lendária",
    culpado: "@{target} foi considerado culpado pelo roubo da espada lendária. @{terceiro} ajudou a escondê-la. ⚔️",
    inocente: "@{target} foi considerado inocente pelo roubo da espada. @{terceiro} foi quem encontrou a arma. ⚔️"
  },
  {
    crime: "invasão de uma fortaleza",
    culpado: "@{target} foi considerado culpado pela invasão da fortaleza junto com @{terceiro}. 🏰",
    inocente: "@{target} foi considerado inocente pela invasão da fortaleza. @{terceiro} estava dentro dela durante o ataque. 🏰"
  },
  {
    crime: "roubo de uma pintura milionária",
    culpado: "@{target} foi considerado culpado pelo roubo da pintura milionária. @{terceiro} foi cúmplice. 🎨",
    inocente: "@{target} foi considerado inocente pelo roubo da pintura. @{terceiro} era o proprietário da obra. 🎨"
  },
  {
    crime: "fraude em um campeonato",
    culpado: "@{target} foi considerado culpado por manipular o campeonato junto com @{terceiro}. 🏆",
    inocente: "@{target} foi considerado inocente pela fraude no campeonato. @{terceiro} foi quem acabou prejudicado. 🏆"
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

    const candidato =
      req.query[`target${i}`];

    if (candidato) {
      const nome = limparNome(candidato);

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
  }

  if (candidatos.length === 0) {
    return res
      .status(200)
      .send(
        `⚖️ Não encontrei outra pessoa válida no chat para participar do julgamento de @${target}.`
      );
  }

  const terceiro =
    escolher(candidatos);

  const julgamento =
    escolher(julgamentos);

  const culpado =
    Math.random() < 0.5;

  const texto =
    culpado
      ? julgamento.culpado
      : julgamento.inocente;

  const resultado =
    texto
      .replaceAll("{target}", `@${target}`)
      .replaceAll("{terceiro}", `@${terceiro}`);

  return res
    .status(200)
    .send(
      `⚖️ JULGAMENTO: ${resultado}`
    );
}
