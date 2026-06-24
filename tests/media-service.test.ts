// ─── Media Service Integration Tests ────────────────────────────
import { describe, it, expect } from 'vitest';
import { buildVariantUrls } from '../src/services/cloudflare-images';
import { IMAGE_VARIANTS } from '../src/types/media';

describe('buildVariantUrls', () => {
  const accountHash = 'test-hash-123';
  const imageId = 'image-abc-456';

  it('returns all four standard variant URLs', () => {
    const urls = buildVariantUrls(accountHash, imageId);

    expect(urls.avatar).toBe(`https://imagedelivery.net/${accountHash}/${imageId}/avatar`);
    expect(urls.thumb).toBe(`https://imagedelivery.net/${accountHash}/${imageId}/thumb`);
    expect(urls.card).toBe(`https://imagedelivery.net/${accountHash}/${imageId}/card`);
    expect(urls.hero).toBe(`https://imagedelivery.net/${accountHash}/${imageId}/hero`);
  });

  it('returns exactly 4 variant keys', () => {
    const urls = buildVariantUrls(accountHash, imageId);
    expect(Object.keys(urls)).toHaveLength(4);
  });
});

describe('IMAGE_VARIANTS', () => {
  it('has correct dimensions for avatar', () => {
    expect(IMAGE_VARIANTS.avatar).toEqual({ width: 128, height: 128 });
  });

  it('has correct dimensions for thumb', () => {
    expect(IMAGE_VARIANTS.thumb).toEqual({ width: 300, height: 300 });
  });

  it('has correct dimensions for card', () => {
    expect(IMAGE_VARIANTS.card).toEqual({ width: 600, height: 600 });
  });

  it('has correct dimensions for hero', () => {
    expect(IMAGE_VARIANTS.hero).toEqual({ width: 1600, height: 900 });
  });
});
