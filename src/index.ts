// ─── Shared Media Service (SMS) V4 — Worker Entry Point ─────────
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types/media';
import { ValidationError } from './middleware/validate';
import { requireAdmin } from './middleware/auth';
import { getAdminHtml } from './admin/ui';

import uploadUrlRoute from './routes/upload-url';
import registerRoute from './routes/register';
import receiptsRoute from './routes/receipts';
import manageRoute from './routes/media-manage';
import mediaRoute from './routes/media';

const app = new Hono<{ Bindings: Env }>();

// ─── Global Middleware ──────────────────────────────────────────
app.use('*', cors());

// ─── Health Check ───────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    service: 'shared-media-service',
    version: '4.0.0',
    status: 'healthy',
  })
);

app.get('/health', (c) =>
  c.json({
    service: 'shared-media-service',
    version: '4.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
);

// ─── V1 API Routes (backward compatible) ────────────────────────
app.route('/api/media/upload-url', uploadUrlRoute);
app.route('/api/media/register', registerRoute);

// ─── V4 Receipt Routes (before catch-all) ───────────────────────
app.route('/api/media/receipts', receiptsRoute);
app.route('/api/media', receiptsRoute);

// ─── V2 Admin-Protected Routes ──────────────────────────────────
app.route('/api/media/manage', manageRoute);

// ─── V1 Query Route (catch-all for /api/media) ─────────────────
app.route('/api/media', mediaRoute);

// ─── Admin UI ───────────────────────────────────────────────────
app.get('/admin/media', (c) => {
  return c.html(getAdminHtml(c.env.ENVIRONMENT || 'production'));
});

// ─── Global Error Handler ───────────────────────────────────────
app.onError((err, c) => {
  if (err instanceof ValidationError) {
    return c.json({ success: false, error: err.message }, err.status as 400);
  }
  console.error('Unhandled error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500 as const);
});

// ─── 404 Handler ────────────────────────────────────────────────
app.notFound((c) =>
  c.json({ success: false, error: 'Not found' }, 404)
);

export default app;
