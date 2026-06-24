# 📸 Shared Media Service (SMS) V1

A standalone, reusable media platform service built on **Cloudflare Workers** that provides centralized image management for all applications in the ecosystem.

## Supported Applications

| App ID    | Application                              |
|-----------|------------------------------------------|
| `carehia` | Caregiver work app & care marketplace     |
| `viliniu` | Fiji SMB business OS & marketplace       |
| `volau`   | Fiji seasonal knowledge platform          |
| `kai`     | AI coach framework                       |

## Features

- 🔒 **Secure uploads** via Cloudflare Images Direct Creator Upload URLs
- 🗄️ **Metadata storage** in Cloudflare D1
- 🏷️ **Rich tagging** — app, tenant, entity type, entity ID, image role
- 🖼️ **Standard variants** — `avatar` (128×128), `thumb` (300×300), `card` (600×600), `hero` (1600×900)
- ⚡ **Edge-deployed** on Cloudflare Workers

## Stack

- Cloudflare Workers + Hono
- Cloudflare Images
- Cloudflare D1 (SQLite)
- TypeScript

## Quick Start

```bash
npm install
wrangler d1 create sms-db
wrangler d1 execute sms-db --file=./migrations/001_media_assets.sql
wrangler secret put CLOUDFLARE_ACCOUNT_ID
wrangler secret put CLOUDFLARE_IMAGES_API_TOKEN
wrangler secret put CLOUDFLARE_IMAGES_ACCOUNT_HASH
wrangler dev
```

## API Endpoints

| Method | Path                     | Description                    |
|--------|--------------------------|--------------------------------|
| GET    | `/health`                | Health check                   |
| POST   | `/api/media/upload-url`  | Get direct upload URL          |
| POST   | `/api/media/register`    | Register uploaded media asset  |
| GET    | `/api/media`             | Query media assets             |

## Documentation

- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## License

MIT
