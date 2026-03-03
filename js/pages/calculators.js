// Payoff Calculators Page
import Store from '../store.js';
import { formatUSD } from '../utils.js';

export function renderCalculators() {
  const loans = Store.getLoans();
  const cards = Store.getCreditCards();
  return `
    <div class="section-header">
      <h3 class="section-title">Financial Calculators</h3>
      <p style="color: var(--text-secondary); font-size: var(--fs-sm);">Interactive sandbox to plan debt payoffs.</p>
    </div>

    <style>
      .calculator-tabs { display: flex; gap: var(--space-xs); margin-bottom: var(--space-lg); padding: 4px; background: var(--bg-secondary); border-radius: var(--radius-lg); }
      .calc-tab { flex: 1; padding: 8px; text-align: center; font-size: var(--fs-xs); font-weight: var(--fw-semibold); border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-base); color: var(--text-secondary); }
      .calc-tab.active { background: white; color: var(--text-primary); box-shadow: var(--shadow-sm); }
      
      .calc-result-box {
        margin-top: var(--space-xl);
        padding: var(--space-lg);
        background: linear-gradient(135deg, rgba(195, 177, 225, 0.1), rgba(181, 234, 215, 0.1));
        border-radius: var(--radius-md);
        border: 1px solid rgba(195, 177, 225, 0.3);
        display: none;
        animation: slideUpFade 0.4s ease forwards;
      }
      
      @keyframes slideUpFade {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .calc-stat-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); padding-bottom: var(--space-sm); border-bottom: 1px dashed rgba(0,0,0,0.05); }
      .calc-stat-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .calc-label { font-size: var(--fs-xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
      .calc-val { font-family: var(--font-display); font-weight: var(--fw-bold); font-size: var(--fs-lg); color: var(--text-primary); }
      .calc-val.highlight { color: var(--lavender-dark); font-size: var(--fs-xl); }
      .calc-val.danger { color: var(--coral-dark); }
    </style>

    <div class="grid-2">
      <!-- Loan Calculator -->
      <div class="glass-card" style="position:relative; overflow:hidden;">
        <div style="position:absolute; top:-50px; right:-50px; width:150px; height:150px; background:var(--sky-light); border-radius:50%; filter:blur(40px); opacity:0.5; z-index:0; pointer-events:none;"></div>
        <div style="position:relative; z-index:1;">
            <div class="settings-title" style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.5rem;">🏦</span> Loan Payoff Calculator
            </div>
            
            <div class="calculator-tabs">
              <div class="calc-tab active" data-target="loan-time" data-group="loan">How long will it take?</div>
              <div class="calc-tab" data-target="loan-pay" data-group="loan">How much should I pay?</div>
            </div>

            <form id="loan-form">
              <input type="hidden" id="loan-mode" value="time">
              
              <div class="form-group">
                <label>Auto-Fill from existing Loans (Optional)</label>
                <select id="loan-autofill" class="form-input">
                  <option value="">-- Custom Loan --</option>
                  ${loans.map(l => `<option value="${l.id}" data-balance="${l.balance}" data-rate="${l.interestRate}">${l.lender} - ${l.loanType} (${formatUSD(l.balance)})</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Current Remaining Balance ($)</label>
                <input type="number" id="loan-balance" class="form-input" step="0.01" min="1" placeholder="e.g. 15000" required>
              </div>
              <div class="form-group">
                <label>Annual Interest Rate (%)</label>
                <input type="number" id="loan-rate" class="form-input" step="0.01" min="0" placeholder="e.g. 5.5" required>
              </div>
              
              <div id="loan-time-inputs" class="calc-inputs" data-group="loan">
                <div class="form-group">
                  <label>Planned Monthly Payment ($)</label>
                  <input type="number" id="loan-payment-input" class="form-input" step="0.01" min="1" placeholder="e.g. 300">
                </div>
              </div>
              
              <div id="loan-pay-inputs" class="calc-inputs" data-group="loan" style="display:none;">
                <div class="form-group">
                  <label>Target Time to Payoff (Months)</label>
                  <input type="number" id="loan-months-input" class="form-input" step="1" min="1" placeholder="e.g. 24">
                </div>
              </div>
              
              <button type="submit" class="btn btn-primary" style="width:100%; margin-top:var(--space-md); position:relative; overflow:hidden;">
                Calculate Loan Projection
              </button>
            </form>
            
            <div id="loan-result" class="calc-result-box"></div>
        </div>
      </div>

      <!-- Credit Card Calculator -->
      <div class="glass-card" style="position:relative; overflow:hidden;">
        <div style="position:absolute; top:-50px; right:-50px; width:150px; height:150px; background:var(--lavender-light); border-radius:50%; filter:blur(40px); opacity:0.5; z-index:0; pointer-events:none;"></div>
        <div style="position:relative; z-index:1;">
            <div class="settings-title" style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.5rem;">💳</span> Credit Card Calculator
            </div>
            
            <div class="calculator-tabs">
              <div class="calc-tab active" data-target="cc-time" data-group="cc">How long will it take?</div>
              <div class="calc-tab" data-target="cc-pay" data-group="cc">How much should I pay?</div>
            </div>

            <form id="cc-form">
              <input type="hidden" id="cc-mode" value="time">
              
              <div class="form-group">
                <label>Auto-Fill from existing Cards (Optional)</label>
                <select id="cc-autofill" class="form-input">
                  <option value="">-- Custom Credit Card --</option>
                  ${cards.map(c => `<option value="${c.id}" data-balance="${c.balance}" data-rate="${c.apr || 19.99}">${c.cardName} ending in ${c.last4} (${formatUSD(c.balance)})</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Current Statement Balance ($)</label>
                <input type="number" id="cc-balance" class="form-input" step="0.01" min="1" placeholder="e.g. 4500" required>
              </div>
              <div class="form-group">
                <label>Annual Percentage Rate (APR %)</label>
                <input type="number" id="cc-rate" class="form-input" step="0.01" min="0" placeholder="e.g. 19.99" required>
              </div>
              
              <div id="cc-time-inputs" class="calc-inputs" data-group="cc">
                <div class="form-group">
                  <label>Planned Monthly Payment ($)</label>
                  <input type="number" id="cc-payment-input" class="form-input" step="0.01" min="1" placeholder="e.g. 150">
                </div>
              </div>
              
              <div id="cc-pay-inputs" class="calc-inputs" data-group="cc" style="display:none;">
                <div class="form-group">
                  <label>Target Time to Payoff (Months)</label>
                  <input type="number" id="cc-months-input" class="form-input" step="1" min="1" placeholder="e.g. 12">
                </div>
              </div>
              
              <button type="submit" class="btn btn-secondary" style="width:100%; margin-top:var(--space-md); position:relative; overflow:hidden;">
                Calculate CC Projection
              </button>
            </form>
            
            <div id="cc-result" class="calc-result-box"></div>
        </div>
      </div>
    </div>
  `;
}

export function initCalculators() {
  // Setup Tab Switching
  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const g = e.target.dataset.group;
      const target = e.target.dataset.target;

      // Update UI active states
      document.querySelectorAll(`.calc-tab[data-group="${g}"]`).forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');

      // Toggle inputs
      document.querySelectorAll(`.calc-inputs[data-group="${g}"]`).forEach(i => i.style.display = 'none');
      document.getElementById(`${target}-inputs`).style.display = 'block';

      // Update hidden mode input
      const formModeInput = document.getElementById(`${g}-mode`);
      formModeInput.value = target.split('-')[1]; // "time" or "pay"

      // Hide results when switching rules
      document.getElementById(`${g}-result`).style.display = 'none';

      // Add a slight interactive tilt effect
      const card = e.target.closest('.glass-card');
      card.style.transform = 'scale(1.01)';
      setTimeout(() => card.style.transform = '', 150);
    });
  });

  // Auto-fill bindings
  document.getElementById('loan-autofill')?.addEventListener('change', (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    if (opt.value) {
      document.getElementById('loan-balance').value = opt.dataset.balance;
      document.getElementById('loan-rate').value = opt.dataset.rate;
    }
  });

  document.getElementById('cc-autofill')?.addEventListener('change', (e) => {
    const opt = e.target.options[e.target.selectedIndex];
    if (opt.value) {
      document.getElementById('cc-balance').value = opt.dataset.balance;
      document.getElementById('cc-rate').value = opt.dataset.rate;
    }
  });

  // Math Functions
  function calculatePayment(balance, annualRate, months) {
    if (annualRate === 0) return balance / months;
    const r = (annualRate / 100) / 12;
    return (balance * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  function calculateMonths(balance, annualRate, payment) {
    if (annualRate === 0) return Math.ceil(balance / payment);
    const r = (annualRate / 100) / 12;
    if (payment <= balance * r) return Infinity; // Will never pay off (payment covers less than interest)
    return Math.ceil(-Math.log(1 - (balance * r) / payment) / Math.log(1 + r));
  }

  function renderResult(container, values, isCC = false) {
    const { mode, balance, months, payment, totalInterest } = values;

    // Add quick flare animation
    container.style.display = 'none';
    setTimeout(() => {
      container.style.display = 'block';
    }, 10);

    const themeColor = isCC ? 'var(--mint-dark)' : 'var(--lavender-dark)';
    const yearsStr = months >= 12 ? ` (${(months / 12).toFixed(1)} years)` : '';

    container.innerHTML = `
      <div class="calc-stat-row">
        <div class="calc-label">${mode === 'time' ? 'Time to Payoff' : 'Required Monthly Payment'}</div>
        <div class="calc-val highlight" style="color: ${themeColor}">
          ${mode === 'time' ? `${months} mo${yearsStr}` : formatUSD(payment)}
        </div>
      </div>
      <div class="calc-stat-row">
        <div class="calc-label">${mode === 'time' ? 'Monthly Payment' : 'Payoff Target'}</div>
        <div class="calc-val">${mode === 'time' ? formatUSD(payment) : `${months} mo${yearsStr}`}</div>
      </div>
      <div class="calc-stat-row">
        <div class="calc-label">Total Interest Paid</div>
        <div class="calc-val ${totalInterest > balance * 0.5 ? 'danger' : ''}">${formatUSD(totalInterest)}</div>
      </div>
      <div class="calc-stat-row">
        <div class="calc-label">Total Cost (${isCC ? 'Debt' : 'Loan'} + Interest)</div>
        <div class="calc-val" style="font-size: var(--fs-md);">${formatUSD(balance + totalInterest)}</div>
      </div>
    `;
  }

  function handleFormSubmit(e, isCC) {
    e.preventDefault();
    const prefix = isCC ? 'cc' : 'loan';
    const mode = document.getElementById(`${prefix}-mode`).value;

    const balance = parseFloat(document.getElementById(`${prefix}-balance`).value);
    const rate = parseFloat(document.getElementById(`${prefix}-rate`).value);
    const container = document.getElementById(`${prefix}-result`);

    if (mode === 'time') {
      const payment = parseFloat(document.getElementById(`${prefix}-payment-input`).value);
      if (!payment || payment <= 0) return alert("Please enter a valid payment amount.");

      const months = calculateMonths(balance, rate, payment);
      if (months === Infinity) {
        container.style.display = 'block';
        container.innerHTML = `
        <div style="text-align:center; padding:10px;">
            <div style="font-size:2rem; margin-bottom:8px;">⚠️</div>
            <div style="color:var(--coral-dark); font-weight:var(--fw-bold);">Infinite Debt Warning</div>
            <div style="font-size:var(--fs-xs); color:var(--text-secondary); margin-top:4px;">
              Your payment of ${formatUSD(payment)} doesn't even cover the monthly interest of ${formatUSD(balance * ((rate / 100) / 12))}. 
              You will never pay this off!
            </div>
          </div>
        `;
        return;
      }

      const totalInterest = (payment * months) - balance;
      renderResult(container, { mode, balance, months, payment, totalInterest: Math.max(0, totalInterest) }, isCC);

    } else {
      const months = parseFloat(document.getElementById(`${prefix}-months-input`).value);
      if (!months || months <= 0) return alert("Please enter a valid number of months.");

      const payment = calculatePayment(balance, rate, months);
      const totalInterest = (payment * months) - balance;
      renderResult(container, { mode, balance, months, payment, totalInterest: Math.max(0, totalInterest) }, isCC);
    }
  }

  // Bind forms
  document.getElementById('loan-form').addEventListener('submit', (e) => handleFormSubmit(e, false));
  document.getElementById('cc-form').addEventListener('submit', (e) => handleFormSubmit(e, true));
}
