CREATE INDEX IF NOT EXISTS idx_media_moderation ON media_assets (app_id, tenant_id, moderation_status);
CREATE INDEX IF NOT EXISTS idx_media_classification ON media_assets (classification);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media_assets (created_at);
