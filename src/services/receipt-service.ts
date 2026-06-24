// ─── Receipt Service (V4) ────────────────────────────────────────
import type { MediaReceipt, CreateReceiptParams } from '../types/media';
import { insertMediaReceipt } from '../db/media-receipts';

/**
 * Generate a SHA-256 receipt hash using the Web Crypto API.
 * Hash input: app_id|tenant_id|media_asset_id|action_type|actor_user_id|image_id|created_at|metadata_json
 */
export async function generateReceiptHash(params: {
  appId: string;
  tenantId: string;
  mediaAssetId: string;
  actionType: string;
  actorUserId: string | null;
  imageId: string | null;
  createdAt: string;
  metadataJson: string | null;
}): Promise<string> {
  const input = [
    params.appId,
    params.tenantId,
    params.mediaAssetId,
    params.actionType,
    params.actorUserId ?? '',
    params.imageId ?? '',
    params.createdAt,
    params.metadataJson ?? '',
  ].join('|');

  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a media receipt with auto-generated id, hash, and timestamp.
 */
export async function createReceipt(
  db: D1Database,
  params: CreateReceiptParams,
): Promise<MediaReceipt> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const metadataJson = params.metadata ? JSON.stringify(params.metadata) : null;

  const receiptHash = await generateReceiptHash({
    appId: params.appId,
    tenantId: params.tenantId,
    mediaAssetId: params.mediaAssetId,
    actionType: params.actionType,
    actorUserId: params.actorUserId ?? null,
    imageId: params.imageId ?? null,
    createdAt,
    metadataJson,
  });

  const receipt: MediaReceipt = {
    id,
    app_id: params.appId,
    tenant_id: params.tenantId,
    media_asset_id: params.mediaAssetId,
    action_type: params.actionType,
    actor_user_id: params.actorUserId ?? null,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    image_role: params.imageRole ?? null,
    image_id: params.imageId ?? null,
    previous_media_asset_id: params.previousMediaAssetId ?? null,
    new_media_asset_id: params.newMediaAssetId ?? null,
    receipt_status: 'created',
    receipt_hash: receiptHash,
    metadata_json: metadataJson,
    created_at: createdAt,
  };

  await insertMediaReceipt(db, receipt);
  return receipt;
}
