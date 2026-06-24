// ─── D1 Data Access — Media Assets (V5) ─────────────────────────
import type { MediaAsset, MediaQueryParams, TenantSummary, IntelligenceSummary } from '../types/media';

/**
 * Insert a new media asset record (V5: includes intelligence & moderation columns).
 */
export async function insertMediaAsset(
  db: D1Database,
  asset: MediaAsset
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO media_assets (
        id, app_id, tenant_id, entity_type, entity_id,
        uploaded_by, image_id, original_filename, image_role,
        status, created_at, updated_at, deleted_at,
        replaced_by_asset_id, usage_count, alt_text, caption,
        moderation_status, moderation_reason, classification,
        tags_json, ai_metadata_json, reviewed_by, reviewed_at, review_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      asset.id,
      asset.app_id,
      asset.tenant_id,
      asset.entity_type,
      asset.entity_id,
      asset.uploaded_by,
      asset.image_id,
      asset.original_filename,
      asset.image_role,
      asset.status,
      asset.created_at,
      asset.updated_at,
      asset.deleted_at,
      asset.replaced_by_asset_id,
      asset.usage_count,
      asset.alt_text,
      asset.caption,
      asset.moderation_status,
      asset.moderation_reason,
      asset.classification,
      asset.tags_json,
      asset.ai_metadata_json,
      asset.reviewed_by,
      asset.reviewed_at,
      asset.review_notes
    )
    .run();
}

/**
 * Query media assets with required + optional filters.
 */
export async function queryMediaAssets(
  db: D1Database,
  params: MediaQueryParams
): Promise<MediaAsset[]> {
  const conditions: string[] = ['app_id = ?', 'tenant_id = ?'];
  const bindings: string[] = [params.appId, params.tenantId];

  if (params.entityType) {
    conditions.push('entity_type = ?');
    bindings.push(params.entityType);
  }
  if (params.entityId) {
    conditions.push('entity_id = ?');
    bindings.push(params.entityId);
  }
  if (params.imageRole) {
    conditions.push('image_role = ?');
    bindings.push(params.imageRole);
  }
  if (params.status) {
    conditions.push('status = ?');
    bindings.push(params.status);
  }

  const sql = `SELECT * FROM media_assets WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;

  const result = await db
    .prepare(sql)
    .bind(...bindings)
    .all<MediaAsset>();

  return result.results ?? [];
}

/**
 * Get a single media asset by ID.
 */
export async function getMediaAssetById(
  db: D1Database,
  id: string
): Promise<MediaAsset | null> {
  const result = await db
    .prepare('SELECT * FROM media_assets WHERE id = ?')
    .bind(id)
    .first<MediaAsset>();

  return result ?? null;
}

/**
 * Update media asset metadata (V5: supports all V5 fields).
 */
export async function updateMediaAsset(
  db: D1Database,
  id: string,
  updates: Partial<Pick<MediaAsset,
    'alt_text' | 'caption' | 'image_role' | 'status' | 'updated_at' | 'deleted_at' |
    'replaced_by_asset_id' | 'usage_count' | 'moderation_status' | 'moderation_reason' |
    'classification' | 'tags_json' | 'ai_metadata_json' | 'reviewed_by' | 'reviewed_at' | 'review_notes'
  >>
): Promise<void> {
  const setClauses: string[] = [];
  const bindings: unknown[] = [];

  if (updates.alt_text !== undefined) { setClauses.push('alt_text = ?'); bindings.push(updates.alt_text); }
  if (updates.caption !== undefined) { setClauses.push('caption = ?'); bindings.push(updates.caption); }
  if (updates.image_role !== undefined) { setClauses.push('image_role = ?'); bindings.push(updates.image_role); }
  if (updates.status !== undefined) { setClauses.push('status = ?'); bindings.push(updates.status); }
  if (updates.updated_at !== undefined) { setClauses.push('updated_at = ?'); bindings.push(updates.updated_at); }
  if (updates.deleted_at !== undefined) { setClauses.push('deleted_at = ?'); bindings.push(updates.deleted_at); }
  if (updates.replaced_by_asset_id !== undefined) { setClauses.push('replaced_by_asset_id = ?'); bindings.push(updates.replaced_by_asset_id); }
  if (updates.usage_count !== undefined) { setClauses.push('usage_count = ?'); bindings.push(updates.usage_count); }
  // V5 fields
  if (updates.moderation_status !== undefined) { setClauses.push('moderation_status = ?'); bindings.push(updates.moderation_status); }
  if (updates.moderation_reason !== undefined) { setClauses.push('moderation_reason = ?'); bindings.push(updates.moderation_reason); }
  if (updates.classification !== undefined) { setClauses.push('classification = ?'); bindings.push(updates.classification); }
  if (updates.tags_json !== undefined) { setClauses.push('tags_json = ?'); bindings.push(updates.tags_json); }
  if (updates.ai_metadata_json !== undefined) { setClauses.push('ai_metadata_json = ?'); bindings.push(updates.ai_metadata_json); }
  if (updates.reviewed_by !== undefined) { setClauses.push('reviewed_by = ?'); bindings.push(updates.reviewed_by); }
  if (updates.reviewed_at !== undefined) { setClauses.push('reviewed_at = ?'); bindings.push(updates.reviewed_at); }
  if (updates.review_notes !== undefined) { setClauses.push('review_notes = ?'); bindings.push(updates.review_notes); }

  if (setClauses.length === 0) return;

  bindings.push(id);

  await db
    .prepare(`UPDATE media_assets SET ${setClauses.join(', ')} WHERE id = ?`)
    .bind(...bindings)
    .run();
}

/**
 * Increment usage count for a media asset (V2).
 */
export async function incrementUsageCount(
  db: D1Database,
  id: string
): Promise<number> {
  await db
    .prepare('UPDATE media_assets SET usage_count = COALESCE(usage_count, 0) + 1, updated_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), id)
    .run();

  const asset = await db
    .prepare('SELECT usage_count FROM media_assets WHERE id = ?')
    .bind(id)
    .first<{ usage_count: number }>();

  return asset?.usage_count ?? 0;
}

/**
 * List tenants with media records (V2).
 */
export async function listTenants(
  db: D1Database,
  appId?: string
): Promise<TenantSummary[]> {
  let sql = `
    SELECT
      app_id,
      tenant_id,
      COUNT(*) as asset_count,
      MAX(created_at) as last_upload_at
    FROM media_assets
    WHERE status != 'deleted'
  `;
  const bindings: string[] = [];

  if (appId) {
    sql += ' AND app_id = ?';
    bindings.push(appId);
  }

  sql += ' GROUP BY app_id, tenant_id ORDER BY last_upload_at DESC';

  const result = await db
    .prepare(sql)
    .bind(...bindings)
    .all<TenantSummary>();

  return result.results ?? [];
}

/**
 * Query all media assets for admin (V5: supports moderationStatus, classification filters).
 */
export async function queryAllMediaAssets(
  db: D1Database,
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
): Promise<{ assets: MediaAsset[]; total: number }> {
  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (filters.appId) { conditions.push('app_id = ?'); bindings.push(filters.appId); }
  if (filters.tenantId) { conditions.push('tenant_id = ?'); bindings.push(filters.tenantId); }
  if (filters.entityType) { conditions.push('entity_type = ?'); bindings.push(filters.entityType); }
  if (filters.imageRole) { conditions.push('image_role = ?'); bindings.push(filters.imageRole); }
  if (filters.status) { conditions.push('status = ?'); bindings.push(filters.status); }
  if (filters.moderationStatus) { conditions.push('moderation_status = ?'); bindings.push(filters.moderationStatus); }
  if (filters.classification) { conditions.push('classification = ?'); bindings.push(filters.classification); }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM media_assets ${whereClause}`)
    .bind(...bindings)
    .first<{ total: number }>();
  const total = countResult?.total ?? 0;

  // Fetch page
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const result = await db
    .prepare(`SELECT * FROM media_assets ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...bindings, limit, offset)
    .all<MediaAsset>();

  return { assets: result.results ?? [], total };
}

/**
 * V5: Query review queue — assets needing moderation review.
 * Default filter: moderation_status IN ('pending_review', 'flagged')
 */
export async function queryReviewQueue(
  db: D1Database,
  filters: {
    appId?: string;
    tenantId?: string;
    moderationStatus?: string;
    classification?: string;
  }
): Promise<MediaAsset[]> {
  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (filters.moderationStatus) {
    conditions.push('moderation_status = ?');
    bindings.push(filters.moderationStatus);
  } else {
    conditions.push("moderation_status IN ('pending_review', 'flagged')");
  }

  if (filters.appId) {
    conditions.push('app_id = ?');
    bindings.push(filters.appId);
  }
  if (filters.tenantId) {
    conditions.push('tenant_id = ?');
    bindings.push(filters.tenantId);
  }
  if (filters.classification) {
    conditions.push('classification = ?');
    bindings.push(filters.classification);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db
    .prepare(`SELECT * FROM media_assets ${whereClause} ORDER BY created_at DESC LIMIT 100`)
    .bind(...bindings)
    .all<MediaAsset>();

  return result.results ?? [];
}

/**
 * V5: Get intelligence summary with counts by moderation status, classification, and app.
 */
export async function getIntelligenceSummary(
  db: D1Database,
  appId?: string
): Promise<IntelligenceSummary> {
  const appCondition = appId ? ' WHERE app_id = ?' : '';
  const appBindings: string[] = appId ? [appId] : [];

  // Total assets
  const totalResult = await db
    .prepare(`SELECT COUNT(*) as total FROM media_assets${appCondition}`)
    .bind(...appBindings)
    .first<{ total: number }>();
  const totalAssets = totalResult?.total ?? 0;

  // Moderation status counts
  const moderationResult = await db
    .prepare(
      `SELECT moderation_status, COUNT(*) as cnt FROM media_assets${appCondition} GROUP BY moderation_status`
    )
    .bind(...appBindings)
    .all<{ moderation_status: string; cnt: number }>();

  let pendingReviewCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let flaggedCount = 0;

  for (const row of moderationResult.results ?? []) {
    switch (row.moderation_status) {
      case 'pending_review': pendingReviewCount = row.cnt; break;
      case 'approved': approvedCount = row.cnt; break;
      case 'rejected': rejectedCount = row.cnt; break;
      case 'flagged': flaggedCount = row.cnt; break;
    }
  }

  // Classification counts
  const classResult = await db
    .prepare(
      `SELECT classification, COUNT(*) as cnt FROM media_assets${appCondition} GROUP BY classification`
    )
    .bind(...appBindings)
    .all<{ classification: string; cnt: number }>();

  const classificationCounts: Record<string, number> = {};
  for (const row of classResult.results ?? []) {
    classificationCounts[row.classification ?? 'unknown'] = row.cnt;
  }

  // App counts
  const appResult = await db
    .prepare(
      `SELECT app_id, COUNT(*) as cnt FROM media_assets${appCondition} GROUP BY app_id`
    )
    .bind(...appBindings)
    .all<{ app_id: string; cnt: number }>();

  const appCounts: Record<string, number> = {};
  for (const row of appResult.results ?? []) {
    appCounts[row.app_id] = row.cnt;
  }

  // Recent uploads (last 24h)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentConditions = appId
    ? 'WHERE app_id = ? AND created_at >= ?'
    : 'WHERE created_at >= ?';
  const recentBindings = appId ? [appId, twentyFourHoursAgo] : [twentyFourHoursAgo];

  const recentResult = await db
    .prepare(`SELECT COUNT(*) as cnt FROM media_assets ${recentConditions}`)
    .bind(...recentBindings)
    .first<{ cnt: number }>();
  const recentUploads = recentResult?.cnt ?? 0;

  return {
    totalAssets,
    pendingReviewCount,
    approvedCount,
    rejectedCount,
    flaggedCount,
    classificationCounts,
    appCounts,
    recentUploads,
  };
}
