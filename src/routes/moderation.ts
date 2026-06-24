// ─── V5 Moderation Routes (admin-protected) ─────────────────────
import { Hono } from 'hono';
import type { Env } from '../types/media';
import { requireAdmin } from '../middleware/auth';
import {
  handleModerationUpdate,
  handleClassificationUpdate,
  handleAiMetadataUpdate,
  handleReviewQueue,
  handleIntelligenceSummary,
} from '../services/media-service';

const moderationRoute = new Hono<{ Bindings: Env }>();
moderationRoute.use('*', requireAdmin);

// GET /api/media/moderate/review-queue
moderationRoute.get('/review-queue', async (c) => {
  const filters = {
    appId: c.req.query('appId') || undefined,
    tenantId: c.req.query('tenantId') || undefined,
    moderationStatus: c.req.query('moderationStatus') || undefined,
    classification: c.req.query('classification') || undefined,
  };
  const result = await handleReviewQueue(c.env, filters);
  return c.json({ success: true, data: result, count: result.length });
});

// GET /api/media/moderate/intelligence-summary
moderationRoute.get('/intelligence-summary', async (c) => {
  const appId = c.req.query('appId') || undefined;
  const result = await handleIntelligenceSummary(c.env, appId);
  return c.json({ success: true, data: result });
});

// PATCH /api/media/moderate/:id/moderation
moderationRoute.patch('/:id/moderation', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await handleModerationUpdate(c.env, id, body);
  return c.json({ success: true, data: result });
});

// PATCH /api/media/moderate/:id/classification
moderationRoute.patch('/:id/classification', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await handleClassificationUpdate(c.env, id, body);
  return c.json({ success: true, data: result });
});

// PATCH /api/media/moderate/:id/ai-metadata
moderationRoute.patch('/:id/ai-metadata', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await handleAiMetadataUpdate(c.env, id, body);
  return c.json({ success: true, data: result });
});

export default moderationRoute;
