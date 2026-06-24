// ─── Validation Middleware & Helpers (V5) ────────────────────────
import {
  SUPPORTED_APP_IDS,
  SUPPORTED_ENTITY_TYPES,
  SUPPORTED_IMAGE_ROLES,
  SUPPORTED_STATUSES,
  SUPPORTED_MODERATION_STATUSES,
  SUPPORTED_CLASSIFICATIONS,
  type AppId,
  type EntityType,
  type ImageRole,
  type MediaStatus,
  type ModerationStatus,
  type Classification,
} from '../types/media';

export class ValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
  }
}

export function validateAppId(appId: unknown): asserts appId is AppId {
  if (!appId || typeof appId !== 'string') {
    throw new ValidationError('Missing required field: appId');
  }
  if (!SUPPORTED_APP_IDS.includes(appId as AppId)) {
    throw new ValidationError(
      `Unsupported appId: "${appId}". Supported: ${SUPPORTED_APP_IDS.join(', ')}`
    );
  }
}

export function validateTenantId(tenantId: unknown): asserts tenantId is string {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new ValidationError('Missing required field: tenantId');
  }
}

export function validateEntityType(entityType: unknown): asserts entityType is EntityType {
  if (!entityType || typeof entityType !== 'string') {
    throw new ValidationError('Missing required field: entityType');
  }
  if (!SUPPORTED_ENTITY_TYPES.includes(entityType as EntityType)) {
    throw new ValidationError(
      `Unsupported entityType: "${entityType}". Supported: ${SUPPORTED_ENTITY_TYPES.join(', ')}`
    );
  }
}

export function validateImageRole(imageRole: unknown): asserts imageRole is ImageRole {
  if (!imageRole || typeof imageRole !== 'string') {
    throw new ValidationError('Missing required field: imageRole');
  }
  if (!SUPPORTED_IMAGE_ROLES.includes(imageRole as ImageRole)) {
    throw new ValidationError(
      `Unsupported imageRole: "${imageRole}". Supported: ${SUPPORTED_IMAGE_ROLES.join(', ')}`
    );
  }
}

export function validateImageId(imageId: unknown): asserts imageId is string {
  if (!imageId || typeof imageId !== 'string') {
    throw new ValidationError('Missing required field: imageId');
  }
}

export function validateStatus(status: unknown): asserts status is MediaStatus {
  if (!status || typeof status !== 'string') {
    throw new ValidationError('Missing required field: status');
  }
  if (!SUPPORTED_STATUSES.includes(status as MediaStatus)) {
    throw new ValidationError(
      `Unsupported status: "${status}". Supported: ${SUPPORTED_STATUSES.join(', ')}`
    );
  }
}

export function validateModerationStatus(status: unknown): asserts status is ModerationStatus {
  if (!status || typeof status !== 'string') {
    throw new ValidationError('Missing required field: moderationStatus');
  }
  if (!SUPPORTED_MODERATION_STATUSES.includes(status as ModerationStatus)) {
    throw new ValidationError(
      `Unsupported moderationStatus: "${status}". Supported: ${SUPPORTED_MODERATION_STATUSES.join(', ')}`
    );
  }
}

export function validateClassification(classification: unknown): asserts classification is Classification {
  if (!classification || typeof classification !== 'string') {
    throw new ValidationError('Missing required field: classification');
  }
  if (!SUPPORTED_CLASSIFICATIONS.includes(classification as Classification)) {
    throw new ValidationError(
      `Unsupported classification: "${classification}". Supported: ${SUPPORTED_CLASSIFICATIONS.join(', ')}`
    );
  }
}
