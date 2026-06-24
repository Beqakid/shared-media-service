# Shared Media Service (SMS) V2

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
- **Public variant URL** alongside standard variants

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
| GET | `/api/media/manage/admin/query` | Admin search |
| GET | `/admin/media` | Admin UI |

## Docs

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment](docs/deployment.md)
- [Admin UI Guide](docs/admin-ui.md)
- [V2 Release Notes](docs/v2-release-notes.md)

## License

MIT
