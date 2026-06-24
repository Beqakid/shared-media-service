# SMS V5 Release Notes — Media Intelligence & Moderation Foundation

**Release Date:** June 2025
**Version:** 5.0.0

## Overview

SMS V5 transforms Shared Media Service from trusted media storage into a governed media platform. It adds the foundation for media classification, moderation workflows, tagging, review queues, and future AI-powered media intelligence via Kai.

## New Features

### Media Moderation
- **Moderation statuses**: `pending_review`, `approved`, `rejected`, `flagged`
- Admin-controlled moderation workflow with review tracking
- Automatic `pending_review` for sensitive media types (proof, receipt, document_preview, unknown)
- Default `approved` for standard media types

### Media Classification
- **11 classification types**: logo, banner, product, service, gallery, avatar, receipt, proof, document_preview, hero, unknown
- Auto-classification from `imageRole` on upload
- Manual reclassification via admin API

### Tagging System
- JSON-based tag storage per media asset
- Admin-managed tags for future search and filtering

### AI Metadata Storage
- Structured storage for AI-generated metadata
- Fields: caption, detectedObjects, keywords, confidenceScore
- Ready for future Kai integration (no AI execution yet)

### Review Queue
- Dedicated endpoint for media needing review
- Filterable by app, tenant, moderation status, classification
- Defaults to showing `pending_review` and `flagged` items

### Intelligence Dashboard
- Summary counts: total assets, pending, approved, rejected, flagged
- Classification distribution breakdown
- App distribution breakdown
- Recent uploads (24h count)

### Trust Proof Receipts (V5 Actions)
- `media_flagged` — when media is flagged for review
- `media_approved` — when media is approved
- `media_rejected` — when media is rejected
- `media_classified` — when classification is updated
- `media_tags_updated` — when tags are updated
- `media_review_notes_updated` — when review notes are updated

## New Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PATCH | `/api/media/moderate/:id/moderation` | Admin | Update moderation status |
| PATCH | `/api/media/moderate/:id/classification` | Admin | Update classification & tags |
| PATCH | `/api/media/moderate/:id/ai-metadata` | Admin | Store AI metadata |
| GET | `/api/media/moderate/review-queue` | Admin | Get media needing review |
| GET | `/api/media/moderate/intelligence-summary` | Admin | Dashboard summary stats |

## Database Changes

### New Columns on `media_assets`
| Column | Type | Default |
|--------|------|---------|
| `moderation_status` | TEXT | `'approved'` |
| `moderation_reason` | TEXT | NULL |
| `classification` | TEXT | from imageRole |
| `tags_json` | TEXT | `'[]'` |
| `ai_metadata_json` | TEXT | NULL |
| `reviewed_by` | TEXT | NULL |
| `reviewed_at` | TEXT | NULL |
| `review_notes` | TEXT | NULL |

### New Indexes
- `idx_media_moderation` — (app_id, tenant_id, moderation_status)
- `idx_media_classification` — (classification)
- `idx_media_created_at` — (created_at)

## Admin UI Updates
- **Tab navigation**: Library, Review Queue, Dashboard views
- **Review Queue**: Filterable list with quick-action moderation buttons
- **Dashboard**: Visual summary with status cards and distribution charts
- **Detail Panel**: Moderation status, classification, tags, AI metadata, review info
- **Moderation Actions**: Approve, Reject, Flag, Mark Pending buttons
- **Classification Editor**: Dropdown + tag input with save

## Backward Compatibility
- All V1–V4 endpoints unchanged
- Existing assets default to `approved` moderation status
- Viliniu integration unaffected
- Receipt generation for V4 actions unchanged

## Known Limitations
- No AI automation yet (metadata stored manually or via future Kai integration)
- No auto-rejection (all moderation is admin-controlled)
- Moderation data not exposed publicly
- No Carehia/Volau/Kai code modified
