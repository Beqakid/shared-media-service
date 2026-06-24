// ─── Media Service — Core Business Logic ────────────────────────
import { createDirectUploadUrl, buildVariantUrls } from './cloudflare-images';
import { insertMediaAsset, queryMediaAssets } from '../db/media-assets';
import type {
  Env,
  UploadUrlRequest,
  RegisterRequest,
  MediaQueryParams,
  MediaAsset,
  MediaAssetResponse,
} from '../types/media';
import {
  validateAppId,
  validateTenantId,
  validateEntityType,
  validateImageRole,
  validateImageId,
} from '../middleware/validate';

/**
 * Generate a secure direct upload URL.
 * The frontend uses this URL to upload directly to Cloudflare Images.
 */
export async function handleUploadUrl(
  env: Env,
  body: UploadUrlRequest
): Promise<{ uploadURL: string; imageId: string }> {
  // Validate all fields
  validateAppId(body.appId);
  validateTenantId(body.tenantId);
  validateEntityType(body.entityType);
  validateImageRole(body.imageRole);

  // Build metadata for Cloudflare Images
  const metadata: Record<string, string> = {
    appId: body.appId,
    tenantId: body.tenantId,
    entityType: body.entityType,
    imageRole: body.imageRole,
  };
  if (body.entityId) metadata.entityId = body.entityId;

  return createDirectUploadUrl(env, metadata);
}

/**
 * Register a completed upload as a media asset in D1.
 */
export async function handleRegister(
  env: Env,
  body: RegisterRequest
): Promise<MediaAssetResponse> {
  // Validate all fields
  validateAppId(body.appId);
  validateTenantId(body.tenantId);
  validateEntityType(body.entityType);
  validateImageRole(body.imageRole);
  validateImageId(body.imageId);

  const asset: MediaAsset = {
    id: crypto.randomUUID(),
    app_id: body.appId,
    tenant_id: body.tenantId,
    entity_type: body.entityType,
    entity_id: body.entityId ?? null,
    uploaded_by: body.uploadedBy ?? null,
    image_id: body.imageId,
    original_filename: body.originalFilename ?? null,
    image_role: body.imageRole,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  await insertMediaAsset(env.DB, asset);

  return {
    ...asset,
    variants: buildVariantUrls(env.CLOUDFLARE_IMAGES_ACCOUNT_HASH, asset.image_id),
  };
}

/**
 * Query media assets with filters, enriched with variant URLs.
 */
export async function handleQuery(
  env: Env,
  params: MediaQueryParams
): Promise<MediaAssetResponse[]> {
  // Required fields
  validateAppId(params.appId);
  validateTenantId(params.tenantId);

  // Optional field validation (only if provided)
  if (params.entityType) validateEntityType(params.entityType);
  if (params.imageRole) validateImageRole(params.imageRole);

  const assets = await queryMediaAssets(env.DB, params);

  return assets.map((asset) => ({
    ...asset,
    variants: buildVariantUrls(env.CLOUDFLARE_IMAGES_ACCOUNT_HASH, asset.image_id),
  }));
}
