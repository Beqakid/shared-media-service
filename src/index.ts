// ─── Shared Media Service (SMS) — Worker Entry Point ────────────
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types/media';
import { ValidationError } from './middleware/validate';

import uploadUrlRoute from './routes/upload-url';
import registerRoute from './routes/register';
import mediaRoute from './routes/media';

const app = new Hono<{ Bindings: Env }>();

// ─── Global Middleware ──────────────────────────────────────────

// CORS — allow requests from any origin (lock down in production)
app.use('*', cors());

// ─── Health Check ───────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    service: 'shared-media-service',
    version: '1.0.0',
    status: 'healthy',
  })
);

app.get('/health', (c) =>
  c.json({
    service: 'shared-media-service',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
);

// ─── API Routes ─────────────────────────────────────────────────
app.route('/api/media/upload-url', uploadUrlRoute);
app.route('/api/media/register', registerRoute);
app.route('/api/media', mediaRoute);

// ─── Global Error Handler ───────────────────────────────────────
app.onError((err, c) => {
  if (err instanceof ValidationError) {
    return c.json({ success: false, error: err.message }, err.status as 400);
  }

  console.error('Unhandled error:', err);
  return c.json(
    { success: false, error: 'Internal server error' },
    500 as const
  );
});

// ─── 404 Handler ────────────────────────────────────────────────
app.notFound((c) =>
  c.json({ success: false, error: 'Not found' }, 404)
);

export default app;
