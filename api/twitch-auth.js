import crypto from "crypto";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

const REDIRECT_URI =
  "https://twitch-api-xi.vercel.app/api/twitch-auth";

function criarState() {
  const dados = {
    nonce: crypto.randomBytes(32).toString("hex"),
    criadoEm: Date.now()
  };

  const payload = Buffer.from(
    JSON.stringify(dados)
  ).toString("base64url");

  const assinatura = crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${assinatura}`;
}

function verificarState(state) {
  try {
    const partes = String(state || "").split(".");

    if (partes.length !== 2) {
      return false;
    }

    const [payload, assinaturaRecebida] = partes;

    const assinaturaEsperada = crypto
      .createHmac("sha256", CLIENT_SECRET)
      .update(payload)
      .digest("base64url");

    const a = Buffer.from(
      assinaturaRecebida
    );

    const b = Buffer.from(
      assinaturaEsperada
    );

    if (
      a.length !== b.length ||
      !crypto.timingSafeEqual(a, b)
    ) {
      return false;
    }

    const dados = JSON.parse(
      Buffer.from(
        payload,
        "base64url"
      ).toString("utf8")
    );

    // Estado válido somente por 10 minutos
    if (
      Date.now() - dados.criadoEm >
      10 * 60 * 1000
    ) {
      return false;
    }

    return true;

  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).send(
        "As credenciais da Twitch não estão configuradas no Vercel."
      );
    }

    // Primeira visita:
    // cria o state e manda para a Twitch.
    if (!req.query.code) {
      const state = criarState();

      const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "user:write:chat",
        state,
        force_verify: "true"
      });

      return res.redirect(
        302,
        `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
      );
    }

    // Twitch devolveu um erro
    if (req.query.error) {
      return res.status(400).send(
        `A Twitch recusou a autorização: ${
          req.query.error_description ||
          req.query.error
        }`
      );
    }

    // Verifica o state
    const stateValido =
      verificarState(req.query.state);

    if (!stateValido) {
      return res.status(403).send(
        "Autorização recusada: state OAuth inválido ou expirado. Abra o endereço de autorização novamente."
      );
    }

    const code = String(
      req.query.code
    );

    // Troca o código pelo token
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
      console.error(
        "Erro ao trocar código Twitch:",
        dados
      );

      return res.status(400).send(
        "A Twitch recusou o código de autorização. Tente iniciar a autorização novamente."
      );
    }

    if (!dados.refresh_token) {
      return res.status(500).send(
        "A Twitch não retornou um refresh token."
      );
    }

    const token = String(
      dados.refresh_token
    )
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >
        <title>Twitch autorizada</title>
      </head>

      <body style="
        font-family: Arial, sans-serif;
        background: #111;
        color: white;
        padding: 30px;
      ">

        <div style="
          max-width: 700px;
          margin: auto;
        ">

          <h1>✅ Twitch autorizada</h1>

          <p>
            A conta <strong>wBarretin</strong>
            foi autorizada com sucesso.
          </p>

          <p>
            Agora copie o token abaixo.
          </p>

          <p>
            No GitHub, ele deverá ser salvo como:
          </p>

          <p>
            <strong>TWITCH_REFRESH_TOKEN</strong>
          </p>

          <textarea
            readonly
            style="
              width:100%;
              height:130px;
              font-size:14px;
              box-sizing:border-box;
            "
          >${token}</textarea>

          <p style="
            color:#ffcc00;
            font-weight:bold;
          ">
            ⚠️ NÃO envie esse token para ninguém.
          </p>

          <p>
            Depois de salvá-lo no GitHub,
            feche esta página.
          </p>

        </div>

      </body>
      </html>
    `);

  } catch (erro) {
    console.error(
      "Erro Twitch OAuth:",
      erro
    );

    return res.status(500).send(
      "Erro interno ao processar a autorização."
    );
  }
}
