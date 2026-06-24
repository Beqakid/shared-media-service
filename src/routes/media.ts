// ─── GET /api/media ─────────────────────────────────────────────
import { Hono } from 'hono';
import type { Env, MediaQueryParams } from '../types/media';
import { handleQuery } from '../services/media-service';

const mediaRoute = new Hono<{ Bindings: Env }>();

mediaRoute.get('/', async (c) => {
  const params: MediaQueryParams = {
    appId: c.req.query('appId') ?? '',
    tenantId: c.req.query('tenantId') ?? '',
    entityType: c.req.query('entityType'),
    entityId: c.req.query('entityId'),
    imageRole: c.req.query('imageRole'),
    status: c.req.query('status'),
  };

  const results = await handleQuery(c.env, params);

  return c.json({
    success: true,
    data: results,
    count: results.length,
  });
});

export default mediaRoute;
