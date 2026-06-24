# SMS Architecture

## Overview

The Shared Media Service (SMS) is a **standalone, platform-wide service** that manages image uploads, storage, metadata, and delivery for all Beqakid applications.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Carehia   │  │   Viliniu   │  │    Volau    │  │     Kai     │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  SMS Worker (Hono API)  │
                    │  + Admin UI (/admin)    │
                    └──┬─────────────────┬───┘
                       │                 │
              ┌────────▼──────┐  ┌───────▼───────┐
              │ D1 Database   │  │  Cloudflare   │
              │ (metadata)    │  │    Images     │
              └───────────────┘  └───────────────┘
```

## Components

### Cloudflare Worker (Hono)
- V1 public API: upload-url, register, query
- V2 admin API: update, delete, replace, usage, tenants
- V2 admin UI: `/admin/media`
- Input validation for all supported enums
- CORS support

### D1 Database
- Single `media_assets` table
- Indexes for app+tenant, entity, image_id, created, status, replaced_by
- V2 columns: `updated_at`, `deleted_at`, `replaced_by_asset_id`, `usage_count`, `alt_text`, `caption`

### Cloudflare Images
- Direct Creator Upload (frontend → Cloudflare, no Worker proxy)
- 5 variants: `avatar`, `thumb`, `card`, `hero`, `public`
- Delivery via `imagedelivery.net`

### Security
- V1 endpoints: open (app provides its own auth)
- V2 management endpoints: `SMS_ADMIN_TOKEN` (Bearer auth)
- Cloudflare credentials stored as Worker secrets, never exposed

## Data Model

### Status Lifecycle
```
active → archived → active (reactivate)
active → deleted (soft delete)
active → replaced (image replacement)
```

### Replacement Chain
When an image is replaced:
1. New asset created with same entity context
2. Old asset marked `status: replaced`, `replaced_by_asset_id: <new-id>`
3. Both assets preserved for history
