# SMS API Reference

**Base URL:** `https://shared-media-service.jjioji.workers.dev`

## Authentication

### V1 Endpoints (Public)
No authentication required. Consuming apps handle their own auth.

### V2 Endpoints (Admin)
Require `SMS_ADMIN_TOKEN` as Bearer token:
```
Authorization: Bearer <SMS_ADMIN_TOKEN>
```

---

## V1 Endpoints

### POST /api/media/upload-url
Get a secure direct upload URL from Cloudflare Images.

**Request:**
```json
{
  "appId": "carehia",
  "tenantId": "vendor_123",
  "entityType": "vendor",
  "imageRole": "logo",
  "entityId": "v-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadURL": "https://upload.imagedelivery.net/...",
    "imageId": "uuid-from-cloudflare"
  }
}
```

### POST /api/media/register
Register a completed image upload.

**Request:**
```json
{
  "appId": "carehia",
  "tenantId": "vendor_123",
  "entityType": "vendor",
  "entityId": "v-456",
  "imageRole": "logo",
  "imageId": "uuid-from-cloudflare",
  "originalFilename": "logo.png",
  "uploadedBy": "user_789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "asset-uuid",
    "app_id": "carehia",
    "tenant_id": "vendor_123",
    "entity_type": "vendor",
    "entity_id": "v-456",
    "image_role": "logo",
    "status": "active",
    "usage_count": 0,
    "alt_text": null,
    "caption": null,
    "variants": {
      "avatar": "https://imagedelivery.net/.../avatar",
      "thumb": "https://imagedelivery.net/.../thumb",
      "card": "https://imagedelivery.net/.../card",
      "hero": "https://imagedelivery.net/.../hero",
      "public": "https://imagedelivery.net/.../public"
    }
  }
}
```

### GET /api/media
Query media assets. Requires `appId` and `tenantId`.

**Query Params:** `appId`, `tenantId`, `entityType`, `entityId`, `imageRole`, `status`

---

## V2 Endpoints (Admin Token Required)

### PATCH /api/media/manage/:id
Update media metadata.

**Request:**
```json
{
  "appId": "carehia",
  "tenantId": "vendor_123",
  "altText": "Company logo",
  "caption": "Official brand logo",
  "imageRole": "logo",
  "status": "archived"
}
```

### DELETE /api/media/manage/:id
Soft delete an asset. Does NOT remove from Cloudflare Images.

**Query Params:** `appId`, `tenantId`

**Response:** Updated asset with `status: "deleted"` and `deleted_at` timestamp.

### POST /api/media/manage/:id/replace
Replace an image while preserving history.

**Request:**
```json
{
  "appId": "viliniu",
  "tenantId": "vendor_123",
  "newImageId": "new-cloudflare-image-id",
  "originalFilename": "new-photo.jpg",
  "uploadedBy": "user_123"
}
```

**Response:** `{ oldAsset, newAsset }` — old asset is `status: "replaced"`.

### POST /api/media/manage/:id/usage
Increment usage count.

**Request:**
```json
{
  "appId": "viliniu",
  "tenantId": "vendor_123"
}
```

### GET /api/media/manage/tenants
List tenants with media records.

**Query Params:** `appId` (optional filter)

**Response:**
```json
{
  "success": true,
  "data": [
    { "app_id": "carehia", "tenant_id": "vendor_123", "asset_count": 5, "last_upload_at": "..." }
  ]
}
```

### GET /api/media/manage/admin/query
Admin search — no required filters. Supports pagination.

**Query Params:** `appId`, `tenantId`, `entityType`, `imageRole`, `status`, `limit`, `offset`

---

## Validation Rules

| Field | Allowed Values |
|-------|---------------|
| `appId` | `carehia`, `viliniu`, `volau`, `kai` |
| `entityType` | `vendor`, `product`, `service`, `agency`, `caregiver`, `client`, `project`, `article`, `species`, `user` |
| `imageRole` | `logo`, `avatar`, `banner`, `gallery`, `product`, `service`, `receipt`, `proof`, `document_preview`, `hero` |
| `status` | `active`, `archived`, `deleted`, `replaced` |

## Image Variants

| Name | Dimensions | Use Case |
|------|-----------|----------|
| `avatar` | 128×128 | Profile pictures |
| `thumb` | 300×300 | Thumbnails, lists |
| `card` | 600×600 | Card previews |
| `hero` | 1600×900 | Hero banners |
| `public` | Original | Full-size image |
