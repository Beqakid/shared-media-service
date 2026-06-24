# SMS Deployment Guide

## Prerequisites
- Node.js 18+
- Cloudflare account with Workers, D1, and Images enabled
- Wrangler CLI (`npm install -g wrangler`)

## Environment Setup

### 1. Secrets (set via `wrangler secret put`)
```bash
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_IMAGES_API_TOKEN
wrangler secret put CLOUDFLARE_IMAGES_ACCOUNT_HASH
wrangler secret put SMS_ADMIN_TOKEN          # V2: Admin access token
```

### 2. D1 Database
```bash
# Database already created: sms-db (318fb945-ae1e-47e1-9be8-ef0001877244)
# Run migrations:
wrangler d1 execute sms-db --file=./migrations/001_media_assets.sql
wrangler d1 execute sms-db --file=./migrations/002_v2_columns.sql
```

### 3. Image Variants
Ensure these variants exist in Cloudflare Images:
- `avatar` — 128×128, scale-down, cover
- `thumb` — 300×300, scale-down, cover
- `card` — 600×600, scale-down, cover
- `hero` — 1600×900, scale-down, cover

### 4. Deploy
```bash
npm install
npm run deploy
```

## Live URL
`https://shared-media-service.jjioji.workers.dev`

## V2 Admin Setup
1. Generate a strong random token for `SMS_ADMIN_TOKEN`
2. Set it as a Worker secret: `wrangler secret put SMS_ADMIN_TOKEN`
3. Access admin UI at `/admin/media` using that token
4. Use the same token as `Authorization: Bearer <token>` for API calls

## Verify Deployment
```bash
# Health check
curl https://shared-media-service.jjioji.workers.dev/health

# Admin UI (browser)
open https://shared-media-service.jjioji.workers.dev/admin/media

# V1 endpoint test
curl -X POST https://shared-media-service.jjioji.workers.dev/api/media/upload-url \
  -H "Content-Type: application/json" \
  -d '{"appId":"carehia","tenantId":"test","entityType":"vendor","imageRole":"logo"}'
```
