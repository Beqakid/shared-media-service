# SMS V1 — API Documentation

Base URL: `https://shared-media-service.<your-subdomain>.workers.dev`

All responses follow the shape:
```json
{ "success": true|false, "data": ..., "error": "..." }
```

---

## Health Check

### `GET /`

Returns service info.

**Response:**
```json
{
  "service": "shared-media-service",
  "version": "1.0.0",
  "status": "healthy"
}
```

### `GET /health`

Returns service health with timestamp.

---

## Endpoints

### 1. Generate Upload URL

`POST /api/media/upload-url`

Request a temporary Cloudflare Images Direct Creator Upload URL. The frontend uses this URL to upload the image directly — the Worker never handles image bytes.

**Request Body:**
```json
{
  "appId": "viliniu",
  "tenantId": "vendor_123",
  "entityType": "product",
  "entityId": "product_456",
  "imageRole": "product"
}
```

| Field        | Type   | Required | Description                           |
|-------------|--------|----------|---------------------------------------|
| `appId`      | string | ✅       | Application identifier                |
| `tenantId`   | string | ✅       | Tenant/owner identifier               |
| `entityType` | string | ✅       | Type of entity the image belongs to   |
| `entityId`   | string | ❌       | Specific entity identifier            |
| `imageRole`  | string | ✅       | Role/purpose of the image             |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uploadURL": "https://upload.imagedelivery.net/...",
    "imageId": "cf-image-id-abc123"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Unsupported appId: \"unknown\". Supported: carehia, viliniu, volau, kai"
}
```

---

### 2. Register Media Asset

`POST /api/media/register`

After a successful upload to Cloudflare Images, register the media asset in the SMS database.

**Request Body:**
```json
{
  "appId": "viliniu",
  "tenantId": "vendor_123",
  "entityType": "product",
  "entityId": "product_456",
  "imageRole": "product",
  "imageId": "cloudflare-image-id",
  "originalFilename": "product-photo.jpg",
  "uploadedBy": "user_123"
}
```

| Field              | Type   | Required | Description                       |
|-------------------|--------|----------|-----------------------------------|
| `appId`            | string | ✅       | Application identifier            |
| `tenantId`         | string | ✅       | Tenant/owner identifier           |
| `entityType`       | string | ✅       | Entity type                       |
| `entityId`         | string | ❌       | Entity identifier                 |
| `imageRole`        | string | ✅       | Image role                        |
| `imageId`          | string | ✅       | Cloudflare Images image ID        |
| `originalFilename` | string | ❌       | Original file name                |
| `uploadedBy`       | string | ❌       | User who uploaded                 |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "app_id": "viliniu",
    "tenant_id": "vendor_123",
    "entity_type": "product",
    "entity_id": "product_456",
    "uploaded_by": "user_123",
    "image_id": "cloudflare-image-id",
    "original_filename": "product-photo.jpg",
    "image_role": "product",
    "status": "active",
    "created_at": "2026-06-24T15:00:00.000Z",
    "variants": {
      "avatar": "https://imagedelivery.net/<hash>/<image_id>/avatar",
      "thumb": "https://imagedelivery.net/<hash>/<image_id>/thumb",
      "card": "https://imagedelivery.net/<hash>/<image_id>/card",
      "hero": "https://imagedelivery.net/<hash>/<image_id>/hero"
    }
  }
}
```

---

### 3. Query Media Assets

`GET /api/media`

Retrieve media assets with required and optional filters. Results ordered by `created_at DESC`.

**Query Parameters:**

| Parameter    | Required | Description               |
|-------------|----------|---------------------------|
| `appId`      | ✅       | Application identifier    |
| `tenantId`   | ✅       | Tenant identifier         |
| `entityType` | ❌       | Filter by entity type     |
| `entityId`   | ❌       | Filter by entity ID       |
| `imageRole`  | ❌       | Filter by image role      |
| `status`     | ❌       | Filter by status          |

**Example:**
```
GET /api/media?appId=viliniu&tenantId=vendor_123&entityType=product&entityId=product_456
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "app_id": "viliniu",
      "tenant_id": "vendor_123",
      "entity_type": "product",
      "entity_id": "product_456",
      "image_id": "cloudflare-image-id",
      "image_role": "product",
      "status": "active",
      "created_at": "2026-06-24T15:00:00.000Z",
      "variants": { ... }
    }
  ],
  "count": 1
}
```

---

## Supported Values

### App IDs
`carehia` · `viliniu` · `volau` · `kai`

### Entity Types
`vendor` · `product` · `service` · `agency` · `caregiver` · `client` · `project` · `article` · `species` · `user`

### Image Roles
`logo` · `avatar` · `banner` · `gallery` · `product` · `service` · `receipt` · `proof` · `document_preview` · `hero`

### Image Variants (Platform Standard)

| Variant  | Dimensions | Use Case          |
|----------|-----------|-------------------|
| `avatar` | 128×128   | Profile pictures   |
| `thumb`  | 300×300   | Thumbnails         |
| `card`   | 600×600   | Cards & listings   |
| `hero`   | 1600×900  | Banners & heroes   |

Variant URL format: `https://imagedelivery.net/<account_hash>/<image_id>/<variant>`
