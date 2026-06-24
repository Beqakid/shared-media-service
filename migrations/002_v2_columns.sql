-- ─── SMS V2 — Add media management columns ─────────────────────
-- Safe migration: D1 will error on duplicate columns, so we check
-- pragmatically. Run these one at a time; if a column already exists
-- the statement simply fails and the rest proceed.

-- New columns for V2
ALTER TABLE media_assets ADD COLUMN updated_at TEXT;
ALTER TABLE media_assets ADD COLUMN deleted_at TEXT;
ALTER TABLE media_assets ADD COLUMN replaced_by_asset_id TEXT;
ALTER TABLE media_assets ADD COLUMN usage_count INTEGER DEFAULT 0;
ALTER TABLE media_assets ADD COLUMN alt_text TEXT;
ALTER TABLE media_assets ADD COLUMN caption TEXT;

-- Index for soft-deleted queries
CREATE INDEX IF NOT EXISTS idx_media_status ON media_assets (status);

-- Index for replacement chain lookups
CREATE INDEX IF NOT EXISTS idx_media_replaced_by ON media_assets (replaced_by_asset_id);
