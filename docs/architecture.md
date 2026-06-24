# SMS V1 — Architecture

## Overview

The Shared Media Service (SMS) is a standalone, reusable Cloudflare Worker that provides centralized media management for all platform applications: **Carehia**, **Viliniu**, **Volau**, **Kai**, and future services.

## Design Principles

- **Platform-first** — No app-specific logic. Any application can use SMS by providing its `appId`.
- **Secure uploads** — Frontends never see Cloudflare credentials. They receive temporary Direct Creator Upload URLs.
- **Metadata-driven** — All media is tagged with `appId`, `tenantId`, `entityType`, `entityId`, and `imageRole` for flexible querying.
- **Standard variants** — Four platform-wide image variants (`avatar`, `thumb`, `card`, `hero`) ensure visual consistency everywhere.

## Stack

| Component              | Technology               |
|------------------------|--------------------------|
| Runtime                | Cloudflare Workers       |
| Framework              | Hono (lightweight)       |
| Image Storage          | Cloudflare Images        |
| Metadata Database      | Cloudflare D1 (SQLite)   |
| Language               | TypeScript               |

## Architecture Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Carehia    │     │   Viliniu    │     │    Volau     │
│   Frontend   │     │   Frontend   │     │   Frontend   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │   SMS Worker      │
                  │   (Hono Router)   │
                  └───┬──────────┬────┘
                      │          │
            ┌─────────▼──┐  ┌───▼──────────┐
            │  Cloudflare │  │  Cloudflare  │
            │  Images API │  │  D1 Database │
            └─────────────┘  └──────────────┘
```

## Request Flow

### Upload Flow (Two-Step)

1. **Get Upload URL** — App calls `POST /api/media/upload-url` with metadata.
2. **Direct Upload** — Frontend uploads the image directly to the returned Cloudflare URL.
3. **Register** — App calls `POST /api/media/register` with the `imageId` from Cloudflare.
4. **Done** — Media record saved in D1 with variant URLs.

### Query Flow

1. App calls `GET /api/media?appId=...&tenantId=...` with optional filters.
2. SMS queries D1, enriches results with variant URLs, and returns them.

## Security Model

- The Worker is the **only** entity that communicates with Cloudflare Images API.
- Frontends receive **temporary upload URLs** that expire.
- All requests require `appId` + `tenantId`; unsupported values are rejected.
- Cloudflare API credentials are stored as Worker secrets (never exposed).

## Data Model

See [Database Schema](./deployment.md#database-schema) for full table definition.

Each `media_asset` row captures:
- **Ownership**: `app_id`, `tenant_id`, `uploaded_by`
- **Context**: `entity_type`, `entity_id`, `image_role`
- **Storage**: `image_id` (Cloudflare Images reference)
- **Lifecycle**: `status`, `created_at`
