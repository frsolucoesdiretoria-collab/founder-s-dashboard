// PM2 Ecosystem File
// This file loads .env.local automatically

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

module.exports = {
  apps: [{
    name: 'founder-dashboard',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      // Load all vars from .env.local
      ...process.env
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
