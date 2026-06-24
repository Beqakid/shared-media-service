// ─── Shared Media Service — Type Definitions ────────────────────

/** Supported application identifiers */
export const SUPPORTED_APP_IDS = ['carehia', 'viliniu', 'volau', 'kai'] as const;
export type AppId = (typeof SUPPORTED_APP_IDS)[number];

/** Supported entity types across all applications */
export const SUPPORTED_ENTITY_TYPES = [
  'vendor',
  'product',
  'service',
  'agency',
  'caregiver',
  'client',
  'project',
  'article',
  'species',
  'user',
] as const;
export type EntityType = (typeof SUPPORTED_ENTITY_TYPES)[number];

/** Supported image roles */
export const SUPPORTED_IMAGE_ROLES = [
  'logo',
  'avatar',
  'banner',
  'gallery',
  'product',
  'service',
  'receipt',
  'proof',
  'document_preview',
  'hero',
] as const;
export type ImageRole = (typeof SUPPORTED_IMAGE_ROLES)[number];

/** Media asset status */
export type MediaStatus = 'active' | 'deleted';

/** Standard platform image variants */
export const IMAGE_VARIANTS = {
  avatar: { width: 128, height: 128 },
  thumb: { width: 300, height: 300 },
  card: { width: 600, height: 600 },
  hero: { width: 1600, height: 900 },
} as const;
export type ImageVariant = keyof typeof IMAGE_VARIANTS;

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

/** A media asset row stored in D1 */
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
}

/** Media asset with variant URLs in API responses */
export interface MediaAssetResponse extends MediaAsset {
  variants: Record<ImageVariant, string>;
}

// ─── Worker Environment Bindings ────────────────────────────────

export interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  CLOUDFLARE_IMAGES_ACCOUNT_HASH: string;
  ENVIRONMENT: string;
}
