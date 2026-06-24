# SMS V1 — Deployment Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) v4+
- Cloudflare account with:
  - Workers (free or paid)
  - Cloudflare Images (paid add-on)
  - D1 Database

## Step 1 — Clone & Install

```bash
git clone https://github.com/Beqakid/shared-media-service.git
cd shared-media-service
npm install
```

## Step 2 — Create D1 Database

```bash
# Production
wrangler d1 create sms-db

# Development (optional)
wrangler d1 create sms-db-dev
```

Copy the `database_id` from the output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "sms-db"
database_id = "<YOUR_D1_DATABASE_ID>"
```

## Step 3 — Run Migrations

```bash
# Production
wrangler d1 execute sms-db --file=./migrations/001_media_assets.sql

# Local dev
wrangler d1 execute sms-db --local --file=./migrations/001_media_assets.sql
```

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS media_assets (
  id                TEXT PRIMARY KEY,
  app_id            TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  entity_type       TEXT NOT NULL,
  entity_id         TEXT,
  uploaded_by       TEXT,
  image_id          TEXT NOT NULL,
  original_filename TEXT,
  image_role        TEXT,
  status            TEXT DEFAULT 'active',
  created_at        TEXT NOT NULL
);
```

**Indexes:**
- `idx_media_app_tenant` — (app_id, tenant_id)
- `idx_media_entity` — (app_id, tenant_id, entity_type, entity_id)
- `idx_media_image_id` — (image_id)
- `idx_media_created` — (created_at DESC)

## Step 4 — Set Secrets

```bash
wrangler secret put CLOUDFLARE_ACCOUNT_ID
# Paste your Cloudflare Account ID

wrangler secret put CLOUDFLARE_IMAGES_API_TOKEN
# Paste an API token with "Cloudflare Images" read+write permissions

wrangler secret put CLOUDFLARE_IMAGES_ACCOUNT_HASH
# Paste your account hash (from Cloudflare Images dashboard → "Image Delivery URL")
```

**Where to find these values:**

| Secret                          | Location                                                      |
|--------------------------------|---------------------------------------------------------------|
| `CLOUDFLARE_ACCOUNT_ID`        | Cloudflare Dashboard → Overview → Account ID (right sidebar) |
| `CLOUDFLARE_IMAGES_API_TOKEN`  | Cloudflare Dashboard → My Profile → API Tokens → Create Token → Cloudflare Images permissions |
| `CLOUDFLARE_IMAGES_ACCOUNT_HASH` | Cloudflare Dashboard → Images → Overview → "Image Delivery URL" → the hash segment |

## Step 5 — Create Image Variants

In the Cloudflare dashboard, go to **Images → Variants** and create these four:

| Variant Name | Width | Height | Fit     |
|-------------|-------|--------|---------|
| `avatar`    | 128   | 128    | cover   |
| `thumb`     | 300   | 300    | cover   |
| `card`      | 600   | 600    | cover   |
| `hero`      | 1600  | 900    | cover   |

These are **platform standards** — all applications must use them.

## Step 6 — Deploy

```bash
# Development
wrangler dev

# Production
wrangler deploy
```

Your service will be live at:
```
https://shared-media-service.<your-subdomain>.workers.dev
```

## Step 7 — Verify

```bash
# Health check
curl https://shared-media-service.<your-subdomain>.workers.dev/health

# Test upload URL generation
curl -X POST https://shared-media-service.<your-subdomain>.workers.dev/api/media/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "viliniu",
    "tenantId": "vendor_123",
    "entityType": "product",
    "entityId": "product_456",
    "imageRole": "product"
  }'
```

## Environment Variables Summary

| Variable                          | Type   | Description                        |
|----------------------------------|--------|------------------------------------|
| `CLOUDFLARE_ACCOUNT_ID`          | Secret | Cloudflare account ID              |
| `CLOUDFLARE_IMAGES_API_TOKEN`    | Secret | API token for Cloudflare Images    |
| `CLOUDFLARE_IMAGES_ACCOUNT_HASH` | Secret | Account hash for delivery URLs     |
| `ENVIRONMENT`                    | Var    | `production` or `development`      |
| `DB`                             | Binding| D1 database binding                |
