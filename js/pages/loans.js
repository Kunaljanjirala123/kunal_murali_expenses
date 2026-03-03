// Loans Manager Page
import Store from '../store.js';
import { formatUSD, formatINR, showToast, openModal, closeModal, createProgressRing, staggerChildren, showCelebrationToast, fetchExchangeRate, convertINRtoUSD, getStoredExchangeRate } from '../utils.js';

function getFormHTML(existing = null) {
  const today = new Date().toISOString().split('T')[0];
  return `
    <form id="loan-form">
      <div class="form-group">
        <label>Person</label>
        <select class="form-input" name="person" required>
          <option value="Kunal" ${existing?.person === 'Kunal' ? 'selected' : ''}>Kunal</option>
          <option value="Murali" ${existing?.person === 'Murali' ? 'selected' : ''}>Murali</option>
        </select>
      </div>
      <div class="form-group">
        <label>Lender / Bank Name</label>
        <input type="text" class="form-input" name="lender" placeholder="e.g., SBI, HDFC" value="${existing?.lender || ''}" required />
      </div>
      <div class="form-group">
        <label>Loan Type</label>
        <select class="form-input" name="loanType">
          <option value="Student Loan" ${existing?.loanType === 'Student Loan' ? 'selected' : ''}>Student Loan</option>
          <option value="Personal Loan" ${existing?.loanType === 'Personal Loan' ? 'selected' : ''}>Personal Loan</option>
          <option value="Education Loan" ${existing?.loanType === 'Education Loan' ? 'selected' : ''}>Education Loan</option>
          <option value="Other" ${existing?.loanType === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Currency</label>
        <select class="form-input" name="currency">
          <option value="INR" ${existing?.currency === 'INR' ? 'selected' : ''}>INR (₹) — India</option>
          <option value="USD" ${existing?.currency === 'USD' ? 'selected' : ''}>USD ($) — US</option>
        </select>
      </div>
      <div class="form-group">
        <label>Date Added</label>
        <input type="date" class="form-input" name="dateAdded" value="${existing?.dateAdded || today}" required />
      </div>
      <div class="form-group">
        <label>Principal Amount</label>
        <input type="number" class="form-input" name="principal" step="0.01" min="0" placeholder="Total loan amount" value="${existing?.principal || ''}" required />
      </div>
      <div class="form-group">
        <label>Interest Rate (%)</label>
        <input type="number" class="form-input" name="interestRate" step="0.01" min="0" placeholder="e.g., 8.5" value="${existing?.interestRate || ''}" />
      </div>
      <div class="form-group">
        <label>Monthly EMI</label>
        <input type="number" class="form-input" name="emi" step="0.01" min="0" placeholder="Monthly payment" value="${existing?.emi || ''}" />
      </div>
      <div class="form-group">
        <label>Remaining Balance</label>
        <input type="number" class="form-input" name="balance" step="0.01" min="0" placeholder="Current remaining" value="${existing?.balance || ''}" required />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Update' : 'Add Loan'}</button>
      </div>
    </form>
  `;
}

function fmt(amount, currency) {
  return currency === 'INR' ? formatINR(amount) : formatUSD(amount);
}

export function renderLoans() {
  const loans = Store.getLoans();
  const totalDebtUSD = loans.filter(l => l.currency === 'USD').reduce((s, l) => s + Number(l.balance || 0), 0);
  const totalDebtINR = loans.filter(l => l.currency === 'INR').reduce((s, l) => s + Number(l.balance || 0), 0);
  const totalEMI_USD = loans.filter(l => l.currency === 'USD').reduce((s, l) => s + Number(l.emi || 0), 0);
  const totalEMI_INR = loans.filter(l => l.currency === 'INR').reduce((s, l) => s + Number(l.emi || 0), 0);

  // Convert INR EMIs to USD using stored exchange rates
  const inrLoansUSDEquiv = loans
    .filter(l => l.currency === 'INR')
    .reduce((s, l) => s + convertINRtoUSD(Number(l.emi || 0), l.exchangeRate), 0);
  const totalEMI_CombinedUSD = totalEMI_USD + inrLoansUSDEquiv;

  // Build EMI display
  let emiDisplay;
  if (totalEMI_INR > 0 && totalEMI_USD > 0) {
    emiDisplay = `${formatINR(totalEMI_INR)} + ${formatUSD(totalEMI_USD)}`;
  } else if (totalEMI_INR > 0) {
    emiDisplay = formatINR(totalEMI_INR);
  } else {
    emiDisplay = formatUSD(totalEMI_USD);
  }
  const hasBothCurrencies = totalEMI_INR > 0 && totalEMI_USD > 0;

  return `
    <div class="section-header">
      <h3 class="section-title">Loans Manager</h3>
      <button class="btn btn-primary" id="add-loan-btn">+ Add Loan</button>
    </div>

    <div class="grid-4" style="margin-bottom: var(--space-xl);">
      <div class="stat-card">
        <div class="stat-icon">🏦</div>
        <div class="stat-label">Total Debt (USD)</div>
        <div class="stat-value" style="color: var(--coral-dark);">${formatUSD(totalDebtUSD)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🇮🇳</div>
        <div class="stat-label">Total Debt (INR)</div>
        <div class="stat-value" style="color: var(--coral-dark);">${formatINR(totalDebtINR)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-label">Monthly EMI</div>
        <div class="stat-value" style="font-size: ${hasBothCurrencies ? 'var(--fs-sm)' : 'var(--fs-xl)'}">${emiDisplay}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💱</div>
        <div class="stat-label">EMI in USD (converted)</div>
        <div class="stat-value" style="color: var(--sky-dark);">${formatUSD(totalEMI_CombinedUSD)}</div>
      </div>
    </div>

    <div class="grid-auto">
      ${loans.length > 0 ? loans.map(loan => {
    const paid = Number(loan.principal || 0) - Number(loan.balance || 0);
    const progress = loan.principal > 0 ? (paid / loan.principal) * 100 : 0;
    return `
          <div class="loan-card">
            <div class="loan-header">
              <div>
                <div class="loan-lender">${loan.lender}</div>
                <span class="badge-category">${loan.loanType || 'Student Loan'}</span>
              </div>
              <span class="badge-person ${loan.person?.toLowerCase()}">${loan.person}</span>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md);">
              ${createProgressRing(80, 6, progress, progress > 50 ? 'var(--mint-dark)' : 'var(--coral)')}
              <div>
                <div style="font-size: var(--fs-xs); color: var(--text-muted);">Remaining</div>
                <div style="font-family: var(--font-display); font-weight: var(--fw-bold); font-size: var(--fs-xl);">
                  ${fmt(loan.balance, loan.currency)}
                </div>
              </div>
            </div>
            <div class="loan-details-grid">
              <div class="loan-detail-item">
                <div class="detail-label">Principal</div>
                <div class="detail-value">${fmt(loan.principal, loan.currency)}</div>
              </div>
              <div class="loan-detail-item">
                <div class="detail-label">Interest</div>
                <div class="detail-value">${loan.interestRate || '—'}%</div>
              </div>
              <div class="loan-detail-item">
                <div class="detail-label">EMI</div>
                <div class="detail-value">${fmt(loan.emi, loan.currency)}/mo</div>
              </div>
              <div class="loan-detail-item">
                <div class="detail-label">Paid Off</div>
                <div class="detail-value" style="color: var(--mint-dark);">${Math.round(progress)}%</div>
              </div>
            </div>
            <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-sm);">
              <button class="btn btn-ghost btn-sm edit-loan" data-id="${loan.id}" style="flex:1;">✏️ Edit</button>
              <button class="btn btn-ghost btn-sm delete-loan" data-id="${loan.id}" style="flex:1;">🗑️ Delete</button>
            </div>
          </div>
        `;
  }).join('') : `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🏦</div>
          <div class="empty-text">No loans added yet. Track your student loans here!</div>
          <button class="btn btn-primary" id="add-loan-empty">+ Add Loan</button>
        </div>
      `}
    </div>
  `;
}

export function initLoans() {
  function openAddModal() {
    openModal('Add Loan', getFormHTML());
    document.getElementById('loan-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const currency = fd.get('currency');
      let exchangeRate = null;
      if (currency === 'INR') {
        exchangeRate = await fetchExchangeRate();
      }
      Store.addLoan({
        person: fd.get('person'), lender: fd.get('lender'), loanType: fd.get('loanType'),
        currency, principal: parseFloat(fd.get('principal')),
        interestRate: parseFloat(fd.get('interestRate')), emi: parseFloat(fd.get('emi')),
        balance: parseFloat(fd.get('balance')),
        dateAdded: fd.get('dateAdded'),
        exchangeRate,
      });
      closeModal();
      showToast(`Loan added!${exchangeRate ? ` (Rate: 1 USD = ₹${exchangeRate.toFixed(2)})` : ''}`, 'success');
      refresh();
    });
  }

  document.getElementById('add-loan-btn')?.addEventListener('click', openAddModal);
  document.getElementById('add-loan-empty')?.addEventListener('click', openAddModal);

  document.querySelectorAll('.edit-loan').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = Store.getLoans().find(i => i.id === btn.dataset.id);
      if (!item) return;
      openModal('Edit Loan', getFormHTML(item));
      document.getElementById('loan-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const currency = fd.get('currency');
        let exchangeRate = item.exchangeRate;
        // Re-fetch rate if currency changed to INR or if there's no stored rate
        if (currency === 'INR' && !exchangeRate) {
          exchangeRate = await fetchExchangeRate();
        }
        Store.updateLoan(btn.dataset.id, {
          person: fd.get('person'), lender: fd.get('lender'), loanType: fd.get('loanType'),
          currency, principal: parseFloat(fd.get('principal')),
          interestRate: parseFloat(fd.get('interestRate')), emi: parseFloat(fd.get('emi')),
          balance: parseFloat(fd.get('balance')),
          dateAdded: fd.get('dateAdded'),
          exchangeRate,
        });
        closeModal();
        const newBalance = parseFloat(fd.get('balance'));
        if (newBalance <= 0 && item.balance > 0) {
          showCelebrationToast(`${fd.get('lender')} loan is PAID OFF!`);
        } else {
          showToast('Loan updated!', 'success');
        }
        refresh();
      });
    });
  });

  document.querySelectorAll('.delete-loan').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this loan?')) { Store.deleteLoan(btn.dataset.id); showToast('Loan deleted', 'warning'); refresh(); }
    });
  });

  staggerChildren(document.getElementById('page-container'), '.loan-card', 100);
}

function refresh() {
  const container = document.getElementById('page-container');
  container.innerHTML = renderLoans();
  initLoans();
}
