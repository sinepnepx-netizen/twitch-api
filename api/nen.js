import { createClient } from "redis";

let redisClient;
let redisConnecting;

const MAX_LEVEL = 100;
const DELAY_TREINO = 2 * 60 * 60 * 1000;
const CHANCE_SUCESSO = 0.65;

const TIPOS = {
  Reforço: {
    emoji: "💥",
    nomes: [
      "Punho", "Impacto", "Colosso", "Ruptura", "Titã", "Tremor",
      "Devastação", "Muralha", "Martelo", "Fúria", "Punho Solar",
      "Núcleo", "Avalanche", "Dragão", "Leão", "Gigante",
      "Esmagador", "Vórtice", "Explosão", "Sentinela",
      "Fênix", "Terremoto", "Coração de Ferro", "Devorador",
      "Punho Fantasma", "Estrela", "Lobo", "Cometa", "Bastião",
      "Furacão", "Espiral", "Rugido", "Golem", "Juízo",
      "Ciclone", "Soberano", "Martelo Celeste", "Monólito"
    ],
    finais: [
      "Carmesim", "do Eclipse", "Celestial", "do Trovão", "Absoluto",
      "da Lua Negra", "do Dragão", "do Vazio", "de Mercúrio",
      "da Última Aurora", "do Infinito", "da Tempestade",
      "do Rei Caído", "das Mil Montanhas", "Solar", "Fantasma",
      "da Destruição", "da Fênix", "do Abismo", "do Horizonte",
      "da Guerra Eterna", "do Destino", "Primitivo", "da Ruína",
      "do Caçador", "da Estrela Negra", "do Punho Sagrado",
      "da Chama Azul", "da Noite Eterna", "do Titã"
    ],
    ataques: [
      "concentra toda a aura em um golpe que estremece o chão",
      "rompe a defesa adversária com uma explosão de força",
      "absorve o impacto e devolve a energia com força redobrada",
      "avança com um golpe capaz de abrir uma cratera",
      "concentra sua aura no corpo e desfere um ataque devastador"
    ],
    treinos: [
      "golpeia uma rocha até conseguir parti-la ao meio",
      "carrega um enorme bloco de pedra usando apenas sua aura",
      "treina golpes repetidos até dominar a concentração de força",
      "resiste a uma sequência de impactos sem perder o equilíbrio",
      "concentra aura nos punhos e tenta destruir um alvo resistente"
    ]
  },
  Transmutação: {
    emoji: "⚡",
    nomes: [
      "Trovão", "Lâmina", "Fio", "Chicote", "Tempestade", "Prisma",
      "Serpente", "Pulso", "Relâmpago", "Espinho", "Véu", "Dança",
      "Garra", "Corrente", "Raio", "Lótus", "Rosa", "Agulha",
      "Manto", "Arco", "Dente", "Espiral", "Lança", "Cobra",
      "Víbora", "Fagulha", "Coroa", "Névoa", "Cristal", "Aurora",
      "Ressonância", "Flecha", "Luar", "Maré", "Fera", "Cometa",
      "Centelha", "Vibração"
    ],
    finais: [
      "Carmesim", "Fantasma", "de Mercúrio", "da Meia-Noite",
      "Relâmpago Azul", "do Eclipse", "Venenoso", "Infinito",
      "da Lua Negra", "do Horizonte", "Celeste", "do Abismo",
      "da Tempestade", "da Serpente", "do Dragão", "Prismático",
      "da Fênix", "do Vazio", "do Trovão", "da Aurora",
      "da Estrela Cadente", "da Névoa", "do Caçador",
      "da Chama Eterna", "do Lobo Branco", "da Noite",
      "do Sol Negro", "do Mar Profundo", "da Cobra Real",
      "da Última Faísca"
    ],
    ataques: [
      "transforma sua aura em eletricidade e ataca num piscar de olhos",
      "molda a aura numa lâmina e desfere um corte preciso",
      "altera as propriedades da aura para surpreender o adversário",
      "libera uma descarga de energia que atravessa o campo",
      "envolve o corpo com aura transmutada e ataca em alta velocidade"
    ],
    treinos: [
      "tenta manter a aura eletrificada sem perder o controle",
      "molda sua aura em uma lâmina com o fio perfeitamente estável",
      "altera a textura da aura várias vezes sem interromper o fluxo",
      "treina velocidade, mudando as propriedades da aura a cada movimento",
      "mantém uma forma complexa de aura até dominar sua estabilidade"
    ]
  },
  Emissão: {
    emoji: "🔵",
    nomes: [
      "Canhão", "Rajada", "Cometa", "Projétil", "Lança", "Esfera",
      "Disparo", "Meteoro", "Estrela", "Flecha", "Orbe", "Pulso",
      "Bomba", "Dardo", "Artilharia", "Chuva", "Turbilhão", "Raio",
      "Espiral", "Fragmento", "Núcleo", "Vórtice", "Trovão",
      "Cápsula", "Falcão", "Satélite", "Laser", "Impacto",
      "Onda", "Ciclone", "Fagulha", "Lótus", "Dança",
      "Enxame", "Ruptura", "Pilar", "Míssil", "Horizonte"
    ],
    finais: [
      "Astral", "do Horizonte", "Fantasma", "Carmesim", "do Vazio",
      "Celestial", "Explosivo", "Perfurante", "do Eclipse",
      "da Lua Negra", "da Última Aurora", "do Dragão",
      "do Trovão", "do Infinito", "do Caçador", "da Fênix",
      "da Tempestade", "do Abismo", "Solar", "da Estrela Negra",
      "da Guerra Eterna", "do Destino", "Primitivo", "da Ruína",
      "da Chama Azul", "da Noite Eterna", "do Rei Caído",
      "das Mil Estrelas", "do Lobo Branco", "do Mar Profundo"
    ],
    ataques: [
      "dispara uma esfera de aura diretamente contra o oponente",
      "lança uma sequência de projéteis de Nen à distância",
      "libera um feixe poderoso de aura concentrada",
      "dispara um ataque de longo alcance que atravessa o campo",
      "comprime a aura e libera uma explosão contra o adversário"
    ],
    treinos: [
      "acerta alvos cada vez mais distantes com projéteis de aura",
      "tenta manter a potência dos disparos sem desperdiçar energia",
      "acerta vários alvos em movimento com uma sequência de tiros",
      "concentra aura em um disparo preciso através de pequenos anéis",
      "treina alcance e precisão até acertar o alvo mais distante"
    ]
  },
  Materialização: {
    emoji: "⛓️",
    nomes: [
      "Correntes", "Lâmina", "Arsenal", "Prisão", "Relógio", "Lança",
      "Espelho", "Livro", "Chave", "Adaga", "Escudo", "Máscara",
      "Bússola", "Cálice", "Arco", "Martelo", "Coroa", "Jaula",
      "Grimório", "Relíquia", "Ampulheta", "Cofre", "Anel",
      "Tabuleiro", "Portal", "Gaiola", "Faca", "Balança",
      "Torre", "Selo", "Contrato", "Caixa", "Marionete",
      "Prisma", "Luneta", "Manto", "Bastão", "Diário"
    ],
    finais: [
      "do Caçador", "da Lua Negra", "das Mil Faces", "do Julgamento",
      "do Destino", "Fantasma", "do Eclipse", "Inquebrável",
      "da Última Aurora", "do Dragão", "do Trovão", "do Infinito",
      "do Abismo", "Celestial", "Carmesim", "da Fênix",
      "da Tempestade", "do Vazio", "Solar", "da Estrela Negra",
      "da Guerra Eterna", "da Ruína", "da Chama Azul",
      "da Noite Eterna", "do Rei Caído", "das Mil Promessas",
      "do Lobo Branco", "da Verdade", "do Tempo Perdido",
      "do Reino Oculto"
    ],
    ataques: [
      "materializa correntes que tentam imobilizar o adversário",
      "invoca uma arma especial e ataca uma abertura na defesa",
      "cria um objeto que altera inesperadamente o combate",
      "materializa várias armas e executa uma sequência precisa",
      "invoca uma prisão de Nen para limitar os movimentos inimigos"
    ],
    treinos: [
      "materializa e desfaz o mesmo objeto repetidamente sem perder foco",
      "tenta manter um objeto complexo durante vários minutos",
      "treina a velocidade de materialização de sua arma",
      "cria objetos com detalhes cada vez mais precisos",
      "mantém várias criações de Nen ativas ao mesmo tempo"
    ]
  },
  Manipulação: {
    emoji: "🌀",
    nomes: [
      "Marionete", "Comando", "Hipnose", "Domínio", "Selo", "Vínculo",
      "Ordem", "Controle", "Fantoche", "Maestro", "Enxame", "Coro",
      "Fio Mental", "Ressonância", "Legião", "Véu", "Névoa",
      "Mandato", "Círculo", "Máscara", "Dança", "Labirinto",
      "Prisma", "Eco", "Orquestra", "Teia", "Sentinela",
      "Coroa", "Chave", "Sussurro", "Falcão", "Espelho",
      "Pêndulo", "Armadilha", "Soberano", "Pacto", "Comandante"
    ],
    finais: [
      "Absoluto", "Fantasma", "da Meia-Noite", "das Mil Vozes",
      "Carmesim", "do Destino", "Invisível", "Eterno",
      "da Lua Negra", "do Eclipse", "do Dragão", "do Trovão",
      "do Infinito", "do Abismo", "Celestial", "da Fênix",
      "da Tempestade", "do Vazio", "Solar", "da Estrela Negra",
      "da Guerra Eterna", "da Ruína", "da Chama Azul",
      "da Noite Eterna", "do Rei Caído", "da Mente Partida",
      "do Lobo Branco", "do Caçador", "do Reino Oculto",
      "da Última Ordem"
    ],
    ataques: [
      "tenta controlar os movimentos do adversário com sua aura",
      "manipula objetos ao redor para criar uma armadilha",
      "usa uma ordem de Nen para interromper o ataque inimigo",
      "controla o ambiente e abre uma oportunidade inesperada",
      "cria uma sequência de comandos que confunde o adversário"
    ],
    treinos: [
      "controla vários objetos pequenos sem perder a concentração",
      "treina comandos precisos sob pressão e com pouco tempo",
      "mantém o controle de objetos em movimento simultaneamente",
      "tenta manipular objetos cada vez mais pesados",
      "executa uma sequência complexa de movimentos sem errar"
    ]
  },
  Especialização: {
    emoji: "🔮",
    nomes: [
      "Olhos", "Oráculo", "Roubo", "Paradoxo", "Profecia", "Eclipse",
      "Veredito", "Legado", "Memória", "Destino", "Presságio", "Enigma",
      "Julgamento", "Espelho", "Segredo", "Relicário", "Verdade",
      "Limiar", "Abismo", "Vidente", "Códice", "Sombra", "Coroa",
      "Sentença", "Arquivo", "Labirinto", "Eternidade", "Máscara",
      "Constelação", "Requiem", "Prisma", "Fantasma", "Pêndulo",
      "Mosaico", "Ritual", "Horizonte", "Chave", "Coração"
    ],
    finais: [
      "do Destino", "do Infinito", "Fantasma", "Carmesim",
      "das Mil Possibilidades", "da Verdade", "Absoluto", "Proibido",
      "da Lua Negra", "do Eclipse", "do Dragão", "do Trovão",
      "do Abismo", "Celestial", "da Fênix", "da Tempestade",
      "do Vazio", "Solar", "da Estrela Negra", "da Guerra Eterna",
      "da Ruína", "da Chama Azul", "da Noite Eterna", "do Rei Caído",
      "do Caçador", "do Reino Oculto", "da Memória Perdida",
      "da Última Aurora", "das Sete Vidas", "do Tempo Partido"
    ],
    ataques: [
      "ativa um poder raro que surpreende completamente o adversário",
      "revela uma condição secreta que muda o rumo do combate",
      "usa uma habilidade imprevisível para encontrar uma abertura",
      "ativa um efeito misterioso e neutraliza parte da defesa inimiga",
      "revela um poder singular que ninguém esperava"
    ],
    treinos: [
      "tenta compreender uma condição complexa de sua própria habilidade",
      "treina a ativação de seu poder sob condições restritas",
      "estuda os limites da habilidade sem perder o controle da aura",
      "repete um exercício incomum para entender seu poder especial",
      "testa uma nova condição para aperfeiçoar sua técnica exclusiva"
    ]
  }
};

async function getRedis() {
  if (redisClient?.isReady) return redisClient;

  if (!redisClient) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL não configurada");
    }

    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (erro) => console.error("Redis:", erro));
  }

  if (!redisClient.isReady) {
    if (!redisConnecting) redisConnecting = redisClient.connect();

    try {
      await redisConnecting;
    } finally {
      redisConnecting = null;
    }
  }

  return redisClient;
}

function limparNome(nome) {
  return String(nome || "")
    .replace(/^@+/, "")
    .trim()
    .replace(/\s+/g, "");
}

function aleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function chavePerfil(usuario) {
  return `nen:perfil:${usuario.toLowerCase()}`;
}

function nomeExibicao(usuario) {
  return `@${usuario}`;
}

function xpNecessario(nivel) {
  return 100 + (nivel - 1) * 25;
}

async function criarHabilidadeExclusiva(redis, tipo) {
  const dados = TIPOS[tipo];
  const chave = "nen:habilidades:registradas";

  for (let tentativa = 0; tentativa < 500; tentativa++) {
    const nome = `${aleatorio(dados.nomes)} ${aleatorio(dados.finais)}`;
    const reservado = await redis.sAdd(chave, nome.toLowerCase());

    if (reservado === 1) {
      return {
        nome,
        efeito: aleatorio(dados.ataques)
      };
    }
  }

  for (let numero = 2; numero < 100000; numero++) {
    const nome = `${aleatorio(dados.nomes)} ${aleatorio(dados.finais)} ${numero}`;
    const reservado = await redis.sAdd(chave, nome.toLowerCase());

    if (reservado === 1) {
      return {
        nome,
        efeito: aleatorio(dados.ataques)
      };
    }
  }

  throw new Error("Não foi possível criar uma habilidade exclusiva.");
}

function prepararPerfil(perfil, usuario) {
  perfil.usuario = perfil.usuario || usuario;
  perfil.nivel = Number(perfil.nivel) || 1;
  perfil.xp = Number(perfil.xp) || 0;
  perfil.xpTotal = Number(perfil.xpTotal) || 0;
  perfil.aura = Number(perfil.aura) || 100;
  perfil.forca = Number(perfil.forca) || 10;
  perfil.controle = Number(perfil.controle) || 10;
  perfil.treinos = Number(perfil.treinos) || 0;
  perfil.vitorias = Number(perfil.vitorias) || 0;
  perfil.ultimoTreino = Number(perfil.ultimoTreino) || 0;
  perfil.emoji = perfil.emoji || TIPOS[perfil.tipo]?.emoji || "✨";
  perfil.efeito = perfil.efeito || "libera sua habilidade de Nen em um ataque especial";

  return perfil;
}

async function lerPerfil(redis, usuario) {
  const bruto = await redis.get(chavePerfil(usuario));
  if (!bruto) return null;

  const perfil = prepararPerfil(JSON.parse(bruto), usuario);
  await redis.set(chavePerfil(usuario), JSON.stringify(perfil));

  return perfil;
}

async function obterOuDespertarNen(redis, usuario) {
  const existente = await lerPerfil(redis, usuario);
  if (existente) return { perfil: existente, novo: false };

  const tipo = aleatorio(Object.keys(TIPOS));
  const habilidade = await criarHabilidadeExclusiva(redis, tipo);

  const perfil = prepararPerfil({
    usuario,
    tipo,
    emoji: TIPOS[tipo].emoji,
    habilidade: habilidade.nome,
    efeito: habilidade.efeito,
    nivel: 1,
    xp: 0,
    xpTotal: 0,
    aura: 100,
    forca: 10,
    controle: 10,
    treinos: 0,
    vitorias: 0,
    ultimoTreino: 0,
    despertadoEm: Date.now()
  }, usuario);

  const salvo = await redis.set(chavePerfil(usuario), JSON.stringify(perfil), {
    NX: true
  });

  if (salvo === "OK") {
    return { perfil, novo: true };
  }

  await redis.sRem("nen:habilidades:registradas", perfil.habilidade.toLowerCase());

  const vencedor = await lerPerfil(redis, usuario);
  if (!vencedor) throw new Error("Não foi possível salvar o perfil.");

  return { perfil: vencedor, novo: false };
}

function mostrarPerfil(perfil, novo) {
  const titulo = novo
    ? `🌟 ${nomeExibicao(perfil.usuario)} despertou seu Nen!`
    : `⚡ Perfil de Nen de ${nomeExibicao(perfil.usuario)}:`;

  return [
    titulo,
    `${perfil.emoji} Tipo: ${perfil.tipo}.`,
    `✨ Habilidade: ${perfil.habilidade}.`,
    `📜 Efeito: ${perfil.efeito}.`,
    `🏅 Nível ${perfil.nivel}/100 | XP: ${perfil.xp}/${xpNecessario(perfil.nivel)}.`,
    `🔋 Aura: ${perfil.aura} | 💪 Força: ${perfil.forca} | 🎯 Controle: ${perfil.controle}.`,
    `🏋️ Treinos: ${perfil.treinos} | 🏆 Vitórias: ${perfil.vitorias}.`
  ].join(" ");
}

function formatarTempo(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;

  return `${String(horas).padStart(2, "0")}h ${String(minutos).padStart(2, "0")}min ${String(resto).padStart(2, "0")}s`;
}

async function treinar(redis, usuario) {
  const { perfil } = await obterOuDespertarNen(redis, usuario);
  const agora = Date.now();
  const restante = DELAY_TREINO - (agora - perfil.ultimoTreino);

  if (restante > 0) {
    return `⏳ ${nomeExibicao(usuario)}, sua aura ainda está se recuperando! Próximo treino em ${formatarTempo(restante)}. Use !tempnen para consultar o tempo restante.`;
  }

  perfil.ultimoTreino = agora;
  perfil.treinos += 1;

  const dados = TIPOS[perfil.tipo];
  const exercicio = aleatorio(dados.treinos);

  if (Math.random() < CHANCE_SUCESSO) {
    const ganho = 60 + Math.floor(Math.random() * 41);
    perfil.xp += ganho;
    perfil.xpTotal += ganho;

    const atributos = [
      { nome: "aura", chance: 0.50, ganho: 5 },
      { nome: "forca", chance: 0.25, ganho: 2 },
      { nome: "controle", chance: 0.25, ganho: 2 }
    ];

    const sorteio = Math.random();
    let acumulado = 0;
    let atributo = atributos[0];

    for (const item of atributos) {
      acumulado += item.chance;
      if (sorteio < acumulado) {
        atributo = item;
        break;
      }
    }

    perfil[atributo.nome] += atributo.ganho;

    let subiu = 0;

    while (perfil.nivel < MAX_LEVEL && perfil.xp >= xpNecessario(perfil.nivel)) {
      perfil.xp -= xpNecessario(perfil.nivel);
      perfil.nivel += 1;
      perfil.aura += 10;
      perfil.forca += 2;
      perfil.controle += 2;
      subiu += 1;
    }

    if (perfil.nivel >= MAX_LEVEL) {
      perfil.nivel = MAX_LEVEL;
      perfil.xp = Math.min(perfil.xp, xpNecessario(MAX_LEVEL) - 1);
    }

    await redis.set(chavePerfil(usuario), JSON.stringify(perfil));

    const mensagemNivel = subiu > 0
      ? ` 🎉 SUBIU ${subiu} NÍVEL(IS)! Agora é nível ${perfil.nivel}!`
      : "";

    const mensagemMaximo = perfil.nivel === MAX_LEVEL
      ? " 👑 Você alcançou o nível máximo de Caçador!"
      : "";

    return `✅ TREINO BEM-SUCEDIDO! ${nomeExibicao(usuario)} ${exercicio} e dominou melhor seu Nen! +${ganho} XP. 📈 +${atributo.ganho} de ${atributo.nome === "aura" ? "aura máxima" : atributo.nome}. 🏅 Nível ${perfil.nivel}/100.${mensagemNivel}${mensagemMaximo} ⏳ Próximo treino em 2 horas.`;
  }

  const falhas = [
    "perdeu a concentração e sua aura se dissipou antes de completar o exercício",
    "forçou demais os limites e precisou interromper o treino para se recuperar",
    "não conseguiu estabilizar a aura e o exercício saiu do controle",
    "calculou mal o fluxo de Nen e falhou no momento decisivo",
    "ficou exausto antes de concluir o desafio e precisou parar"
  ];

  await redis.set(chavePerfil(usuario), JSON.stringify(perfil));

  return `❌ TREINO FALHOU! ${nomeExibicao(usuario)} tentou ${exercicio}, mas ${aleatorio(falhas)}. Nenhum XP recebido desta vez. 💪 Não desista, Caçador! ⏳ Próximo treino em 2 horas.`;
}

async function mostrarTempo(redis, usuario) {
  const perfil = await lerPerfil(redis, usuario);

  if (!perfil) {
    return `⚠️ ${nomeExibicao(usuario)}, você ainda não despertou seu Nen. Use !nen primeiro.`;
  }

  const restante = DELAY_TREINO - (Date.now() - perfil.ultimoTreino);

  if (restante <= 0) {
    return `✅ ${nomeExibicao(usuario)}, seu treino está liberado! Use !treinar para continuar sua evolução.`;
  }

  return `⏳ ${nomeExibicao(usuario)}, faltam ${formatarTempo(restante)} para seu próximo treino de Nen.`;
}

async function ranking(redis) {
  const perfis = [];

  for await (const chave of redis.scanIterator({
    MATCH: "nen:perfil:*",
    COUNT: 100
  })) {
    const bruto = await redis.get(chave);
    if (!bruto) continue;

    try {
      perfis.push(prepararPerfil(JSON.parse(bruto), chave.slice("nen:perfil:".length)));
    } catch {
      // Ignora perfis inválidos.
    }
  }

  if (perfis.length === 0) {
    return "📜 Ainda não há Caçadores registrados no ranking. Use !nen para despertar seu poder!";
  }

  perfis.sort((a, b) =>
    b.nivel - a.nivel ||
    b.xpTotal - a.xpTotal ||
    b.vitorias - a.vitorias
  );

  const top = perfis.slice(0, 5).map((perfil, indice) =>
    `${indice + 1}. ${nomeExibicao(perfil.usuario)} — Nv. ${perfil.nivel}, ${perfil.xpTotal} XP`
  );

  return `🏆 RANKING DOS CAÇADORES DE NEN: ${top.join(" | ")}`;
}

function narrarBatalha(atacante, defensor, vencedor) {
  const perdedor =
    vencedor.usuario.toLowerCase() === atacante.usuario.toLowerCase()
      ? defensor
      : atacante;

  const aberturas = [
    "As duas auras colidem e fazem o campo de batalha estremecer!",
    "Uma pressão intensa de Nen toma conta do ambiente!",
    "Os dois Caçadores liberam suas auras e partem para o confronto!",
    "O choque entre as duas habilidades faz o ar vibrar!"
  ];

  const finais = [
    `🏆 ${nomeExibicao(vencedor.usuario)} vence a batalha de Nen!`,
    `👑 ${nomeExibicao(vencedor.usuario)} é declarado o campeão!`,
    `🔥 ${nomeExibicao(vencedor.usuario)} encontra a abertura decisiva e vence!`,
    `⚔️ ${nomeExibicao(vencedor.usuario)} leva a melhor neste confronto!`
  ];

  return [
    aleatorio(aberturas),
    `${vencedor.emoji} ${nomeExibicao(vencedor.usuario)} (Nv. ${vencedor.nivel}) usa ${vencedor.habilidade} e ${vencedor.efeito}.`,
    `${perdedor.emoji} ${nomeExibicao(perdedor.usuario)} (Nv. ${perdedor.nivel}) responde com ${perdedor.habilidade}, mas não consegue superar o ataque.`,
    aleatorio(finais)
  ].join(" ");
}

export default async function handler(req, res) {
  try {
    const user = limparNome(req.query.user || req.query.sender);
    const target = limparNome(req.query.target || req.query.touser);
    const acao = String(req.query.acao || "").toLowerCase();

    if (!user && !["ranking"].includes(acao)) {
      return res.status(400).send("Não consegui identificar o usuário. ⚡");
    }

    const redis = await getRedis();

    if (acao === "ranking") {
      return res.status(200).send(await ranking(redis));
    }

    if (acao === "treinar") {
      return res.status(200).send(await treinar(redis, user));
    }

    if (acao === "tempo") {
      return res.status(200).send(await mostrarTempo(redis, user));
    }

    if (!target || target.toLowerCase() === user.toLowerCase()) {
      const { perfil, novo } = await obterOuDespertarNen(redis, user);
      return res.status(200).send(mostrarPerfil(perfil, novo));
    }

    if (user.toLowerCase() === target.toLowerCase()) {
      return res.status(200).send("Você não pode batalhar contra si mesmo! ⚡");
    }

    const atacante = await lerPerfil(redis, user);
    const defensor = await lerPerfil(redis, target);

    if (!atacante || !defensor) {
      const faltando = [];
      if (!atacante) faltando.push(`@${user}`);
      if (!defensor) faltando.push(`@${target}`);

      return res.status(200).send(
        `⚠️ Para batalhar, todos precisam despertar seu Nen primeiro! Falta registrar: ${faltando.join(" e ")}. Usem !nen sem mencionar ninguém.`
      );
    }

    const vencedor = Math.random() < 0.5 ? atacante : defensor;

    if (vencedor.usuario.toLowerCase() === atacante.usuario.toLowerCase()) {
      atacante.vitorias += 1;
      await redis.set(chavePerfil(atacante.usuario), JSON.stringify(atacante));
    } else {
      defensor.vitorias += 1;
      await redis.set(chavePerfil(defensor.usuario), JSON.stringify(defensor));
    }

    return res.status(200).send(
      `⚔️ BATALHA DE NEN! ${nomeExibicao(atacante.usuario)} (${atacante.tipo}: ${atacante.habilidade}) VS ${nomeExibicao(defensor.usuario)} (${defensor.tipo}: ${defensor.habilidade})! ${narrarBatalha(atacante, defensor, vencedor)}`
    );
  } catch (erro) {
    console.error("Erro no comando Nen:", erro);
    return res.status(500).send("A aura ficou instável! Tente novamente. ⚡");
  }
}
