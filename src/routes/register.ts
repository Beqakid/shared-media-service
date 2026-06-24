// ─── POST /api/media/register ───────────────────────────────────
import { Hono } from 'hono';
import type { Env } from '../types/media';
import { handleRegister } from '../services/media-service';

const registerRoute = new Hono<{ Bindings: Env }>();

registerRoute.post('/', async (c) => {
  const body = await c.req.json();

  const result = await handleRegister(c.env, body);

  return c.json({
    success: true,
    data: result,
  });
});

export default registerRoute;
