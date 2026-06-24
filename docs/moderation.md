# Media Moderation Guide

## Overview

SMS V5 introduces a moderation workflow for all media assets. Moderation is admin-controlled — no automatic rejection occurs.

## Moderation Statuses

| Status | Description | Default For |
|--------|-------------|-------------|
| `approved` | Media cleared for display | Standard uploads (logo, product, etc.) |
| `pending_review` | Awaiting admin review | Proof, receipt, document_preview, unknown |
| `flagged` | Marked for attention | Admin-flagged items |
| `rejected` | Not suitable for display | Admin-rejected items |

## Workflow

1. **Upload** → Media gets default status based on `imageRole`
2. **Review Queue** → Admins see `pending_review` and `flagged` items
3. **Admin Action** → Approve, reject, or flag with notes
4. **Receipt Created** → Trust proof for every moderation action

## API Usage

### Update Moderation Status

```bash
curl -X PATCH https://shared-media-service.jjioji.workers.dev/api/media/moderate/{id}/moderation \
  -H "Authorization: Bearer $SMS_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "viliniu",
    "tenantId": "vendor_123",
    "moderationStatus": "approved",
    "moderationReason": "",
    "reviewedBy": "admin_123",
    "reviewNotes": "Looks good"
  }'
```

### Get Review Queue

```bash
curl "https://shared-media-service.jjioji.workers.dev/api/media/moderate/review-queue?appId=viliniu" \
  -H "Authorization: Bearer $SMS_ADMIN_TOKEN"
```

## Display Rules

| Status | Public Storefront | Internal/Admin |
|--------|-------------------|----------------|
| `approved` | ✅ Display | ✅ Display |
| `pending_review` | ⚠️ May display (app decides) | ✅ Display with badge |
| `flagged` | ❌ Should not display | ✅ Display with warning |
| `rejected` | ❌ Must not display | ✅ Display with rejection note |

## Receipt Actions

Every moderation action creates a trust proof receipt:
- `media_approved` — includes reviewer, notes
- `media_rejected` — includes reason, reviewer
- `media_flagged` — includes reason, reviewer
