// FR Tech OS - Express Server
// Server-side only - handles all Notion API calls

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { healthRouter } from './routes/health';
import { selftestRouter } from './routes/selftest';
import { kpisRouter } from './routes/kpis';
import { goalsRouter } from './routes/goals';
import { actionsRouter } from './routes/actions';
import { journalRouter } from './routes/journal';
import { financeRouter } from './routes/finance';
import { databasesRouter } from './routes/databases';
import { contactsRouter } from './routes/contacts';
import { crmRouter } from './routes/crm';
import { produtosRouter } from './routes/produtos';
import { doterraRouter } from './routes/doterra';
import { vendeMaisObrasRouter } from './routes/vendeMaisObras';
import proposalsRouter from './routes/proposals';
import { domaCondoClientRouter } from './routes/domaCondoClient';
import { enzoRouter } from './routes/enzo';
import { validateEnvVars } from './lib/envValidator';

// Load environment variables (priority: .env.local > .env)
// .env.local takes precedence and is not committed to git
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Validate environment variables before starting server
// Em produção, não crashar se variáveis opcionais estiverem faltando
try {
  const result = validateEnvVars();
  if (result.valid) {
    console.log('✅ Environment variables validated');
  } else {
    // Em produção, apenas avisar mas não crashar
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Some environment variables are missing, but continuing...');
      console.warn('   Missing:', result.missing.join(', '));
    } else {
      // Em desenvolvimento, crashar para forçar configuração
      console.error('\n' + '❌ Missing required environment variables:\n' + result.missing.map(v => `   - ${v}`).join('\n') + '\n');
      process.exit(1);
    }
  }
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    result.warnings.forEach(w => console.warn(`   ${w}`));
  }
} catch (error: any) {
  // Em produção, apenas avisar
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Error validating environment variables:', error.message);
    console.warn('   Continuing anyway...');
  } else {
    console.error('\n' + error.message + '\n');
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS: Em produção, aceitar requisições do mesmo domínio (mesmo servidor)
// Em desenvolvimento, aceitar do Vite dev server
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true // Aceitar qualquer origem em produção (mesmo servidor)
    : (process.env.CORS_ORIGIN || process.env.VITE_DEV_SERVER_URL || 'http://localhost:8080'),
  credentials: true
};
app.use(cors(corsOptions));
// Increase JSON limit to support CSV uploads as text payloads (import)
app.use(express.json({ limit: '10mb' }));

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/admin/health', healthRouter);
app.use('/api/admin/databases', databasesRouter);
app.use('/api/__selftest', selftestRouter);
app.use('/api/kpis', kpisRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/finance', financeRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/doterra', doterraRouter);
app.use('/api/vende-mais-obras', vendeMaisObrasRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/doma-condo-clientes', domaCondoClientRouter);
app.use('/api/enzo', enzoRouter);

// Serve static files in production/staging (after API routes)
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  const distPath = resolve(process.cwd(), 'dist');
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // Serve index.html for all non-API routes (SPA routing)
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(distPath, 'index.html'));
    });
    
    console.log(`📁 Serving static files from: ${distPath}`);
  } else {
    console.warn(`⚠️  Warning: dist directory not found at ${distPath}`);
  }
}

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with retry logic for port conflicts
function startServer() {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`\n💡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💡 Admin health: http://localhost:${PORT}/api/admin/health`);
    console.log(`💡 Self test: http://localhost:${PORT}/api/__selftest\n`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`   Attempting to kill process on port ${PORT}...`);
      // Try to kill the process on the port (Linux/Mac)
      try {
        if (process.platform !== 'win32') {
          execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
          console.log(`   Waiting 2 seconds before retry...`);
          setTimeout(() => {
            console.log(`   Retrying to start server...`);
            startServer();
          }, 2000);
        } else {
          console.error(`   Please stop the process using port ${PORT} or change PORT in .env.local`);
          process.exit(1);
        }
      } catch (killErr) {
        console.error(`   Could not kill process on port ${PORT}. Please stop it manually.`);
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to start server:', err.message);
      process.exit(1);
    }
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer();

