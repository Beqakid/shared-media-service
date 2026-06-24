// ─── Media Service — Core Business Logic (V5) ───────────────────
import { createDirectUploadUrl, buildVariantUrls } from './cloudflare-images';
import {
  insertMediaAsset,
  queryMediaAssets,
  getMediaAssetById,
  updateMediaAsset,
  incrementUsageCount,
  listTenants,
  queryAllMediaAssets,
  queryReviewQueue,
  getIntelligenceSummary,
} from '../db/media-assets';
import { createReceipt } from './receipt-service';
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
  ModerationUpdateRequest,
  ClassificationUpdateRequest,
  AiMetadataUpdateRequest,
  IntelligenceSummary,
} from '../types/media';
import {
  SUPPORTED_CLASSIFICATIONS,
  type Classification,
} from '../types/media';
import {
  validateAppId,
  validateTenantId,
  validateEntityType,
  validateImageRole,
  validateImageId,
  validateStatus,
  validateModerationStatus,
  validateClassification,
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
 * Register a completed upload as a media asset (V5: includes moderation & classification defaults).
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

  // V5: Set default moderation status and classification
  const moderationStatus = ['proof', 'receipt', 'document_preview', 'unknown'].includes(body.imageRole)
    ? 'pending_review' : 'approved';
  const classification = SUPPORTED_CLASSIFICATIONS.includes(body.imageRole as Classification)
    ? body.imageRole : 'unknown';

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
    // V5 fields
    moderation_status: moderationStatus,
    moderation_reason: null,
    classification,
    tags_json: '[]',
    ai_metadata_json: null,
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
  };

  await insertMediaAsset(env.DB, asset);

  // V4: Create trust proof receipt
  try {
    await createReceipt(env.DB, {
      appId: body.appId,
      tenantId: body.tenantId,
      mediaAssetId: asset.id,
      actionType: 'media_registered',
      actorUserId: body.uploadedBy,
      entityType: body.entityType,
      entityId: body.entityId,
      imageRole: body.imageRole,
      imageId: body.imageId,
    });
  } catch (err) {
    console.error('Failed to create receipt for media_registered:', err);
  }

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
 * Update media metadata (PATCH /api/media/:id). V4: creates receipt.
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

  // V4: Create trust proof receipt
  try {
    await createReceipt(env.DB, {
      appId: body.appId,
      tenantId: body.tenantId,
      mediaAssetId: id,
      actionType: 'media_metadata_updated',
      imageRole: asset.image_role,
      imageId: asset.image_id,
      metadata: {
        updatedFields: Object.keys(updates).filter((k) => k !== 'updated_at'),
      },
    });
  } catch (err) {
    console.error('Failed to create receipt for media_metadata_updated:', err);
  }

  const updated = await getMediaAssetById(env.DB, id);
  return enrichAsset(env, updated!);
}

/**
 * Soft delete a media asset (DELETE /api/media/:id). V4: creates receipt.
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

  // V4: Create trust proof receipt
  try {
    await createReceipt(env.DB, {
      appId,
      tenantId,
      mediaAssetId: id,
      actionType: 'media_deleted',
      imageRole: asset.image_role,
      imageId: asset.image_id,
    });
  } catch (err) {
    console.error('Failed to create receipt for media_deleted:', err);
  }

  const updated = await getMediaAssetById(env.DB, id);
  return enrichAsset(env, updated!);
}

/**
 * Replace an image while preserving history (POST /api/media/:id/replace). V4: creates receipt.
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

  // V5: Determine moderation defaults for replacement asset
  const moderationStatus = ['proof', 'receipt', 'document_preview', 'unknown'].includes(oldAsset.image_role)
    ? 'pending_review' : 'approved';
  const classification = SUPPORTED_CLASSIFICATIONS.includes(oldAsset.image_role as Classification)
    ? oldAsset.image_role : 'unknown';

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
    // V5 fields
    moderation_status: moderationStatus,
    moderation_reason: null,
    classification,
    tags_json: '[]',
    ai_metadata_json: null,
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
  };

  await insertMediaAsset(env.DB, newAsset);

  // Mark old asset as replaced
  const now = new Date().toISOString();
  await updateMediaAsset(env.DB, id, {
    status: 'replaced',
    replaced_by_asset_id: newAsset.id,
    updated_at: now,
  });

  // V4: Create trust proof receipt
  try {
    await createReceipt(env.DB, {
      appId: body.appId,
      tenantId: body.tenantId,
      mediaAssetId: id,
      actionType: 'media_replaced',
      imageRole: oldAsset.image_role,
      imageId: oldAsset.image_id,
      previousMediaAssetId: id,
      newMediaAssetId: newAsset.id,
      metadata: {
        oldImageId: oldAsset.image_id,
        newImageId: body.newImageId,
      },
    });
  } catch (err) {
    console.error('Failed to create receipt for media_replaced:', err);
  }

  const updatedOld = await getMediaAssetById(env.DB, id);

  return {
    oldAsset: enrichAsset(env, updatedOld!),
    newAsset: enrichAsset(env, newAsset),
  };
}

/**
 * Increment usage count (POST /api/media/:id/usage). V4: creates receipt.
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

  // V4: Create trust proof receipt
  try {
    await createReceipt(env.DB, {
      appId: body.appId,
      tenantId: body.tenantId,
      mediaAssetId: id,
      actionType: 'media_usage_incremented',
      imageRole: asset.image_role,
      imageId: asset.image_id,
      metadata: { usageCount: newCount },
    });
  } catch (err) {
    console.error('Failed to create receipt for media_usage_incremented:', err);
  }

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
    moderationStatus?: string;
    classification?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: MediaAssetResponse[]; total: number }> {
  if (filters.appId) validateAppId(filters.appId);
  if (filters.entityType) validateEntityType(filters.entityType);
  if (filters.imageRole) validateImageRole(filters.imageRole);
  if (filters.status) validateStatus(filters.status);
  if (filters.moderationStatus) validateModerationStatus(filters.moderationStatus);
  if (filters.classification) validateClassification(filters.classification);

  const { assets, total } = await queryAllMediaAssets(env.DB, filters);
  return {
    data: assets.map((a) => enrichAsset(env, a)),
    total,
  };
}

// ─── V5 Handlers ────────────────────────────────────────────────

/**
 * V5: Update moderation status for a media asset.
 */
export async function handleModerationUpdate(
  env: Env,
  id: string,
  body: ModerationUpdateRequest
): Promise<MediaAssetResponse> {
  validateAppId(body.appId);
  validateTenantId(body.tenantId);
  validateModerationStatus(body.moderationStatus);

  const asset = await getMediaAssetById(env.DB, id);
  if (!asset) throw new ValidationError('Media asset not found', 404);
  if (asset.app_id !== body.appId || asset.tenant_id !== body.tenantId) {
    throw new ValidationError('Asset does not belong to this app/tenant', 403);
  }

  const now = new Date().toISOString();
  await updateMediaAsset(env.DB, id, {
    moderation_status: body.moderationStatus,
    moderation_reason: body.moderationReason ?? null,
    reviewed_by: body.reviewedBy,
    reviewed_at: now,
    review_notes: body.reviewNotes ?? null,
    updated_at: now,
  });

  // Determine action type based on moderation status
  let actionType: string;
  switch (body.moderationStatus) {
    case 'approved':
      actionType = 'media_approved';
      break;
    case 'rejected':
      actionType = 'media_rejected';
      break;
    case 'flagged':
    case 'pending_review':
    default:
      actionType = 'media_flagged';
      break;
  }

  // Create trust proof receipt
  try {
    await createReceipt(env.DB, {
      appId: body.appId,
      tenantId: body.tenantId,
      mediaAssetId: id,
      actionType,
      actorUserId: body.reviewedBy,
      imageRole: asset.image_role,
      imageId: asset.image_id,
      metadata: {
        previousModerationStatus: asset.moderation_status,
        newModerationStatus: body.moderationStatus,
        moderationReason: body.moderationReason ?? null,
        reviewNotes: body.reviewNotes ?? null,
      },
    });
  } catch (err) {
    console.error(`Failed to create receipt for ${actionType}:`, err);
  }

  const updated = await getMediaAssetById(env.DB, id);
  return enrichAsset(env, updated!);
}

/**
 * V5: Update classification and tags for a media asset.
 */
export async function handleClassificationUpdate(
  env: Env,
  id: string,
  body: ClassificationUpdateRequest
): Promise<MediaAssetResponse> {
  validateAppId(body.appId);
  validateTenantId(body.tenantId);
  validateClassification(body.classification);

  const asset = await getMediaAssetById(env.DB, id);
  if (!asset) throw new ValidationError('Media asset not found', 404);
  if (asset.app_id !== body.appId || asset.tenant_id !== body.tenantId) {
    throw new ValidationError('Asset does not belong to this app/tenant', 403);
  }

  const now = new Date().toISOString();
  const tagsJson = JSON.stringify(body.tags ?? []);

  await updateMediaAsset(env.DB, id, {
    classification: body.classification,
    tags_json: tagsJson,
    updated_at: now,
  });

  // Create receipt for classification update
  try {
    await createReceipt(env.DB, {
      appId: body.appId,
      tenantId: body.tenantId,
      mediaAssetId: id,
      actionType: 'media_classified',
      imageRole: asset.image_role,
      imageId: asset.image_id,
      metadata: {
        previousClassification: asset.classification,
        newClassification: body.classification,
      },
    });
  } catch (err) {
    console.error('Failed to create receipt for media_classified:', err);
  }

  // Create receipt for tags update if tags were provided
  if (body.tags !== undefined) {
    try {
      await createReceipt(env.DB, {
        appId: body.appId,
        tenantId: body.tenantId,
        mediaAssetId: id,
        actionType: 'media_tags_updated',
        imageRole: asset.image_role,
        imageId: asset.image_id,
        metadata: {
          previousTags: asset.tags_json ? JSON.parse(asset.tags_json) : [],
          newTags: body.tags,
        },
      });
    } catch (err) {
      console.error('Failed to create receipt for media_tags_updated:', err);
    }
  }

  const updated = await getMediaAssetById(env.DB, id);
  return enrichAsset(env, updated!);
}

/**
 * V5: Update AI metadata for a media asset.
 */
export async function handleAiMetadataUpdate(
  env: Env,
  id: string,
  body: AiMetadataUpdateRequest
): Promise<MediaAssetResponse> {
  validateAppId(body.appId);
  validateTenantId(body.tenantId);

  const asset = await getMediaAssetById(env.DB, id);
  if (!asset) throw new ValidationError('Media asset not found', 404);
  if (asset.app_id !== body.appId || asset.tenant_id !== body.tenantId) {
    throw new ValidationError('Asset does not belong to this app/tenant', 403);
  }

  const now = new Date().toISOString();
  await updateMediaAsset(env.DB, id, {
    ai_metadata_json: JSON.stringify(body.aiMetadata),
    updated_at: now,
  });

  // Create trust proof receipt
  try {
    await createReceipt(env.DB, {
      appId: body.appId,
      tenantId: body.tenantId,
      mediaAssetId: id,
      actionType: 'media_metadata_updated',
      imageRole: asset.image_role,
      imageId: asset.image_id,
      metadata: {
        aiFields: Object.keys(body.aiMetadata),
      },
    });
  } catch (err) {
    console.error('Failed to create receipt for media_metadata_updated (AI):', err);
  }

  const updated = await getMediaAssetById(env.DB, id);
  return enrichAsset(env, updated!);
}

/**
 * V5: Query the moderation review queue.
 */
export async function handleReviewQueue(
  env: Env,
  filters: { appId?: string; tenantId?: string; moderationStatus?: string; classification?: string }
): Promise<MediaAssetResponse[]> {
  if (filters.appId) validateAppId(filters.appId);
  if (filters.moderationStatus) validateModerationStatus(filters.moderationStatus);
  if (filters.classification) validateClassification(filters.classification);

  const assets = await queryReviewQueue(env.DB, filters);
  return assets.map((a) => enrichAsset(env, a));
}

/**
 * V5: Get intelligence summary with counts and stats.
 */
export async function handleIntelligenceSummary(
  env: Env,
  appId?: string
): Promise<IntelligenceSummary> {
  if (appId) validateAppId(appId);
  return getIntelligenceSummary(env.DB, appId);
}
