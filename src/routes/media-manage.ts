// ─── V2 Media Management Routes (admin-protected) ───────────────
import { Hono } from 'hono';
import type { Env } from '../types/media';
import { requireAdmin } from '../middleware/auth';
import {
  handleUpdate,
  handleSoftDelete,
  handleReplace,
  handleUsageIncrement,
  handleListTenants,
  handleAdminQuery,
} from '../services/media-service';

const manageRoute = new Hono<{ Bindings: Env }>();

// All routes require admin token
manageRoute.use('*', requireAdmin);

// PATCH /api/media/:id — Update metadata
manageRoute.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await handleUpdate(c.env, id, body);
  return c.json({ success: true, data: result });
});

// DELETE /api/media/:id — Soft delete
manageRoute.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const appId = c.req.query('appId') ?? '';
  const tenantId = c.req.query('tenantId') ?? '';
  const result = await handleSoftDelete(c.env, id, appId, tenantId);
  return c.json({ success: true, data: result });
});

// POST /api/media/:id/replace — Replace image
manageRoute.post('/:id/replace', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await handleReplace(c.env, id, body);
  return c.json({ success: true, data: result });
});

// POST /api/media/:id/usage — Increment usage count
manageRoute.post('/:id/usage', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const result = await handleUsageIncrement(c.env, id, body);
  return c.json({ success: true, data: result });
});

// GET /api/media/tenants — List tenants
manageRoute.get('/tenants', async (c) => {
  const appId = c.req.query('appId');
  const result = await handleListTenants(c.env, appId);
  return c.json({ success: true, data: result });
});

// GET /api/admin/media — Admin query (no required filters)
manageRoute.get('/admin/query', async (c) => {
  const filters = {
    appId: c.req.query('appId') || undefined,
    tenantId: c.req.query('tenantId') || undefined,
    entityType: c.req.query('entityType') || undefined,
    imageRole: c.req.query('imageRole') || undefined,
    status: c.req.query('status') || undefined,
    limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 50,
    offset: c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0,
  };
  const result = await handleAdminQuery(c.env, filters);
  return c.json({ success: true, ...result });
});

export default manageRoute;
