// ─── D1 Data Access — Media Assets ──────────────────────────────
import type { MediaAsset, MediaQueryParams } from '../types/media';

/**
 * Insert a new media asset record.
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
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      asset.created_at
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
