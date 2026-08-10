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

      for (const skin of arma.skins || []) {

        // Ignora a skin padrão da arma
        if (
          !skin.displayName ||
          skin.displayName === arma.displayName
        ) {
          continue;
        }

        skins.push({
          arma: arma.displayName,
          skin: skin.displayName
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
