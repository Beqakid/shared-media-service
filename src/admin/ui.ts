// ─── Admin Media Library UI (V2) ────────────────────────────────
// Serves a self-contained HTML admin page at /admin/media

export function getAdminHtml(env: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SMS Admin — Media Library</title>
<style>
  :root {
    --bg: #0f1117; --surface: #1a1d27; --surface2: #252830;
    --border: #2e3140; --text: #e4e5e9; --text2: #9ca3af;
    --primary: #6366f1; --primary-hover: #818cf8;
    --danger: #ef4444; --warning: #f59e0b; --success: #22c55e;
    --radius: 8px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  /* Header */
  .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
  .header h1 { font-size: 20px; font-weight: 600; }
  .header .env { font-size: 12px; padding: 4px 8px; background: var(--primary); border-radius: 4px; font-weight: 500; }
  .header .stats { font-size: 14px; color: var(--text2); }

  /* Filters */
  .filters { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; flex-wrap: wrap; gap: 12px; align-items: end; }
  .filter-group { display: flex; flex-direction: column; gap: 4px; }
  .filter-group label { font-size: 11px; text-transform: uppercase; color: var(--text2); letter-spacing: 0.5px; }
  .filter-group select, .filter-group input {
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
    padding: 8px 12px; border-radius: var(--radius); font-size: 14px; min-width: 140px;
  }
  .filter-group input { min-width: 180px; }
  .btn { padding: 8px 16px; border-radius: var(--radius); border: none; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-hover); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }

  /* Grid */
  .content { padding: 24px; display: flex; gap: 24px; }
  .grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; align-content: start; }
  .card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; cursor: pointer; transition: border-color 0.15s;
  }
  .card:hover { border-color: var(--primary); }
  .card.selected { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
  .card-img { width: 100%; height: 180px; object-fit: cover; background: var(--surface2); display: flex; align-items: center; justify-content: center; }
  .card-img img { width: 100%; height: 100%; object-fit: cover; }
  .card-img .placeholder { color: var(--text2); font-size: 14px; }
  .card-body { padding: 12px; }
  .card-body .meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .tag { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 500; }
  .tag-app { background: #312e81; color: #a5b4fc; }
  .tag-role { background: #064e3b; color: #6ee7b7; }
  .tag-status { background: #1e3a5f; color: #93c5fd; }
  .tag-status.deleted { background: #7f1d1d; color: #fca5a5; }
  .tag-status.archived { background: #78350f; color: #fcd34d; }
  .tag-status.replaced { background: #4a1d96; color: #c4b5fd; }
  .card-body .filename { font-size: 13px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-body .details { font-size: 12px; color: var(--text2); margin-top: 4px; }

  /* Detail panel */
  .detail-panel {
    width: 400px; min-width: 400px; background: var(--surface);
    border: 1px solid var(--border); border-radius: var(--radius);
    display: none; overflow-y: auto; max-height: calc(100vh - 200px);
  }
  .detail-panel.open { display: block; }
  .detail-header { padding: 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .detail-header h3 { font-size: 16px; }
  .detail-close { background: none; border: none; color: var(--text2); cursor: pointer; font-size: 20px; }
  .detail-img { width: 100%; height: 250px; background: var(--surface2); display: flex; align-items: center; justify-content: center; }
  .detail-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .detail-section { padding: 16px; border-bottom: 1px solid var(--border); }
  .detail-section h4 { font-size: 13px; text-transform: uppercase; color: var(--text2); margin-bottom: 8px; letter-spacing: 0.5px; }
  .detail-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
  .detail-row .label { color: var(--text2); }
  .detail-row .value { color: var(--text); word-break: break-all; text-align: right; max-width: 60%; }
  .detail-actions { padding: 16px; display: flex; flex-wrap: wrap; gap: 8px; }
  .edit-group { width: 100%; margin-bottom: 8px; }
  .edit-group label { font-size: 12px; color: var(--text2); display: block; margin-bottom: 4px; }
  .edit-group input, .edit-group textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); padding: 8px; border-radius: var(--radius); font-size: 13px;
  }
  .edit-group textarea { min-height: 60px; resize: vertical; }

  /* Pagination */
  .pagination { padding: 16px 24px; display: flex; align-items: center; justify-content: center; gap: 12px; }
  .pagination .info { font-size: 13px; color: var(--text2); }

  /* Auth modal */
  .auth-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .auth-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 32px; width: 400px; }
  .auth-modal h2 { margin-bottom: 8px; }
  .auth-modal p { color: var(--text2); margin-bottom: 16px; font-size: 14px; }
  .auth-modal input { width: 100%; margin-bottom: 16px; }

  /* Toast */
  .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: var(--radius); font-size: 14px; z-index: 200; animation: fadeIn 0.2s; }
  .toast-success { background: #065f46; color: #a7f3d0; }
  .toast-error { background: #7f1d1d; color: #fca5a5; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text2); }
  .loading { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text2); }

  /* Receipts section */
  .receipts-section { margin-top: 0; padding: 16px; border-bottom: 1px solid var(--border); }
  .receipts-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text); }
  .receipt-card {
    background: var(--surface2); border-radius: var(--radius); padding: 12px;
    margin-bottom: 10px; border-left: 3px solid var(--border);
  }
  .receipt-card.action-media_registered { border-left-color: #22c55e; }
  .receipt-card.action-media_replaced { border-left-color: #f97316; }
  .receipt-card.action-media_archived { border-left-color: #f59e0b; }
  .receipt-card.action-media_deleted { border-left-color: #ef4444; }
  .receipt-card.action-media_usage_incremented { border-left-color: #3b82f6; }
  .receipt-card.action-media_metadata_updated { border-left-color: #a855f7; }
  .receipt-badge {
    display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 4px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;
  }
  .receipt-badge.badge-media_registered { background: #065f46; color: #6ee7b7; }
  .receipt-badge.badge-media_replaced { background: #7c2d12; color: #fdba74; }
  .receipt-badge.badge-media_archived { background: #78350f; color: #fcd34d; }
  .receipt-badge.badge-media_deleted { background: #7f1d1d; color: #fca5a5; }
  .receipt-badge.badge-media_usage_incremented { background: #1e3a5f; color: #93c5fd; }
  .receipt-badge.badge-media_metadata_updated { background: #4c1d95; color: #c4b5fd; }
  .receipt-hash {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 11px; color: var(--text2); cursor: pointer;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    max-width: 100%; display: inline-block;
  }
  .receipt-hash:hover { color: var(--primary-hover); }
  .receipt-meta {
    font-size: 11px; color: var(--text2); margin-top: 6px;
    background: var(--bg); padding: 6px 8px; border-radius: 4px;
    word-break: break-all; line-height: 1.4;
  }
  .receipt-actions { display: flex; gap: 6px; margin-top: 8px; }
  .receipt-status-badge {
    display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 4px;
    font-weight: 500; background: #1e3a5f; color: #93c5fd;
  }
  .receipt-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 12px; }
  .receipt-row .r-label { color: var(--text2); }
  .receipt-row .r-value { color: var(--text); }
  .receipts-empty { text-align: center; padding: 20px; color: var(--text2); font-size: 13px; }
  .receipts-loading { text-align: center; padding: 20px; color: var(--text2); font-size: 13px; }
</style>
</head>
<body>

<!-- Auth Modal -->
<div id="authOverlay" class="auth-overlay">
  <div class="auth-modal">
    <h2>🔐 SMS Admin</h2>
    <p>Enter your admin token to access the Media Library.</p>
    <input type="password" id="tokenInput" placeholder="Admin Token" onkeydown="if(event.key==='Enter')authenticate()">
    <button class="btn btn-primary" style="width:100%" onclick="authenticate()">Sign In</button>
  </div>
</div>

<!-- Header -->
<div class="header">
  <div style="display:flex;align-items:center;gap:12px">
    <h1>📸 Shared Media Service</h1>
    <span class="env">${env}</span>
  </div>
  <div class="stats">
    Total assets: <strong id="totalCount">—</strong>
  </div>
</div>

<!-- Filters -->
<div class="filters">
  <div class="filter-group">
    <label>App</label>
    <select id="filterApp">
      <option value="">All Apps</option>
      <option value="carehia">Carehia</option>
      <option value="viliniu">Viliniu</option>
      <option value="volau">Volau</option>
      <option value="kai">Kai</option>
    </select>
  </div>
  <div class="filter-group">
    <label>Tenant ID</label>
    <input type="text" id="filterTenant" placeholder="e.g. vendor_123">
  </div>
  <div class="filter-group">
    <label>Entity Type</label>
    <select id="filterEntity">
      <option value="">All Types</option>
      <option>vendor</option><option>product</option><option>service</option>
      <option>agency</option><option>caregiver</option><option>client</option>
      <option>project</option><option>article</option><option>species</option>
      <option>user</option>
    </select>
  </div>
  <div class="filter-group">
    <label>Image Role</label>
    <select id="filterRole">
      <option value="">All Roles</option>
      <option>logo</option><option>avatar</option><option>banner</option>
      <option>gallery</option><option>product</option><option>service</option>
      <option>receipt</option><option>proof</option><option>document_preview</option>
      <option>hero</option>
    </select>
  </div>
  <div class="filter-group">
    <label>Status</label>
    <select id="filterStatus">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="archived">Archived</option>
      <option value="deleted">Deleted</option>
      <option value="replaced">Replaced</option>
    </select>
  </div>
  <div class="filter-group" style="justify-content:end">
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="search()">Search</button>
      <button class="btn btn-secondary" onclick="clearFilters()">Clear</button>
    </div>
  </div>
</div>

<!-- Content -->
<div class="content">
  <div id="mediaGrid" class="grid">
    <div class="loading">Loading media assets...</div>
  </div>
  <div id="detailPanel" class="detail-panel"></div>
</div>

<!-- Pagination -->
<div class="pagination">
  <button class="btn btn-secondary btn-sm" id="prevBtn" onclick="prevPage()" disabled>← Prev</button>
  <span class="info" id="pageInfo">Page 1</span>
  <button class="btn btn-secondary btn-sm" id="nextBtn" onclick="nextPage()">Next →</button>
</div>

<script>
let TOKEN = '';
let currentPage = 0;
let totalAssets = 0;
const PAGE_SIZE = 50;
let selectedAsset = null;
const BASE = '';

function authenticate() {
  TOKEN = document.getElementById('tokenInput').value.trim();
  if (!TOKEN) return;
  document.getElementById('authOverlay').style.display = 'none';
  search();
}

function headers() {
  return { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };
}

async function search(page = 0) {
  currentPage = page;
  const params = new URLSearchParams();
  const app = document.getElementById('filterApp').value;
  const tenant = document.getElementById('filterTenant').value.trim();
  const entity = document.getElementById('filterEntity').value;
  const role = document.getElementById('filterRole').value;
  const status = document.getElementById('filterStatus').value;

  if (app) params.set('appId', app);
  if (tenant) params.set('tenantId', tenant);
  if (entity) params.set('entityType', entity);
  if (role) params.set('imageRole', role);
  if (status) params.set('status', status);
  params.set('limit', PAGE_SIZE);
  params.set('offset', page * PAGE_SIZE);

  document.getElementById('mediaGrid').innerHTML = '<div class="loading">Loading...</div>';

  try {
    const resp = await fetch(BASE + '/api/media/manage/admin/query?' + params, { headers: { 'Authorization': 'Bearer ' + TOKEN } });
    if (resp.status === 401 || resp.status === 403) {
      document.getElementById('authOverlay').style.display = 'flex';
      return;
    }
    const json = await resp.json();
    totalAssets = json.total;
    document.getElementById('totalCount').textContent = totalAssets;
    renderGrid(json.data || []);
    updatePagination();
  } catch (e) {
    document.getElementById('mediaGrid').innerHTML = '<div class="empty-state">Error loading assets</div>';
  }
}

function renderGrid(assets) {
  const grid = document.getElementById('mediaGrid');
  if (!assets.length) {
    grid.innerHTML = '<div class="empty-state">No media assets found. Try adjusting your filters.</div>';
    return;
  }
  grid.innerHTML = assets.map(a => {
    const statusClass = ['deleted','archived','replaced'].includes(a.status) ? ' ' + a.status : '';
    const imgUrl = a.variants?.card || a.variants?.thumb || '';
    return \`<div class="card \${selectedAsset?.id === a.id ? 'selected' : ''}" onclick='selectAsset(\${JSON.stringify(a).replace(/'/g,"&#39;")})'>
      <div class="card-img">
        \${imgUrl ? \`<img src="\${imgUrl}" alt="\${a.alt_text || a.original_filename || ''}" onerror="this.parentElement.innerHTML='<span class=placeholder>No preview</span>'">\` : '<span class="placeholder">No preview</span>'}
      </div>
      <div class="card-body">
        <div class="meta">
          <span class="tag tag-app">\${a.app_id}</span>
          <span class="tag tag-role">\${a.image_role || '—'}</span>
          <span class="tag tag-status\${statusClass}">\${a.status}</span>
        </div>
        <div class="filename">\${a.original_filename || '—'}</div>
        <div class="details">\${a.entity_type}\${a.entity_id ? '/' + a.entity_id : ''} · \${a.tenant_id}</div>
        <div class="details">Usage: \${a.usage_count || 0} · \${new Date(a.created_at).toLocaleDateString()}</div>
      </div>
    </div>\`;
  }).join('');
}

function selectAsset(asset) {
  selectedAsset = asset;
  const panel = document.getElementById('detailPanel');
  panel.classList.add('open');

  const imgUrl = asset.variants?.card || asset.variants?.thumb || '';
  const variantHtml = asset.variants ? Object.entries(asset.variants).map(([k,v]) =>
    \`<div class="detail-row"><span class="label">\${k}</span><span class="value"><a href="\${v}" target="_blank" style="color:var(--primary)">\${k}</a></span></div>\`
  ).join('') : '';

  panel.innerHTML = \`
    <div class="detail-header">
      <h3>Asset Details</h3>
      <button class="detail-close" onclick="closeDetail()">×</button>
    </div>
    <div class="detail-img">
      \${imgUrl ? \`<img src="\${imgUrl}" onerror="this.parentElement.innerHTML='<span class=placeholder>No preview</span>'">\` : '<span class="placeholder">No preview</span>'}
    </div>
    <div class="detail-section">
      <h4>Information</h4>
      <div class="detail-row"><span class="label">ID</span><span class="value">\${asset.id}</span></div>
      <div class="detail-row"><span class="label">Image ID</span><span class="value">\${asset.image_id}</span></div>
      <div class="detail-row"><span class="label">App</span><span class="value">\${asset.app_id}</span></div>
      <div class="detail-row"><span class="label">Tenant</span><span class="value">\${asset.tenant_id}</span></div>
      <div class="detail-row"><span class="label">Entity</span><span class="value">\${asset.entity_type}\${asset.entity_id ? '/' + asset.entity_id : ''}</span></div>
      <div class="detail-row"><span class="label">Role</span><span class="value">\${asset.image_role || '—'}</span></div>
      <div class="detail-row"><span class="label">Status</span><span class="value">\${asset.status}</span></div>
      <div class="detail-row"><span class="label">Filename</span><span class="value">\${asset.original_filename || '—'}</span></div>
      <div class="detail-row"><span class="label">Uploaded by</span><span class="value">\${asset.uploaded_by || '—'}</span></div>
      <div class="detail-row"><span class="label">Usage count</span><span class="value">\${asset.usage_count || 0}</span></div>
      <div class="detail-row"><span class="label">Created</span><span class="value">\${asset.created_at ? new Date(asset.created_at).toLocaleString() : '—'}</span></div>
      <div class="detail-row"><span class="label">Updated</span><span class="value">\${asset.updated_at ? new Date(asset.updated_at).toLocaleString() : '—'}</span></div>
      \${asset.replaced_by_asset_id ? \`<div class="detail-row"><span class="label">Replaced by</span><span class="value">\${asset.replaced_by_asset_id}</span></div>\` : ''}
    </div>
    <div class="detail-section">
      <h4>Variants</h4>
      \${variantHtml || '<div style="color:var(--text2);font-size:13px">No variants</div>'}
    </div>
    <div class="detail-section">
      <h4>Edit</h4>
      <div class="edit-group">
        <label>Alt Text</label>
        <input type="text" id="editAltText" value="\${asset.alt_text || ''}" placeholder="Descriptive alt text">
      </div>
      <div class="edit-group">
        <label>Caption</label>
        <textarea id="editCaption" placeholder="Image caption">\${asset.caption || ''}</textarea>
      </div>
      <button class="btn btn-primary btn-sm" onclick="saveMetadata()">Save Changes</button>
    </div>
    <div class="detail-actions">
      <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('\${asset.image_id}','Image ID')">📋 Copy Image ID</button>
      <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('\${asset.variants?.card || ''}','Image URL')">🔗 Copy URL</button>
      \${asset.status === 'active' ? \`
        <button class="btn btn-secondary btn-sm" onclick="archiveAsset()">📦 Archive</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAsset()">🗑️ Delete</button>
      \` : ''}
      \${asset.status === 'archived' ? \`
        <button class="btn btn-primary btn-sm" onclick="reactivateAsset()">✅ Reactivate</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAsset()">🗑️ Delete</button>
      \` : ''}
    </div>
    <div class="receipts-section">
      <h3>📋 Trust Proof Receipts</h3>
      <div id="receipts-list"><div class="receipts-loading">Loading receipts...</div></div>
    </div>
  \`;

  // Re-render grid to show selection
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));

  // Fetch receipts for this asset
  loadReceipts(asset);
}

async function loadReceipts(asset) {
  const container = document.getElementById('receipts-list');
  if (!container) return;

  try {
    const params = new URLSearchParams({ appId: asset.app_id, tenantId: asset.tenant_id });
    const resp = await fetch(BASE + '/api/media/' + asset.id + '/receipts?' + params);
    const json = await resp.json();
    const receipts = json.data || json.receipts || [];

    if (!receipts.length) {
      container.innerHTML = '<div class="receipts-empty">No receipts found for this asset.</div>';
      return;
    }

    container.innerHTML = receipts.map((r, idx) => {
      const actionClass = 'action-' + (r.action_type || '');
      const badgeClass = 'badge-' + (r.action_type || '');
      const hashShort = r.receipt_hash ? r.receipt_hash.substring(0, 16) + '...' : '—';
      const hashFull = r.receipt_hash || '';
      const ts = r.created_at ? new Date(r.created_at).toLocaleString() : (r.timestamp ? new Date(r.timestamp).toLocaleString() : '—');
      const metaPreview = r.metadata_json ? (typeof r.metadata_json === 'string' ? r.metadata_json : JSON.stringify(r.metadata_json)).substring(0, 100) : '';
      const receiptJson = JSON.stringify(r, null, 2);
      const escapedJson = receiptJson.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'").replace(/\\n/g, '\\\\n');

      return \`<div class="receipt-card \${actionClass}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span class="receipt-badge \${badgeClass}">\${r.action_type || 'unknown'}</span>
          \${r.status ? \`<span class="receipt-status-badge">\${r.status}</span>\` : ''}
        </div>
        <div class="receipt-row"><span class="r-label">Time</span><span class="r-value">\${ts}</span></div>
        \${r.actor_user_id ? \`<div class="receipt-row"><span class="r-label">Actor</span><span class="r-value">\${r.actor_user_id}</span></div>\` : ''}
        <div class="receipt-row">
          <span class="r-label">Hash</span>
          <span class="receipt-hash" title="\${hashFull}" onclick="copyToClipboard('\${hashFull}','Receipt hash')">\${hashShort}</span>
        </div>
        \${metaPreview ? \`<div class="receipt-meta">\${metaPreview}\${metaPreview.length >= 100 ? '...' : ''}</div>\` : ''}
        <div class="receipt-actions">
          <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('\${hashFull}','Receipt hash')">📋 Copy Hash</button>
          <button class="btn btn-secondary btn-sm" onclick="copyToClipboard('\${escapedJson}','Receipt JSON')">📄 Copy JSON</button>
        </div>
      </div>\`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<div class="receipts-empty">Failed to load receipts.</div>';
  }
}

function closeDetail() {
  document.getElementById('detailPanel').classList.remove('open');
  selectedAsset = null;
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
}

async function saveMetadata() {
  if (!selectedAsset) return;
  const altText = document.getElementById('editAltText').value;
  const caption = document.getElementById('editCaption').value;
  try {
    const resp = await fetch(BASE + '/api/media/manage/' + selectedAsset.id, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ appId: selectedAsset.app_id, tenantId: selectedAsset.tenant_id, altText, caption }),
    });
    const json = await resp.json();
    if (json.success) {
      toast('Metadata saved', 'success');
      selectedAsset = json.data;
      selectAsset(selectedAsset);
      search(currentPage);
    } else { toast(json.error || 'Failed', 'error'); }
  } catch (e) { toast('Network error', 'error'); }
}

async function archiveAsset() {
  if (!selectedAsset) return;
  try {
    const resp = await fetch(BASE + '/api/media/manage/' + selectedAsset.id, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ appId: selectedAsset.app_id, tenantId: selectedAsset.tenant_id, status: 'archived' }),
    });
    const json = await resp.json();
    if (json.success) { toast('Asset archived', 'success'); selectedAsset = json.data; selectAsset(selectedAsset); search(currentPage); }
    else toast(json.error || 'Failed', 'error');
  } catch (e) { toast('Network error', 'error'); }
}

async function reactivateAsset() {
  if (!selectedAsset) return;
  try {
    const resp = await fetch(BASE + '/api/media/manage/' + selectedAsset.id, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ appId: selectedAsset.app_id, tenantId: selectedAsset.tenant_id, status: 'active' }),
    });
    const json = await resp.json();
    if (json.success) { toast('Asset reactivated', 'success'); selectedAsset = json.data; selectAsset(selectedAsset); search(currentPage); }
    else toast(json.error || 'Failed', 'error');
  } catch (e) { toast('Network error', 'error'); }
}

async function deleteAsset() {
  if (!selectedAsset || !confirm('Soft-delete this asset?')) return;
  try {
    const resp = await fetch(BASE + '/api/media/manage/' + selectedAsset.id + '?appId=' + selectedAsset.app_id + '&tenantId=' + selectedAsset.tenant_id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + TOKEN },
    });
    const json = await resp.json();
    if (json.success) { toast('Asset deleted', 'success'); closeDetail(); search(currentPage); }
    else toast(json.error || 'Failed', 'error');
  } catch (e) { toast('Network error', 'error'); }
}

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => toast(label + ' copied', 'success')).catch(() => toast('Copy failed', 'error'));
}

function clearFilters() {
  document.getElementById('filterApp').value = '';
  document.getElementById('filterTenant').value = '';
  document.getElementById('filterEntity').value = '';
  document.getElementById('filterRole').value = '';
  document.getElementById('filterStatus').value = '';
  search();
}

function updatePagination() {
  const totalPages = Math.ceil(totalAssets / PAGE_SIZE) || 1;
  document.getElementById('pageInfo').textContent = 'Page ' + (currentPage + 1) + ' of ' + totalPages;
  document.getElementById('prevBtn').disabled = currentPage === 0;
  document.getElementById('nextBtn').disabled = (currentPage + 1) >= totalPages;
}

function prevPage() { if (currentPage > 0) search(currentPage - 1); }
function nextPage() { search(currentPage + 1); }

function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
</script>
</body>
</html>`;
}
