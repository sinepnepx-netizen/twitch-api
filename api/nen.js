import { createClient } from "redis";

let redisClient;
let redisConnecting;

const MAX_LEVEL = 200;
const DELAY_TREINO = 2 * 60 * 60 * 1000;
const CHANCE_SUCESSO = 0.45;

const TIPOS = {
  Reforço: {
    emoji: "💥",
    nomes: ["Punho", "Impacto", "Colosso", "Ruptura", "Titã", "Tremor", "Devastação", "Muralha", "Martelo", "Fúria", "Núcleo", "Avalanche", "Dragão", "Leão", "Gigante", "Esmagador", "Vórtice", "Explosão", "Sentinela", "Fênix"],
    finais: ["Carmesim", "do Eclipse", "Celestial", "do Trovão", "Absoluto", "da Lua Negra", "do Dragão", "do Vazio", "de Mercúrio", "da Última Aurora", "do Infinito", "da Tempestade", "do Rei Caído", "Solar", "Fantasma", "da Destruição", "da Fênix", "do Abismo", "do Horizonte", "da Guerra Eterna"],
    ataques: [
      "concentra sua aura em um golpe devastador",
      "rompe a defesa adversária com uma explosão de força",
      "absorve o impacto e devolve a energia multiplicada",
      "desfere um ataque que estremece todo o campo",
      "concentra aura nos punhos e avança sem hesitar"
    ],
    treinos: [
      "destrói rochas com golpes concentrados de aura",
      "carrega enormes blocos de pedra para aumentar sua força",
      "repete golpes até dominar a concentração de energia",
      "resiste a impactos cada vez mais poderosos",
      "treina sua força física enquanto mantém o Ten ativo"
    ]
  },
  Transmutação: {
    emoji: "⚡",
    nomes: ["Trovão", "Lâmina", "Fio", "Chicote", "Tempestade", "Prisma", "Serpente", "Pulso", "Relâmpago", "Espinho", "Véu", "Dança", "Garra", "Corrente", "Raio", "Lótus", "Rosa", "Agulha", "Manto", "Arco"],
    finais: ["Carmesim", "Fantasma", "de Mercúrio", "da Meia-Noite", "Relâmpago Azul", "do Eclipse", "Venenoso", "Infinito", "da Lua Negra", "do Horizonte", "Celeste", "do Abismo", "da Tempestade", "da Serpente", "do Dragão", "Prismático", "da Fênix", "do Vazio", "do Trovão", "da Aurora"],
    ataques: [
      "transforma sua aura em eletricidade e ataca num piscar de olhos",
      "molda a aura numa lâmina cortante e desfere um golpe preciso",
      "altera as propriedades da aura para surpreender o adversário",
      "libera uma descarga de energia que atravessa o campo",
      "envolve o corpo com aura transmutada e avança em alta velocidade"
    ],
    treinos: [
      "mantém a aura eletrificada sem perder o controle",
      "molda sua aura em uma lâmina cada vez mais precisa",
      "altera as propriedades da aura sem interromper o fluxo",
      "treina velocidade enquanto transforma sua aura",
      "mantém uma forma complexa de aura até dominar sua estabilidade"
    ]
  },
  Emissão: {
    emoji: "🔵",
    nomes: ["Canhão", "Rajada", "Cometa", "Projétil", "Lança", "Esfera", "Disparo", "Meteoro", "Estrela", "Flecha", "Orbe", "Pulso", "Bomba", "Dardo", "Artilharia", "Chuva", "Turbilhão", "Raio", "Espiral", "Fragmento"],
    finais: ["Astral", "do Horizonte", "Fantasma", "Carmesim", "do Vazio", "Celestial", "Explosivo", "Perfurante", "do Eclipse", "da Lua Negra", "da Última Aurora", "do Dragão", "do Trovão", "do Infinito", "do Caçador", "da Fênix", "da Tempestade", "do Abismo", "Solar", "da Estrela Negra"],
    ataques: [
      "dispara uma esfera de aura diretamente contra o oponente",
      "lança uma sequência de projéteis de Nen à distância",
      "libera um feixe de aura concentrada",
      "dispara um ataque de longo alcance que atravessa o campo",
      "comprime sua aura e libera uma explosão contra o adversário"
    ],
    treinos: [
      "acerta alvos cada vez mais distantes com projéteis de aura",
      "treina a potência dos disparos sem desperdiçar energia",
      "acerta vários alvos em movimento com tiros consecutivos",
      "concentra aura em um disparo de precisão extrema",
      "treina alcance e precisão até acertar um alvo minúsculo"
    ]
  },
  Materialização: {
    emoji: "⛓️",
    nomes: ["Correntes", "Lâmina", "Arsenal", "Prisão", "Relógio", "Lança", "Espelho", "Livro", "Chave", "Adaga", "Escudo", "Máscara", "Bússola", "Cálice", "Arco", "Martelo", "Coroa", "Jaula", "Grimório", "Relíquia"],
    finais: ["do Caçador", "da Lua Negra", "das Mil Faces", "do Julgamento", "do Destino", "Fantasma", "do Eclipse", "Inquebrável", "da Última Aurora", "do Dragão", "do Trovão", "do Infinito", "do Abismo", "Celestial", "Carmesim", "da Fênix", "da Tempestade", "do Vazio", "Solar", "da Estrela Negra"],
    ataques: [
      "materializa correntes que tentam imobilizar o adversário",
      "invoca uma arma especial e ataca uma abertura na defesa",
      "cria um objeto de Nen que altera inesperadamente o combate",
      "materializa várias armas e executa uma sequência precisa",
      "invoca uma prisão de Nen para limitar os movimentos inimigos"
    ],
    treinos: [
      "materializa e desfaz o mesmo objeto sem perder a concentração",
      "mantém um objeto complexo durante vários minutos",
      "treina a velocidade de materialização de sua arma",
      "cria objetos com detalhes cada vez mais precisos",
      "mantém várias criações de Nen ativas simultaneamente"
    ]
  },
  Manipulação: {
    emoji: "🌀",
    nomes: ["Marionete", "Comando", "Hipnose", "Domínio", "Selo", "Vínculo", "Ordem", "Controle", "Fantoche", "Maestro", "Enxame", "Coro", "Fio Mental", "Ressonância", "Legião", "Véu", "Névoa", "Mandato", "Círculo", "Máscara"],
    finais: ["Absoluto", "Fantasma", "da Meia-Noite", "das Mil Vozes", "Carmesim", "do Destino", "Invisível", "Eterno", "da Lua Negra", "do Eclipse", "do Dragão", "do Trovão", "do Infinito", "do Abismo", "Celestial", "da Fênix", "da Tempestade", "do Vazio", "Solar", "da Estrela Negra"],
    ataques: [
      "tenta controlar os movimentos do adversário com sua aura",
      "manipula objetos ao redor para criar uma armadilha",
      "usa uma ordem de Nen para interromper o ataque inimigo",
      "controla o ambiente e abre uma oportunidade inesperada",
      "cria uma sequência de comandos que confunde o adversário"
    ],
    treinos: [
      "controla vários objetos sem perder a concentração",
      "treina comandos precisos sob pressão e com pouco tempo",
      "mantém o controle de objetos em movimento simultaneamente",
      "tenta manipular objetos cada vez mais pesados",
      "executa uma sequência complexa de movimentos sem errar"
    ]
  },
  Especialização: {
    emoji: "🔮",
    nomes: ["Oráculo", "Roubo", "Paradoxo", "Profecia", "Eclipse", "Veredito", "Legado", "Memória", "Destino", "Presságio", "Enigma", "Julgamento", "Espelho", "Segredo", "Relicário", "Verdade", "Limiar", "Abismo", "Vidente", "Códice"],
    finais: ["do Destino", "do Infinito", "Fantasma", "Carmesim", "das Mil Possibilidades", "da Verdade", "Absoluto", "Proibido", "da Lua Negra", "do Eclipse", "do Dragão", "do Trovão", "do Abismo", "Celestial", "da Fênix", "da Tempestade", "do Vazio", "Solar", "da Estrela Negra", "da Guerra Eterna"],
    ataques: [
      "ativa um poder raro que surpreende completamente o adversário",
      "revela uma condição secreta que muda o rumo do combate",
      "usa uma habilidade imprevisível para encontrar uma abertura",
      "ativa um efeito misterioso e neutraliza parte da defesa inimiga",
      "revela um poder singular que ninguém esperava"
    ],
    treinos: [
      "tenta compreender uma condição complexa de sua habilidade",
      "treina a ativação de seu poder sob condições restritas",
      "estuda os limites da habilidade sem perder o controle da aura",
      "repete um exercício incomum para entender seu poder especial",
      "testa uma nova condição para aperfeiçoar sua técnica exclusiva"
    ]
  }
};

const ESTAGIOS = [
  { nivel: 1, nome: "Desperto", multiplicador: 1 },
  { nivel: 10, nome: "Aprendiz", multiplicador: 1.15 },
  { nivel: 25, nome: "Praticante", multiplicador: 1.35 },
  { nivel: 50, nome: "Especialista", multiplicador: 1.65 },
  { nivel: 75, nome: "Mestre", multiplicador: 2 },
  { nivel: 100, nome: "Elite", multiplicador: 2.5 },
  { nivel: 125, nome: "Lendário", multiplicador: 3 },
  { nivel: 150, nome: "Mestre Supremo", multiplicador: 3.75 },
  { nivel: 175, nome: "Transcendente", multiplicador: 4.5 },
  { nivel: 200, nome: "Lenda Viva", multiplicador: 5.5 }
];

async function getRedis() {
  if (redisClient?.isReady) return redisClient;

  if (!redisClient) {
    if (!process.env.REDIS_URL) throw new Error("REDIS_URL não configurada");
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", erro => console.error("Redis:", erro));
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
  return String(nome || "").replace(/^@+/, "").trim().replace(/\s+/g, "");
}

function aleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function chavePerfil(usuario) {
  return `nen:perfil:${usuario.toLowerCase()}`;
}

function xpNecessario(nivel) {
  return 150 + (nivel - 1) * 35;
}

function obterEstagio(nivel) {
  let atual = ESTAGIOS[0];

  for (const estagio of ESTAGIOS) {
    if (nivel >= estagio.nivel) atual = estagio;
  }

  return atual;
}

function prepararPerfil(perfil, usuario) {
  perfil.usuario ||= usuario;
  perfil.nivel = Math.min(MAX_LEVEL, Math.max(1, Number(perfil.nivel) || 1));
  perfil.xp = Math.max(0, Number(perfil.xp) || 0);
  perfil.xpTotal = Math.max(0, Number(perfil.xpTotal) || 0);
  perfil.aura = Math.max(100, Number(perfil.aura) || 100);
  perfil.forca = Math.max(10, Number(perfil.forca) || 10);
  perfil.controle = Math.max(10, Number(perfil.controle) || 10);
  perfil.treinos = Math.max(0, Number(perfil.treinos) || 0);
  perfil.vitorias = Math.max(0, Number(perfil.vitorias) || 0);
  perfil.ultimoTreino = Math.max(0, Number(perfil.ultimoTreino) || 0);
  perfil.emoji ||= TIPOS[perfil.tipo]?.emoji || "✨";
  perfil.efeito ||= aleatorio(TIPOS[perfil.tipo]?.ataques || ["usa sua habilidade de Nen"]);
  return perfil;
}

async function lerPerfil(redis, usuario) {
  const bruto = await redis.get(chavePerfil(usuario));
  if (!bruto) return null;

  const perfil = prepararPerfil(JSON.parse(bruto), usuario);
  await redis.set(chavePerfil(usuario), JSON.stringify(perfil));
  return perfil;
}

async function criarHabilidadeExclusiva(redis, tipo) {
  const dados = TIPOS[tipo];
  const chave = "nen:habilidades:registradas";

  for (let tentativa = 0; tentativa < 500; tentativa++) {
    const nome = `${aleatorio(dados.nomes)} ${aleatorio(dados.finais)}`;
    if (await redis.sAdd(chave, nome.toLowerCase()) === 1) {
      return { nome, efeito: aleatorio(dados.ataques) };
    }
  }

  for (let numero = 2; numero < 100000; numero++) {
    const nome = `${aleatorio(dados.nomes)} ${aleatorio(dados.finais)} ${numero}`;
    if (await redis.sAdd(chave, nome.toLowerCase()) === 1) {
      return { nome, efeito: aleatorio(dados.ataques) };
    }
  }

  throw new Error("Não foi possível criar uma habilidade exclusiva.");
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

  const salvo = await redis.set(chavePerfil(usuario), JSON.stringify(perfil), { NX: true });

  if (salvo === "OK") return { perfil, novo: true };

  await redis.sRem("nen:habilidades:registradas", perfil.habilidade.toLowerCase());
  const vencedor = await lerPerfil(redis, usuario);
  if (!vencedor) throw new Error("Não foi possível salvar o perfil.");
  return { perfil: vencedor, novo: false };
}

function nomeExibicao(usuario) {
  return `@${usuario}`;
}

function mostrarPerfil(perfil, novo) {
  const estagio = obterEstagio(perfil.nivel);

  return [
    novo ? `🌟 ${nomeExibicao(perfil.usuario)} despertou seu Nen!` : `⚡ Perfil de Nen de ${nomeExibicao(perfil.usuario)}:`,
    `${perfil.emoji} Tipo: ${perfil.tipo}.`,
    `✨ Habilidade exclusiva: ${perfil.habilidade}.`,
    `📜 Técnica: ${perfil.efeito}.`,
    `🏅 Nível ${perfil.nivel}/${MAX_LEVEL} — ${estagio.nome}.`,
    `📈 XP: ${perfil.xp}/${perfil.nivel >= MAX_LEVEL ? "MÁXIMO" : xpNecessario(perfil.nivel)} | XP total: ${perfil.xpTotal}.`,
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
    return `⏳ ${nomeExibicao(usuario)}, sua aura ainda está se recuperando! Próximo treino em ${formatarTempo(restante)}.`;
  }

  if (perfil.nivel >= MAX_LEVEL) {
    return `👑 ${nomeExibicao(usuario)}, você já alcançou o nível máximo ${MAX_LEVEL}! Sua jornada de evolução chegou ao auge.`;
  }

  perfil.ultimoTreino = agora;
  perfil.treinos += 1;

  const exercicio = aleatorio(TIPOS[perfil.tipo].treinos);

  if (Math.random() < CHANCE_SUCESSO) {
    const ganho = 100 + Math.floor(Math.random() * 101);
    perfil.xp += ganho;
    perfil.xpTotal += ganho;

    const sorteio = Math.random();
    const atributo = sorteio < 0.4
      ? { nome: "aura", ganho: 8 + Math.floor(Math.random() * 8) }
      : sorteio < 0.7
        ? { nome: "forca", ganho: 3 + Math.floor(Math.random() * 4) }
        : { nome: "controle", ganho: 3 + Math.floor(Math.random() * 4) };

    perfil[atributo.nome] += atributo.ganho;

    let subiu = 0;
    const estagioAnterior = obterEstagio(perfil.nivel).nome;

    while (perfil.nivel < MAX_LEVEL && perfil.xp >= xpNecessario(perfil.nivel)) {
      perfil.xp -= xpNecessario(perfil.nivel);
      perfil.nivel += 1;
      perfil.aura += 15;
      perfil.forca += 3;
      perfil.controle += 3;
      subiu++;
    }

    if (perfil.nivel >= MAX_LEVEL) {
      perfil.nivel = MAX_LEVEL;
      perfil.xp = 0;
    }

    const estagioNovo = obterEstagio(perfil.nivel);
    await redis.set(chavePerfil(usuario), JSON.stringify(perfil));

    const mensagemNivel = subiu
      ? ` 🎉 SUBIU ${subiu} NÍVEL(IS)! Agora é nível ${perfil.nivel}/${MAX_LEVEL}!`
      : "";

    const mensagemEstagio = estagioNovo.nome !== estagioAnterior
      ? ` 🌟 NOVA EVOLUÇÃO: ${estagioNovo.nome}! Sua técnica ${perfil.habilidade} agora possui multiplicador narrativo x${estagioNovo.multiplicador}.`
      : "";

    const mensagemMaximo = perfil.nivel === MAX_LEVEL
      ? " 👑 VOCÊ ALCANÇOU O NÍVEL MÁXIMO! Você se tornou uma Lenda Viva!"
      : "";

    return `✅ TREINO BEM-SUCEDIDO! ${nomeExibicao(usuario)} ${exercicio} e aprimorou ${perfil.habilidade}! +${ganho} XP. 📈 +${atributo.ganho} de ${atributo.nome === "aura" ? "aura" : atributo.nome}. 🏅 Nível ${perfil.nivel}/${MAX_LEVEL} — ${estagioNovo.nome}.${mensagemNivel}${mensagemEstagio}${mensagemMaximo} ⏳ Próximo treino em 2 horas.`;
  }

  const falhas = [
    "perdeu a concentração e sua aura se dissipou antes de completar o exercício",
    "forçou demais os limites e precisou interromper o treino para se recuperar",
    "não conseguiu estabilizar a aura e o exercício saiu do controle",
    "calculou mal o fluxo de Nen e falhou no momento decisivo",
    "ficou exausto antes de concluir o desafio e precisou parar",
    "perdeu o controle da habilidade e precisou evitar uma lesão",
    "não conseguiu manter o foco e desperdiçou a aura acumulada"
  ];

  await redis.set(chavePerfil(usuario), JSON.stringify(perfil));

  return `❌ TREINO FALHOU! ${nomeExibicao(usuario)} tentou ${exercicio}, mas ${aleatorio(falhas)}. Nenhum XP recebido desta vez. 💪 Continue treinando, Caçador! ⏳ Próximo treino em 2 horas.`;
}

async function ranking(redis) {
  const perfis = [];
  let lote = [];

  async function processarLote() {
    if (!lote.length) return;

    const chaves = lote;
    lote = [];

    const resultados = await Promise.all(
      chaves.map(async chave => {
        const bruto = await redis.get(chave);
        if (!bruto) return null;

        try {
          return prepararPerfil(JSON.parse(bruto), chave.slice("nen:perfil:".length));
        } catch {
          return null;
        }
      })
    );

    for (const perfil of resultados) {
      if (perfil) perfis.push(perfil);
    }
  }

  for await (const chave of redis.scanIterator({
    MATCH: "nen:perfil:*",
    COUNT: 100
  })) {
    lote.push(chave);
    if (lote.length >= 50) await processarLote();
  }

  await processarLote();

  if (!perfis.length) {
    return "📜 Ainda não há Caçadores registrados. Use !nen para despertar seu poder!";
  }

  perfis.sort((a, b) =>
    b.nivel - a.nivel ||
    b.xpTotal - a.xpTotal ||
    b.vitorias - a.vitorias
  );

  const top = perfis.slice(0, 5).map((perfil, indice) => {
    const estagio = obterEstagio(perfil.nivel);
    return `${indice + 1}. ${nomeExibicao(perfil.usuario)} — Nv. ${perfil.nivel} (${estagio.nome}), ${perfil.xpTotal} XP`;
  });

  return `🏆 RANKING DOS CAÇADORES DE NEN: ${top.join(" | ")}`;
}

function narrarBatalha(atacante, defensor, vencedor) {
  const perdedor =
    vencedor.usuario.toLowerCase() === atacante.usuario.toLowerCase()
      ? defensor
      : atacante;

  const estagioVencedor = obterEstagio(vencedor.nivel);
  const estagioPerdedor = obterEstagio(perdedor.nivel);

  const aberturas = [
    "As duas auras colidem e fazem o campo de batalha estremecer!",
    "Uma pressão intensa de Nen toma conta do ambiente!",
    "Os dois Caçadores liberam suas auras e partem para o confronto!",
    "O choque entre as habilidades faz o ar vibrar!",
    "O campo de batalha se transforma numa arena de pura energia!"
  ];

  const finais = [
    `🏆 ${nomeExibicao(vencedor.usuario)} vence a batalha de Nen!`,
    `👑 ${nomeExibicao(vencedor.usuario)} é declarado o campeão!`,
    `🔥 ${nomeExibicao(vencedor.usuario)} encontra a abertura decisiva e vence!`,
    `⚔️ ${nomeExibicao(vencedor.usuario)} leva a melhor neste confronto!`
  ];

  const multiplicador = estagioVencedor.multiplicador;
  const forcaNarrativa = multiplicador >= 4
    ? "libera uma quantidade colossal de aura e"
    : multiplicador >= 2.5
      ? "usa sua aura aprimorada e"
      : "concentra sua aura e";

  return [
    aleatorio(aberturas),
    `${vencedor.emoji} ${nomeExibicao(vencedor.usuario)} (Nv. ${vencedor.nivel}, ${estagioVencedor.nome}) ${forcaNarrativa} ${vencedor.efeito}.`,
    `${perdedor.emoji} ${nomeExibicao(perdedor.usuario)} (Nv. ${perdedor.nivel}, ${estagioPerdedor.nome}) tenta responder com ${perdedor.habilidade}, mas não consegue superar o ataque decisivo.`,
    aleatorio(finais)
  ].join(" ");
}

export default async function handler(req, res) {
  try {
    const user = limparNome(req.query.user || req.query.sender);
    const target = limparNome(req.query.target || req.query.touser);
    const acao = String(req.query.acao || "").toLowerCase();
    const redis = await getRedis();

    if (acao === "ranking") {
      return res.status(200).send(await ranking(redis));
    }

    if (!user) {
      return res.status(400).send("Não consegui identificar o usuário. ⚡");
    }

    if (acao === "treinar") {
      return res.status(200).send(await treinar(redis, user));
    }

    if (!target || target.toLowerCase() === user.toLowerCase()) {
      const { perfil, novo } = await obterOuDespertarNen(redis, user);
      return res.status(200).send(mostrarPerfil(perfil, novo));
    }

    const atacante = await lerPerfil(redis, user);
    const defensor = await lerPerfil(redis, target);

    if (!atacante || !defensor) {
      const faltando = [];
      if (!atacante) faltando.push(nomeExibicao(user));
      if (!defensor) faltando.push(nomeExibicao(target));

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
