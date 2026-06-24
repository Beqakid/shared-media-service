export function getAdminHtml(env: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Media Admin — ${env}</title>
<style>
  :root {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface-2: #242836;
    --surface-3: #2e3344;
    --border: #333849;
    --text: #e4e4e7;
    --text-muted: #9ca3af;
    --text-dim: #6b7280;
    --primary: #6366f1;
    --primary-hover: #818cf8;
    --danger: #ef4444;
    --danger-hover: #f87171;
    --success: #22c55e;
    --success-hover: #4ade80;
    --warning: #f59e0b;
    --warning-hover: #fbbf24;
    --info: #3b82f6;
    --info-hover: #60a5fa;
    --orange: #f97316;
    --orange-hover: #fb923c;
    --radius: 8px;
    --radius-sm: 4px;
    --shadow: 0 4px 24px rgba(0,0,0,0.3);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* Auth Modal */
  .auth-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .auth-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 32px;
    width: 400px;
    max-width: 90vw;
  }
  .auth-modal h2 { margin-bottom: 8px; font-size: 20px; }
  .auth-modal p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
  .auth-modal input {
    width: 100%;
    padding: 10px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-size: 14px;
    margin-bottom: 16px;
    outline: none;
  }
  .auth-modal input:focus { border-color: var(--primary); }
  .auth-modal .auth-error {
    color: var(--danger);
    font-size: 13px;
    margin-bottom: 12px;
    display: none;
  }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
    color: #fff;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--primary); }
  .btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
  .btn-danger { background: var(--danger); }
  .btn-danger:hover:not(:disabled) { background: var(--danger-hover); }
  .btn-success { background: var(--success); color: #000; }
  .btn-success:hover:not(:disabled) { background: var(--success-hover); }
  .btn-warning { background: var(--warning); color: #000; }
  .btn-warning:hover:not(:disabled) { background: var(--warning-hover); }
  .btn-info { background: var(--info); }
  .btn-info:hover:not(:disabled) { background: var(--info-hover); }
  .btn-secondary { background: var(--surface-3); color: var(--text); }
  .btn-secondary:hover:not(:disabled) { background: var(--border); }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-block { width: 100%; justify-content: center; }

  /* Header */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .header-title {
    display: flex; align-items: center; gap: 12px;
    font-size: 18px; font-weight: 600;
  }
  .header-env {
    font-size: 11px;
    padding: 2px 8px;
    background: var(--primary);
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .header-actions { display: flex; gap: 8px; align-items: center; }

  /* Tab Bar */
  .tab-bar {
    display: flex;
    gap: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
  }
  .tab-btn {
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab-btn:hover { color: var(--text); }
  .tab-btn.active {
    color: var(--primary-hover);
    border-bottom-color: var(--primary);
  }

  /* Layout */
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .content-area {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .main-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .detail-panel {
    width: 420px;
    background: var(--surface);
    border-left: 1px solid var(--border);
    overflow-y: auto;
    display: none;
  }
  .detail-panel.open { display: block; }

  /* Filters */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 16px 24px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    align-items: center;
  }
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .filter-label {
    font-size: 11px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .filter-select, .filter-input {
    padding: 6px 10px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-size: 13px;
    min-width: 130px;
    outline: none;
  }
  .filter-select:focus, .filter-input:focus { border-color: var(--primary); }
  .filter-input { min-width: 180px; }

  /* Media Grid */
  .media-grid {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    align-content: start;
  }

  .media-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.1s;
  }
  .media-card:hover { border-color: var(--primary); transform: translateY(-1px); }
  .media-card.selected { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }

  .media-card-img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    background: var(--surface-2);
    display: block;
  }
  .media-card-img-placeholder {
    width: 100%;
    height: 160px;
    background: var(--surface-2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim);
    font-size: 13px;
  }
  .media-card-body {
    padding: 12px;
  }
  .media-card-name {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .media-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
  }
  .tag-app { background: #312e81; color: #a5b4fc; }
  .tag-role { background: #1e3a5f; color: #93c5fd; }
  .tag-status-active { background: #14532d; color: #86efac; }
  .tag-status-deleted { background: #450a0a; color: #fca5a5; }
  .tag-status-archived { background: #422006; color: #fdba74; }
  .tag-classification { background: #1e293b; color: #94a3b8; }

  .tag-mod-pending_review { background: #78350f; color: #fbbf24; }
  .tag-mod-approved { background: #14532d; color: #86efac; }
  .tag-mod-rejected { background: #450a0a; color: #fca5a5; }
  .tag-mod-flagged { background: #713f12; color: #fde047; }

  /* Quick Actions */
  .card-quick-actions {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    border-top: 1px solid var(--border);
  }

  /* Pagination */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid var(--border);
    background: var(--surface);
  }
  .pagination-info {
    font-size: 13px;
    color: var(--text-muted);
  }

  /* Detail Panel */
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }
  .detail-header h3 { font-size: 16px; }
  .detail-close {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
  }
  .detail-close:hover { color: var(--text); }
  .detail-image {
    width: 100%;
    max-height: 280px;
    object-fit: contain;
    background: var(--surface-2);
    display: block;
  }
  .detail-section {
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }
  .detail-section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }
  .detail-field {
    margin-bottom: 10px;
  }
  .detail-field label {
    display: block;
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 4px;
  }
  .detail-field .value {
    font-size: 13px;
    color: var(--text);
    word-break: break-all;
  }
  .detail-field input,
  .detail-field select,
  .detail-field textarea {
    width: 100%;
    padding: 6px 10px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-size: 13px;
    outline: none;
    font-family: inherit;
  }
  .detail-field textarea { resize: vertical; min-height: 60px; }
  .detail-field input:focus,
  .detail-field select:focus,
  .detail-field textarea:focus { border-color: var(--primary); }
  .detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }

  /* Badge */
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-pending_review { background: #78350f; color: #fbbf24; }
  .badge-approved { background: #14532d; color: #86efac; }
  .badge-rejected { background: #450a0a; color: #fca5a5; }
  .badge-flagged { background: #713f12; color: #fde047; }

  /* Dashboard */
  .dashboard {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    text-align: center;
  }
  .stat-card-label {
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .stat-card-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--text);
  }
  .stat-card-value.val-pending { color: var(--warning); }
  .stat-card-value.val-approved { color: var(--success); }
  .stat-card-value.val-rejected { color: var(--danger); }
  .stat-card-value.val-flagged { color: #fde047; }

  .dashboard-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 24px;
  }
  .dashboard-section h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .dist-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  .dist-bar-label {
    min-width: 120px;
    font-size: 13px;
    color: var(--text);
    text-align: right;
  }
  .dist-bar-track {
    flex: 1;
    height: 24px;
    background: var(--surface-2);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .dist-bar-fill {
    height: 100%;
    background: var(--primary);
    border-radius: var(--radius-sm);
    transition: width 0.4s ease;
    min-width: 2px;
  }
  .dist-bar-count {
    min-width: 50px;
    font-size: 13px;
    color: var(--text-muted);
  }

  /* Receipt Panel */
  .receipt-panel {
    position: fixed;
    top: 0; right: 0;
    width: 480px;
    max-width: 90vw;
    height: 100vh;
    background: var(--surface);
    border-left: 1px solid var(--border);
    z-index: 900;
    display: none;
    flex-direction: column;
    box-shadow: -4px 0 24px rgba(0,0,0,0.4);
  }
  .receipt-panel.open { display: flex; }
  .receipt-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }
  .receipt-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  .receipt-item {
    padding: 12px;
    background: var(--surface-2);
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
    font-size: 13px;
  }
  .receipt-item .receipt-action {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .receipt-item .receipt-meta {
    color: var(--text-muted);
    font-size: 12px;
  }
  .receipt-action-media_uploaded { color: var(--info); }
  .receipt-action-media_updated { color: var(--primary-hover); }
  .receipt-action-media_deleted { color: var(--danger); }
  .receipt-action-media_archived { color: var(--warning); }
  .receipt-action-media_restored { color: var(--success); }
  .receipt-action-media_flagged { color: #fde047; }
  .receipt-action-media_approved { color: var(--success); }
  .receipt-action-media_rejected { color: var(--danger); }
  .receipt-action-media_classified { color: var(--info); }
  .receipt-action-media_tags_updated { color: var(--info); }
  .receipt-action-media_review_notes_updated { color: var(--text-muted); }

  /* Loading */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    color: var(--text-muted);
    font-size: 14px;
  }
  .spinner {
    width: 20px; height: 20px;
    border: 2px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 10px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Toast */
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .toast {
    padding: 12px 20px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--text);
    box-shadow: var(--shadow);
    animation: slideIn 0.2s ease;
  }
  .toast.toast-success { border-left: 3px solid var(--success); }
  .toast.toast-error { border-left: 3px solid var(--danger); }
  .toast.toast-info { border-left: 3px solid var(--info); }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: var(--text-muted);
    font-size: 14px;
    text-align: center;
  }
  .empty-state svg { margin-bottom: 16px; opacity: 0.4; }

  /* View containers */
  .view-container { display: none; flex: 1; flex-direction: column; overflow: hidden; }
  .view-container.active { display: flex; }
</style>
</head>
<body>

<!-- Auth Modal -->
<div class="auth-overlay" id="authOverlay">
  <div class="auth-modal">
    <h2>🔐 Admin Access</h2>
    <p>Enter admin token to access the media management dashboard.</p>
    <div class="auth-error" id="authError">Invalid or expired token.</div>
    <input type="password" id="authToken" placeholder="Admin token..." autocomplete="off" />
    <button class="btn btn-primary btn-block" onclick="doAuth()">Authenticate</button>
  </div>
</div>

<!-- Toast Container -->
<div class="toast-container" id="toastContainer"></div>

<!-- Receipt Panel -->
<div class="receipt-panel" id="receiptPanel">
  <div class="receipt-header">
    <h3>📜 Receipts</h3>
    <button class="detail-close" onclick="closeReceiptPanel()">✕</button>
  </div>
  <div class="receipt-list" id="receiptList">
    <div class="empty-state">No receipts yet.</div>
  </div>
</div>

<!-- App Container -->
<div class="app-container" id="appContainer" style="display:none">

  <!-- Header -->
  <div class="header">
    <div class="header-title">
      📷 Media Admin
      <span class="header-env">${env}</span>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary btn-sm" onclick="openReceiptPanel()">📜 Receipts</button>
      <button class="btn btn-secondary btn-sm" onclick="logout()">Logout</button>
    </div>
  </div>

  <!-- Tab Bar -->
  <div class="tab-bar">
    <button class="tab-btn active" data-tab="library" onclick="switchTab('library')">📚 Library</button>
    <button class="tab-btn" data-tab="review" onclick="switchTab('review')">🔍 Review Queue</button>
    <button class="tab-btn" data-tab="dashboard" onclick="switchTab('dashboard')">📊 Dashboard</button>
  </div>

  <!-- Content Area -->
  <div class="content-area">

    <!-- ===== LIBRARY VIEW ===== -->
    <div class="view-container active" id="view-library">
      <div class="main-panel">
        <!-- Filters -->
        <div class="filter-bar" id="libraryFilters">
          <div class="filter-group">
            <span class="filter-label">App</span>
            <select class="filter-select" id="filterApp" onchange="loadLibrary()">
              <option value="">All Apps</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Tenant</span>
            <select class="filter-select" id="filterTenant" onchange="loadLibrary()">
              <option value="">All Tenants</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Entity Type</span>
            <select class="filter-select" id="filterEntityType" onchange="loadLibrary()">
              <option value="">All Types</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Image Role</span>
            <select class="filter-select" id="filterRole" onchange="loadLibrary()">
              <option value="">All Roles</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Status</span>
            <select class="filter-select" id="filterStatus" onchange="loadLibrary()">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Moderation</span>
            <select class="filter-select" id="filterModeration" onchange="loadLibrary()">
              <option value="">All</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Classification</span>
            <select class="filter-select" id="filterClassification" onchange="loadLibrary()">
              <option value="">All</option>
              <option value="logo">Logo</option>
              <option value="banner">Banner</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="gallery">Gallery</option>
              <option value="avatar">Avatar</option>
              <option value="receipt">Receipt</option>
              <option value="proof">Proof</option>
              <option value="document_preview">Document Preview</option>
              <option value="hero">Hero</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Search</span>
            <input class="filter-input" id="filterSearch" placeholder="Filename or ID..." onkeydown="if(event.key==='Enter')loadLibrary()" />
          </div>
          <div class="filter-group" style="align-self:flex-end">
            <button class="btn btn-primary btn-sm" onclick="loadLibrary()">Apply</button>
          </div>
        </div>

        <!-- Grid -->
        <div class="media-grid" id="libraryGrid">
          <div class="loading"><div class="spinner"></div> Loading media...</div>
        </div>

        <!-- Pagination -->
        <div class="pagination" id="libraryPagination"></div>
      </div>
    </div>

    <!-- ===== REVIEW QUEUE VIEW ===== -->
    <div class="view-container" id="view-review">
      <div class="main-panel">
        <!-- Filters -->
        <div class="filter-bar" id="reviewFilters">
          <div class="filter-group">
            <span class="filter-label">Moderation Status</span>
            <select class="filter-select" id="reviewFilterModeration" onchange="loadReviewQueue()">
              <option value="">All</option>
              <option value="pending_review" selected>Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Classification</span>
            <select class="filter-select" id="reviewFilterClassification" onchange="loadReviewQueue()">
              <option value="">All</option>
              <option value="logo">Logo</option>
              <option value="banner">Banner</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="gallery">Gallery</option>
              <option value="avatar">Avatar</option>
              <option value="receipt">Receipt</option>
              <option value="proof">Proof</option>
              <option value="document_preview">Document Preview</option>
              <option value="hero">Hero</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div class="filter-group" style="align-self:flex-end">
            <button class="btn btn-primary btn-sm" onclick="loadReviewQueue()">Refresh</button>
          </div>
        </div>

        <!-- Grid -->
        <div class="media-grid" id="reviewGrid">
          <div class="loading"><div class="spinner"></div> Loading review queue...</div>
        </div>

        <!-- Pagination -->
        <div class="pagination" id="reviewPagination"></div>
      </div>
    </div>

    <!-- ===== DASHBOARD VIEW ===== -->
    <div class="view-container" id="view-dashboard">
      <div class="dashboard" id="dashboardContent">
        <div class="loading"><div class="spinner"></div> Loading dashboard...</div>
      </div>
    </div>

    <!-- ===== DETAIL PANEL (shared) ===== -->
    <div class="detail-panel" id="detailPanel">
      <div class="detail-header">
        <h3 id="detailTitle">Details</h3>
        <button class="detail-close" onclick="closeDetail()">✕</button>
      </div>
      <div id="detailBody"></div>
    </div>

  </div>
</div>

<script>
(function() {
  // ---- State ----
  window.adminToken = '';
  let currentTab = 'library';
  let libraryPage = 1;
  let libraryTotal = 0;
  let libraryPageSize = 24;
  let reviewPage = 1;
  let reviewTotal = 0;
  let reviewPageSize = 24;
  let selectedAsset = null;
  let tenants = [];
  let receipts = [];

  const CLASSIFICATIONS = ['logo','banner','product','service','gallery','avatar','receipt','proof','document_preview','hero','unknown'];

  // ---- Auth ----
  window.doAuth = async function() {
    const token = document.getElementById('authToken').value.trim();
    if (!token) return;
    window.adminToken = token;
    try {
      const res = await apiFetch('/api/media/manage/tenants');
      if (!res.ok) throw new Error('Auth failed');
      const data = await res.json();
      tenants = data.tenants || data || [];
      document.getElementById('authOverlay').style.display = 'none';
      document.getElementById('appContainer').style.display = 'flex';
      populateTenantFilter();
      loadLibrary();
    } catch(e) {
      document.getElementById('authError').style.display = 'block';
      window.adminToken = '';
    }
  };

  window.logout = function() {
    window.adminToken = '';
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authToken').value = '';
  };

  document.getElementById('authToken').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doAuth();
  });

  // ---- API helpers ----
  function apiFetch(url, opts = {}) {
    opts.headers = opts.headers || {};
    opts.headers['Authorization'] = 'Bearer ' + window.adminToken;
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(url, opts);
  }

  function showToast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.remove(); }, 4000);
  }

  // ---- Tabs ----
  window.switchTab = function(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.view-container').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
    closeDetail();
    if (tab === 'library') loadLibrary();
    else if (tab === 'review') loadReviewQueue();
    else if (tab === 'dashboard') loadDashboard();
  };

  // ---- Tenant filter ----
  function populateTenantFilter() {
    const sel = document.getElementById('filterTenant');
    sel.innerHTML = '<option value="">All Tenants</option>';
    (Array.isArray(tenants) ? tenants : []).forEach(t => {
      const id = t.tenantId || t.id || t;
      const name = t.name || id;
      sel.innerHTML += '<option value="' + escHtml(id) + '">' + escHtml(name) + '</option>';
    });
  }

  // ---- Library ----
  window.loadLibrary = async function(page) {
    if (page) libraryPage = page;
    else libraryPage = 1;
    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading media...</div>';

    const params = new URLSearchParams();
    params.set('page', libraryPage);
    params.set('limit', libraryPageSize);
    const app = document.getElementById('filterApp').value;
    const tenant = document.getElementById('filterTenant').value;
    const entityType = document.getElementById('filterEntityType').value;
    const role = document.getElementById('filterRole').value;
    const status = document.getElementById('filterStatus').value;
    const moderation = document.getElementById('filterModeration').value;
    const classification = document.getElementById('filterClassification').value;
    const search = document.getElementById('filterSearch').value.trim();
    if (app) params.set('appId', app);
    if (tenant) params.set('tenantId', tenant);
    if (entityType) params.set('entityType', entityType);
    if (role) params.set('imageRole', role);
    if (status) params.set('status', status);
    if (moderation) params.set('moderationStatus', moderation);
    if (classification) params.set('classification', classification);
    if (search) params.set('search', search);

    try {
      const res = await apiFetch('/api/media/manage/admin/query?' + params.toString());
      if (!res.ok) throw new Error('Failed to load media');
      const data = await res.json();
      const assets = data.assets || data.items || data.results || [];
      libraryTotal = data.total || assets.length;
      renderMediaGrid(grid, assets, 'library');
      renderPagination('libraryPagination', libraryPage, libraryTotal, libraryPageSize, (p) => loadLibrary(p));
      populateDynamicFilters(assets);
    } catch(e) {
      grid.innerHTML = '<div class="empty-state">Failed to load media: ' + escHtml(e.message) + '</div>';
    }
  };

  function populateDynamicFilters(assets) {
    const apps = new Set();
    const types = new Set();
    const roles = new Set();
    assets.forEach(a => {
      if (a.appId) apps.add(a.appId);
      if (a.entityType) types.add(a.entityType);
      if (a.imageRole) roles.add(a.imageRole);
    });
    fillFilterOptions('filterApp', apps, 'All Apps');
    fillFilterOptions('filterEntityType', types, 'All Types');
    fillFilterOptions('filterRole', roles, 'All Roles');
  }

  function fillFilterOptions(id, values, allLabel) {
    const sel = document.getElementById(id);
    const current = sel.value;
    const existing = new Set();
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value) existing.add(sel.options[i].value);
    }
    values.forEach(v => {
      if (!existing.has(v)) {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
      }
    });
    sel.value = current;
  }

  // ---- Review Queue ----
  window.loadReviewQueue = async function(page) {
    if (page) reviewPage = page;
    else reviewPage = 1;
    const grid = document.getElementById('reviewGrid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading review queue...</div>';

    const params = new URLSearchParams();
    params.set('page', reviewPage);
    params.set('limit', reviewPageSize);
    const modStatus = document.getElementById('reviewFilterModeration').value;
    const cls = document.getElementById('reviewFilterClassification').value;
    if (modStatus) params.set('moderationStatus', modStatus);
    if (cls) params.set('classification', cls);

    try {
      const res = await apiFetch('/api/media/moderate/review-queue?' + params.toString());
      if (!res.ok) throw new Error('Failed to load review queue');
      const data = await res.json();
      const assets = data.assets || data.items || data.results || [];
      reviewTotal = data.total || assets.length;
      renderMediaGrid(grid, assets, 'review');
      renderPagination('reviewPagination', reviewPage, reviewTotal, reviewPageSize, (p) => loadReviewQueue(p));
    } catch(e) {
      grid.innerHTML = '<div class="empty-state">Failed to load review queue: ' + escHtml(e.message) + '</div>';
    }
  };

  // ---- Dashboard ----
  window.loadDashboard = async function() {
    const el = document.getElementById('dashboardContent');
    el.innerHTML = '<div class="loading"><div class="spinner"></div> Loading dashboard...</div>';
    try {
      const res = await apiFetch('/api/media/moderate/intelligence-summary');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();
      renderDashboard(el, data);
    } catch(e) {
      el.innerHTML = '<div class="empty-state">Failed to load dashboard: ' + escHtml(e.message) + '</div>';
    }
  };

  function renderDashboard(el, data) {
    const totalAssets = data.totalAssets || data.total || 0;
    const statusBreakdown = data.statusBreakdown || data.moderationStatus || {};
    const pendingCount = statusBreakdown.pending_review || statusBreakdown.pendingReview || 0;
    const approvedCount = statusBreakdown.approved || 0;
    const rejectedCount = statusBreakdown.rejected || 0;
    const flaggedCount = statusBreakdown.flagged || 0;
    const classificationDist = data.classificationDistribution || data.classification || {};
    const appDist = data.appDistribution || data.apps || {};
    const recentUploads = data.recentUploads || data.recentUploads24h || 0;

    let html = '';

    // Top stats
    html += '<div class="dashboard-grid">';
    html += statCard('Total Assets', totalAssets, '');
    html += statCard('Recent Uploads (24h)', recentUploads, '');
    html += statCard('Pending Review', pendingCount, 'val-pending');
    html += statCard('Approved', approvedCount, 'val-approved');
    html += statCard('Rejected', rejectedCount, 'val-rejected');
    html += statCard('Flagged', flaggedCount, 'val-flagged');
    html += '</div>';

    // Classification Distribution
    html += '<div class="dashboard-section"><h3>Classification Distribution</h3>';
    html += renderDistBars(classificationDist);
    html += '</div>';

    // App Distribution
    html += '<div class="dashboard-section"><h3>App Distribution</h3>';
    html += renderDistBars(appDist);
    html += '</div>';

    el.innerHTML = html;
  }

  function statCard(label, value, valClass) {
    return '<div class="stat-card"><div class="stat-card-label">' + escHtml(label) + '</div><div class="stat-card-value ' + valClass + '">' + escHtml(String(value)) + '</div></div>';
  }

  function renderDistBars(dist) {
    const entries = Object.entries(dist);
    if (!entries.length) return '<div style="color:var(--text-muted);font-size:13px;">No data</div>';
    const max = Math.max(...entries.map(e => e[1]), 1);
    let html = '';
    entries.sort((a, b) => b[1] - a[1]).forEach(([key, count]) => {
      const pct = Math.round((count / max) * 100);
      html += '<div class="dist-bar-row">';
      html += '<div class="dist-bar-label">' + escHtml(key) + '</div>';
      html += '<div class="dist-bar-track"><div class="dist-bar-fill" style="width:' + pct + '%"></div></div>';
      html += '<div class="dist-bar-count">' + count + '</div>';
      html += '</div>';
    });
    return html;
  }

  // ---- Render Media Grid ----
  function renderMediaGrid(container, assets, context) {
    if (!assets.length) {
      container.innerHTML = '<div class="empty-state">No media found.</div>';
      return;
    }
    container.innerHTML = '';
    assets.forEach(asset => {
      const card = document.createElement('div');
      card.className = 'media-card' + (selectedAsset && selectedAsset.id === asset.id ? ' selected' : '');
      card.onclick = function(e) {
        if (e.target.closest('.card-quick-actions')) return;
        selectAsset(asset);
      };

      let imgHtml = '';
      const url = asset.url || asset.cdnUrl || asset.thumbnailUrl || '';
      if (url) {
        imgHtml = '<img class="media-card-img" src="' + escHtml(url) + '" alt="" loading="lazy" onerror="this.outerHTML=\\'<div class=media-card-img-placeholder>No preview</div>\\'"/>';
      } else {
        imgHtml = '<div class="media-card-img-placeholder">No preview</div>';
      }

      let tagsHtml = '';
      if (asset.appId) tagsHtml += '<span class="tag tag-app">' + escHtml(asset.appId) + '</span>';
      if (asset.imageRole) tagsHtml += '<span class="tag tag-role">' + escHtml(asset.imageRole) + '</span>';
      if (asset.status) {
        const sc = asset.status === 'active' ? 'tag-status-active' : asset.status === 'deleted' ? 'tag-status-deleted' : 'tag-status-archived';
        tagsHtml += '<span class="tag ' + sc + '">' + escHtml(asset.status) + '</span>';
      }
      const modSt = asset.moderationStatus || '';
      if (modSt && modSt !== 'approved') {
        tagsHtml += '<span class="tag tag-mod-' + escHtml(modSt) + '">' + escHtml(formatModStatus(modSt)) + '</span>';
      }
      if (asset.classification) {
        tagsHtml += '<span class="tag tag-classification">' + escHtml(asset.classification) + '</span>';
      }

      let quickHtml = '';
      if (context === 'review') {
        quickHtml = '<div class="card-quick-actions">';
        quickHtml += '<button class="btn btn-success btn-sm" onclick="quickModerate(event,\\'approved\\',\\'' + escHtml(asset.id) + '\\',\\'' + escHtml(asset.appId || '') + '\\',\\'' + escHtml(asset.tenantId || '') + '\\')">✓ Approve</button>';
        quickHtml += '<button class="btn btn-danger btn-sm" onclick="quickModerate(event,\\'rejected\\',\\'' + escHtml(asset.id) + '\\',\\'' + escHtml(asset.appId || '') + '\\',\\'' + escHtml(asset.tenantId || '') + '\\')">✗ Reject</button>';
        quickHtml += '<button class="btn btn-warning btn-sm" onclick="quickModerate(event,\\'flagged\\',\\'' + escHtml(asset.id) + '\\',\\'' + escHtml(asset.appId || '') + '\\',\\'' + escHtml(asset.tenantId || '') + '\\')">⚑ Flag</button>';
        quickHtml += '</div>';
      }

      card.innerHTML = imgHtml +
        '<div class="media-card-body">' +
          '<div class="media-card-name">' + escHtml(asset.originalFilename || asset.filename || asset.id || 'Untitled') + '</div>' +
          '<div class="media-card-tags">' + tagsHtml + '</div>' +
        '</div>' + quickHtml;

      container.appendChild(card);
    });
  }

  // ---- Quick Moderate (review queue card actions) ----
  window.quickModerate = async function(event, status, id, appId, tenantId) {
    event.stopPropagation();
    const btn = event.target;
    btn.disabled = true;
    try {
      const res = await apiFetch('/api/media/moderate/' + encodeURIComponent(id) + '/moderation', {
        method: 'PATCH',
        body: {
          moderationStatus: status,
          reviewedBy: 'admin',
          appId: appId,
          tenantId: tenantId
        }
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Asset ' + status, 'success');
      addReceipt({ action: 'media_' + status, assetId: id, timestamp: new Date().toISOString() });
      if (currentTab === 'review') loadReviewQueue(reviewPage);
      if (selectedAsset && selectedAsset.id === id) {
        selectedAsset.moderationStatus = status;
        renderDetailPanel(selectedAsset);
      }
    } catch(e) {
      showToast('Moderation failed: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
    }
  };

  // ---- Pagination ----
  function renderPagination(containerId, page, total, pageSize, onPageChange) {
    const container = document.getElementById(containerId);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (totalPages <= 1 && total <= pageSize) {
      container.innerHTML = '<span class="pagination-info">' + total + ' items</span>';
      return;
    }
    let html = '';
    html += '<button class="btn btn-secondary btn-sm" ' + (page <= 1 ? 'disabled' : '') + ' onclick="void(0)" id="' + containerId + '_prev">← Prev</button>';
    html += '<span class="pagination-info">Page ' + page + ' of ' + totalPages + ' (' + total + ' items)</span>';
    html += '<button class="btn btn-secondary btn-sm" ' + (page >= totalPages ? 'disabled' : '') + ' onclick="void(0)" id="' + containerId + '_next">Next →</button>';
    container.innerHTML = html;
    const prevBtn = document.getElementById(containerId + '_prev');
    const nextBtn = document.getElementById(containerId + '_next');
    if (prevBtn) prevBtn.onclick = function() { onPageChange(page - 1); };
    if (nextBtn) nextBtn.onclick = function() { onPageChange(page + 1); };
  }

  // ---- Detail Panel ----
  function selectAsset(asset) {
    selectedAsset = asset;
    document.querySelectorAll('.media-card').forEach(c => c.classList.remove('selected'));
    renderDetailPanel(asset);
    document.getElementById('detailPanel').classList.add('open');
  }

  window.closeDetail = function() {
    selectedAsset = null;
    document.getElementById('detailPanel').classList.remove('open');
    document.querySelectorAll('.media-card').forEach(c => c.classList.remove('selected'));
  };

  function renderDetailPanel(asset) {
    document.getElementById('detailTitle', asset.originalFilename || asset.filename || 'Details');
    const body = document.getElementById('detailBody');
    let html = '';

    // Image preview
    const url = asset.url || asset.cdnUrl || asset.thumbnailUrl || '';
    if (url) {
      html += '<img class="detail-image" src="' + escHtml(url) + '" alt="" onerror="this.style.display=\\'none\\'"/>';
    }

    // ---- Metadata Section ----
    html += '<div class="detail-section"><div class="detail-section-title">Metadata</div>';
    html += readonlyField('ID', asset.id);
    html += readonlyField('App', asset.appId);
    html += readonlyField('Tenant', asset.tenantId);
    html += readonlyField('Entity Type', asset.entityType);
    html += readonlyField('Entity ID', asset.entityId);
    html += readonlyField('Status', asset.status);
    html += readonlyField('Filename', asset.originalFilename || asset.filename);
    html += readonlyField('MIME Type', asset.mimeType || asset.contentType);
    html += readonlyField('Size', asset.size ? formatBytes(asset.size) : '—');
    html += readonlyField('Created', formatDate(asset.createdAt));
    html += readonlyField('Updated', formatDate(asset.updatedAt));
    html += '</div>';

    // ---- Edit Metadata Section ----
    html += '<div class="detail-section"><div class="detail-section-title">Edit Metadata</div>';
    html += '<div class="detail-field"><label>Image Role</label><input id="editRole" value="' + escHtml(asset.imageRole || '') + '"/></div>';
    html += '<div class="detail-field"><label>Alt Text</label><input id="editAlt" value="' + escHtml(asset.altText || '') + '"/></div>';
    html += '<div class="detail-field"><label>Display Order</label><input id="editOrder" type="number" value="' + (asset.displayOrder || 0) + '"/></div>';
    html += '<button class="btn btn-primary btn-sm" onclick="saveMetadata()">Save Metadata</button>';
    html += '</div>';

    // ---- Moderation Section ----
    html += '<div class="detail-section"><div class="detail-section-title">Moderation</div>';
    const modSt = asset.moderationStatus || 'unknown';
    html += '<div class="detail-field"><label>Moderation Status</label><div><span class="badge badge-' + escHtml(modSt) + '">' + escHtml(formatModStatus(modSt)) + '</span></div></div>';
    html += readonlyField('Moderation Reason', asset.moderationReason || '—');
    html += readonlyField('Reviewed By', asset.reviewedBy || '—');
    html += readonlyField('Reviewed At', asset.reviewedAt ? formatDate(asset.reviewedAt) : '—');
    html += readonlyField('Review Notes', asset.reviewNotes || '—');
    html += '</div>';

    // ---- Moderation Actions ----
    html += '<div class="detail-section"><div class="detail-section-title">Moderation Actions</div>';
    html += '<div class="detail-field"><label>Review Notes</label><textarea id="modReviewNotes" placeholder="Add review notes...">' + escHtml(asset.reviewNotes || '') + '</textarea></div>';
    html += '<div class="detail-field"><label>Moderation Reason</label><input id="modReason" value="' + escHtml(asset.moderationReason || '') + '" placeholder="Reason..."/></div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
    html += '<button class="btn btn-success btn-sm" onclick="moderateAsset(\\'approved\\')">✓ Approve</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="moderateAsset(\\'rejected\\')">✗ Reject</button>';
    html += '<button class="btn btn-warning btn-sm" onclick="moderateAsset(\\'flagged\\')">⚑ Flag</button>';
    html += '<button class="btn btn-secondary btn-sm" onclick="moderateAsset(\\'pending_review\\')">↻ Mark Pending</button>';
    html += '</div></div>';

    // ---- Classification Section ----
    html += '<div class="detail-section"><div class="detail-section-title">Classification</div>';
    if (asset.classification) {
      html += '<div class="detail-field"><label>Current Classification</label><div><span class="tag tag-classification">' + escHtml(asset.classification) + '</span></div></div>';
    }
    if (asset.tags && asset.tags.length) {
      const tagStr = Array.isArray(asset.tags) ? asset.tags.join(', ') : asset.tags;
      html += readonlyField('Tags', tagStr);
    }
    html += '<div class="detail-field"><label>Set Classification</label><select id="editClassification">';
    html += '<option value="">— Select —</option>';
    CLASSIFICATIONS.forEach(c => {
      const sel = (asset.classification === c) ? ' selected' : '';
      html += '<option value="' + c + '"' + sel + '>' + c + '</option>';
    });
    html += '</select></div>';
    html += '<div class="detail-field"><label>Tags (comma-separated)</label><input id="editTags" value="' + escHtml(Array.isArray(asset.tags) ? asset.tags.join(', ') : (asset.tags || '')) + '" placeholder="tag1, tag2, ..."/></div>';
    html += '<button class="btn btn-info btn-sm" onclick="saveClassification()">Save Classification</button>';
    html += '</div>';

    // ---- AI Metadata Section (if present) ----
    const ai = asset.aiMetadata || asset.ai || null;
    if (ai) {
      html += '<div class="detail-section"><div class="detail-section-title">AI Metadata</div>';
      if (ai.caption) html += readonlyField('Caption', ai.caption);
      if (ai.detectedObjects) {
        const objs = Array.isArray(ai.detectedObjects) ? ai.detectedObjects.join(', ') : ai.detectedObjects;
        html += readonlyField('Detected Objects', objs);
      }
      if (ai.keywords) {
        const kw = Array.isArray(ai.keywords) ? ai.keywords.join(', ') : ai.keywords;
        html += readonlyField('Keywords', kw);
      }
      if (ai.confidenceScore !== undefined) html += readonlyField('Confidence Score', String(ai.confidenceScore));
      html += '</div>';
    }

    // ---- Admin Actions ----
    html += '<div class="detail-actions">';
    if (asset.status !== 'deleted') {
      html += '<button class="btn btn-danger btn-sm" onclick="softDeleteAsset()">🗑 Soft Delete</button>';
    }
    if (asset.status !== 'archived') {
      html += '<button class="btn btn-warning btn-sm" onclick="archiveAsset()">📦 Archive</button>';
    }
    if (asset.status === 'deleted' || asset.status === 'archived') {
      html += '<button class="btn btn-success btn-sm" onclick="restoreAsset()">♻ Restore</button>';
    }
    html += '</div>';

    body.innerHTML = html;
  }

  function readonlyField(label, value) {
    return '<div class="detail-field"><label>' + escHtml(label) + '</label><div class="value">' + escHtml(value || '—') + '</div></div>';
  }

  // ---- Detail Actions ----
  window.saveMetadata = async function() {
    if (!selectedAsset) return;
    const role = document.getElementById('editRole').value.trim();
    const alt = document.getElementById('editAlt').value.trim();
    const order = parseInt(document.getElementById('editOrder').value) || 0;
    try {
      const res = await apiFetch('/api/media/manage/' + encodeURIComponent(selectedAsset.id), {
        method: 'PATCH',
        body: { imageRole: role, altText: alt, displayOrder: order, appId: selectedAsset.appId, tenantId: selectedAsset.tenantId }
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Metadata updated', 'success');
      addReceipt({ action: 'media_updated', assetId: selectedAsset.id, timestamp: new Date().toISOString() });
      Object.assign(selectedAsset, { imageRole: role, altText: alt, displayOrder: order });
      renderDetailPanel(selectedAsset);
      refreshCurrentGrid();
    } catch(e) {
      showToast('Save failed: ' + e.message, 'error');
    }
  };

  window.moderateAsset = async function(status) {
    if (!selectedAsset) return;
    const notes = document.getElementById('modReviewNotes').value.trim();
    const reason = document.getElementById('modReason').value.trim();
    try {
      const res = await apiFetch('/api/media/moderate/' + encodeURIComponent(selectedAsset.id) + '/moderation', {
        method: 'PATCH',
        body: {
          moderationStatus: status,
          reviewedBy: 'admin',
          reviewNotes: notes,
          moderationReason: reason,
          appId: selectedAsset.appId,
          tenantId: selectedAsset.tenantId
        }
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Asset ' + formatModStatus(status), 'success');
      addReceipt({ action: 'media_' + status, assetId: selectedAsset.id, timestamp: new Date().toISOString() });
      Object.assign(selectedAsset, { moderationStatus: status, reviewedBy: 'admin', reviewNotes: notes, moderationReason: reason, reviewedAt: new Date().toISOString() });
      renderDetailPanel(selectedAsset);
      refreshCurrentGrid();
    } catch(e) {
      showToast('Moderation failed: ' + e.message, 'error');
    }
  };

  window.saveClassification = async function() {
    if (!selectedAsset) return;
    const classification = document.getElementById('editClassification').value;
    const tagsRaw = document.getElementById('editTags').value;
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    try {
      const res = await apiFetch('/api/media/moderate/' + encodeURIComponent(selectedAsset.id) + '/classification', {
        method: 'PATCH',
        body: {
          classification: classification,
          tags: tags,
          appId: selectedAsset.appId,
          tenantId: selectedAsset.tenantId
        }
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Classification saved', 'success');
      addReceipt({ action: 'media_classified', assetId: selectedAsset.id, timestamp: new Date().toISOString() });
      Object.assign(selectedAsset, { classification: classification, tags: tags });
      renderDetailPanel(selectedAsset);
      refreshCurrentGrid();
    } catch(e) {
      showToast('Classification failed: ' + e.message, 'error');
    }
  };

  window.softDeleteAsset = async function() {
    if (!selectedAsset || !confirm('Soft delete this asset?')) return;
    try {
      const res = await apiFetch('/api/media/manage/' + encodeURIComponent(selectedAsset.id), {
        method: 'DELETE',
        body: { appId: selectedAsset.appId, tenantId: selectedAsset.tenantId }
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Asset deleted', 'success');
      addReceipt({ action: 'media_deleted', assetId: selectedAsset.id, timestamp: new Date().toISOString() });
      selectedAsset.status = 'deleted';
      renderDetailPanel(selectedAsset);
      refreshCurrentGrid();
    } catch(e) {
      showToast('Delete failed: ' + e.message, 'error');
    }
  };

  window.archiveAsset = async function() {
    if (!selectedAsset) return;
    try {
      const res = await apiFetch('/api/media/manage/' + encodeURIComponent(selectedAsset.id) + '/archive', {
        method: 'PATCH',
        body: { appId: selectedAsset.appId, tenantId: selectedAsset.tenantId }
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Asset archived', 'success');
      addReceipt({ action: 'media_archived', assetId: selectedAsset.id, timestamp: new Date().toISOString() });
      selectedAsset.status = 'archived';
      renderDetailPanel(selectedAsset);
      refreshCurrentGrid();
    } catch(e) {
      showToast('Archive failed: ' + e.message, 'error');
    }
  };

  window.restoreAsset = async function() {
    if (!selectedAsset) return;
    try {
      const res = await apiFetch('/api/media/manage/' + encodeURIComponent(selectedAsset.id) + '/restore', {
        method: 'PATCH',
        body: { appId: selectedAsset.appId, tenantId: selectedAsset.tenantId }
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Asset restored', 'success');
      addReceipt({ action: 'media_restored', assetId: selectedAsset.id, timestamp: new Date().toISOString() });
      selectedAsset.status = 'active';
      renderDetailPanel(selectedAsset);
      refreshCurrentGrid();
    } catch(e) {
      showToast('Restore failed: ' + e.message, 'error');
    }
  };

  function refreshCurrentGrid() {
    if (currentTab === 'library') loadLibrary(libraryPage);
    else if (currentTab === 'review') loadReviewQueue(reviewPage);
  }

  // ---- Receipts ----
  function addReceipt(receipt) {
    receipts.unshift(receipt);
    renderReceipts();
  }

  function renderReceipts() {
    const list = document.getElementById('receiptList');
    if (!receipts.length) {
      list.innerHTML = '<div class="empty-state">No receipts yet.</div>';
      return;
    }
    list.innerHTML = receipts.map(r => {
      const actionClass = 'receipt-action-' + (r.action || '');
      return '<div class="receipt-item">' +
        '<div class="receipt-action ' + actionClass + '">' + escHtml(formatReceiptAction(r.action)) + '</div>' +
        '<div class="receipt-meta">Asset: ' + escHtml(r.assetId || '—') + '</div>' +
        '<div class="receipt-meta">' + escHtml(formatDate(r.timestamp)) + '</div>' +
      '</div>';
    }).join('');
  }

  window.openReceiptPanel = function() {
    document.getElementById('receiptPanel').classList.add('open');
  };

  window.closeReceiptPanel = function() {
    document.getElementById('receiptPanel').classList.remove('open');
  };

  // ---- Formatting helpers ----
  function escHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function formatModStatus(s) {
    if (!s) return 'Unknown';
    return s.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase());
  }

  function formatReceiptAction(a) {
    if (!a) return 'Unknown Action';
    return a.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase());
  }

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString();
    } catch(e) { return d; }
  }

  function formatBytes(b) {
    if (!b) return '—';
    const units = ['B','KB','MB','GB'];
    let i = 0;
    let size = b;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return size.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
  }
})();
</script>
</body>
</html>`;
}
