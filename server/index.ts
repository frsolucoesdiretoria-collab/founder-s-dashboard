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
import { assertEnvVars } from './lib/envValidator';

// Load environment variables (priority: .env.local > .env)
// .env.local takes precedence and is not committed to git
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Validate environment variables before starting server
try {
  assertEnvVars();
  console.log('✅ Environment variables validated');
} catch (error: any) {
  console.error('\n' + error.message + '\n');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.VITE_DEV_SERVER_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`\n💡 Health check: http://localhost:${PORT}/api/admin/health`);
  console.log(`💡 Self test: http://localhost:${PORT}/api/__selftest\n`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the process using port ${PORT} or change PORT in .env.local`);
  } else {
    console.error('❌ Failed to start server:', err.message);
  }
  process.exit(1);
});

