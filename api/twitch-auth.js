import crypto from "crypto";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

const REDIRECT_URI =
  "https://twitch-api-xi.vercel.app/api/twitch-auth";

export default async function handler(req, res) {
  try {
    // Primeira visita: inicia a autorização
    if (!req.query.code) {
      const state = crypto.randomBytes(32).toString("hex");

      res.setHeader(
        "Set-Cookie",
        `twitch_oauth_state=${state}; Path=/api/twitch-auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
      );

      const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "user:write:chat",
        state
      });

      return res.redirect(
        302,
        `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
      );
    }

    // Verifica o state recebido
    const cookies = req.headers.cookie || "";

    const match = cookies.match(
      /(?:^|;\s*)twitch_oauth_state=([^;]+)/
    );

    const stateCookie = match
      ? decodeURIComponent(match[1])
      : "";

    const stateRecebido = String(
      req.query.state || ""
    );

    if (
      !stateCookie ||
      !stateRecebido ||
      !crypto.timingSafeEqual(
        Buffer.from(stateCookie),
        Buffer.from(stateRecebido)
      )
    ) {
      return res.status(403).send(
        "Autorização recusada: state OAuth inválido."
      );
    }

    const code = String(req.query.code);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI
    });

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

    // Remove o cookie de state
    res.setHeader(
      "Set-Cookie",
      "twitch_oauth_state=; Path=/api/twitch-auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    );

    const token = String(dados.refresh_token)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
          content="width=device-width, initial-scale=1">
        <title>Twitch autorizada</title>
      </head>

      <body style="
        font-family: Arial;
        background: #111;
        color: white;
        padding: 30px;
      ">

        <h1>✅ Autorização concluída</h1>

        <p>
          A conta <strong>wBarretin</strong> foi autorizada.
        </p>

        <p>
          Copie o token abaixo e coloque no GitHub Secret:
        </p>

        <p>
          <strong>TWITCH_REFRESH_TOKEN</strong>
        </p>

        <textarea
          readonly
          style="
            width:100%;
            max-width:700px;
            height:130px;
            font-size:14px;
          "
        >${token}</textarea>

        <p style="color:#ffcc00;font-weight:bold;">
          ⚠️ Não envie esse token para ninguém.
        </p>

        <p>
          Depois de salvá-lo no GitHub, pode fechar esta página.
        </p>

      </body>
      </html>
    `);

  } catch (erro) {
    console.error("Erro:", erro);

    return res.status(500).send(
      "Erro interno ao processar a autorização."
    );
  }
}
