# Media Intelligence Guide

## Overview

SMS V5 provides the storage foundation for AI-powered media intelligence. Actual AI processing will be added via Kai integration in a future version.

## Classification System

Every media asset has a `classification` field that describes what the image contains:

| Classification | Description | Auto-set From |
|----------------|-------------|---------------|
| `logo` | Company/brand logos | imageRole: logo |
| `banner` | Store/page banners | imageRole: banner |
| `product` | Product photography | imageRole: product |
| `service` | Service imagery | imageRole: service |
| `gallery` | Gallery images | imageRole: gallery |
| `avatar` | User/profile photos | imageRole: avatar |
| `receipt` | Receipt images | imageRole: receipt |
| `proof` | Proof/evidence photos | imageRole: proof |
| `document_preview` | Document previews | imageRole: document_preview |
| `hero` | Hero/feature images | imageRole: hero |
| `unknown` | Unclassified | Default fallback |

## Tagging

Tags are stored as a JSON array in `tags_json`. Examples:
- `["food", "marketplace", "vendor"]`
- `["healthcare", "medical", "equipment"]`

### Update Tags

```bash
curl -X PATCH https://shared-media-service.jjioji.workers.dev/api/media/moderate/{id}/classification \
  -H "Authorization: Bearer $SMS_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "viliniu",
    "tenantId": "vendor_123",
    "classification": "product",
    "tags": ["food", "organic", "fresh"]
  }'
```

## AI Metadata

The `ai_metadata_json` field stores structured AI-generated data. The expected format:

```json
{
  "caption": "Fresh produce displayed on a market table",
  "detectedObjects": ["vegetables", "table", "basket"],
  "keywords": ["fresh", "market", "produce"],
  "confidenceScore": 0.91
}
```

### Store AI Metadata

```bash
curl -X PATCH https://shared-media-service.jjioji.workers.dev/api/media/moderate/{id}/ai-metadata \
  -H "Authorization: Bearer $SMS_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "viliniu",
    "tenantId": "vendor_123",
    "aiMetadata": {
      "caption": "Fresh produce on market table",
      "detectedObjects": ["vegetables", "table"],
      "keywords": ["fresh", "market"],
      "confidenceScore": 0.91
    }
  }'
```

## Intelligence Summary

```bash
curl "https://shared-media-service.jjioji.workers.dev/api/media/moderate/intelligence-summary" \
  -H "Authorization: Bearer $SMS_ADMIN_TOKEN"
```

Returns:
```json
{
  "success": true,
  "data": {
    "totalAssets": 150,
    "pendingReviewCount": 5,
    "approvedCount": 140,
    "rejectedCount": 2,
    "flaggedCount": 3,
    "classificationCounts": {
      "product": 80,
      "logo": 30,
      "banner": 20,
      "gallery": 15,
      "unknown": 5
    },
    "appCounts": {
      "viliniu": 120,
      "carehia": 30
    },
    "recentUploads": 12
  }
}
```

## Future: Kai Integration

When Kai is connected, it will:
1. Automatically classify new uploads
2. Generate captions and keywords
3. Detect objects in images
4. Flag potentially inappropriate content
5. Suggest tags based on content analysis

The V5 schema is designed to support this without migration changes.
