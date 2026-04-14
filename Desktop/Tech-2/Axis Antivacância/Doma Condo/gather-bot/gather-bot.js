const { Game } = require("@gathertown/gather-game-client");
const express = require("express");
const axios = require("axios");

// ─── Configuração ───────────────────────────────────────────
const GATHER_API_KEY = process.env.GATHER_API_KEY;
const GATHER_SPACE_ID = process.env.GATHER_SPACE_ID;
// Formato do SPACE_ID: "ABC123\\nome-do-espaco"
// Exemplo: "xKj9mN\\doma-condo"

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
// URL do webhook do N8N que recebe mensagens das funcionárias

const BOT_HTTP_PORT = process.env.BOT_HTTP_PORT || 3500;
// Porta onde o bot escuta respostas do N8N

// ─── Conectar ao Gather ──────────────────────────────────────
const game = new Game(
  GATHER_SPACE_ID,
  () => Promise.resolve({ apiKey: GATHER_API_KEY })
);

game.connect();

// Confirmar conexão
game.subscribeToEvent("ready", () => {
  console.log("[Gather Bot] Conectado ao espaço com sucesso.");
});

// ─── Receber DMs das funcionárias ────────────────────────────
game.subscribeToEvent("playerChats", async (data, context) => {
  const chat = data.playerChats;

  // Filtrar apenas mensagens diretas (DM)
  // messageType "DM" indica mensagem privada
  if (chat.messageType !== "DM") return;

  const remetenteId = chat.senderId;     // ID do jogador que enviou
  const mensagem = chat.contents;        // Texto da mensagem
  const mapaId = context.spaceId;        // ID do espaço/mapa atual

  console.log(`[Gather Bot] DM recebida de ${remetenteId}: ${mensagem}`);

  // Montar payload para o N8N
  const payload = {
    funcionaria_id: remetenteId,
    mensagem: mensagem,
    sessao_id: `${remetenteId}-${Date.now()}`,
    mapa_id: mapaId,
    timestamp: new Date().toISOString(),
  };

  try {
    // Enviar para o N8N processar com o Gemini
    await axios.post(N8N_WEBHOOK_URL, payload);
    console.log(`[Gather Bot] Mensagem enviada ao N8N para processamento.`);
  } catch (err) {
    console.error("[Gather Bot] Erro ao enviar para N8N:", err.message);

    // Avisar a funcionária que houve erro
    game.chat(
      "DM",
      [{ name: "", map: mapaId, target: remetenteId }],
      mapaId,
      "Desculpe, tive um problema ao processar sua mensagem. Tente novamente em instantes."
    );
  }
});

// ─── Endpoint HTTP — receber resposta do N8N ─────────────────
// O N8N chama esta rota com a resposta gerada pelo Gemini
const app = express();
app.use(express.json());

app.post("/responder", (req, res) => {
  const { funcionaria_id, resposta, mapa_id } = req.body;

  if (!funcionaria_id || !resposta) {
    return res.status(400).json({ erro: "funcionaria_id e resposta são obrigatórios" });
  }

  const mapDestino = mapa_id || "main"; // mapa padrão se não informado

  console.log(`[Gather Bot] Enviando resposta para ${funcionaria_id}: ${resposta}`);

  // Enviar DM de volta para a funcionária no Gather
  game.chat(
    "DM",
    [{ name: "", map: mapDestino, target: funcionaria_id }],
    mapDestino,
    resposta
  );

  res.json({ ok: true });
});

app.listen(BOT_HTTP_PORT, () => {
  console.log(`[Gather Bot] Endpoint HTTP rodando na porta ${BOT_HTTP_PORT}`);
});
