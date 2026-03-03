// HSA Account Page (Kunal Only)
import Store from '../store.js';
import { formatUSD, formatDate, today, showToast, openModal, closeModal, createProgressRing, staggerChildren } from '../utils.js';

const HSA_LIMIT_2026 = 4300; // Self-only HSA limit for 2026

function getContributionFormHTML() {
    return `
    <form id="hsa-contrib-form">
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-input" name="date" value="${today()}" required />
      </div>
      <div class="form-group">
        <label>Amount ($)</label>
        <input type="number" class="form-input" name="amount" step="0.01" min="0" placeholder="0.00" required />
      </div>
      <div class="form-group">
        <label>Notes</label>
        <input type="text" class="form-input" name="notes" placeholder="e.g., Payroll deduction" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Contribution</button>
      </div>
    </form>
  `;
}

function getExpenseFormHTML() {
    return `
    <form id="hsa-expense-form">
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-input" name="date" value="${today()}" required />
      </div>
      <div class="form-group">
        <label>Amount ($)</label>
        <input type="number" class="form-input" name="amount" step="0.01" min="0" placeholder="0.00" required />
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="form-input" name="description" placeholder="e.g., Doctor visit, prescription" required />
      </div>
      <div class="form-group">
        <label>Category</label>
        <select class="form-input" name="category">
          <option value="Doctor Visit">Doctor Visit</option>
          <option value="Prescription">Prescription</option>
          <option value="Dental">Dental</option>
          <option value="Vision">Vision</option>
          <option value="Lab Work">Lab Work</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Expense</button>
      </div>
    </form>
  `;
}

function getSettingsFormHTML(hsa) {
    return `
    <form id="hsa-settings-form">
      <div class="form-group">
        <label>Current Balance ($)</label>
        <input type="number" class="form-input" name="balance" step="0.01" min="0" value="${hsa.balance || 0}" required />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
  `;
}

export function renderHSA() {
    const hsa = Store.getHSA();
    const contributions = hsa.contributions || [];
    const expenses = hsa.expenses || [];
    const totalContributed = contributions.reduce((s, c) => s + Number(c.amount || 0), 0);
    const totalExpensed = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const yearContributions = contributions
        .filter(c => c.date && c.date.startsWith(String(new Date().getFullYear())))
        .reduce((s, c) => s + Number(c.amount || 0), 0);
    const pctOfLimit = (yearContributions / HSA_LIMIT_2026) * 100;
    const taxSavings = yearContributions * 0.22; // Estimated at 22% bracket

    return `
    <div class="section-header">
      <div style="display:flex; align-items:center; gap: var(--space-md);">
        <h3 class="section-title">HSA Account</h3>
        <span class="kunal-only-tag">👤 Kunal Only</span>
      </div>
      <div style="display:flex;gap:var(--space-sm);">
        <button class="btn btn-ghost" id="hsa-settings-btn">⚙️</button>
        <button class="btn btn-secondary" id="add-hsa-expense-btn">+ Expense</button>
        <button class="btn btn-primary" id="add-hsa-contrib-btn">+ Contribute</button>
      </div>
    </div>

    <!-- Hero -->
    <div class="account-hero animate-fade-in" style="background: linear-gradient(135deg, var(--mint-light), var(--sky-light));">
      <div class="account-label">HSA Balance</div>
      <div class="account-balance">${formatUSD(hsa.balance)}</div>
      <div style="margin-top: var(--space-sm); font-size: var(--fs-sm); color: var(--text-secondary);">
        Tax-Free Medical Savings
      </div>
    </div>

    <!-- Stats -->
    <div class="grid-4" style="margin-bottom: var(--space-xl);">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Total Contributed</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(totalContributed)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏥</div>
        <div class="stat-label">Total Spent</div>
        <div class="stat-value" style="color: var(--coral-dark);">${formatUSD(totalExpensed)}</div>
      </div>
      <div class="stat-card" style="text-align:center;">
        <div class="stat-label" style="margin-bottom: var(--space-xs);">Annual Limit</div>
        ${createProgressRing(80, 6, Math.min(pctOfLimit, 100), 'var(--mint-dark)')}
        <div style="font-size: var(--fs-xs); color: var(--text-muted); margin-top: 4px;">
          ${formatUSD(yearContributions)} / ${formatUSD(HSA_LIMIT_2026)}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-label">Est. Tax Savings</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(taxSavings)}</div>
        <div style="font-size: var(--fs-xs); color: var(--text-muted);">at 22% bracket</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Contributions -->
      <div class="glass-card">
        <div class="section-header"><h4 class="section-title">Contributions</h4></div>
        ${contributions.length > 0 ? `
          <div class="transaction-list">
            ${contributions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(c => `
              <div class="transaction-item">
                <div class="transaction-icon" style="background: var(--mint-light);">💰</div>
                <div class="transaction-details">
                  <div class="transaction-desc">${c.notes || 'Contribution'}</div>
                  <div class="transaction-meta"><span>${formatDate(c.date)}</span></div>
                </div>
                <div class="transaction-amount income">+${formatUSD(c.amount)}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state" style="padding: var(--space-lg);">
            <div class="empty-icon">💰</div>
            <div class="empty-text">No contributions yet</div>
          </div>
        `}
      </div>

      <!-- Expenses -->
      <div class="glass-card">
        <div class="section-header"><h4 class="section-title">Medical Expenses</h4></div>
        ${expenses.length > 0 ? `
          <div class="transaction-list">
            ${expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => `
              <div class="transaction-item">
                <div class="transaction-icon" style="background: var(--coral-light);">🏥</div>
                <div class="transaction-details">
                  <div class="transaction-desc">${e.description}</div>
                  <div class="transaction-meta">
                    <span class="badge-category">${e.category || 'Other'}</span>
                    <span>${formatDate(e.date)}</span>
                  </div>
                </div>
                <div class="transaction-amount expense">-${formatUSD(e.amount)}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state" style="padding: var(--space-lg);">
            <div class="empty-icon">🏥</div>
            <div class="empty-text">No expenses recorded</div>
          </div>
        `}
      </div>
    </div>
  `;
}

export function initHSA() {
    document.getElementById('add-hsa-contrib-btn')?.addEventListener('click', () => {
        openModal('Add HSA Contribution', getContributionFormHTML());
        document.getElementById('hsa-contrib-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            Store.addHSAContribution({
                date: fd.get('date'),
                amount: parseFloat(fd.get('amount')) || 0,
                notes: fd.get('notes'),
            });
            closeModal(); showToast('Contribution added!', 'success'); refresh();
        });
    });

    document.getElementById('add-hsa-expense-btn')?.addEventListener('click', () => {
        openModal('Add Medical Expense', getExpenseFormHTML());
        document.getElementById('hsa-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            Store.addHSAExpense({
                date: fd.get('date'),
                amount: parseFloat(fd.get('amount')) || 0,
                description: fd.get('description'),
                category: fd.get('category'),
            });
            closeModal(); showToast('Expense recorded!', 'success'); refresh();
        });
    });

    document.getElementById('hsa-settings-btn')?.addEventListener('click', () => {
        const hsa = Store.getHSA();
        openModal('HSA Settings', getSettingsFormHTML(hsa));
        document.getElementById('hsa-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            Store.updateHSA({ balance: parseFloat(fd.get('balance')) || 0 });
            closeModal(); showToast('Balance updated!', 'success'); refresh();
        });
    });

    staggerChildren(document.getElementById('page-container'), '.stat-card', 100);
}

function refresh() {
    const container = document.getElementById('page-container');
    container.innerHTML = renderHSA();
    initHSA();
}
