// ─── Media Receipts DB Layer (V4) ────────────────────────────────
import type { MediaReceipt } from '../types/media';

/**
 * Insert a media receipt row into the database.
 */
export async function insertMediaReceipt(
  db: D1Database,
  receipt: MediaReceipt,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO media_receipts (
        id, app_id, tenant_id, media_asset_id, action_type,
        actor_user_id, entity_type, entity_id, image_role, image_id,
        previous_media_asset_id, new_media_asset_id,
        receipt_status, receipt_hash, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      receipt.id,
      receipt.app_id,
      receipt.tenant_id,
      receipt.media_asset_id,
      receipt.action_type,
      receipt.actor_user_id,
      receipt.entity_type,
      receipt.entity_id,
      receipt.image_role,
      receipt.image_id,
      receipt.previous_media_asset_id,
      receipt.new_media_asset_id,
      receipt.receipt_status,
      receipt.receipt_hash,
      receipt.metadata_json,
      receipt.created_at,
    )
    .run();
}

/**
 * Get all receipts for a specific media asset, ordered by created_at DESC.
 */
export async function getReceiptsByMediaAssetId(
  db: D1Database,
  mediaAssetId: string,
  appId: string,
  tenantId: string,
): Promise<MediaReceipt[]> {
  const result = await db
    .prepare(
      `SELECT * FROM media_receipts
       WHERE media_asset_id = ? AND app_id = ? AND tenant_id = ?
       ORDER BY created_at DESC`,
    )
    .bind(mediaAssetId, appId, tenantId)
    .all<MediaReceipt>();

  return result.results ?? [];
}

/**
 * Query receipts with optional filters.
 * appId is required; all other filters are optional.
 */
export async function queryReceipts(
  db: D1Database,
  filters: {
    appId: string;
    tenantId?: string;
    mediaAssetId?: string;
    actionType?: string;
    entityType?: string;
    entityId?: string;
  },
): Promise<MediaReceipt[]> {
  const conditions: string[] = ['app_id = ?'];
  const params: string[] = [filters.appId];

  if (filters.tenantId) {
    conditions.push('tenant_id = ?');
    params.push(filters.tenantId);
  }
  if (filters.mediaAssetId) {
    conditions.push('media_asset_id = ?');
    params.push(filters.mediaAssetId);
  }
  if (filters.actionType) {
    conditions.push('action_type = ?');
    params.push(filters.actionType);
  }
  if (filters.entityType) {
    conditions.push('entity_type = ?');
    params.push(filters.entityType);
  }
  if (filters.entityId) {
    conditions.push('entity_id = ?');
    params.push(filters.entityId);
  }

  const sql = `SELECT * FROM media_receipts
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT 100`;

  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<MediaReceipt>();

  return result.results ?? [];
}
