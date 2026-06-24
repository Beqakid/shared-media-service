// ─── POST /api/media/upload-url ─────────────────────────────────
import { Hono } from 'hono';
import type { Env } from '../types/media';
import { handleUploadUrl } from '../services/media-service';

const uploadUrlRoute = new Hono<{ Bindings: Env }>();

uploadUrlRoute.post('/', async (c) => {
  const body = await c.req.json();

  const result = await handleUploadUrl(c.env, body);

  return c.json({
    success: true,
    data: {
      uploadURL: result.uploadURL,
      imageId: result.imageId,
    },
  });
});

export default uploadUrlRoute;
