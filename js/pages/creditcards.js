// Credit Cards Page
import Store from '../store.js';
import { formatUSD, formatDate, showToast, openModal, closeModal, getCardGradient, createProgressRing, staggerChildren, showCelebrationToast, launchConfetti, confirmAction } from '../utils.js';

// Payment motivational quotes
const PAYMENT_QUOTES = [
  "Every payment is a step toward freedom! 💪",
  "Debt crusher mode: ACTIVATED! 🔥",
  "Your future self is cheering right now! 🎉",
  "One less worry, one more win! 🏆",
  "Smashing debt like a boss! 💥",
  "Financial freedom is calling your name! 📞",
  "That's the sound of progress! Keep going! 🚀",
  "Less debt = more peace of mind! 🧘",
  "You're writing your own success story! 📖",
  "Debt-free journey: another milestone hit! 🎯",
  "Money well spent — on YOUR freedom! 🗽",
  "Balance going down, confidence going up! 📈",
  "Chip chip chip away! You're unstoppable! ⭐",
  "That payment just made your wallet smile! 😊",
  "Financial glow-up in progress! ✨",
  "You showed that balance who's boss! 👑",
  "Another smart move. Keep stacking wins! 💎",
  "Debt shrinking, dreams growing! 🌱",
  "Payment power! You're crushing it! 💪🔥",
  "Less owed, more owned. Let's go! 🚀",
];

function getRandomPaymentQuote() {
  return PAYMENT_QUOTES[Math.floor(Math.random() * PAYMENT_QUOTES.length)];
}

function showPaymentCelebration(cardName, amount, newBalance) {
  const quote = getRandomPaymentQuote();
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast success quote-toast';
  toast.style.borderLeftColor = '#7DD4B0';
  toast.style.borderLeftWidth = '6px';

  const isPaidOff = newBalance <= 0;
  toast.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;">
      <span style="font-weight:700;font-size:1rem;">
        ${isPaidOff ? '🎉🎊 ' + cardName + ' is PAID OFF!' : '💰 Payment of ' + formatUSD(amount) + ' made!'}
      </span>
      <span style="font-size:0.85rem;opacity:0.9;">${cardName} — New balance: <strong>${isPaidOff ? '✅ $0.00' : formatUSD(newBalance)}</strong></span>
      <span style="font-size:0.8rem;opacity:0.8;font-style:italic;">"${quote}"</span>
    </div>
  `;
  container.appendChild(toast);

  // Always confetti for payments!
  launchConfetti(isPaidOff ? 5000 : 2500);

  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, isPaidOff ? 6000 : 4500);
}

function getPaymentFormHTML(card) {
  return `
    <form id="payment-form">
      <div style="text-align:center; margin-bottom: var(--space-lg);">
        <div style="font-size: var(--fs-sm); color: var(--text-muted); margin-bottom: 4px;">Current Balance</div>
        <div style="font-family: var(--font-display); font-size: var(--fs-3xl); font-weight: var(--fw-extrabold); color: ${card.balance > 0 ? 'var(--coral-dark)' : 'var(--mint-dark)'};">
          ${card.balance <= 0 ? '✅ Paid Off' : formatUSD(card.balance)}
        </div>
        <div style="font-size: var(--fs-xs); color: var(--text-muted); margin-top: 4px;">Available: ${formatUSD((card.creditLimit || 0) - (card.balance || 0))}</div>
      </div>
      ${card.balance > 0 ? `
        <div class="form-group">
          <label>Payment Amount ($)</label>
          <input type="number" class="form-input" name="paymentAmount" step="0.01" min="0.01" max="${card.balance}" 
            placeholder="Enter payment amount" value="${card.minPayment || ''}" required 
            style="font-size: var(--fs-lg); text-align: center; font-weight: var(--fw-bold);" />
        </div>
        <div style="display:flex; gap: var(--space-sm); margin-bottom: var(--space-md);">
          <button type="button" class="btn btn-ghost btn-sm quick-pay" data-amount="${card.minPayment || 25}" style="flex:1; font-size: var(--fs-xs);">Min (${formatUSD(card.minPayment || 25)})</button>
          <button type="button" class="btn btn-ghost btn-sm quick-pay" data-amount="${Math.min(card.balance, (card.balance * 0.5))}" style="flex:1; font-size: var(--fs-xs);">Half (${formatUSD(card.balance * 0.5)})</button>
          <button type="button" class="btn btn-ghost btn-sm quick-pay" data-amount="${card.balance}" style="flex:1; font-size: var(--fs-xs);">Full (${formatUSD(card.balance)})</button>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
          <button type="submit" class="btn btn-primary" style="background: linear-gradient(135deg, var(--mint), var(--mint-dark)); flex: 2;">💰 Make Payment</button>
        </div>
      ` : `
        <div style="text-align:center; padding: var(--space-lg); color: var(--mint-dark); font-weight: var(--fw-semibold);">
          🎉 This card is fully paid off! No payment needed.
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')" style="width:100%;">Close</button>
        </div>
      `}
    </form>
  `;
}

function getFormHTML(existing = null) {
  return `
    <form id="cc-form">
      <div class="form-group">
        <label>Person</label>
        <select class="form-input" name="person" required>
          <option value="Kunal" ${existing?.person === 'Kunal' ? 'selected' : ''}>Kunal</option>
          <option value="Murali" ${existing?.person === 'Murali' ? 'selected' : ''}>Murali</option>
        </select>
      </div>
      <div class="form-group">
        <label>Card Name</label>
        <input type="text" class="form-input" name="cardName" placeholder="e.g., Chase Freedom" value="${existing?.cardName || ''}" required />
      </div>
      <div class="form-group">
        <label>Credit Limit ($)</label>
        <input type="number" class="form-input" name="creditLimit" step="0.01" min="0" placeholder="Total credit limit" value="${existing?.creditLimit || ''}" required />
      </div>
      <div class="form-group">
        <label>Current Balance ($)</label>
        <input type="number" class="form-input" name="balance" step="0.01" min="0" placeholder="Outstanding balance" value="${existing?.balance || ''}" required />
      </div>
      <div class="form-group">
        <label>Due Date</label>
        <input type="date" class="form-input" name="dueDate" value="${existing?.dueDate || ''}" />
      </div>
      <div class="form-group">
        <label>Minimum Payment ($)</label>
        <input type="number" class="form-input" name="minPayment" step="0.01" min="0" placeholder="Min monthly payment" value="${existing?.minPayment || ''}" />
      </div>
      <div class="form-group">
        <label>Last 4 Digits (optional)</label>
        <input type="text" class="form-input" name="last4" maxlength="4" placeholder="1234" value="${existing?.last4 || ''}" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Update' : 'Add Card'}</button>
      </div>
    </form>
  `;
}

export function renderCreditCards() {
  const cards = Store.getCreditCards();
  const totalDebt = cards.reduce((s, c) => s + Number(c.balance || 0), 0);
  const totalLimit = cards.reduce((s, c) => s + Number(c.creditLimit || 0), 0);
  const utilization = totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0;

  return `
    <div class="section-header">
      <h3 class="section-title">Credit Cards</h3>
      <button class="btn btn-primary" id="add-cc-btn">+ Add Card</button>
    </div>

    <div class="grid-3" style="margin-bottom: var(--space-xl);">
      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-label">Total Debt</div>
        <div class="stat-value" style="color: var(--coral-dark);">${formatUSD(totalDebt)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-label">Total Limit</div>
        <div class="stat-value">${formatUSD(totalLimit)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-label">Utilization</div>
        <div class="stat-value" style="color: ${utilization > 30 ? 'var(--coral-dark)' : 'var(--mint-dark)'};">
          ${utilization.toFixed(1)}%
        </div>
        <div class="progress-bar" style="margin-top: var(--space-sm);">
          <div class="progress-fill ${utilization > 30 ? 'danger' : 'success'}" style="width: ${Math.min(utilization, 100)}%"></div>
        </div>
      </div>
    </div>

    <div class="cc-grid">
      ${cards.length > 0 ? cards.map((card, idx) => {
    const cardUtil = card.creditLimit > 0 ? (card.balance / card.creditLimit) * 100 : 0;
    return `
          <div class="cc-item">
            <div class="credit-card">
              <div class="credit-card-inner credit-card-visual" style="background: ${getCardGradient(idx)};">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div class="card-chip"></div>
                  <span class="badge-person ${card.person?.toLowerCase()}" style="background:rgba(255,255,255,0.25); color:white;">${card.person}</span>
                </div>
                <div class="card-number">•••• •••• •••• ${card.last4 || '••••'}</div>
                <div class="card-bottom">
                  <div>
                    <div style="font-size: 0.65rem; opacity:0.8;">CARD NAME</div>
                    <div class="card-name">${card.cardName}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size: 0.65rem; opacity:0.8;">BALANCE</div>
                    <div style="font-weight: var(--fw-bold);">${card.balance <= 0 ? '✅ PAID OFF' : formatUSD(card.balance)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="cc-details glass-card" style="margin-top: -12px; padding-top: var(--space-lg);">
              <div class="cc-detail-row">
                <span class="cc-detail-label">Credit Limit</span>
                <span class="cc-detail-value">${formatUSD(card.creditLimit)}</span>
              </div>
              <div class="cc-detail-row">
                <span class="cc-detail-label">Available</span>
                <span class="cc-detail-value" style="color: var(--mint-dark);">${formatUSD((card.creditLimit || 0) - (card.balance || 0))}</span>
              </div>
              <div class="cc-detail-row">
                <span class="cc-detail-label">Utilization</span>
                <span class="cc-detail-value" style="color: ${cardUtil > 30 ? 'var(--coral-dark)' : 'var(--mint-dark)'};">${cardUtil.toFixed(1)}%</span>
              </div>
              <div class="cc-detail-row">
                <span class="cc-detail-label">Due Date</span>
                <span class="cc-detail-value">${card.dueDate ? formatDate(card.dueDate) : '—'}</span>
              </div>
              <div class="cc-detail-row">
                <span class="cc-detail-label">Min Payment</span>
                <span class="cc-detail-value">${formatUSD(card.minPayment)}</span>
              </div>
              <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-sm);">
                <button class="btn btn-primary btn-sm pay-cc" data-id="${card.id}" style="flex:2; background: linear-gradient(135deg, var(--mint), var(--mint-dark));">💰 Pay</button>
                <button class="btn btn-ghost btn-sm edit-cc" data-id="${card.id}" style="flex:1;">✏️</button>
                <button class="btn btn-ghost btn-sm delete-cc" data-id="${card.id}" style="flex:1;">🗑️</button>
              </div>
            </div>
          </div>
        `;
  }).join('') : `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">💳</div>
          <div class="empty-text">No credit cards added yet. Add yours to track utilization!</div>
          <button class="btn btn-primary" id="add-cc-empty">+ Add Card</button>
        </div>
      `}
    </div>
  `;
}

export function initCreditCards() {
  function openAddModal() {
    openModal('Add Credit Card', getFormHTML());
    document.getElementById('cc-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Store.addCreditCard({
        person: fd.get('person'), cardName: fd.get('cardName'),
        creditLimit: parseFloat(fd.get('creditLimit')), balance: parseFloat(fd.get('balance')),
        dueDate: fd.get('dueDate'), minPayment: parseFloat(fd.get('minPayment')),
        last4: fd.get('last4'),
      });
      closeModal(); showToast('Card added!', 'success'); refresh();
    });
  }

  document.getElementById('add-cc-btn')?.addEventListener('click', openAddModal);
  document.getElementById('add-cc-empty')?.addEventListener('click', openAddModal);

  document.querySelectorAll('.edit-cc').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = Store.getCreditCards().find(i => i.id === btn.dataset.id);
      if (!item) return;
      openModal('Edit Credit Card', getFormHTML(item));
      document.getElementById('cc-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        Store.updateCreditCard(btn.dataset.id, {
          person: fd.get('person'), cardName: fd.get('cardName'),
          creditLimit: parseFloat(fd.get('creditLimit')), balance: parseFloat(fd.get('balance')),
          dueDate: fd.get('dueDate'), minPayment: parseFloat(fd.get('minPayment')),
          last4: fd.get('last4'),
        });
        closeModal();
        const newBalance = parseFloat(fd.get('balance'));
        if (newBalance <= 0 && item.balance > 0) {
          showCelebrationToast(`${fd.get('cardName')} is PAID OFF!`);
        } else {
          showToast('Card updated!', 'success');
        }
        refresh();
      });
    });
  });

  document.querySelectorAll('.delete-cc').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmAction('Delete Card', 'Are you sure you want to delete this credit card?', () => {
        Store.deleteCreditCard(btn.dataset.id);
        showToast('Card deleted', 'warning');
        refresh();
      });
    });
  });

  // Make Payment handlers
  document.querySelectorAll('.pay-cc').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = Store.getCreditCards().find(c => c.id === btn.dataset.id);
      if (!card) return;
      openModal(`Pay — ${card.cardName}`, getPaymentFormHTML(card));

      // Quick pay buttons
      document.querySelectorAll('.quick-pay').forEach(qb => {
        qb.addEventListener('click', () => {
          const input = document.querySelector('#payment-form input[name="paymentAmount"]');
          if (input) input.value = parseFloat(qb.dataset.amount).toFixed(2);
        });
      });

      // Payment submission
      document.getElementById('payment-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(new FormData(e.target).get('paymentAmount'));
        if (!amount || amount <= 0) {
          showToast('Please enter a valid amount', 'warning');
          return;
        }
        const newBalance = Math.max(0, (card.balance || 0) - amount);
        Store.updateCreditCard(card.id, { balance: newBalance });
        closeModal();
        showPaymentCelebration(card.cardName, amount, newBalance);
        refresh();
      });
    });
  });

  staggerChildren(document.getElementById('page-container'), '.cc-item', 150);
}

function refresh() {
  const container = document.getElementById('page-container');
  container.innerHTML = renderCreditCards();
  initCreditCards();
}
