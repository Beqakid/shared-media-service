# SMS Admin Media Library

## Access
Navigate to: `https://shared-media-service.jjioji.workers.dev/admin/media`

Enter your `SMS_ADMIN_TOKEN` when prompted.

## Features

### Filter Bar
Filter media by:
- **App** — Carehia, Viliniu, Volau, Kai
- **Tenant ID** — free text search
- **Entity Type** — vendor, product, service, etc.
- **Image Role** — logo, avatar, banner, etc.
- **Status** — active, archived, deleted, replaced

### Media Grid
Each card shows:
- Image preview (card variant)
- App badge, role badge, status badge
- Original filename
- Entity type/ID and tenant
- Usage count and creation date

### Detail Panel
Click any card to open the detail panel:
- Larger image preview
- Full asset metadata (ID, image ID, entity info, timestamps)
- All variant URLs (clickable)
- Edit alt text and caption
- Action buttons: Archive, Delete, Reactivate, Copy ID/URL

### Pagination
- 50 assets per page
- Navigate with Prev/Next buttons

## Actions

| Action | What it does |
|--------|-------------|
| **Save Changes** | Updates alt text and caption |
| **Archive** | Sets status to `archived` |
| **Reactivate** | Sets archived status back to `active` |
| **Delete** | Soft-deletes (sets `status: deleted`, `deleted_at` timestamp) |
| **Copy Image ID** | Copies Cloudflare image ID to clipboard |
| **Copy URL** | Copies card variant URL to clipboard |

## Security
- Token is entered client-side and sent as Bearer token
- Token is never stored in HTML or JavaScript source
- All admin API calls include the Authorization header
- Invalid/missing tokens return 401/403
