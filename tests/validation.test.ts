// ─── Validation Tests ───────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import {
  validateAppId,
  validateTenantId,
  validateEntityType,
  validateImageRole,
  validateImageId,
  ValidationError,
} from '../src/middleware/validate';

describe('validateAppId', () => {
  it('accepts supported app IDs', () => {
    expect(() => validateAppId('carehia')).not.toThrow();
    expect(() => validateAppId('viliniu')).not.toThrow();
    expect(() => validateAppId('volau')).not.toThrow();
    expect(() => validateAppId('kai')).not.toThrow();
  });

  it('rejects unsupported app IDs', () => {
    expect(() => validateAppId('unknown')).toThrow(ValidationError);
    expect(() => validateAppId('unknown')).toThrow(/Unsupported appId/);
  });

  it('rejects missing app ID', () => {
    expect(() => validateAppId(undefined)).toThrow(ValidationError);
    expect(() => validateAppId('')).toThrow(/Missing required field: appId/);
    expect(() => validateAppId(null)).toThrow(ValidationError);
  });
});

describe('validateTenantId', () => {
  it('accepts any non-empty string', () => {
    expect(() => validateTenantId('vendor_123')).not.toThrow();
    expect(() => validateTenantId('agency_abc')).not.toThrow();
  });

  it('rejects missing tenant ID', () => {
    expect(() => validateTenantId(undefined)).toThrow(ValidationError);
    expect(() => validateTenantId('')).toThrow(/Missing required field: tenantId/);
  });
});

describe('validateEntityType', () => {
  it('accepts supported entity types', () => {
    const types = ['vendor', 'product', 'service', 'agency', 'caregiver', 'client', 'project', 'article', 'species', 'user'];
    types.forEach((t) => expect(() => validateEntityType(t)).not.toThrow());
  });

  it('rejects unsupported entity types', () => {
    expect(() => validateEntityType('invoice')).toThrow(/Unsupported entityType/);
  });

  it('rejects missing entity type', () => {
    expect(() => validateEntityType(undefined)).toThrow(ValidationError);
  });
});

describe('validateImageRole', () => {
  it('accepts supported image roles', () => {
    const roles = ['logo', 'avatar', 'banner', 'gallery', 'product', 'service', 'receipt', 'proof', 'document_preview', 'hero'];
    roles.forEach((r) => expect(() => validateImageRole(r)).not.toThrow());
  });

  it('rejects unsupported image roles', () => {
    expect(() => validateImageRole('thumbnail')).toThrow(/Unsupported imageRole/);
  });

  it('rejects missing image role', () => {
    expect(() => validateImageRole(undefined)).toThrow(ValidationError);
  });
});

describe('validateImageId', () => {
  it('accepts any non-empty string', () => {
    expect(() => validateImageId('cf-image-abc123')).not.toThrow();
  });

  it('rejects missing image ID', () => {
    expect(() => validateImageId(undefined)).toThrow(ValidationError);
    expect(() => validateImageId('')).toThrow(/Missing required field: imageId/);
  });
});
