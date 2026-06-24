-- ─── SMS V1 — Initial Schema ────────────────────────────────────
-- Shared Media Service: media_assets table

CREATE TABLE IF NOT EXISTS media_assets (
  id                TEXT PRIMARY KEY,
  app_id            TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  entity_type       TEXT NOT NULL,
  entity_id         TEXT,
  uploaded_by       TEXT,
  image_id          TEXT NOT NULL,
  original_filename TEXT,
  image_role        TEXT,
  status            TEXT DEFAULT 'active',
  created_at        TEXT NOT NULL
);

-- ─── Indexes for Common Query Patterns ──────────────────────────

CREATE INDEX IF NOT EXISTS idx_media_app_tenant
  ON media_assets (app_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_media_entity
  ON media_assets (app_id, tenant_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_media_image_id
  ON media_assets (image_id);

CREATE INDEX IF NOT EXISTS idx_media_created
  ON media_assets (created_at DESC);
