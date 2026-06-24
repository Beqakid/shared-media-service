// ─── Cloudflare Images Service (V2) ─────────────────────────────
import { IMAGE_VARIANTS, type Env } from '../types/media';

const CF_IMAGES_API = 'https://api.cloudflare.com/client/v4/accounts';

interface DirectUploadResponse {
  result: { id: string; uploadURL: string };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
}

/**
 * Request a Direct Creator Upload URL from Cloudflare Images.
 */
export async function createDirectUploadUrl(
  env: Env,
  metadata?: Record<string, string>
): Promise<{ uploadURL: string; imageId: string }> {
  const url = `${CF_IMAGES_API}/${env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`;

  const body = new FormData();
  body.append('requireSignedURLs', 'false');
  if (metadata) {
    body.append('metadata', JSON.stringify(metadata));
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_IMAGES_API_TOKEN}` },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudflare Images API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as DirectUploadResponse;
  if (!data.success) {
    throw new Error(`Cloudflare Images API failed: ${data.errors.map((e) => e.message).join(', ')}`);
  }

  return { uploadURL: data.result.uploadURL, imageId: data.result.id };
}

/**
 * Build variant delivery URLs for an image (V2: includes public).
 */
export function buildVariantUrls(
  accountHash: string,
  imageId: string
): Record<string, string> {
  const base = `https://imagedelivery.net/${accountHash}/${imageId}`;
  const urls: Record<string, string> = {};

  for (const variant of Object.keys(IMAGE_VARIANTS)) {
    urls[variant] = `${base}/${variant}`;
  }
  urls.public = `${base}/public`;

  return urls;
}
