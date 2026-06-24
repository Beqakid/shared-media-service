// ─── Shared Media Service — Type Definitions (V5) ───────────────

/** Supported application identifiers */
export const SUPPORTED_APP_IDS = ['carehia', 'viliniu', 'volau', 'kai'] as const;
export type AppId = (typeof SUPPORTED_APP_IDS)[number];

/** Supported entity types across all applications */
export const SUPPORTED_ENTITY_TYPES = [
  'vendor', 'product', 'service', 'agency', 'caregiver',
  'client', 'project', 'article', 'species', 'user',
] as const;
export type EntityType = (typeof SUPPORTED_ENTITY_TYPES)[number];

/** Supported image roles */
export const SUPPORTED_IMAGE_ROLES = [
  'logo', 'avatar', 'banner', 'gallery', 'product', 'service',
  'receipt', 'proof', 'document_preview', 'hero',
] as const;
export type ImageRole = (typeof SUPPORTED_IMAGE_ROLES)[number];

/** Media asset status (V2: added archived, replaced) */
export const SUPPORTED_STATUSES = ['active', 'archived', 'deleted', 'replaced'] as const;
export type MediaStatus = (typeof SUPPORTED_STATUSES)[number];

/** V5: Supported moderation statuses */
export const SUPPORTED_MODERATION_STATUSES = ['pending_review', 'approved', 'rejected', 'flagged'] as const;
export type ModerationStatus = (typeof SUPPORTED_MODERATION_STATUSES)[number];

/** V5: Supported classifications */
export const SUPPORTED_CLASSIFICATIONS = [
  'logo', 'banner', 'product', 'service', 'gallery', 'avatar',
  'receipt', 'proof', 'document_preview', 'hero', 'unknown',
] as const;
export type Classification = (typeof SUPPORTED_CLASSIFICATIONS)[number];

/** V4+V5: Supported receipt action types */
export const SUPPORTED_ACTION_TYPES = [
  // V4
  'media_uploaded',
  'media_registered',
  'media_replaced',
  'media_archived',
  'media_deleted',
  'media_usage_incremented',
  'media_metadata_updated',
  // V5
  'media_flagged',
  'media_approved',
  'media_rejected',
  'media_classified',
  'media_tags_updated',
  'media_review_notes_updated',
] as const;
export type ActionType = (typeof SUPPORTED_ACTION_TYPES)[number];

/** Standard platform image variants */
export const IMAGE_VARIANTS = {
  avatar: { width: 128, height: 128 },
  thumb: { width: 300, height: 300 },
  card: { width: 600, height: 600 },
  hero: { width: 1600, height: 900 },
} as const;
export type ImageVariant = keyof typeof IMAGE_VARIANTS;

/** All variant names including public */
export type VariantName = ImageVariant | 'public';

// ─── Request / Response Shapes ──────────────────────────────────

export interface UploadUrlRequest {
  appId: string;
  tenantId: string;
  entityType: string;
  entityId?: string;
  imageRole: string;
}

export interface RegisterRequest {
  appId: string;
  tenantId: string;
  entityType: string;
  entityId?: string;
  imageRole: string;
  imageId: string;
  originalFilename?: string;
  uploadedBy?: string;
}

export interface MediaQueryParams {
  appId: string;
  tenantId: string;
  entityType?: string;
  entityId?: string;
  imageRole?: string;
  status?: string;
}

/** V2: Update metadata request */
export interface UpdateMediaRequest {
  appId: string;
  tenantId: string;
  altText?: string;
  caption?: string;
  imageRole?: string;
  status?: string;
}

/** V2: Replace image request */
export interface ReplaceImageRequest {
  appId: string;
  tenantId: string;
  newImageId: string;
  originalFilename?: string;
  uploadedBy?: string;
}

/** V2: Usage increment request */
export interface UsageIncrementRequest {
  appId: string;
  tenantId: string;
}

/** V2: Tenant summary */
export interface TenantSummary {
  app_id: string;
  tenant_id: string;
  asset_count: number;
  last_upload_at: string;
}

/** A media asset row stored in D1 (V5: added intelligence & moderation columns) */
export interface MediaAsset {
  id: string;
  app_id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string | null;
  uploaded_by: string | null;
  image_id: string;
  original_filename: string | null;
  image_role: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  replaced_by_asset_id: string | null;
  usage_count: number;
  alt_text: string | null;
  caption: string | null;
  // V5: Intelligence & Moderation
  moderation_status: string;
  moderation_reason: string | null;
  classification: string | null;
  tags_json: string | null;
  ai_metadata_json: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
}

/** Media asset with variant URLs in API responses */
export interface MediaAssetResponse extends MediaAsset {
  variants: Record<string, string>;
}

/** V4: Media receipt row stored in D1 */
export interface MediaReceipt {
  id: string;
  app_id: string;
  tenant_id: string;
  media_asset_id: string;
  action_type: string;
  actor_user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  image_role: string | null;
  image_id: string | null;
  previous_media_asset_id: string | null;
  new_media_asset_id: string | null;
  receipt_status: string;
  receipt_hash: string;
  metadata_json: string | null;
  created_at: string;
}

/** V4: Create receipt params */
export interface CreateReceiptParams {
  appId: string;
  tenantId: string;
  mediaAssetId: string;
  actionType: string;
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  imageRole?: string;
  imageId?: string;
  previousMediaAssetId?: string;
  newMediaAssetId?: string;
  metadata?: Record<string, unknown>;
}

/** V5: Moderation update request */
export interface ModerationUpdateRequest {
  appId: string;
  tenantId: string;
  moderationStatus: string;
  moderationReason?: string;
  reviewedBy: string;
  reviewNotes?: string;
}

/** V5: Classification update request */
export interface ClassificationUpdateRequest {
  appId: string;
  tenantId: string;
  classification: string;
  tags?: string[];
}

/** V5: AI metadata update request */
export interface AiMetadataUpdateRequest {
  appId: string;
  tenantId: string;
  aiMetadata: Record<string, unknown>;
}

/** V5: Intelligence summary response */
export interface IntelligenceSummary {
  totalAssets: number;
  pendingReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  flaggedCount: number;
  classificationCounts: Record<string, number>;
  appCounts: Record<string, number>;
  recentUploads: number;
}

// ─── Worker Environment Bindings (V2: added SMS_ADMIN_TOKEN) ────

export interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  CLOUDFLARE_IMAGES_ACCOUNT_HASH: string;
  ENVIRONMENT: string;
  SMS_ADMIN_TOKEN: string;
}
