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

  // 1
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma joalheria. As câmeras mostraram @TARGET entrando no estabelecimento durante a madrugada, enquanto @TERCEIRO ajudou na fuga. 💎",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo de uma joalheria. As câmeras provaram que @TARGET estava em outro lugar no momento do crime, enquanto @TERCEIRO foi identificado como responsável pelo roubo. 💎"
  },

  // 2
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo assalto a um banco. As provas mostraram que @TARGET participou do planejamento, enquanto @TERCEIRO forneceu informações sobre o sistema de segurança. 🏦",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo assalto ao banco. Os registros mostraram que @TARGET sequer estava na cidade no momento do crime, e @TERCEIRO foi identificado como um dos envolvidos. 🏦"
  },

  // 3
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de um carro esportivo. Uma testemunha reconheceu @TARGET no local, enquanto @TERCEIRO ajudou a esconder o veículo. 🚗",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo do carro esportivo. Uma gravação mostrou que @TARGET estava longe do local, e @TERCEIRO foi encontrado com o veículo roubado. 🚗"
  },

  // 4
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo desaparecimento de uma coleção de videogames. @TARGET foi visto retirando os objetos do local, enquanto @TERCEIRO ajudou a transportá-los. 🎮",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo desaparecimento da coleção de videogames. As imagens mostraram que @TARGET não esteve no local, e @TERCEIRO foi flagrado transportando os objetos. 🎮"
  },

  // 5
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma obra de arte. As câmeras registraram @TARGET retirando a pintura, enquanto @TERCEIRO forneceu acesso ao prédio. 🖼️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da obra de arte. Uma gravação comprovou que @TARGET estava em outro local, e @TERCEIRO foi identificado entrando na galeria durante o crime. 🖼️"
  },

  // 6
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por uma fraude financeira. Os documentos mostraram que @TARGET participou do esquema, enquanto @TERCEIRO ajudou a movimentar o dinheiro. 💰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela fraude financeira. Os documentos provaram que @TARGET não participou das transações, e @TERCEIRO foi identificado como responsável pelo esquema. 💰"
  },

  // 7
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de um diamante. @TARGET foi visto deixando o local com a joia, enquanto @TERCEIRO ajudou a escondê-la. 💎",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo do diamante. A investigação mostrou que @TARGET não teve contato com a joia, enquanto @TERCEIRO foi encontrado tentando escondê-la. 💎"
  },

  // 8
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por invadir uma mansão. As câmeras registraram @TARGET dentro da propriedade, enquanto @TERCEIRO serviu como cúmplice. 🏠",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão da mansão. As imagens mostraram que @TARGET estava em outro lugar, enquanto @TERCEIRO foi registrado dentro da propriedade. 🏠"
  },

  // 9
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma carga de ouro. @TARGET participou da retirada da carga, enquanto @TERCEIRO ajudou a escondê-la. 🪙",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da carga de ouro. Os registros de localização afastaram @TARGET do crime, enquanto @TERCEIRO foi encontrado com parte da carga. 🪙"
  },

  // 10
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por falsificação de documentos. Os documentos falsificados foram encontrados com @TARGET, enquanto @TERCEIRO ajudou a produzi-los. 📜",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela falsificação de documentos. A perícia mostrou que os documentos não foram produzidos por @TARGET, e @TERCEIRO foi identificado como responsável pela falsificação. 📜"
  },

  // 11
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma relíquia histórica. @TARGET foi visto retirando a peça do museu, enquanto @TERCEIRO ajudou na fuga. 🗿",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da relíquia histórica. As imagens mostraram que @TARGET não esteve no museu, enquanto @TERCEIRO foi visto retirando a peça. 🗿"
  },

  // 12
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por espionagem. As mensagens encontradas mostraram que @TARGET repassava informações, enquanto @TERCEIRO fornecia os dados secretos. 🕵️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE por espionagem. As mensagens analisadas provaram que @TARGET não teve participação, enquanto @TERCEIRO era quem repassava as informações. 🕵️"
  },

  // 13
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela sabotagem de uma empresa. @TARGET foi registrado alterando equipamentos, enquanto @TERCEIRO ajudou no planejamento. 💻",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela sabotagem da empresa. Os registros mostraram que @TARGET não teve acesso aos equipamentos, enquanto @TERCEIRO foi identificado como responsável. 💻"
  },

  // 14
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de documentos secretos. @TARGET foi visto retirando os arquivos, enquanto @TERCEIRO forneceu acesso ao local. 📁",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo dos documentos. Os registros de acesso provaram que @TARGET não entrou no prédio, enquanto @TERCEIRO utilizou seu acesso para pegar os arquivos. 📁"
  },

  // 15
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por invadir um laboratório. As câmeras mostraram @TARGET dentro do laboratório, enquanto @TERCEIRO desligou o sistema de segurança. 🧪",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão do laboratório. O sistema de segurança mostrou que @TARGET não esteve no local, enquanto @TERCEIRO foi registrado entrando no prédio. 🧪"
  },

  // 16
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma coroa real. @TARGET foi encontrado tentando fugir com a coroa, enquanto @TERCEIRO abriu uma passagem secreta para a fuga. 👑",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da coroa. Uma testemunha confirmou que @TARGET não estava no castelo, enquanto @TERCEIRO foi visto fugindo com a coroa. 👑"
  },

  // 17
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma pintura milionária. @TARGET retirou a pintura da galeria, enquanto @TERCEIRO ajudou a transportá-la. 🎨",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da pintura. A investigação mostrou que @TARGET estava longe da galeria, enquanto @TERCEIRO foi encontrado transportando a obra. 🎨"
  },

  // 18
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por invadir um cofre. As imagens mostraram @TARGET abrindo o cofre, enquanto @TERCEIRO forneceu a combinação. 🔐",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão do cofre. A perícia mostrou que @TARGET não tinha acesso à combinação, enquanto @TERCEIRO utilizou o código para abrir o cofre. 🔐"
  },

  // 19
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo desaparecimento de uma fortuna. As transferências foram feitas por @TARGET, enquanto @TERCEIRO ajudou a esconder o dinheiro. 💰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo desaparecimento da fortuna. Os registros bancários mostraram que @TARGET não movimentou o dinheiro, enquanto @TERCEIRO realizou as transferências. 💰"
  },

  // 20
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela sabotagem de um trem. @TARGET foi registrado próximo aos controles, enquanto @TERCEIRO ajudou a desativar os sistemas de segurança. 🚂",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela sabotagem do trem. Os registros mostraram que @TARGET estava em outro local, enquanto @TERCEIRO foi identificado próximo aos controles. 🚂"
  },

  // 21
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma espada lendária. @TARGET foi visto retirando a espada, enquanto @TERCEIRO ajudou a escondê-la. ⚔️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da espada lendária. Uma testemunha confirmou que @TARGET não estava no local, enquanto @TERCEIRO foi encontrado escondendo a arma. ⚔️"
  },

  // 22
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pela invasão de uma fortaleza. @TARGET participou do ataque, enquanto @TERCEIRO abriu os portões para facilitar a entrada. 🏰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão da fortaleza. Os guardas confirmaram que @TARGET não participou do ataque, enquanto @TERCEIRO foi identificado abrindo os portões. 🏰"
  },

  // 23
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por manipular um campeonato. As mensagens mostraram que @TARGET combinou o resultado com @TERCEIRO. 🏆",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela manipulação do campeonato. As mensagens provaram que @TARGET não participou do esquema, enquanto @TERCEIRO foi identificado combinando os resultados. 🏆"
  },

  // 24
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de ingressos de um evento. @TARGET foi visto retirando os ingressos, enquanto @TERCEIRO ajudou a revendê-los. 🎟️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo dos ingressos. Os registros mostraram que @TARGET não teve acesso aos ingressos, enquanto @TERCEIRO foi identificado revendendo o material. 🎟️"
  },

  // 25
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar uma coleção de moedas raras. @TARGET foi visto entrando no local, enquanto @TERCEIRO ajudou a esconder as moedas. 🪙",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo das moedas raras. As câmeras mostraram que @TARGET não entrou no local, enquanto @TERCEIRO foi encontrado com a coleção. 🪙"
  },

  // 26
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar um mapa antigo. @TARGET retirou o mapa do arquivo, enquanto @TERCEIRO ajudou a escondê-lo. 🗺️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo do mapa antigo. Os registros provaram que @TARGET não entrou no arquivo, enquanto @TERCEIRO foi visto retirando o mapa. 🗺️"
  },

  // 27
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por sabotar um concurso. @TARGET alterou os resultados, enquanto @TERCEIRO forneceu acesso ao sistema. 🏆",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela sabotagem do concurso. Os registros do sistema mostraram que @TARGET não alterou os resultados, enquanto @TERCEIRO utilizou seu acesso para manipular a disputa. 🏆"
  },

  // 28
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma coleção de cartas raras. @TARGET levou as cartas, enquanto @TERCEIRO ajudou a escondê-las. 🃏",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo das cartas raras. As câmeras provaram que @TARGET não esteve no local, enquanto @TERCEIRO foi encontrado com a coleção. 🃏"
  },

  // 29
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por invadir uma biblioteca histórica. @TARGET retirou documentos raros, enquanto @TERCEIRO ajudou a transportá-los. 📚",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão da biblioteca. Os registros mostraram que @TARGET não entrou no prédio, enquanto @TERCEIRO foi visto retirando os documentos. 📚"
  },

  // 30
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma estátua. @TARGET participou da retirada da peça, enquanto @TERCEIRO ajudou no transporte. 🗿",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da estátua. As imagens mostraram que @TARGET estava longe do local, enquanto @TERCEIRO foi identificado transportando a peça. 🗿"
  },

  // 31
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por destruir uma obra histórica. As câmeras registraram @TARGET causando o dano, enquanto @TERCEIRO ajudou a esconder as evidências. 🏛️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela destruição da obra histórica. As imagens provaram que @TARGET não estava presente, enquanto @TERCEIRO foi identificado no local durante o incidente. 🏛️"
  },

  // 32
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar equipamentos de uma escola. @TARGET retirou os equipamentos durante a noite, enquanto @TERCEIRO ajudou a transportá-los. 🏫",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo dos equipamentos da escola. As câmeras mostraram que @TARGET não esteve no prédio, enquanto @TERCEIRO foi visto levando os equipamentos. 🏫"
  },

  // 33
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por invadir um estádio. @TARGET entrou na área restrita, enquanto @TERCEIRO ajudou a abrir os portões. 🏟️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão do estádio. Os registros mostraram que @TARGET estava na arquibancada, enquanto @TERCEIRO entrou na área restrita. 🏟️"
  },

  // 34
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar equipamentos de uma emissora. @TARGET foi visto retirando os equipamentos, enquanto @TERCEIRO ajudou a escondê-los. 📺",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo dos equipamentos da emissora. As gravações mostraram que @TARGET não estava no prédio, enquanto @TERCEIRO foi visto retirando os equipamentos. 📺"
  },

  // 35
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por invadir um servidor privado. Os registros digitais mostraram que @TARGET acessou o sistema, enquanto @TERCEIRO forneceu as credenciais. 💻",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão do servidor. Os registros digitais mostraram que @TARGET não acessou o sistema, enquanto @TERCEIRO utilizou as credenciais para entrar. 💻"
  },

  // 36
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar informações de uma empresa. @TARGET copiou os arquivos, enquanto @TERCEIRO ajudou a retirar os documentos. 📁",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo das informações. A análise dos computadores mostrou que @TARGET não acessou os arquivos, enquanto @TERCEIRO realizou a cópia. 📁"
  },

  // 37
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por falsificar uma assinatura. A perícia confirmou que @TARGET produziu a falsificação, enquanto @TERCEIRO apresentou o documento falso. ✍️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela falsificação da assinatura. A perícia mostrou que a assinatura não foi feita por @TARGET, enquanto @TERCEIRO apresentou o documento falsificado. ✍️"
  },

  // 38
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar uma peça de museu. @TARGET foi registrado retirando a peça, enquanto @TERCEIRO ajudou a escondê-la. 🏺",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da peça do museu. As câmeras provaram que @TARGET não esteve na sala, enquanto @TERCEIRO foi visto retirando a peça. 🏺"
  },

  // 39
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por organizar um golpe financeiro. As mensagens mostraram que @TARGET comandava o esquema, enquanto @TERCEIRO atraía as vítimas. 💰",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo golpe financeiro. As mensagens analisadas mostraram que @TARGET não fazia parte do esquema, enquanto @TERCEIRO estava diretamente envolvido. 💰"
  },

  // 40
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma medalha histórica. @TARGET foi visto retirando a medalha, enquanto @TERCEIRO ajudou na fuga. 🥇",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da medalha histórica. Uma testemunha confirmou que @TARGET não estava no local, enquanto @TERCEIRO foi visto fugindo com a medalha. 🥇"
  },

  // 41
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por adulterar documentos de um concurso. @TARGET alterou os arquivos, enquanto @TERCEIRO ajudou a esconder as alterações. 📄",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela adulteração dos documentos. A perícia mostrou que @TARGET não modificou os arquivos, enquanto @TERCEIRO foi identificado como responsável pelas alterações. 📄"
  },

  // 42
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo desaparecimento de uma obra rara. @TARGET retirou a obra do local, enquanto @TERCEIRO ajudou a escondê-la. 🎨",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo desaparecimento da obra rara. Os registros mostraram que @TARGET não esteve no local, enquanto @TERCEIRO foi encontrado com a obra. 🎨"
  },

  // 43
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar uma coleção de troféus. @TARGET levou os troféus, enquanto @TERCEIRO ajudou a transportá-los. 🏆",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo dos troféus. As câmeras mostraram que @TARGET não entrou no local, enquanto @TERCEIRO foi visto transportando a coleção. 🏆"
  },

  // 44
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por invadir uma estação de rádio. @TARGET entrou na área restrita, enquanto @TERCEIRO desligou o sistema de segurança. 📻",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela invasão da estação de rádio. Os registros mostraram que @TARGET não entrou na área restrita, enquanto @TERCEIRO foi registrado no local. 📻"
  },

  // 45
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma coleção de relógios. @TARGET retirou os relógios, enquanto @TERCEIRO ajudou a escondê-los. ⌚",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo dos relógios. As imagens provaram que @TARGET não esteve no estabelecimento, enquanto @TERCEIRO foi encontrado com a coleção. ⌚"
  },

  // 46
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por roubar uma fórmula secreta. @TARGET retirou os documentos do laboratório, enquanto @TERCEIRO ajudou a escondê-los. 🧪",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da fórmula. Os registros mostraram que @TARGET não acessou o laboratório, enquanto @TERCEIRO foi identificado retirando os documentos. 🧪"
  },

  // 47
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por destruir provas de um caso. @TARGET foi visto retirando os documentos, enquanto @TERCEIRO ajudou a escondê-los. 🗂️",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pela destruição das provas. As câmeras mostraram que @TARGET não teve acesso aos documentos, enquanto @TERCEIRO foi visto escondendo as evidências. 🗂️"
  },

  // 48
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO pelo roubo de uma peça arqueológica. @TARGET foi visto retirando a peça, enquanto @TERCEIRO ajudou a transportá-la. 🏺",

    inocente:
      "⚖️ @TARGET foi considerado INOCENTE pelo roubo da peça arqueológica. Os registros mostraram que @TARGET não estava no sítio arqueológico, enquanto @TERCEIRO foi encontrado transportando a peça. 🏺"
  },

  // 49
  {
    culpado:
      "⚖️ @TARGET foi considerado CULPADO por organizar uma fraude em um campeonato. @TARGET m
