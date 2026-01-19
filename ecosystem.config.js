// PM2 Ecosystem Configuration
// This file ensures environment variables are loaded correctly

module.exports = {
  apps: [{
    name: 'founder-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/founder-dashboard',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // Load .env.local file
    env_file: '.env.local',
    // Auto restart on crash
    autorestart: true,
    // Watch disabled in production
    watch: false,
    // Max memory before restart
    max_memory_restart: '1G',
    // Log settings
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Merge environment variables
    merge_logs: true,
    // Time to wait before considering app online
    min_uptime: '10s',
    // Number of restarts within max_restarts time window
    max_restarts: 10,
    // Time window for max_restarts
    min_uptime: '10s'
  }]
};

