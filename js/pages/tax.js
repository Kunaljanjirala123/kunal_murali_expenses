// Tax Details Page (Kunal Only)
import Store from '../store.js';
import { formatUSD, showToast, openModal, closeModal, staggerChildren } from '../utils.js';

const FILING_STATUSES = ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household'];

const TAX_BRACKETS_2026 = [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
];

function getFormHTML(existing = null) {
    return `
    <form id="tax-form">
      <div class="form-group">
        <label>Tax Year</label>
        <input type="number" class="form-input" name="year" min="2020" max="2030" placeholder="2026" value="${existing?.year || new Date().getFullYear()}" required />
      </div>
      <div class="form-group">
        <label>Filing Status</label>
        <select class="form-input" name="filingStatus" required>
          ${FILING_STATUSES.map(s => `<option value="${s}" ${existing?.filingStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Gross Income ($)</label>
        <input type="number" class="form-input" name="grossIncome" step="0.01" min="0" placeholder="Annual gross income" value="${existing?.grossIncome || ''}" required />
      </div>
      <div class="form-group">
        <label>Total Deductions ($)</label>
        <input type="number" class="form-input" name="deductions" step="0.01" min="0" placeholder="Standard/itemized deductions" value="${existing?.deductions || ''}" />
      </div>
      <div class="form-group">
        <label>Tax Withheld ($)</label>
        <input type="number" class="form-input" name="withheld" step="0.01" min="0" placeholder="Total tax withheld" value="${existing?.withheld || ''}" />
      </div>
      <div class="form-group">
        <label>Estimated Tax Owed ($)</label>
        <input type="number" class="form-input" name="taxOwed" step="0.01" min="0" placeholder="Calculated tax" value="${existing?.taxOwed || ''}" />
      </div>
      <div class="form-group">
        <label>Notes</label>
        <input type="text" class="form-input" name="notes" placeholder="Any notes" value="${existing?.notes || ''}" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Update' : 'Add Tax Record'}</button>
      </div>
    </form>
  `;
}

function calcEffectiveRate(income) {
    let tax = 0;
    for (const bracket of TAX_BRACKETS_2026) {
        if (income <= bracket.min) break;
        const taxable = Math.min(income, bracket.max) - bracket.min;
        tax += taxable * (bracket.rate / 100);
    }
    return { tax, rate: income > 0 ? (tax / income) * 100 : 0 };
}

export function renderTax() {
    const taxRecords = Store.getTax().sort((a, b) => (b.year || 0) - (a.year || 0));
    const latest = taxRecords[0];

    return `
    <div class="section-header">
      <div style="display:flex; align-items:center; gap: var(--space-md);">
        <h3 class="section-title">Tax Details</h3>
        <span class="kunal-only-tag">👤 Kunal Only</span>
      </div>
      <button class="btn btn-primary" id="add-tax-btn">+ Add Tax Year</button>
    </div>

    <!-- Tax Bracket Visualization -->
    <div class="glass-card" style="margin-bottom: var(--space-xl);">
      <div class="section-header">
        <h4 class="section-title">2026 Tax Brackets (Single)</h4>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
        ${TAX_BRACKETS_2026.map((bracket, i) => {
        const width = bracket.max === Infinity ? 100 : Math.min((bracket.max / 609350) * 100, 100);
        const colors = ['var(--mint-light)', 'var(--mint)', 'var(--sky-light)', 'var(--peach-light)', 'var(--blush)', 'var(--coral-light)', 'var(--coral)'];
        return `
            <div style="display:flex; align-items:center; gap: var(--space-sm);">
              <span style="font-size: var(--fs-xs); width: 40px; text-align: right; font-weight: var(--fw-semibold);">${bracket.rate}%</span>
              <div style="flex:1; height: 24px; background: var(--bg-secondary); border-radius: var(--radius-sm); overflow: hidden;">
                <div style="height:100%; width: ${width}%; background: ${colors[i]}; border-radius: var(--radius-sm); transition: width 1s ease;"></div>
              </div>
              <span style="font-size: var(--fs-xs); color: var(--text-muted); min-width: 120px;">
                ${formatUSD(bracket.min)} — ${bracket.max === Infinity ? '∞' : formatUSD(bracket.max)}
              </span>
            </div>
          `;
    }).join('')}
      </div>
    </div>

    <!-- Tax Records -->
    <div class="grid-auto">
      ${taxRecords.length > 0 ? taxRecords.map(rec => {
        const { tax: estimatedTax, rate: effectiveRate } = calcEffectiveRate(rec.grossIncome - (rec.deductions || 0));
        const refund = (rec.withheld || 0) - (rec.taxOwed || estimatedTax);
        return `
          <div class="glass-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-md);">
              <h4 style="font-size: var(--fs-xl); font-weight: var(--fw-bold);">📋 ${rec.year}</h4>
              <span class="badge-category">${rec.filingStatus || 'Single'}</span>
            </div>
            <div class="benefit-info-grid" style="margin-bottom: var(--space-md);">
              <div class="benefit-info-item">
                <div class="info-label">Gross Income</div>
                <div class="info-value">${formatUSD(rec.grossIncome)}</div>
              </div>
              <div class="benefit-info-item">
                <div class="info-label">Deductions</div>
                <div class="info-value">${formatUSD(rec.deductions)}</div>
              </div>
              <div class="benefit-info-item">
                <div class="info-label">Tax Withheld</div>
                <div class="info-value">${formatUSD(rec.withheld)}</div>
              </div>
              <div class="benefit-info-item">
                <div class="info-label">Effective Rate</div>
                <div class="info-value">${effectiveRate.toFixed(1)}%</div>
              </div>
            </div>
            <div style="text-align: center; padding: var(--space-md); background: ${refund >= 0 ? 'var(--mint-light)' : 'var(--coral-light)'}; border-radius: var(--radius-md); margin-bottom: var(--space-md);">
              <div style="font-size: var(--fs-xs); color: var(--text-secondary);">${refund >= 0 ? 'Estimated Refund' : 'Amount Owed'}</div>
              <div style="font-family: var(--font-display); font-size: var(--fs-xl); font-weight: var(--fw-bold); color: ${refund >= 0 ? 'var(--mint-dark)' : 'var(--coral-dark)'};">
                ${formatUSD(Math.abs(refund))}
              </div>
            </div>
            ${rec.notes ? `<div style="font-size: var(--fs-xs); color: var(--text-muted);">📝 ${rec.notes}</div>` : ''}
            <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-sm);">
              <button class="btn btn-ghost btn-sm edit-tax" data-id="${rec.id}" style="flex:1;">✏️ Edit</button>
              <button class="btn btn-ghost btn-sm delete-tax" data-id="${rec.id}" style="flex:1;">🗑️ Delete</button>
            </div>
          </div>
        `;
    }).join('') : `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">📋</div>
          <div class="empty-text">No tax records yet. Add your tax year details!</div>
          <button class="btn btn-primary" id="add-tax-empty">+ Add Tax Year</button>
        </div>
      `}
    </div>
  `;
}

export function initTax() {
    function openAddModal() {
        openModal('Add Tax Record', getFormHTML());
        document.getElementById('tax-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            Store.addTax({
                year: parseInt(fd.get('year')), filingStatus: fd.get('filingStatus'),
                grossIncome: parseFloat(fd.get('grossIncome')), deductions: parseFloat(fd.get('deductions')),
                withheld: parseFloat(fd.get('withheld')), taxOwed: parseFloat(fd.get('taxOwed')),
                notes: fd.get('notes'),
            });
            closeModal(); showToast('Tax record added!', 'success'); refresh();
        });
    }

    document.getElementById('add-tax-btn')?.addEventListener('click', openAddModal);
    document.getElementById('add-tax-empty')?.addEventListener('click', openAddModal);

    document.querySelectorAll('.edit-tax').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = Store.getTax().find(i => i.id === btn.dataset.id);
            if (!item) return;
            openModal('Edit Tax Record', getFormHTML(item));
            document.getElementById('tax-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                Store.updateTax(btn.dataset.id, {
                    year: parseInt(fd.get('year')), filingStatus: fd.get('filingStatus'),
                    grossIncome: parseFloat(fd.get('grossIncome')), deductions: parseFloat(fd.get('deductions')),
                    withheld: parseFloat(fd.get('withheld')), taxOwed: parseFloat(fd.get('taxOwed')),
                    notes: fd.get('notes'),
                });
                closeModal(); showToast('Tax record updated!', 'success'); refresh();
            });
        });
    });

    document.querySelectorAll('.delete-tax').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this tax record?')) { Store.deleteTax(btn.dataset.id); showToast('Tax record deleted', 'warning'); refresh(); }
        });
    });

    staggerChildren(document.getElementById('page-container'), '.glass-card', 120);
}

function refresh() {
    const container = document.getElementById('page-container');
    container.innerHTML = renderTax();
    initTax();
}
