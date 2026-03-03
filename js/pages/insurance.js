// Insurance Page (Both Kunal & Murali)
import Store from '../store.js';
import { formatUSD, formatDate, showToast, openModal, closeModal, staggerChildren } from '../utils.js';

const INSURANCE_TYPES = ['Health', 'Dental', 'Vision', 'Life', 'Auto', 'Renter\'s', 'Other'];
const INSURANCE_ICONS = { Health: '❤️', Dental: '🦷', Vision: '👁️', Life: '🛡️', Auto: '🚗', "Renter's": '🏠', Other: '📋' };
const INSURANCE_COLORS = { Health: 'var(--coral-light)', Dental: 'var(--sky-light)', Vision: 'var(--lavender-light)', Life: 'var(--mint-light)', Auto: 'var(--peach-light)', "Renter's": 'var(--lemon-light)', Other: 'var(--lilac-light)' };

function getFormHTML(existing = null) {
  return `
    <form id="insurance-form">
      <div class="form-group">
        <label>Person</label>
        <select class="form-input" name="person" required>
          <option value="Kunal" ${existing?.person === 'Kunal' ? 'selected' : ''}>Kunal</option>
          <option value="Murali" ${existing?.person === 'Murali' ? 'selected' : ''}>Murali</option>
        </select>
      </div>
      <div class="form-group">
        <label>Insurance Type</label>
        <select class="form-input" name="type" required>
          ${INSURANCE_TYPES.map(t => `<option value="${t}" ${existing?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Provider</label>
        <input type="text" class="form-input" name="provider" placeholder="e.g., Blue Cross" value="${existing?.provider || ''}" required />
      </div>
      <div class="form-group">
        <label>Monthly Premium ($)</label>
        <input type="number" class="form-input" name="premium" step="0.01" min="0" placeholder="0.00" value="${existing?.premium || ''}" required />
      </div>
      <div class="form-group">
        <label>Coverage Amount ($)</label>
        <input type="number" class="form-input" name="coverage" step="0.01" min="0" placeholder="Total coverage" value="${existing?.coverage || ''}" />
      </div>
      <div class="form-group">
        <label>Deductible ($)</label>
        <input type="number" class="form-input" name="deductible" step="0.01" min="0" placeholder="Annual deductible" value="${existing?.deductible || ''}" />
      </div>
      <div class="form-group">
        <label>Next Payment Date</label>
        <input type="date" class="form-input" name="nextPayment" value="${existing?.nextPayment || ''}" />
      </div>
      <div class="form-group">
        <label>Policy Number (optional)</label>
        <input type="text" class="form-input" name="policyNumber" placeholder="Policy #" value="${existing?.policyNumber || ''}" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Update' : 'Add Insurance'}</button>
      </div>
    </form>
  `;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function renderInsurance() {
  const insurance = Store.getInsurance();
  const totalMonthly = insurance.reduce((s, i) => s + Number(i.premium || 0), 0);
  const totalAnnual = totalMonthly * 12;
  const kunalPremiums = insurance.filter(i => i.person === 'Kunal').reduce((s, i) => s + Number(i.premium || 0), 0);
  const muraliPremiums = insurance.filter(i => i.person === 'Murali').reduce((s, i) => s + Number(i.premium || 0), 0);

  return `
    <div class="section-header">
      <h3 class="section-title">Insurance</h3>
      <button class="btn btn-primary" id="add-insurance-btn">+ Add Policy</button>
    </div>

    <div class="grid-4" style="margin-bottom: var(--space-xl);">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Monthly Premiums</div>
        <div class="stat-value">${formatUSD(totalMonthly)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-label">Annual Cost</div>
        <div class="stat-value">${formatUSD(totalAnnual)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💜</div>
        <div class="stat-label">Kunal's Premiums</div>
        <div class="stat-value" style="color: var(--lavender-dark);">${formatUSD(kunalPremiums)}/mo</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💚</div>
        <div class="stat-label">Murali's Premiums</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(muraliPremiums)}/mo</div>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-bar" style="margin-bottom: var(--space-lg);">
      <select class="form-input" id="filter-ins-person" style="max-width:160px;">
        <option value="">All Policies</option>
        <option value="Kunal">Kunal's Policies</option>
        <option value="Murali">Murali's Policies</option>
      </select>
    </div>

    <div class="grid-auto" id="insurance-cards-container">
      ${renderInsuranceCards(insurance)}
    </div>
  `;
}

function renderInsuranceCards(insurance) {
  if (insurance.length === 0) {
    return `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🛡️</div>
        <div class="empty-text">No insurance policies added yet.</div>
        <button class="btn btn-primary" id="add-insurance-empty">+ Add Policy</button>
      </div>
    `;
  }

  return insurance.map(ins => {
    const days = daysUntil(ins.nextPayment);
    return `
      <div class="benefit-card">
        <div class="benefit-header">
          <div class="benefit-icon" style="background: ${INSURANCE_COLORS[ins.type] || 'var(--bg-secondary)'};">
            ${INSURANCE_ICONS[ins.type] || '📋'}
          </div>
          <div style="flex:1;">
            <div class="benefit-type">${ins.type} Insurance</div>
            <div class="benefit-provider">${ins.provider}</div>
          </div>
          <span class="badge-person ${ins.person?.toLowerCase()}">${ins.person}</span>
        </div>
        <div class="benefit-info-grid">
          <div class="benefit-info-item">
            <div class="info-label">Premium</div>
            <div class="info-value">${formatUSD(ins.premium)}/mo</div>
          </div>
          <div class="benefit-info-item">
            <div class="info-label">Coverage</div>
            <div class="info-value">${ins.coverage ? formatUSD(ins.coverage) : '—'}</div>
          </div>
          <div class="benefit-info-item">
            <div class="info-label">Deductible</div>
            <div class="info-value">${ins.deductible ? formatUSD(ins.deductible) : '—'}</div>
          </div>
          <div class="benefit-info-item">
            <div class="info-label">Next Payment</div>
            <div class="info-value" style="color: ${days !== null && days <= 7 ? 'var(--coral-dark)' : 'var(--text-primary)'};">
              ${days !== null ? (days <= 0 ? 'Due!' : `${days} days`) : '—'}
            </div>
          </div>
        </div>
        ${ins.policyNumber ? `<div style="margin-top: var(--space-sm); font-size: var(--fs-xs); color: var(--text-muted);">Policy: ${ins.policyNumber}</div>` : ''}
        <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
          <button class="btn btn-ghost btn-sm edit-ins" data-id="${ins.id}" style="flex:1;">✏️ Edit</button>
          <button class="btn btn-ghost btn-sm delete-ins" data-id="${ins.id}" style="flex:1;">🗑️ Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

export function initInsurance() {
  function openAddModal() {
    openModal('Add Insurance Policy', getFormHTML());
    document.getElementById('insurance-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Store.addInsurance({
        person: fd.get('person'),
        type: fd.get('type'), provider: fd.get('provider'),
        premium: parseFloat(fd.get('premium')), coverage: parseFloat(fd.get('coverage')),
        deductible: parseFloat(fd.get('deductible')), nextPayment: fd.get('nextPayment'),
        policyNumber: fd.get('policyNumber'),
      });
      closeModal(); showToast('Insurance added!', 'success'); refresh();
    });
  }

  document.getElementById('add-insurance-btn')?.addEventListener('click', openAddModal);
  document.getElementById('add-insurance-empty')?.addEventListener('click', openAddModal);

  // Person filter
  const filterPerson = document.getElementById('filter-ins-person');
  filterPerson?.addEventListener('change', () => {
    let list = Store.getInsurance();
    if (filterPerson.value) list = list.filter(i => i.person === filterPerson.value);
    document.getElementById('insurance-cards-container').innerHTML = renderInsuranceCards(list);
    attachCardEvents();
  });

  attachCardEvents();
  staggerChildren(document.getElementById('page-container'), '.benefit-card', 120);
}

function attachCardEvents() {
  document.querySelectorAll('.edit-ins').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = Store.getInsurance().find(i => i.id === btn.dataset.id);
      if (!item) return;
      openModal('Edit Insurance', getFormHTML(item));
      document.getElementById('insurance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        Store.updateInsurance(btn.dataset.id, {
          person: fd.get('person'),
          type: fd.get('type'), provider: fd.get('provider'),
          premium: parseFloat(fd.get('premium')), coverage: parseFloat(fd.get('coverage')),
          deductible: parseFloat(fd.get('deductible')), nextPayment: fd.get('nextPayment'),
          policyNumber: fd.get('policyNumber'),
        });
        closeModal(); showToast('Insurance updated!', 'success'); refresh();
      });
    });
  });

  document.querySelectorAll('.delete-ins').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this insurance policy?')) { Store.deleteInsurance(btn.dataset.id); showToast('Insurance deleted', 'warning'); refresh(); }
    });
  });
}

function refresh() {
  const container = document.getElementById('page-container');
  container.innerHTML = renderInsurance();
  initInsurance();
}
