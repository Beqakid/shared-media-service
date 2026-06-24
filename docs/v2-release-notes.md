# SMS V2 Release Notes

**Version:** 2.0.0
**Date:** 2026-06-24

## What's New

### Admin Media Library UI
- Internal dashboard at `/admin/media`
- Filter, browse, and manage all media across apps and tenants
- Image preview cards with metadata
- Detail panel with variant URLs and editing
- Pagination support

### New API Endpoints
- `PATCH /api/media/manage/:id` — Update alt text, caption, role, status
- `DELETE /api/media/manage/:id` — Soft delete (preserves in Cloudflare Images)
- `POST /api/media/manage/:id/replace` — Replace image with history chain
- `POST /api/media/manage/:id/usage` — Increment usage counter
- `GET /api/media/manage/tenants` — List tenants with asset counts
- `GET /api/media/manage/admin/query` — Admin search (no required filters)

### Database Changes
New columns on `media_assets`:
- `updated_at` — Last modification timestamp
- `deleted_at` — Soft deletion timestamp
- `replaced_by_asset_id` — Links to replacement asset
- `usage_count` — Number of times asset was used
- `alt_text` — Accessibility text
- `caption` — Image caption

New indexes: `idx_media_status`, `idx_media_replaced_by`

### Status Lifecycle
- `active` → `archived` → `active` (reactivate)
- `active` → `deleted` (soft delete, no Cloudflare removal)
- `active` → `replaced` (image replacement, old asset preserved)

### Security
- `SMS_ADMIN_TOKEN` environment variable
- Required for all V2 management endpoints and admin UI
- Bearer token authentication

### Additional
- `public` variant URL added to all asset responses
- Version bumped to 2.0.0 in health check

## Backward Compatibility
All V1 endpoints remain fully functional with no changes:
- `POST /api/media/upload-url` ✅
- `POST /api/media/register` ✅
- `GET /api/media` ✅
- `GET /health` ✅

## Known Limitations
- No hard delete from Cloudflare Images (soft delete only)
- No batch operations (single asset at a time)
- No image upload through admin UI (use upload-url endpoint)
- Admin UI requires JavaScript
- No audit log for admin actions
