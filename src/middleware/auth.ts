// ─── Admin Auth Middleware (V2) ─────────────────────────────────
import { Context, Next } from 'hono';
import type { Env } from '../types/media';

/**
 * Middleware that checks for a valid admin token.
 * Token must be passed as: Authorization: Bearer <SMS_ADMIN_TOKEN>
 */
export async function requireAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const adminToken = c.env.SMS_ADMIN_TOKEN;

  if (!adminToken) {
    return c.json({ success: false, error: 'Admin access not configured' }, 503);
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ success: false, error: 'Authorization required' }, 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1] !== adminToken) {
    return c.json({ success: false, error: 'Invalid admin token' }, 403);
  }

  await next();
}
