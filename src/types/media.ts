// ─── Shared Media Service — Type Definitions (V2) ───────────────

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

/** A media asset row stored in D1 (V2: added new columns) */
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
}

/** Media asset with variant URLs in API responses */
export interface MediaAssetResponse extends MediaAsset {
  variants: Record<string, string>;
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
