// ─── D1 Data Access — Media Assets (V2) ─────────────────────────
import type { MediaAsset, MediaQueryParams, TenantSummary } from '../types/media';

/**
 * Insert a new media asset record (V2: includes new columns).
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
        replaced_by_asset_id, usage_count, alt_text, caption
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      asset.caption
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
 * Update media asset metadata (V2).
 */
export async function updateMediaAsset(
  db: D1Database,
  id: string,
  updates: Partial<Pick<MediaAsset, 'alt_text' | 'caption' | 'image_role' | 'status' | 'updated_at' | 'deleted_at' | 'replaced_by_asset_id' | 'usage_count'>>
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
 * Query all media assets for admin (no required filters, V2).
 */
export async function queryAllMediaAssets(
  db: D1Database,
  filters: {
    appId?: string;
    tenantId?: string;
    entityType?: string;
    imageRole?: string;
    status?: string;
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
