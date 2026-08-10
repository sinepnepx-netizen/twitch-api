export default async function handler(req, res) {
  const { user = "Alguém" } = req.query;

  try {
    const resposta = await fetch(
      "https://valorant-api.com/v1/weapons?language=pt-BR"
    );

    if (!resposta.ok) {
      throw new Error("Erro ao consultar a API do VALORANT");
    }

    const dados = await resposta.json();

    const skins = [];

    for (const arma of dados.data || []) {

      // Ignora armas que não possuem skins
      if (!arma.skins) continue;

      for (const skin of arma.skins) {

        if (!skin.displayName) continue;

        // Ignora a skin padrão
        if (
          skin.displayName.toLowerCase() ===
          arma.displayName.toLowerCase()
        ) {
          continue;
        }

        // Ignora variantes/chromas
        if (
          skin.displayName.toLowerCase().includes("variant")
        ) {
          continue;
        }

        let nomeSkin = skin.displayName.trim();
        const nomeArma = arma.displayName.trim();

        // Remove o nome da arma do começo da skin
        // caso a API tenha retornado algo como:
        // "Phantom Oni"
        const regexArma = new RegExp(
          `^${nomeArma}\\s*`,
          "i"
        );

        nomeSkin = nomeSkin
          .replace(regexArma, "")
          .trim();

        // Se depois da remoção não sobrou nome,
        // usa o nome original para não ficar vazio.
        if (!nomeSkin) {
          nomeSkin = skin.displayName;
        }

        skins.push({
          arma: nomeArma,
          skin: nomeSkin
        });
      }
    }

    if (skins.length === 0) {
      return res
        .status(500)
        .send("Nenhuma skin encontrada.");
    }

    const sorteada =
      skins[Math.floor(Math.random() * skins.length)];

    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    res.status(200).send(
      `@${user} tirou a ${sorteada.arma} ${sorteada.skin} no baú! 🎁🔥`
    );

  } catch (erro) {

    console.error(erro);

    res
      .status(500)
      .send("💀 O baú bugou, tenta de novo.");
  }
}
