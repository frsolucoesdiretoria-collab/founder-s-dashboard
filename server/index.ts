// FR Tech OS - Express Server
// Server-side only - handles all Notion API calls

import express from 'express';
import cors from 'cors';
import compression from 'compression'; // Gzip compression
import { config } from 'dotenv';
// Core modules
import { resolve, join } from 'path';
import { existsSync } from 'fs';

// Routes
import { healthRouter } from './routes/health';
import { databasesRouter } from './routes/databases';
import { selftestRouter } from './routes/selftest';
import { kpisRouter } from './routes/kpis';
import { goalsRouter } from './routes/goals';
import { actionsRouter } from './routes/actions';
import { journalRouter } from './routes/journal';
import { financeRouter } from './routes/finance';
import { contactsRouter } from './routes/contacts';
import { crmRouter } from './routes/crm';
import { produtosRouter } from './routes/produtos';
import { leadGateRouter } from './routes/leadGate';

// ... existing code ...

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Enable Gzip compression
app.use(compression());

// CORS: Em produção, aceitar requisições do mesmo domínio (mesmo servidor)
// Em desenvolvimento, aceitar do Vite dev server
const corsOptions = {
  // ... existing code ...
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
app.use('/api/lead-gate', leadGateRouter);

// Notion API Client
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN_AXIS_LEADS || process.env.NOTION_API_KEY // Fallback
});

const NOTION_DB_ID = process.env.NOTION_DB_AXIS_LEADS;

app.post('/api/save-lead', async (req, res) => {
  try {
    const { name, phone, estimatedLoss } = req.body;

    console.log('📝 New Lead:', { name, phone, estimatedLoss });

    if (!NOTION_DB_ID) {
      console.error('❌ Missing NOTION_DB_AXIS_LEADS env var');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await notion.pages.create({
      parent: { database_id: NOTION_DB_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name || 'Sem nome',
              },
            },
          ],
        },
        Phone: {
          phone_number: phone || '',
        },
        'Perda Estimada': {
          number: Number(estimatedLoss) || 0
        },
        Status: {
          select: {
            name: "Novo Lead"
          }
        },
        Date: {
          date: {
            start: new Date().toISOString()
          }
        }
      },
    });

    console.log('✅ Lead saved to Notion:', response.id);
    res.json({ success: true, id: response.id });
  } catch (error: any) {
    console.error('❌ Error saving to Notion:', error.body || error.message);
    res.status(500).json({ error: 'Failed to save lead', details: error.message });
  }
});

// Serve static files (after API routes)
// First, serve public folder (for landing pages like /v4-1, /v4-2, etc.)
const publicPath = resolve(process.cwd(), 'public');
if (existsSync(publicPath)) {
  app.use(express.static(publicPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
  }));
  console.log(`📁 Serving public files from: ${publicPath}`);
}

// Serve in any environment where dist folder exists
const distPath = resolve(process.cwd(), 'dist');
const distPathForLog = distPath;

if (existsSync(distPath)) {
  // Serve static files (JS, CSS, images, etc.)
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
  }));

  console.log(`📁 Serving static files from: ${distPath}`);
} else {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    console.warn(`⚠️  Warning: dist directory not found at ${distPath}`);
    console.warn(`   Make sure to run 'npm run build' before starting the server in production`);
  }
}

// Serve index.html for all non-API routes (SPA routing)
// This must be LAST, after all API routes and static files
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Skip if it's a file request (has extension) - let express.static handle it
  // Exception: file requests that failed static middleware should probably 404
  // but if we are here, static middleware already ran.
  if (req.path.includes('.') && !req.path.endsWith('/')) {
    return next();
  }

  // Serve index.html for SPA routes
  // Prefer dist/index.html
  const indexPath = join(distPathForLog, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  } else {
    res.status(404).send('Application not built (index.html missing)');
  }
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
// PM2 já gerencia a porta, então não precisamos de retry complexo
let server: any;
try {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`\n💡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💡 Admin health: http://localhost:${PORT}/api/admin/health`);
    console.log(`💡 Self test: http://localhost:${PORT}/api/__selftest\n`);

    // Log environment status
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📋 Port: ${PORT}`);
    console.log(`📋 Dist path: ${existsSync(distPathForLog) ? distPathForLog : 'NOT FOUND'}`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    console.error('❌ Server startup error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`   PM2 should handle this. If error persists, check: pm2 list`);
      console.error(`   To kill process on port ${PORT}: lsof -ti:${PORT} | xargs kill -9`);
    } else {
      console.error('❌ Failed to start server:', err.message);
      console.error('   Error code:', err.code);
    }
    // Não crashar imediatamente, deixar PM2 gerenciar
    setTimeout(() => {
      console.error('❌ Exiting due to server startup error');
      process.exit(1);
    }, 1000);
  });
} catch (error: any) {
  console.error('❌ Fatal error starting server:', error);
  console.error('   Message:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('   Message:', error.message);
  console.error('   Stack:', error.stack);
  // Don't exit immediately, let PM2 handle it
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('   Reason:', reason);
  // Don't exit immediately, let PM2 handle it
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

