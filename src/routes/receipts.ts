// ─── Receipt Routes (V4) ─────────────────────────────────────────
import { Hono } from 'hono';
import type { Env } from '../types/media';
import { getReceiptsByMediaAssetId, queryReceipts } from '../db/media-receipts';
import { createReceipt } from '../services/receipt-service';
import { requireAdmin } from '../middleware/auth';

const receipts = new Hono<{ Bindings: Env }>();

/**
 * GET /api/media/receipts
 * Query receipts with filters. appId is required.
 */
receipts.get('/', async (c) => {
  const appId = c.req.query('appId');
  if (!appId) {
    return c.json({ error: 'appId query parameter is required' }, 400);
  }

  const tenantId = c.req.query('tenantId');
  const mediaAssetId = c.req.query('mediaAssetId');
  const actionType = c.req.query('actionType');
  const entityType = c.req.query('entityType');
  const entityId = c.req.query('entityId');

  const results = await queryReceipts(c.env.DB, {
    appId,
    tenantId: tenantId || undefined,
    mediaAssetId: mediaAssetId || undefined,
    actionType: actionType || undefined,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
  });

  return c.json({ receipts: results });
});

/**
 * GET /api/media/:id/receipts
 * Get receipts for a specific media asset. Validates ownership.
 */
receipts.get('/:id/receipts', async (c) => {
  const id = c.req.param('id');
  const appId = c.req.query('appId');
  const tenantId = c.req.query('tenantId');

  if (!appId || !tenantId) {
    return c.json({ error: 'appId and tenantId query parameters are required' }, 400);
  }

  // Validate the media asset exists and belongs to app/tenant
  const asset = await c.env.DB.prepare(
    'SELECT id FROM media_assets WHERE id = ? AND app_id = ? AND tenant_id = ?',
  )
    .bind(id, appId, tenantId)
    .first();

  if (!asset) {
    return c.json({ error: 'Media asset not found or does not belong to this app/tenant' }, 404);
  }

  const results = await getReceiptsByMediaAssetId(c.env.DB, id, appId, tenantId);
  return c.json({ receipts: results });
});

/**
 * POST /api/media/:id/receipt
 * Create a receipt for a media asset (admin only).
 */
receipts.post('/:id/receipt', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    appId: string;
    tenantId: string;
    actionType: string;
    actorUserId?: string;
    metadata?: Record<string, unknown>;
  }>();

  if (!body.appId || !body.tenantId || !body.actionType) {
    return c.json({ error: 'appId, tenantId, and actionType are required' }, 400);
  }

  // Validate the media asset exists and belongs to app/tenant
  const asset = await c.env.DB.prepare(
    'SELECT id, entity_type, entity_id, image_role, image_id FROM media_assets WHERE id = ? AND app_id = ? AND tenant_id = ?',
  )
    .bind(id, body.appId, body.tenantId)
    .first<{ id: string; entity_type: string; entity_id: string; image_role: string; image_id: string }>();

  if (!asset) {
    return c.json({ error: 'Media asset not found or does not belong to this app/tenant' }, 404);
  }

  const receipt = await createReceipt(c.env.DB, {
    appId: body.appId,
    tenantId: body.tenantId,
    mediaAssetId: id,
    actionType: body.actionType,
    actorUserId: body.actorUserId,
    entityType: asset.entity_type ?? undefined,
    entityId: asset.entity_id ?? undefined,
    imageRole: asset.image_role ?? undefined,
    imageId: asset.image_id ?? undefined,
    metadata: body.metadata,
  });

  return c.json({ receipt }, 201);
});

export default receipts;
