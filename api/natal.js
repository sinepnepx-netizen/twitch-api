export default function handler(req, res) {
  try {
    const agora = new Date();

    // Natal: 25 de dezembro às 00:00
    let natal = new Date(agora.getFullYear(), 11, 25, 0, 0, 0);

    // Se o Natal deste ano já passou, conta para o próximo
    if (agora >= natal) {
      natal = new Date(agora.getFullYear() + 1, 11, 25, 0, 0, 0);
    }

    const diferenca = natal - agora;

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor(
      (diferenca / (1000 * 60 * 60)) % 24
    );
    const minutos = Math.floor(
      (diferenca / (1000 * 60)) % 60
    );
    const segundos = Math.floor(
      (diferenca / 1000) % 60
    );

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    res.status(200).send(
      `🎄 Faltam ${dias} dias, ${horas} horas, ${minutos} minutos e ${segundos} segundos para o Natal! 🎅`
    );

  } catch (erro) {
    res.status(500).send("Erro ao calcular a contagem para o Natal.");
  }
}
