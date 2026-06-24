// ─── Media Service — Core Business Logic (V2) ───────────────────
import { createDirectUploadUrl, buildVariantUrls } from './cloudflare-images';
import {
  insertMediaAsset,
  queryMediaAssets,
  getMediaAssetById,
  updateMediaAsset,
  incrementUsageCount,
  listTenants,
  queryAllMediaAssets,
} from '../db/media-assets';
import type {
  Env,
  UploadUrlRequest,
  RegisterRequest,
  MediaQueryParams,
  MediaAsset,
  MediaAssetResponse,
  UpdateMediaRequest,
  ReplaceImageRequest,
  UsageIncrementRequest,
  TenantSummary,
} from '../types/media';
import {
  validateAppId,
  validateTenantId,
  validateEntityType,
  validateImageRole,
  validateImageId,
  validateStatus,
  ValidationError,
} from '../middleware/validate';

function enrichAsset(env: Env, asset: MediaAsset): MediaAssetResponse {
  return {
    ...asset,
    variants: buildVariantUrls(env.CLOUDFLARE_IMAGES_ACCOUNT_HASH, asset.image_id),
  };
}

/**
 * Generate a secure direct upload URL (unchanged from V1).
 */
export async function handleUploadUrl(
  env: Env,
  body: UploadUrlRequest
): Promise<{ uploadURL: string; imageId: string }> {
  validateAppId(body.appId);
  validateTenantId(body.tenantId);
  validateEntityType(body.entityType);
  validateImageRole(body.imageRole);

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
 * Register a completed upload as a media asset (V2: includes new columns).
 */
export async function handleRegister(
  env: Env,
  body: RegisterRequest
): Promise<MediaAssetResponse> {
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
    updated_at: null,
    deleted_at: null,
    replaced_by_asset_id: null,
    usage_count: 0,
    alt_text: null,
    caption: null,
  };

  await insertMediaAsset(env.DB, asset);
  return enrichAsset(env, asset);
}

/**
 * Query media assets with filters (unchanged logic, V2 response shape).
 */
export async function handleQuery(
  env: Env,
  params: MediaQueryParams
): Promise<MediaAssetResponse[]> {
  validateAppId(params.appId);
  validateTenantId(params.tenantId);
  if (params.entityType) validateEntityType(params.entityType);
  if (params.imageRole) validateImageRole(params.imageRole);

  const assets = await queryMediaAssets(env.DB, params);
  return assets.map((a) => enrichAsset(env, a));
}

// ─── V2 Handlers ────────────────────────────────────────────────

/**
 * Update media metadata (PATCH /api/media/:id).
 */
export async function handleUpdate(
  env: Env,
  id: string,
  body: UpdateMediaRequest
): Promise<MediaAssetResponse> {
  validateAppId(body.appId);
  validateTenantId(body.tenantId);

  const asset = await getMediaAssetById(env.DB, id);
  if (!asset) throw new ValidationError('Media asset not found', 404);
  if (asset.app_id !== body.appId || asset.tenant_id !== body.tenantId) {
    throw new ValidationError('Asset does not belong to this app/tenant', 403);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.altText !== undefined) updates.alt_text = body.altText;
  if (body.caption !== undefined) updates.caption = body.caption;
  if (body.imageRole !== undefined) {
    validateImageRole(body.imageRole);
    updates.image_role = body.imageRole;
  }
  if (body.status !== undefined) {
    validateStatus(body.status);
    updates.status = body.status;
  }

  await updateMediaAsset(env.DB, id, updates);

  const updated = await getMediaAssetById(env.DB, id);
  return enrichAsset(env, updated!);
}

/**
 * Soft delete a media asset (DELETE /api/media/:id).
 */
export async function handleSoftDelete(
  env: Env,
  id: string,
  appId: string,
  tenantId: string
): Promise<MediaAssetResponse> {
  validateAppId(appId);
  validateTenantId(tenantId);

  const asset = await getMediaAssetById(env.DB, id);
  if (!asset) throw new ValidationError('Media asset not found', 404);
  if (asset.app_id !== appId || asset.tenant_id !== tenantId) {
    throw new ValidationError('Asset does not belong to this app/tenant', 403);
  }

  const now = new Date().toISOString();
  await updateMediaAsset(env.DB, id, {
    status: 'deleted',
    deleted_at: now,
    updated_at: now,
  });

  const updated = await getMediaAssetById(env.DB, id);
  return enrichAsset(env, updated!);
}

/**
 * Replace an image while preserving history (POST /api/media/:id/replace).
 */
export async function handleReplace(
  env: Env,
  id: string,
  body: ReplaceImageRequest
): Promise<{ oldAsset: MediaAssetResponse; newAsset: MediaAssetResponse }> {
  validateAppId(body.appId);
  validateTenantId(body.tenantId);
  validateImageId(body.newImageId);

  const oldAsset = await getMediaAssetById(env.DB, id);
  if (!oldAsset) throw new ValidationError('Media asset not found', 404);
  if (oldAsset.app_id !== body.appId || oldAsset.tenant_id !== body.tenantId) {
    throw new ValidationError('Asset does not belong to this app/tenant', 403);
  }

  // Create new asset inheriting entity context
  const newAsset: MediaAsset = {
    id: crypto.randomUUID(),
    app_id: oldAsset.app_id,
    tenant_id: oldAsset.tenant_id,
    entity_type: oldAsset.entity_type,
    entity_id: oldAsset.entity_id,
    uploaded_by: body.uploadedBy ?? oldAsset.uploaded_by,
    image_id: body.newImageId,
    original_filename: body.originalFilename ?? null,
    image_role: oldAsset.image_role,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_at: null,
    replaced_by_asset_id: null,
    usage_count: 0,
    alt_text: oldAsset.alt_text,
    caption: oldAsset.caption,
  };

  await insertMediaAsset(env.DB, newAsset);

  // Mark old asset as replaced
  const now = new Date().toISOString();
  await updateMediaAsset(env.DB, id, {
    status: 'replaced',
    replaced_by_asset_id: newAsset.id,
    updated_at: now,
  });

  const updatedOld = await getMediaAssetById(env.DB, id);

  return {
    oldAsset: enrichAsset(env, updatedOld!),
    newAsset: enrichAsset(env, newAsset),
  };
}

/**
 * Increment usage count (POST /api/media/:id/usage).
 */
export async function handleUsageIncrement(
  env: Env,
  id: string,
  body: UsageIncrementRequest
): Promise<{ id: string; usageCount: number }> {
  validateAppId(body.appId);
  validateTenantId(body.tenantId);

  const asset = await getMediaAssetById(env.DB, id);
  if (!asset) throw new ValidationError('Media asset not found', 404);
  if (asset.app_id !== body.appId || asset.tenant_id !== body.tenantId) {
    throw new ValidationError('Asset does not belong to this app/tenant', 403);
  }

  const newCount = await incrementUsageCount(env.DB, id);
  return { id, usageCount: newCount };
}

/**
 * List tenants (GET /api/media/tenants).
 */
export async function handleListTenants(
  env: Env,
  appId?: string
): Promise<TenantSummary[]> {
  if (appId) validateAppId(appId);
  return listTenants(env.DB, appId);
}

/**
 * Query all media for admin view (GET /api/admin/media).
 */
export async function handleAdminQuery(
  env: Env,
  filters: {
    appId?: string;
    tenantId?: string;
    entityType?: string;
    imageRole?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: MediaAssetResponse[]; total: number }> {
  if (filters.appId) validateAppId(filters.appId);
  if (filters.entityType) validateEntityType(filters.entityType);
  if (filters.imageRole) validateImageRole(filters.imageRole);
  if (filters.status) validateStatus(filters.status);

  const { assets, total } = await queryAllMediaAssets(env.DB, filters);
  return {
    data: assets.map((a) => enrichAsset(env, a)),
    total,
  };
}
