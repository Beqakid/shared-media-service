-- SMS V5: Media Intelligence & Moderation columns
ALTER TABLE media_assets ADD COLUMN moderation_status TEXT DEFAULT 'approved';
ALTER TABLE media_assets ADD COLUMN moderation_reason TEXT;
ALTER TABLE media_assets ADD COLUMN classification TEXT;
ALTER TABLE media_assets ADD COLUMN tags_json TEXT;
ALTER TABLE media_assets ADD COLUMN ai_metadata_json TEXT;
ALTER TABLE media_assets ADD COLUMN reviewed_by TEXT;
ALTER TABLE media_assets ADD COLUMN reviewed_at TEXT;
ALTER TABLE media_assets ADD COLUMN review_notes TEXT;

-- Update existing assets: set classification from image_role where possible
UPDATE media_assets SET classification = image_role WHERE image_role IN ('logo', 'banner', 'product', 'service', 'gallery', 'avatar', 'receipt', 'proof', 'document_preview', 'hero');
UPDATE media_assets SET classification = 'unknown' WHERE classification IS NULL;
UPDATE media_assets SET tags_json = '[]' WHERE tags_json IS NULL;
