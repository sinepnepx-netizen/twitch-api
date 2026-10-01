const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

export default async function handler(req, res) {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send(
        "Código de autorização não recebido."
      );
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).send(
        "As credenciais da Twitch não estão configuradas no Vercel."
      );
    }

    const params = new URLSearchParams();

    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append(
      "redirect_uri",
      "https://twitch-api-xi.vercel.app/api/twitch-auth"
    );

    const resposta = await fetch(
      "https://id.twitch.tv/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },
        body: params.toString()
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro Twitch:", dados);

      return res.status(400).send(
        "A Twitch recusou a autorização. O código pode ter expirado ou já ter sido utilizado."
      );
    }

    if (!dados.refresh_token) {
      return res.status(500).send(
        "A Twitch não retornou um refresh token."
      );
    }

    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width,initial-scale=1">
        <title>Autorização concluída</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            background: #111;
            color: white;
          }

          .box {
            max-width: 700px;
            margin: auto;
          }

          textarea {
            width: 100%;
            min-height: 120px;
            font-size: 14px;
            box-sizing: border-box;
          }

          .aviso {
            color: #ffcc00;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <div class="box">
          <h1>✅ Twitch autorizada</h1>

          <p>
            A conta <strong>wBarretin</strong> foi autorizada.
          </p>

          <p>
            Agora copie o conteúdo abaixo e coloque no
            GitHub Secret chamado:
          </p>

          <p><strong>TWITCH_REFRESH_TOKEN</strong></p>

          <textarea readonly>${String(
            dados.refresh_token
          )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")}</textarea>

          <p class="aviso">
            ⚠️ NÃO envie esse token para ninguém.
          </p>

          <p>
            Depois de copiar para o GitHub,
            feche esta página.
          </p>
        </div>
      </body>
      </html>
    `);

  } catch (erro) {
    console.error(erro);

    return res.status(500).send(
      "Erro interno ao processar a autorização."
    );
  }
}
