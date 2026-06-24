# Shared Media Service (SMS) V5

Platform-wide media management service for **Carehia**, **Viliniu**, **Volau**, **Kai**, and future applications.

Built on Cloudflare Workers + Cloudflare Images + D1.

## Features

### V1 (Foundation)
- Secure direct upload URLs (frontend never touches Cloudflare credentials)
- Image registration with D1 metadata storage
- Multi-tenant media queries with filtering
- Standard image variants: `avatar` (128×128), `thumb` (300×300), `card` (600×600), `hero` (1600×900)
- Input validation for appId, tenantId, entityType, imageRole

### V2 (Media Library & Management)
- **Admin Media Library UI** at `/admin/media`
- **Metadata editing** — alt text, caption, image role, status
- **Soft delete / archive** with status tracking
- **Image replacement** with full history chain
- **Usage tracking** with increment endpoint
- **Tenant browsing** — list all tenants with asset counts
- **Admin token security** for all management endpoints

### V3 (Viliniu Integration)
- **Viliniu pilot** — vendor logos, banners, gallery, product, service images
- **smsClient.ts** helper with createUploadUrl, registerAsset, getMedia, replaceMedia, incrementUsage
- Standard variant display per use case

### V4 (Trust Proof Receipts)
- **Media receipts** — SHA-256 hashed trust proof for every media action
- **Receipt endpoints** — query receipts per asset or globally
- **Auto-receipts** — register, replace, archive, delete, usage, metadata update
- **Admin receipt viewer** in detail panel

### V5 (Media Intelligence & Moderation)
- **Moderation workflow** — pending_review, approved, rejected, flagged statuses
- **Classification system** — 11 types auto-mapped from imageRole
- **Tagging** — JSON-based tag storage per asset
- **AI metadata storage** — structured data for future Kai integration
- **Review queue** — dedicated endpoint for items needing review
- **Intelligence dashboard** — summary stats and distribution counts
- **6 new receipt actions** — flagged, approved, rejected, classified, tags_updated, review_notes_updated
- **Admin UI** — tabbed views (Library, Review Queue, Dashboard), moderation actions, classification editor

## Quick Start

```bash
npm install
npm run dev          # Local development
npm run deploy       # Deploy to Cloudflare
```

## API Endpoints

### Public (V1 — no auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/media/upload-url` | Get secure upload URL |
| POST | `/api/media/register` | Register uploaded image |
| GET | `/api/media` | Query media assets |

### Admin-Protected (V2 — requires `SMS_ADMIN_TOKEN`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/media/manage/:id` | Update metadata |
| DELETE | `/api/media/manage/:id` | Soft delete |
| POST | `/api/media/manage/:id/replace` | Replace image |
| POST | `/api/media/manage/:id/usage` | Increment usage |
| GET | `/api/media/manage/tenants` | List tenants |
| GET | `/api/media/manage/admin/query` | Admin query (with filters) |

### Receipts (V4 — mixed auth)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/media/receipts` | None | Query receipts |
| GET | `/api/media/:id/receipts` | None | Get asset receipts |
| POST | `/api/media/:id/receipt` | Admin | Create manual receipt |

### Moderation & Intelligence (V5 — requires `SMS_ADMIN_TOKEN`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/media/moderate/:id/moderation` | Update moderation status |
| PATCH | `/api/media/moderate/:id/classification` | Update classification & tags |
| PATCH | `/api/media/moderate/:id/ai-metadata` | Store AI metadata |
| GET | `/api/media/moderate/review-queue` | Get media needing review |
| GET | `/api/media/moderate/intelligence-summary` | Dashboard summary stats |

## Admin UI

Visit `/admin/media` for the admin dashboard with:
- **Library** — browse all media with filters
- **Review Queue** — moderate pending/flagged items
- **Dashboard** — intelligence summary and stats

## Documentation

- [API Reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [Admin UI Guide](docs/admin-ui.md)
- [Moderation Guide](docs/moderation.md)
- [Media Intelligence Guide](docs/media-intelligence.md)
- [Deployment Guide](docs/deployment.md)
- [V5 Release Notes](docs/v5-release-notes.md)
