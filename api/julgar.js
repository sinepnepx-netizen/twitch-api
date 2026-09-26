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
  return lista[Math.floor(Math.random() * lista.length)];
}

const julgamentos = [
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma joia rara. @TERCEIRO foi visto ajudando na fuga. 💎🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE do roubo de uma joia rara. O verdadeiro culpado era @TERCEIRO. 💎🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por assaltar um banco. @TERCEIRO participou do plano. 🏦💰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE do assalto ao banco. @TERCEIRO era quem estava por trás do crime. 🏦💰"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar um carro esportivo. @TERCEIRO ajudou a esconder o veículo. 🚗💨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo do carro esportivo. @TERCEIRO acabou sendo identificado como o ladrão. 🚗💨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por desaparecer com uma coleção de videogames. @TERCEIRO ajudou a transportar tudo. 🎮📦",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo desaparecimento da coleção de videogames. @TERCEIRO estava com os jogos escondidos. 🎮📦"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma obra de arte. @TERCEIRO ajudou a tirá-la do museu. 🖼️🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da obra de arte. @TERCEIRO foi quem a retirou do museu. 🖼️🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por aplicar um golpe financeiro. @TERCEIRO ajudou a movimentar o dinheiro. 💰📉",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo golpe financeiro. @TERCEIRO era o responsável pela fraude. 💰📉"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar um diamante gigantesco. @TERCEIRO serviu como cúmplice. 💎😈",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo do diamante. @TERCEIRO foi quem colocou o plano em prática. 💎😈"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir uma mansão. @TERCEIRO ficou responsável pela fuga. 🏠🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão da mansão. @TERCEIRO foi encontrado dentro da propriedade. 🏠🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma carga de ouro. @TERCEIRO ajudou no transporte. 🪙🚚",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da carga de ouro. @TERCEIRO foi quem desviou o carregamento. 🪙🚚"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por falsificar documentos oficiais. @TERCEIRO forneceu os documentos originais. 📄🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela falsificação de documentos. @TERCEIRO foi identificado como o falsificador. 📄🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma relíquia histórica. @TERCEIRO ajudou a escondê-la. 🏺🕵️",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da relíquia histórica. @TERCEIRO estava com a peça desaparecida. 🏺🕵️"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por espionagem. @TERCEIRO entregava as informações secretas. 🕵️📡",
    inocente: "⚖️ @TARGET foi julgado INOCENTE por espionagem. @TERCEIRO era quem estava passando informações secretas. 🕵️📡"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por sabotar uma empresa. @TERCEIRO forneceu acesso ao prédio. 🏢💥",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela sabotagem da empresa. @TERCEIRO foi quem invadiu o sistema. 🏢💥"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar documentos secretos. @TERCEIRO ajudou na invasão. 📁🔐",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo dos documentos secretos. @TERCEIRO foi encontrado com os arquivos. 📁🔐"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir um laboratório. @TERCEIRO ajudou a desligar os alarmes. 🧪🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão do laboratório. @TERCEIRO desligou os alarmes e entrou primeiro. 🧪🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar a coroa de um reino. @TERCEIRO ajudou na fuga. 👑🏃",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da coroa. @TERCEIRO foi visto saindo do castelo com ela. 👑🏃"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma pintura milionária. @TERCEIRO ajudou a trocar a obra. 🖼️💰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da pintura milionária. @TERCEIRO foi quem fez a troca. 🖼️💰"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir um cofre. @TERCEIRO descobriu a combinação. 🔐💰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão do cofre. @TERCEIRO conhecia a combinação e roubou tudo. 🔐💰"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por desaparecer com uma fortuna. @TERCEIRO ajudou a esconder o dinheiro. 💰🕵️",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo desaparecimento da fortuna. @TERCEIRO estava escondendo o dinheiro. 💰🕵️"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por sabotar um trem. @TERCEIRO ajudou a planejar o ataque. 🚂💥",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela sabotagem do trem. @TERCEIRO foi quem colocou o plano em prática. 🚂💥"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma espada lendária. @TERCEIRO ajudou a atravessar a fortaleza. ⚔️🏰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da espada lendária. @TERCEIRO foi quem saiu da fortaleza com ela. ⚔️🏰"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir uma fortaleza. @TERCEIRO abriu os portões por dentro. 🏰⚔️",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão da fortaleza. @TERCEIRO abriu os portões e liderou o ataque. 🏰⚔️"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por manipular o resultado de um campeonato. @TERCEIRO ajudou no esquema. 🏆🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela manipulação do campeonato. @TERCEIRO foi quem fraudou os resultados. 🏆🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar ingressos de um grande evento. @TERCEIRO ajudou a vender os ingressos. 🎟️💰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo dos ingressos. @TERCEIRO estava vendendo os bilhetes roubados. 🎟️💰"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma coleção de moedas raras. @TERCEIRO ajudou a esconder as moedas. 🪙🔍",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo das moedas raras. @TERCEIRO foi encontrado com a coleção. 🪙🔍"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar um mapa antigo. @TERCEIRO ajudou a decifrá-lo. 🗺️🕵️",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo do mapa antigo. @TERCEIRO foi quem o levou. 🗺️🕵️"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por sabotar um concurso. @TERCEIRO ajudou a manipular as inscrições. 📝🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela sabotagem do concurso. @TERCEIRO alterou as inscrições. 📝🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma coleção de cartas raras. @TERCEIRO ajudou a vender as cartas. 🃏💰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo das cartas raras. @TERCEIRO apareceu vendendo a coleção. 🃏💰"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir uma biblioteca histórica. @TERCEIRO ajudou a remover os livros raros. 📚🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão da biblioteca. @TERCEIRO foi quem roubou os livros raros. 📚🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma estátua histórica. @TERCEIRO ajudou no transporte. 🗿🚚",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da estátua. @TERCEIRO foi quem organizou o transporte. 🗿🚚"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por destruir uma obra histórica. @TERCEIRO ajudou a esconder as provas. 🏛️🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela destruição da obra histórica. @TERCEIRO foi identificado como responsável. 🏛️🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar equipamentos de uma escola. @TERCEIRO ajudou a carregar tudo. 🏫📦",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo dos equipamentos escolares. @TERCEIRO foi visto levando tudo. 🏫📦"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir um estádio. @TERCEIRO ajudou a entrar sem autorização. 🏟️🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão do estádio. @TERCEIRO foi quem entrou sem autorização. 🏟️🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar equipamentos de uma emissora. @TERCEIRO ajudou a transportar o material. 📺🚚",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo dos equipamentos da emissora. @TERCEIRO foi encontrado com o material. 📺🚚"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir um servidor privado. @TERCEIRO forneceu a senha. 💻🔐",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão do servidor. @TERCEIRO forneceu a senha e entrou no sistema. 💻🔐"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar informações de uma empresa. @TERCEIRO ajudou a copiar os arquivos. 💻📁",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo das informações. @TERCEIRO copiou os arquivos e levou tudo. 💻📁"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por falsificar uma assinatura. @TERCEIRO forneceu o documento falsificado. ✍️🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela falsificação da assinatura. @TERCEIRO foi quem falsificou o documento. ✍️🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma peça de museu. @TERCEIRO ajudou a retirar a peça. 🏛️💎",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da peça do museu. @TERCEIRO foi quem a retirou. 🏛️💎"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por aplicar um golpe financeiro. @TERCEIRO recebeu parte do dinheiro. 💰🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo golpe financeiro. @TERCEIRO recebeu o dinheiro e organizou a fraude. 💰🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma medalha histórica. @TERCEIRO ajudou a escondê-la. 🏅🕵️",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da medalha histórica. @TERCEIRO estava escondendo a medalha. 🏅🕵️"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por alterar documentos de um concurso. @TERCEIRO ajudou a falsificar os resultados. 📄🏆",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela alteração dos documentos do concurso. @TERCEIRO falsificou os resultados. 📄🏆"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO pelo desaparecimento de uma obra rara. @TERCEIRO ajudou a escondê-la. 🖼️🔎",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo desaparecimento da obra rara. @TERCEIRO estava com a obra escondida. 🖼️🔎"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma coleção de troféus. @TERCEIRO ajudou no transporte. 🏆🚚",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo dos troféus. @TERCEIRO foi visto transportando a coleção. 🏆🚚"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por invadir uma estação de rádio. @TERCEIRO ajudou a desligar os sistemas. 📻🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela invasão da estação de rádio. @TERCEIRO desligou os sistemas e entrou no local. 📻🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma coleção de relógios. @TERCEIRO ajudou a vender as peças. ⌚💰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo dos relógios. @TERCEIRO foi quem vendeu a coleção roubada. ⌚💰"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma fórmula secreta. @TERCEIRO ajudou a copiar os documentos. 🧪🔐",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da fórmula secreta. @TERCEIRO foi quem copiou os documentos. 🧪🔐"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por destruir provas de um crime. @TERCEIRO ajudou a esconder os vestígios. 🚨🕵️",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela destruição das provas. @TERCEIRO foi quem eliminou os vestígios. 🚨🕵️"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma peça arqueológica. @TERCEIRO ajudou a retirar a peça do local. 🏺🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da peça arqueológica. @TERCEIRO foi quem a retirou do local. 🏺🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por fraudar um campeonato. @TERCEIRO ajudou a manipular os resultados. 🏆🚨",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pela fraude no campeonato. @TERCEIRO manipulou os resultados. 🏆🚨"
  },
  {
    culpado: "⚖️ @TARGET foi julgado CULPADO por roubar uma fortuna guardada em um cofre. @TERCEIRO ajudou a abrir o cofre. 🔐💰",
    inocente: "⚖️ @TARGET foi julgado INOCENTE pelo roubo da fortuna. @TERCEIRO conhecia a combinação e abriu o cofre. 🔐💰"
  }
];

export default function handler(req, res) {
  try {
    const user = limparNome(req.query.user);
    const target = limparNome(req.query.target);

    if (!target) {
      return res.status(200).send(
        `⚖️ @${user || "Alguém"}, você precisa marcar alguém para ser julgado!`
      );
    }

    const userLower = user.toLowerCase();
    const targetLower = target.toLowerCase();

    const candidatos = [];

    for (let i = 1; i <= 10; i++) {
      const valor = req.query[`target${i}`];

      if (!valor) {
        continue;
      }

      const nome = limparNome(valor);

      if (!nome) {
        continue;
      }

      const nomeLower = nome.toLowerCase();

      if (nomeLower === userLower) {
        continue;
      }

      if (nomeLower === targetLower) {
        continue;
      }

      if (botsIgnorados.includes(nomeLower)) {
        continue;
      }

      const jaExiste = candidatos.some(
        (item) => item.toLowerCase() === nomeLower
      );

      if (!jaExiste) {
        candidatos.push(nome);
      }
    }

    if (candidatos.length === 0) {
      return res.status(200).send(
        `⚖️ Não encontrei outra pessoa válida no chat para participar do julgamento de @${target}.`
      );
    }

    const terceiro = escolher(candidatos);
    const julgamento = escolher(julgamentos);

    const culpado = Math.random() < 0.5;

    let texto;

    if (culpado) {
      texto = julgamento.culpado;
    } else {
      texto = julgamento.inocente;
    }

    texto = texto
      .split("@TARGET")
      .join(`@${target}`)
      .split("@TERCEIRO")
      .join(`@${terceiro}`);

    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    return res.status(200).send(texto);

  } catch (erro) {
    console.error("Erro em /api/julgar:", erro);

    return res.status(500).send(
      "Erro interno no julgamento."
    );
  }
}
