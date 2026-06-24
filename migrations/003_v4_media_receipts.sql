CREATE TABLE IF NOT EXISTS media_receipts (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  media_asset_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  actor_user_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  image_role TEXT,
  image_id TEXT,
  previous_media_asset_id TEXT,
  new_media_asset_id TEXT,
  receipt_status TEXT DEFAULT 'created',
  receipt_hash TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_receipts_media_asset ON media_receipts (media_asset_id);
CREATE INDEX IF NOT EXISTS idx_receipts_app_tenant ON media_receipts (app_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_receipts_action_type ON media_receipts (action_type);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON media_receipts (created_at DESC);
