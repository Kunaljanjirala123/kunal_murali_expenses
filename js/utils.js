// Utility functions

export function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

// ============================
// Exchange Rate Utilities
// ============================
const EXCHANGE_RATE_KEY = 'duobudget_exchange_rate';
const EXCHANGE_RATE_CACHE_HOURS = 24;

export async function fetchExchangeRate() {
  try {
    // Check cache first
    const cached = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (cached) {
      const { rate, timestamp } = JSON.parse(cached);
      const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (ageHours < EXCHANGE_RATE_CACHE_HOURS && rate > 0) {
        return rate;
      }
    }

    // Fetch fresh rate (INR per 1 USD)
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      const rate = data.rates?.INR;
      if (rate && rate > 0) {
        localStorage.setItem(EXCHANGE_RATE_KEY, JSON.stringify({
          rate,
          timestamp: Date.now(),
        }));
        return rate;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch exchange rate:', e);
  }
  // Fallback to cached or default
  try {
    const cached = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (cached) return JSON.parse(cached).rate;
  } catch (e) { /* ignore */ }
  return 85; // reasonable fallback
}

export function getStoredExchangeRate() {
  try {
    const cached = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (cached) return JSON.parse(cached).rate;
  } catch (e) { /* ignore */ }
  return 85;
}

export function convertINRtoUSD(inrAmount, rate) {
  if (!rate || rate <= 0) rate = getStoredExchangeRate();
  return inrAmount / rate;
}


export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getMonthYear(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getCurrentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

// Toast notifications
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Confirm Action Modal
export function confirmAction(title, message, onConfirm) {
  const overlay = document.getElementById('modal-overlay');

  document.getElementById('modal-title').innerHTML = `<span style="color:var(--coral-dark);">⚠️</span> ${title}`;
  document.getElementById('modal-body').innerHTML = `
    <div style="padding: 10px 0;">
      <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: var(--fs-sm);">${message}</p>
      <div class="modal-actions" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
        <button type="button" class="btn btn-ghost" id="confirm-cancel-btn">Cancel</button>
        <button type="button" class="btn btn-primary" id="confirm-action-btn" style="background: var(--coral-dark); border-color: var(--coral-dark);">Confirm Delete</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');

  const cancelBtn = document.getElementById('confirm-cancel-btn');
  const confirmBtn = document.getElementById('confirm-action-btn');

  const cleanup = () => {
    cancelBtn.removeEventListener('click', handleCancel);
    confirmBtn.removeEventListener('click', handleConfirm);
    closeModal();
  };

  const handleCancel = () => { cleanup(); };
  const handleConfirm = () => { cleanup(); onConfirm(); };

  cancelBtn.addEventListener('click', handleCancel);
  confirmBtn.addEventListener('click', handleConfirm);
}

// Modal helpers
export function openModal(title, bodyHTML) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  overlay.classList.add('active');
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// Animated counter
export function animateCounter(element, endValue, duration = 1000, prefix = '$') {
  const startValue = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startValue + (endValue - startValue) * eased;
    element.textContent = prefix + current.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Generate unique colors for chart categories
const CATEGORY_COLORS = {
  Rent: '#C3B1E1',
  Groceries: '#B5EAD7',
  Dining: '#FFDAC1',
  Transport: '#A7C7E7',
  Shopping: '#F4978E',
  Entertainment: '#FFD6A5',
  Utilities: '#E0BBE4',
  Subscriptions: '#FDFD96',
  Healthcare: '#F8BCB6',
  Other: '#C5DBF0',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#C5DBF0';
}

export const EXPENSE_CATEGORIES = [
  'Rent', 'Groceries', 'Dining', 'Transport', 'Shopping',
  'Entertainment', 'Utilities', 'Subscriptions', 'Healthcare', 'Other'
];

export const INCOME_TYPES = ['Salary', 'Bonus', 'Freelance', 'Other'];

export const CARD_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

export function getCardGradient(index) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

// Create progress ring SVG
export function createProgressRing(size, strokeWidth, progress, color = 'var(--lavender)') {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return `
    <div class="progress-ring" style="width:${size}px;height:${size}px;">
      <svg width="${size}" height="${size}">
        <circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${strokeWidth}" />
        <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${strokeWidth}"
          stroke="${color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}" />
      </svg>
      <span class="ring-text">${Math.round(progress)}%</span>
    </div>
  `;
}

// Stagger animation helper
export function staggerChildren(parent, selector, delay = 80) {
  const children = parent.querySelectorAll(selector);
  children.forEach((child, i) => {
    child.style.opacity = '0';
    child.style.animation = `fadeInUp 0.4s ease ${i * delay}ms forwards`;
  });
}

// ============================
// 🎉 Confetti Celebration
// ============================
export function launchConfetti(duration = 3000) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const colors = ['#C3B1E1', '#B5EAD7', '#FFDAC1', '#A7C7E7', '#F4978E', '#FFD6A5', '#E0BBE4', '#FDFD96', '#fbc2eb', '#a18cd1'];
  const particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fadeStart = duration * 0.7;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.rotation += p.rotSpeed;
      if (elapsed > fadeStart) {
        p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (duration - fadeStart));
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(animate);
}

// ============================
// 💬 Motivational Quotes
// ============================
const INCOME_QUOTES = [
  "Money flows to you effortlessly! 💸",
  "Another step toward financial freedom! 🚀",
  "Your hard work is paying off — literally! 💪",
  "Building wealth, one paycheck at a time! 📈",
  "Cheers to growth and prosperity! 🥂",
  "The grind pays off! Keep going! 🔥",
  "Financial goals getting closer! 🎯",
  "Smart money moves! You're crushing it! ⭐",
  "Abundance is your nature! 🌟",
  "Stacking bricks, building empires! 🏗️",
  "Every dollar is a seed for your future! 🌱",
  "You're writing your success story! 📖",
  "Wealth is not a destination, it's a journey! 🛤️",
  "Today's earnings = tomorrow's freedom! 🗽",
  "More money, more opportunities! 🌈",
  "Your bank account called — it's happy! 😄",
  "Success looks good on you! ✨",
  "Ka-ching! Another win! 🏆",
  "Your future self will thank you! 🙏",
  "Building that empire, one check at a time! 👑",
  "Money magnet activated! 🧲",
  "Keep up the hustle! 💎",
  "Financial wellness check: You're doing great! 💚",
  "That's the sound of progress! 🎵",
  "Adding fuel to the financial rocket! 🚀",
  "Your dedication is inspiring! 🌺",
  "Prosperity is knocking at your door! 🚪",
  "From hard work to heart work! ❤️",
  "Numbers going up! This is the way! 📊",
  "New income unlocked! Achievement earned! 🎮",
];

export function getRandomQuote() {
  return INCOME_QUOTES[Math.floor(Math.random() * INCOME_QUOTES.length)];
}

export function showQuoteToast(extraMessage = '') {
  const quote = getRandomQuote();
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast success quote-toast';
  toast.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:600;">${extraMessage || 'Income Added!'}</span>
            <span style="font-size:0.8rem;opacity:0.85;font-style:italic;">"${quote}"</span>
        </div>
    `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Celebration toast for debt cleared
export function showCelebrationToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.style.borderLeftColor = '#7DD4B0';
  toast.style.borderLeftWidth = '6px';
  toast.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:700;font-size:1rem;">🎉 ${message}</span>
            <span style="font-size:0.8rem;opacity:0.85;">Incredible achievement! Keep going!</span>
        </div>
    `;
  container.appendChild(toast);
  launchConfetti(3500);
  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ============================
// 📄 PDF / Summary Generation
// ============================
export function generateSummaryHTML(Store) {
  const income = Store.getIncome();
  const expenses = Store.getExpenses();
  const loans = Store.getLoans();
  const cards = Store.getCreditCards();
  const insurance = Store.getInsurance();
  const tax = Store.getTax();
  const retirement = Store.getRetirement();
  const hsa = Store.getHSA();

  const totalIncome = income.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalLoanEMI = loans.reduce((sum, l) => {
    return sum + (l.currency === 'INR' ? convertINRtoUSD(Number(l.emi || 0), l.exchangeRate) : Number(l.emi || 0));
  }, 0);
  const totalLoanBalance = loans.reduce((sum, l) => {
    return sum + (l.currency === 'INR' ? convertINRtoUSD(Number(l.balance || 0), l.exchangeRate) : Number(l.balance || 0));
  }, 0);
  const totalCCDebt = cards.reduce((s, c) => s + Number(c.balance || 0), 0);
  const totalCCLimit = cards.reduce((s, c) => s + Number(c.creditLimit || 0), 0);
  const totalInsurance = insurance.reduce((s, i) => s + Number(i.premium || 0), 0);
  const totalCCMin = cards.reduce((s, c) => s + Number(c.minPayment || 0), 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount || 0); });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DuoBudget Summary — ${monthYear}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2D2A3E; background: #fff; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 4px; color: #2D2A3E; }
    h2 { font-size: 18px; margin: 30px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #C3B1E1; color: #9B7ED4; }
    .subtitle { font-size: 14px; color: #6B6580; margin-bottom: 24px; }
    .logo-line { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .logo-line span { font-size: 24px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .summary-box { padding: 16px; border-radius: 10px; text-align: center; }
    .summary-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6580; }
    .summary-box .value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .green { background: #D4F5E9; } .green .value { color: #2a8f65; }
    .red { background: #FFE0DB; } .red .value { color: #d04b3a; }
    .purple { background: #EDE3F7; } .purple .value { color: #7B5EA7; }
    .blue { background: #D8ECFA; } .blue .value { color: #3F7EB5; }
    .orange { background: #FFF3E0; } .orange .value { color: #E67E22; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 13px; }
    th { text-align: left; padding: 8px 10px; background: #F5F0EB; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6580; }
    td { padding: 8px 10px; border-bottom: 1px solid #F0EBE5; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E0DBD5; font-size: 12px; color: #9E97B0; text-align: center; }
    .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #F0EBE5; }
    .section-box { padding: 16px; border-radius: 10px; background: #FAFAFA; border: 1px solid #EDEAF0; margin: 12px 0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="logo-line"><span>💰</span><h1>DuoBudget — Joint Financial Summary</h1></div>
  <div class="subtitle">Kunal & Murali • Generated on ${dateStr}</div>

  <div class="summary-grid">
    <div class="summary-box green"><div class="label">Joint Income</div><div class="value">${formatUSD(totalIncome)}</div></div>
    <div class="summary-box red"><div class="label">Joint Expenses</div><div class="value">${formatUSD(totalExpenses)}</div></div>
    <div class="summary-box purple"><div class="label">Net Balance</div><div class="value">${formatUSD(netBalance)}</div></div>
    <div class="summary-box orange"><div class="label">Total Liabilities</div><div class="value">${formatUSD(totalLiabilities)}</div></div>
  </div>

  <div class="section-box">
    <div class="detail-row"><span>Total Loan Balance (Converted USD)</span><strong>${formatUSD(totalLoanBalance)}</strong></div>
    <div class="detail-row"><span>Monthly Loan EMIs (Converted USD)</span><strong>${formatUSD(totalLoanEMI)}</strong></div>
    <div class="detail-row"><span>Monthly CC Minimum</span><strong>${formatUSD(totalCCMin)}</strong></div>
    <div class="detail-row"><span>Monthly Insurance</span><strong>${formatUSD(totalInsurance)}</strong></div>
    <div class="detail-row" style="border-bottom:none;font-weight:700;"><span>Total Monthly Obligations</span><strong style="color:#d04b3a;">${formatUSD(monthlyObligations)}</strong></div>
  </div>

  ${income.length > 0 ? `
  <h2>💵 Income (${income.length} entries)</h2>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Notes</th></tr></thead>
    <tbody>${income.sort((a, b) => new Date(b.date) - new Date(a.date)).map(i => `<tr>
      <td>${formatDate(i.date)}</td>
      <td>${i.type || 'Salary'}</td>
      <td style="font-weight:600;color:#2a8f65;">${formatUSD(i.amount)}</td>
      <td>${i.notes || '—'}</td>
    </tr>`).join('')}</tbody>
  </table>` : ''}

  ${expenses.length > 0 ? `
  <h2>🛒 Expenses (${expenses.length} entries)</h2>
  <table>
    <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr></thead>
    <tbody>${expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => `<tr>
      <td>${formatDate(e.date)}</td>
      <td>${e.category}</td>
      <td style="font-weight:600;color:#d04b3a;">${formatUSD(e.amount)}</td>
      <td>${e.description || '—'}</td>
    </tr>`).join('')}</tbody>
  </table>` : ''}

  ${Object.keys(catTotals).length > 0 ? `
  <h2>📊 Spending by Category</h2>
  <table>
    <thead><tr><th>Category</th><th>Total Spent</th><th>% of Expenses</th></tr></thead>
    <tbody>${Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, val]) => `<tr>
      <td>${cat}</td><td>${formatUSD(val)}</td>
      <td>${totalExpenses > 0 ? ((val / totalExpenses) * 100).toFixed(1) : 0}%</td>
    </tr>`).join('')}</tbody>
  </table>` : ''}

  ${loans.length > 0 ? `
  <h2>🏦 Loans (${loans.length})</h2>
  <table>
    <thead><tr><th>Lender</th><th>Type</th><th>Principal</th><th>Balance</th><th>EMI</th><th>Rate</th><th>Paid Off</th></tr></thead>
    <tbody>${loans.map(l => {
    const progress = l.principal > 0 ? (((l.principal - l.balance) / l.principal) * 100).toFixed(0) : 0;
    return `<tr>
      <td>${l.lender}</td><td>${l.loanType}</td>
      <td>${l.currency === 'INR' ? formatINR(l.principal) : formatUSD(l.principal)}</td>
      <td style="font-weight:600;color:#d04b3a;">${l.currency === 'INR' ? formatINR(l.balance) : formatUSD(l.balance)}</td>
      <td>${l.currency === 'INR' ? formatINR(l.emi) : formatUSD(l.emi)}/mo</td>
      <td>${l.interestRate || '—'}%</td>
      <td style="color:#2a8f65;">${progress}%</td>
    </tr>`}).join('')}</tbody>
  </table>
  <div class="summary-grid" style="grid-template-columns:repeat(2,1fr);">
    <div class="summary-box red"><div class="label">Total Loan Balance</div><div class="value">${formatUSD(totalLoanBalance)}</div></div>
    <div class="summary-box blue"><div class="label">Monthly EMI Total</div><div class="value">${formatUSD(totalLoanEMI)}</div></div>
  </div>` : ''}

  ${cards.length > 0 ? `
  <h2>💳 Credit Cards (${cards.length})</h2>
  <table>
    <thead><tr><th>Card</th><th>Limit</th><th>Balance</th><th>Available</th><th>Utilization</th><th>Min Payment</th><th>Due Date</th></tr></thead>
    <tbody>${cards.map(c => {
      const util = c.creditLimit > 0 ? ((c.balance / c.creditLimit) * 100).toFixed(0) : 0;
      return `<tr>
      <td>${c.cardName}</td>
      <td>${formatUSD(c.creditLimit)}</td>
      <td style="font-weight:600;color:${c.balance > 0 ? '#d04b3a' : '#2a8f65'};">${c.balance <= 0 ? '✅ Paid Off' : formatUSD(c.balance)}</td>
      <td>${formatUSD((c.creditLimit || 0) - (c.balance || 0))}</td>
      <td style="color:${util > 30 ? '#d04b3a' : '#2a8f65'};">${util}%</td>
      <td>${formatUSD(c.minPayment)}</td>
      <td>${c.dueDate ? formatDate(c.dueDate) : '—'}</td>
    </tr>`}).join('')}</tbody>
  </table>
  <div class="summary-grid" style="grid-template-columns:repeat(3,1fr);">
    <div class="summary-box red"><div class="label">Total CC Debt</div><div class="value">${formatUSD(totalCCDebt)}</div></div>
    <div class="summary-box blue"><div class="label">Total CC Limit</div><div class="value">${formatUSD(totalCCLimit)}</div></div>
    <div class="summary-box ${totalCCLimit > 0 && (totalCCDebt / totalCCLimit * 100) > 30 ? 'red' : 'green'}"><div class="label">Utilization</div><div class="value">${totalCCLimit > 0 ? (totalCCDebt / totalCCLimit * 100).toFixed(1) : 0}%</div></div>
  </div>` : ''}

  ${insurance.length > 0 ? `
  <h2>🛡️ Insurance (${insurance.length} policies)</h2>
  <table>
    <thead><tr><th>Type</th><th>Provider</th><th>Premium</th><th>Coverage</th><th>Deductible</th></tr></thead>
    <tbody>${insurance.map(i => `<tr>
      <td>${i.type}</td><td>${i.provider}</td>
      <td>${formatUSD(i.premium)}/mo</td>
      <td>${i.coverage ? formatUSD(i.coverage) : '—'}</td>
      <td>${i.deductible ? formatUSD(i.deductible) : '—'}</td>
    </tr>`).join('')}</tbody>
  </table>
  <div class="summary-grid" style="grid-template-columns:repeat(2,1fr);">
    <div class="summary-box blue"><div class="label">Monthly Premiums</div><div class="value">${formatUSD(totalInsurance)}</div></div>
    <div class="summary-box purple"><div class="label">Annual Insurance Cost</div><div class="value">${formatUSD(totalInsurance * 12)}</div></div>
  </div>` : ''}

  ${tax.length > 0 ? `
  <h2>📋 Tax Records</h2>
  <table>
    <thead><tr><th>Year</th><th>Filing Status</th><th>Total Income</th><th>Deductions</th><th>Withheld</th><th>Result</th></tr></thead>
    <tbody>${tax.map(t => {
        const owed = (t.taxOwed || 0) - (t.withheld || 0);
        return `<tr>
      <td>${t.year}</td><td>${t.filingStatus || 'Single'}</td>
      <td>${formatUSD(t.grossIncome)}</td><td>${formatUSD(t.deductions)}</td>
      <td>${formatUSD(t.withheld)}</td>
      <td style="font-weight:600;color:${owed <= 0 ? '#2a8f65' : '#d04b3a'};">${owed <= 0 ? 'Refund ' + formatUSD(Math.abs(owed)) : 'Owe ' + formatUSD(owed)}</td>
    </tr>`}).join('')}</tbody>
  </table>` : ''}

  <h2>🏖️ Retirement & Health Savings</h2>
  <div class="summary-grid" style="grid-template-columns:repeat(3,1fr);">
    <div class="summary-box purple"><div class="label">401k Balance</div><div class="value">${formatUSD(retirement.balance)}</div></div>
    <div class="summary-box green"><div class="label">HSA Balance</div><div class="value">${formatUSD(hsa.balance)}</div></div>
    <div class="summary-box blue"><div class="label">401k Vesting</div><div class="value">${retirement.vestingPct || 0}%</div></div>
  </div>

  <div class="footer">DuoBudget — Joint Financial Summary • Kunal & Murali • Generated automatically</div>
</body>
</html>`;
}

export function downloadSummaryPDF(Store) {
  const html = generateSummaryHTML(Store);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
    };
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = `DuoBudget-Summary-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
  showToast('Summary generated! Use Print → Save as PDF', 'success');
}

export function downloadMonthlySalaryReport(Store) {
  const now = new Date();
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const income = Store.getIncome().filter(i => i.date?.startsWith(monthStr));
  const expenses = Store.getExpenses().filter(e => e.date?.startsWith(monthStr));
  const loans = Store.getLoans();
  const cards = Store.getCreditCards();
  const insurance = Store.getInsurance();
  const tax = Store.getTax();
  const retirement = Store.getRetirement();
  const hsa = Store.getHSA();

  const totalIncome = income.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalLoanEMI = loans.reduce((s, l) => s + Number(l.emi || 0), 0);
  const totalLoanBalance = loans.reduce((s, l) => s + Number(l.balance || 0), 0);
  const totalCCDebt = cards.reduce((s, c) => s + Number(c.balance || 0), 0);
  const totalCCLimit = cards.reduce((s, c) => s + Number(c.creditLimit || 0), 0);
  const totalInsurance = insurance.reduce((s, i) => s + Number(i.premium || 0), 0);
  const totalCCMin = cards.reduce((s, c) => s + Number(c.minPayment || 0), 0);

  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount || 0); });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Monthly Report — ${monthYear}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2D2A3E; background: #fff; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #C3B1E1; color: #9B7ED4; }
    .subtitle { font-size: 13px; color: #6B6580; margin-bottom: 20px; }
    .hero { text-align: center; padding: 24px; border-radius: 12px; background: linear-gradient(135deg, #EDE3F7, #D4F5E9); margin-bottom: 24px; }
    .hero .big-num { font-size: 36px; font-weight: 800; margin: 8px 0; }
    .hero .sub { font-size: 13px; color: #6B6580; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .summary-box { padding: 14px; border-radius: 10px; text-align: center; }
    .summary-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B6580; }
    .summary-box .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
    .green { background: #D4F5E9; } .green .value { color: #2a8f65; }
    .red { background: #FFE0DB; } .red .value { color: #d04b3a; }
    .purple { background: #EDE3F7; } .purple .value { color: #7B5EA7; }
    .blue { background: #D8ECFA; } .blue .value { color: #3F7EB5; }
    .orange { background: #FFF3E0; } .orange .value { color: #E67E22; }
    .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #F0EBE5; }
    .section-box { padding: 16px; border-radius: 10px; background: #FAFAFA; border: 1px solid #EDEAF0; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
    th { text-align: left; padding: 6px 8px; background: #F5F0EB; font-size: 10px; text-transform: uppercase; color: #6B6580; }
    td { padding: 6px 8px; border-bottom: 1px solid #F0EBE5; }
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #E0DBD5; font-size: 11px; color: #9E97B0; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📋 Monthly Financial Report — ${monthYear}</h1>
  <div class="subtitle">Kunal & Murali • Generated on ${dateStr}</div>

  <div class="hero">
    <div class="sub">JOINT NET BALANCE THIS MONTH</div>
    <div class="big-num" style="color:${totalIncome - totalExpenses >= 0 ? '#2a8f65' : '#d04b3a'};">${formatUSD(totalIncome - totalExpenses)}</div>
    <div class="sub">${formatUSD(totalIncome)} earned · ${formatUSD(totalExpenses)} spent</div>
  </div>

  <div class="summary-grid">
    <div class="summary-box green"><div class="label">Joint Income</div><div class="value">${formatUSD(totalIncome)}</div></div>
    <div class="summary-box red"><div class="label">Joint Expenses</div><div class="value">${formatUSD(totalExpenses)}</div></div>
    <div class="summary-box orange"><div class="label">Monthly EMIs</div><div class="value">${formatUSD(totalLoanEMI)}</div></div>
    <div class="summary-box blue"><div class="label">Insurance</div><div class="value">${formatUSD(totalInsurance)}</div></div>
  </div>

  ${income.length > 0 ? `
  <h2>💵 Income This Month (${income.length} entries)</h2>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Notes</th></tr></thead>
    <tbody>${income.sort((a, b) => new Date(a.date) - new Date(b.date)).map(i => `<tr>
      <td>${formatDate(i.date)}</td>
      <td>${i.type || 'Salary'}</td>
      <td style="font-weight:600;color:#2a8f65;">${formatUSD(i.amount)}</td>
      <td>${i.notes || '—'}</td>
    </tr>`).join('')}</tbody>
  </table>` : '<p style="color:#9E97B0;margin:12px 0;">No income recorded this month.</p>'}

  ${expenses.length > 0 ? `
  <h2>🛒 Expenses This Month (${expenses.length} entries)</h2>
  <table>
    <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr></thead>
    <tbody>${expenses.sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => `<tr>
      <td>${formatDate(e.date)}</td>
      <td>${e.category}</td>
      <td style="font-weight:600;color:#d04b3a;">${formatUSD(e.amount)}</td>
      <td>${e.description || '—'}</td>
    </tr>`).join('')}</tbody>
  </table>` : '<p style="color:#9E97B0;margin:12px 0;">No expenses recorded this month.</p>'}

  ${Object.keys(catTotals).length > 0 ? `
  <h2>📊 Spending by Category</h2>
  <table>
    <thead><tr><th>Category</th><th>Spent</th><th>%</th></tr></thead>
    <tbody>${Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, val]) => `<tr>
      <td>${cat}</td><td>${formatUSD(val)}</td>
      <td>${totalExpenses > 0 ? ((val / totalExpenses) * 100).toFixed(1) : 0}%</td>
    </tr>`).join('')}</tbody>
  </table>` : ''}

  ${loans.length > 0 ? `
  <h2>🏦 Loans (${loans.length})</h2>
  <table>
    <thead><tr><th>Lender</th><th>Type</th><th>Principal</th><th>Balance</th><th>EMI</th><th>Rate</th></tr></thead>
    <tbody>${loans.map(l => `<tr>
      <td>${l.lender}</td><td>${l.loanType}</td>
      <td>${l.currency === 'INR' ? formatINR(l.principal) : formatUSD(l.principal)}</td>
      <td style="font-weight:600;">${l.currency === 'INR' ? formatINR(l.balance) : formatUSD(l.balance)}</td>
      <td>${l.currency === 'INR' ? formatINR(l.emi) : formatUSD(l.emi)}/mo</td>
      <td>${l.interestRate || '—'}%</td>
    </tr>`).join('')}</tbody>
  </table>
  <div class="section-box">
    <div class="detail-row"><span>Total Loan Balance</span><strong style="color:#d04b3a;">${formatUSD(totalLoanBalance)}</strong></div>
    <div class="detail-row" style="border-bottom:none;"><span>Total Monthly EMI</span><strong>${formatUSD(totalLoanEMI)}</strong></div>
  </div>` : ''}

  ${cards.length > 0 ? `
  <h2>💳 Credit Cards (${cards.length})</h2>
  <table>
    <thead><tr><th>Card</th><th>Limit</th><th>Balance</th><th>Available</th><th>Utilization</th><th>Due Date</th></tr></thead>
    <tbody>${cards.map(c => {
    const util = c.creditLimit > 0 ? ((c.balance / c.creditLimit) * 100).toFixed(0) : 0;
    return `<tr>
      <td>${c.cardName}</td>
      <td>${formatUSD(c.creditLimit)}</td>
      <td style="font-weight:600;color:${c.balance > 0 ? '#d04b3a' : '#2a8f65'};">${c.balance <= 0 ? '✅ Paid' : formatUSD(c.balance)}</td>
      <td>${formatUSD((c.creditLimit || 0) - (c.balance || 0))}</td>
      <td style="color:${util > 30 ? '#d04b3a' : '#2a8f65'};">${util}%</td>
      <td>${c.dueDate ? formatDate(c.dueDate) : '—'}</td>
    </tr>`}).join('')}</tbody>
  </table>
  <div class="section-box">
    <div class="detail-row"><span>Total CC Debt</span><strong style="color:#d04b3a;">${formatUSD(totalCCDebt)}</strong></div>
    <div class="detail-row"><span>Total CC Limit</span><strong>${formatUSD(totalCCLimit)}</strong></div>
    <div class="detail-row" style="border-bottom:none;"><span>Overall Utilization</span><strong style="color:${totalCCLimit > 0 && (totalCCDebt / totalCCLimit * 100) > 30 ? '#d04b3a' : '#2a8f65'};">${totalCCLimit > 0 ? (totalCCDebt / totalCCLimit * 100).toFixed(1) : 0}%</strong></div>
  </div>` : ''}

  ${insurance.length > 0 ? `
  <h2>🛡️ Insurance (${insurance.length} policies)</h2>
  <table>
    <thead><tr><th>Type</th><th>Provider</th><th>Premium</th><th>Coverage</th><th>Deductible</th></tr></thead>
    <tbody>${insurance.map(i => `<tr>
      <td>${i.type}</td><td>${i.provider}</td>
      <td>${formatUSD(i.premium)}/mo</td>
      <td>${i.coverage ? formatUSD(i.coverage) : '—'}</td>
      <td>${i.deductible ? formatUSD(i.deductible) : '—'}</td>
    </tr>`).join('')}</tbody>
  </table>` : ''}

  ${tax.length > 0 ? `
  <h2>📋 Tax Records</h2>
  <table>
    <thead><tr><th>Year</th><th>Status</th><th>Income</th><th>Deductions</th><th>Withheld</th><th>Result</th></tr></thead>
    <tbody>${tax.map(t => {
      const owed = (t.taxOwed || 0) - (t.withheld || 0);
      return `<tr>
      <td>${t.year}</td><td>${t.filingStatus || 'Single'}</td>
      <td>${formatUSD(t.grossIncome)}</td><td>${formatUSD(t.deductions)}</td>
      <td>${formatUSD(t.withheld)}</td>
      <td style="font-weight:600;color:${owed <= 0 ? '#2a8f65' : '#d04b3a'};">${owed <= 0 ? 'Refund ' + formatUSD(Math.abs(owed)) : 'Owe ' + formatUSD(owed)}</td>
    </tr>`}).join('')}</tbody>
  </table>` : ''}

  <h2>🏖️ Retirement & Health Savings</h2>
  <div class="summary-grid" style="grid-template-columns:repeat(3,1fr);">
    <div class="summary-box purple"><div class="label">401k Balance</div><div class="value">${formatUSD(retirement.balance)}</div></div>
    <div class="summary-box green"><div class="label">HSA Balance</div><div class="value">${formatUSD(hsa.balance)}</div></div>
    <div class="summary-box blue"><div class="label">401k Vesting</div><div class="value">${retirement.vestingPct || 0}%</div></div>
  </div>

  <div class="footer">DuoBudget — Joint Monthly Report • Kunal & Murali</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
    };
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = `DuoBudget-Monthly-${monthStr}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
  showToast('Monthly report generated!', 'success');
}

