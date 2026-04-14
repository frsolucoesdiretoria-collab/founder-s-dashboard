module.exports = {
  apps: [
    {
      name: "doma-gather-bot",
      script: "./gather-bot.js",
      env: {
        NODE_ENV: "production",
        GATHER_API_KEY: "sua_api_key",
        GATHER_SPACE_ID: "ABC123\\nome-espaco",
        N8N_WEBHOOK_URL: "http://localhost:5678/webhook/gather-mensagem",
        BOT_HTTP_PORT: "3500",
      },
      restart_delay: 5000,     // aguarda 5s antes de reiniciar em caso de crash
      max_restarts: 10,
    },
  ],
};
