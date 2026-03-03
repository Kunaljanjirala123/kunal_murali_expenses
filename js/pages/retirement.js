// 401k Retirement Page (Kunal Only)
import Store from '../store.js';
import { formatUSD, formatDate, today, showToast, openModal, closeModal, createProgressRing, staggerChildren } from '../utils.js';

const ANNUAL_LIMIT_2026 = 23500; // 401k contribution limit for 2026

function getContributionFormHTML() {
    return `
    <form id="retirement-form">
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-input" name="date" value="${today()}" required />
      </div>
      <div class="form-group">
        <label>Your Contribution ($)</label>
        <input type="number" class="form-input" name="amount" step="0.01" min="0" placeholder="0.00" required />
      </div>
      <div class="form-group">
        <label>Employer Match ($)</label>
        <input type="number" class="form-input" name="employerMatch" step="0.01" min="0" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label>Notes</label>
        <input type="text" class="form-input" name="notes" placeholder="e.g., Paycheck contribution" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Contribution</button>
      </div>
    </form>
  `;
}

function getSettingsFormHTML(ret) {
    return `
    <form id="retirement-settings-form">
      <div class="form-group">
        <label>Current Balance ($)</label>
        <input type="number" class="form-input" name="balance" step="0.01" min="0" value="${ret.balance || 0}" required />
      </div>
      <div class="form-group">
        <label>Employer Match (%)</label>
        <input type="number" class="form-input" name="employerMatchPct" step="1" min="0" max="100" value="${ret.employerMatchPct || 100}" />
      </div>
      <div class="form-group">
        <label>Vesting (%)</label>
        <input type="number" class="form-input" name="vestingPct" step="1" min="0" max="100" value="${ret.vestingPct || 0}" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
  `;
}

export function renderRetirement() {
    const ret = Store.getRetirement();
    const contributions = ret.contributions || [];
    const totalContributed = contributions.reduce((s, c) => s + Number(c.amount || 0), 0);
    const totalEmployerMatch = contributions.reduce((s, c) => s + Number(c.employerMatch || 0), 0);
    const yearContributions = contributions
        .filter(c => c.date && c.date.startsWith(String(new Date().getFullYear())))
        .reduce((s, c) => s + Number(c.amount || 0), 0);
    const pctOfLimit = (yearContributions / ANNUAL_LIMIT_2026) * 100;
    const vestingPct = ret.vestingPct || 0;

    return `
    <div class="section-header">
      <div style="display:flex; align-items:center; gap: var(--space-md);">
        <h3 class="section-title">401k Retirement</h3>
        <span class="kunal-only-tag">👤 Kunal Only</span>
      </div>
      <div style="display:flex;gap:var(--space-sm);">
        <button class="btn btn-ghost" id="retirement-settings-btn">⚙️ Settings</button>
        <button class="btn btn-primary" id="add-contribution-btn">+ Add Contribution</button>
      </div>
    </div>

    <!-- Hero Balance -->
    <div class="account-hero animate-fade-in">
      <div class="account-label">Current 401k Balance</div>
      <div class="account-balance">${formatUSD(ret.balance)}</div>
      <div style="margin-top: var(--space-md); font-size: var(--fs-sm); color: var(--text-secondary);">
        Vesting: ${vestingPct}% • Vested Amount: ${formatUSD(ret.balance * vestingPct / 100)}
      </div>
    </div>

    <!-- Stats -->
    <div class="grid-3" style="margin-bottom: var(--space-xl);">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Your Contributions</div>
        <div class="stat-value">${formatUSD(totalContributed)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🤝</div>
        <div class="stat-label">Employer Match</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(totalEmployerMatch)}</div>
      </div>
      <div class="stat-card" style="text-align: center;">
        <div class="stat-label" style="margin-bottom: var(--space-sm);">Annual Limit Progress</div>
        <div style="display:flex; align-items:center; justify-content:center; gap: var(--space-md);">
          ${createProgressRing(90, 7, Math.min(pctOfLimit, 100), pctOfLimit > 90 ? 'var(--mint-dark)' : 'var(--lavender-dark)')}
          <div style="text-align:left;">
            <div style="font-size: var(--fs-xs); color: var(--text-muted);">${formatUSD(yearContributions)}</div>
            <div style="font-size: var(--fs-xs); color: var(--text-muted);">of ${formatUSD(ANNUAL_LIMIT_2026)}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vesting Progress -->
    <div class="glass-card" style="margin-bottom: var(--space-xl);">
      <div class="section-header"><h4 class="section-title">Vesting Schedule</h4></div>
      <div class="progress-bar" style="height: 12px;">
        <div class="progress-fill success" style="width: ${vestingPct}%;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top: var(--space-xs); font-size: var(--fs-xs); color: var(--text-muted);">
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>
    </div>

    <!-- Contribution History -->
    <div class="glass-card">
      <div class="section-header"><h3 class="section-title">Contribution History</h3></div>
      ${contributions.length > 0 ? `
        <div class="table-responsive" style="overflow-x:auto;">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Your Contribution</th><th>Employer Match</th><th>Total</th><th>Notes</th></tr></thead>
            <tbody>
              ${contributions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(c => `
                <tr>
                  <td>${formatDate(c.date)}</td>
                  <td style="font-weight:var(--fw-semibold);">${formatUSD(c.amount)}</td>
                  <td style="color: var(--mint-dark);">${formatUSD(c.employerMatch)}</td>
                  <td style="font-weight:var(--fw-semibold);">${formatUSD((c.amount || 0) + (c.employerMatch || 0))}</td>
                  <td style="color: var(--text-muted);">${c.notes || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">🏖️</div>
          <div class="empty-text">No contributions recorded yet.</div>
        </div>
      `}
    </div>
  `;
}

export function initRetirement() {
    document.getElementById('add-contribution-btn')?.addEventListener('click', () => {
        openModal('Add 401k Contribution', getContributionFormHTML());
        document.getElementById('retirement-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            Store.addRetirementContribution({
                date: fd.get('date'),
                amount: parseFloat(fd.get('amount')) || 0,
                employerMatch: parseFloat(fd.get('employerMatch')) || 0,
                notes: fd.get('notes'),
            });
            closeModal(); showToast('Contribution added!', 'success'); refresh();
        });
    });

    document.getElementById('retirement-settings-btn')?.addEventListener('click', () => {
        const ret = Store.getRetirement();
        openModal('401k Settings', getSettingsFormHTML(ret));
        document.getElementById('retirement-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            Store.updateRetirement({
                balance: parseFloat(fd.get('balance')) || 0,
                employerMatchPct: parseFloat(fd.get('employerMatchPct')) || 0,
                vestingPct: parseFloat(fd.get('vestingPct')) || 0,
            });
            closeModal(); showToast('Settings saved!', 'success'); refresh();
        });
    });

    staggerChildren(document.getElementById('page-container'), '.stat-card', 100);
}

function refresh() {
    const container = document.getElementById('page-container');
    container.innerHTML = renderRetirement();
    initRetirement();
}
