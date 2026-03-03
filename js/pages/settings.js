// Settings Page
import Store from '../store.js';
import { showToast } from '../utils.js';

export function renderSettings() {
  return `
    <div class="section-header">
      <h3 class="section-title">Settings</h3>
    </div>

    <!-- Profiles -->
    <div class="settings-section glass-card" style="margin-bottom: var(--space-xl);">
      <div class="settings-title">👥 Profiles</div>
      <div class="grid-2">
        <div style="display:flex; align-items:center; gap: var(--space-md); padding: var(--space-md); background: var(--lavender-light); border-radius: var(--radius-md);">
          <div style="width:48px;height:48px;border-radius:var(--radius-full);background:var(--lavender);display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:white;font-weight:var(--fw-bold);">K</div>
          <div>
            <div style="font-weight: var(--fw-semibold);">Kunal</div>
            <div style="font-size: var(--fs-xs); color: var(--text-secondary);">Shipt • Full-Time • Starting March 15, 2026</div>
            <div style="font-size: var(--fs-xs); color: var(--lavender-dark); font-weight: var(--fw-semibold);">$165,000/yr</div>
            <div style="font-size: var(--fs-xs); color: var(--text-muted);">Insurance • 401k • HSA • Tax</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap: var(--space-md); padding: var(--space-md); background: var(--mint-light); border-radius: var(--radius-md);">
          <div style="width:48px;height:48px;border-radius:var(--radius-full);background:var(--mint);display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:white;font-weight:var(--fw-bold);">M</div>
          <div>
            <div style="font-weight: var(--fw-semibold);">Murali</div>
            <div style="font-size: var(--fs-xs); color: var(--text-secondary);">State of Michigan • Contract</div>
            <div style="font-size: var(--fs-xs); color: var(--mint-dark); font-weight: var(--fw-semibold);">$37.50/hr</div>
            <div style="font-size: var(--fs-xs); color: var(--text-muted);">Insurance</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div class="settings-section glass-card" style="margin-bottom: var(--space-xl);">
      <div class="settings-title">💾 Data Management</div>
      <p style="font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: var(--space-lg);">
        Your data is stored locally in this browser. Use export to create backups and import to restore them.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap: var(--space-md);">
        <button class="btn btn-primary" id="export-data-btn">📤 Export Data (JSON)</button>
        <button class="btn btn-secondary" id="import-data-btn">📥 Import Data</button>
        <button class="btn btn-danger" id="clear-data-btn">🗑️ Clear All Data</button>
      </div>
      <input type="file" id="import-file-input" accept=".json" style="display:none;" />
    </div>

    <!-- App Info -->
    <div class="settings-section glass-card">
      <div class="settings-title">ℹ️ About DuoBudget</div>
      <div style="font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.8;">
        <p><strong>DuoBudget</strong> is a shared financial management app built for Kunal & Murali.</p>
        <p>Track income, expenses, loans, credit cards, insurance, taxes, 401k, and HSA — all in one beautiful place.</p>
        <div style="margin-top: var(--space-md); padding: var(--space-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
          <div style="display:grid; grid-template-columns: auto 1fr; gap: var(--space-xs) var(--space-md); font-size: var(--fs-xs);">
            <span style="color: var(--text-muted);">Version</span><span>1.0.0</span>
            <span style="color: var(--text-muted);">Storage</span><span>LocalStorage</span>
            <span style="color: var(--text-muted);">Framework</span><span>Vanilla JS + Vite</span>
            <span style="color: var(--text-muted);">Charts</span><span>Chart.js</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initSettings() {
  // Export
  document.getElementById('export-data-btn')?.addEventListener('click', () => {
    const data = Store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duobudget-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  });

  // Import
  const fileInput = document.getElementById('import-file-input');
  document.getElementById('import-data-btn')?.addEventListener('click', () => {
    fileInput.click();
  });
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        Store.importData(ev.target.result);
        showToast('Data imported successfully! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast('Invalid JSON file!', 'error');
      }
    };
    reader.readAsText(file);
  });

  // Clear
  document.getElementById('clear-data-btn')?.addEventListener('click', () => {
    if (confirm('⚠️ Are you sure you want to clear ALL data? This cannot be undone!')) {
      if (confirm('Really? This will delete everything permanently.')) {
        Store.clearAll();
        showToast('All data cleared!', 'warning');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  });
}
