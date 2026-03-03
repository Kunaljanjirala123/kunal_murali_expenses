// Dashboard Page
import Store from '../store.js';
import { formatUSD, formatINR, animateCounter, getCategoryColor, staggerChildren, showToast, downloadSummaryPDF, downloadMonthlySalaryReport, convertINRtoUSD } from '../utils.js';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

let chartInstance = null;

function fmtLoanAmount(amount, currency) {
  return currency === 'INR' ? formatINR(amount) : formatUSD(amount);
}

export function renderDashboard() {
  const income = Store.getIncome();
  const expenses = Store.getExpenses();
  const loans = Store.getLoans();
  const cards = Store.getCreditCards();
  const insurance = Store.getInsurance();
  const retirement = Store.getRetirement();
  const hsa = Store.getHSA();

  const totalIncome = income.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalLoanEMI_USD = loans.filter(l => l.currency === 'USD').reduce((s, l) => s + Number(l.emi || 0), 0);
  const totalLoanEMI_INR = loans.filter(l => l.currency === 'INR').reduce((s, l) => s + Number(l.emi || 0), 0);

  // Convert INR EMIs to USD using stored exchange rates
  const inrLoansUSDEquiv = loans
    .filter(l => l.currency === 'INR')
    .reduce((s, l) => s + convertINRtoUSD(Number(l.emi || 0), l.exchangeRate), 0);
  const totalEMI_CombinedUSD = totalLoanEMI_USD + inrLoansUSDEquiv;

  // Properly display EMI in the correct currency
  let loanEMIDisplay;
  if (totalLoanEMI_INR > 0 && totalLoanEMI_USD > 0) {
    loanEMIDisplay = `${formatINR(totalLoanEMI_INR)} + ${formatUSD(totalLoanEMI_USD)}`;
  } else if (totalLoanEMI_INR > 0) {
    loanEMIDisplay = formatINR(totalLoanEMI_INR);
  } else {
    loanEMIDisplay = formatUSD(totalLoanEMI_USD);
  }

  const totalCCDebt = cards.reduce((s, c) => s + Number(c.balance || 0), 0);
  const totalInsurance = insurance.reduce((s, ins) => s + Number(ins.premium || 0), 0);
  const totalRetirement = Number(retirement.balance || 0);
  const totalHSA = Number(hsa.balance || 0);

  const kunalIncome = income.filter(i => i.person === 'Kunal').reduce((s, i) => s + Number(i.amount || 0), 0);
  const muraliIncome = income.filter(i => i.person === 'Murali').reduce((s, i) => s + Number(i.amount || 0), 0);
  const kunalExpenses = expenses.filter(e => e.person === 'Kunal').reduce((s, e) => s + Number(e.amount || 0), 0);
  const muraliExpenses = expenses.filter(e => e.person === 'Murali').reduce((s, e) => s + Number(e.amount || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  // Category breakdown
  const catTotals = {};
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount || 0);
  });

  // Recent transactions (last 8)
  const allTransactions = [
    ...income.map(i => ({ ...i, txType: 'income', desc: `${i.type || 'Income'} - ${i.person}` })),
    ...expenses.map(e => ({ ...e, txType: 'expense', desc: `${e.description || e.category} - ${e.person}` })),
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 8);

  const hasBothCurrencies = totalLoanEMI_INR > 0 && totalLoanEMI_USD > 0;

  return `
    <!-- Hero Balance -->
    <div class="dashboard-hero tilt-3d" data-tilt-intensity="8" data-tilt-perspective="1200">
      <div class="hero-bg-orb orb-1"></div>
      <div class="hero-bg-orb orb-2"></div>
      <div class="hero-bg-orb orb-3"></div>
      <div class="hero-label">Combined Balance</div>
      <div class="hero-balance" id="hero-balance">${formatUSD(netBalance)}</div>
      <div class="hero-subtitle">Kunal (Shipt) & Murali (State of Michigan)</div>
      <div class="hero-persons">
        <div class="hero-person-card tilt-3d" data-tilt-intensity="15" data-tilt-perspective="800">
          <div class="person-name" style="color: var(--lavender-dark);">💜 Kunal</div>
          <div class="person-balance" style="color: var(--lavender-dark);">${formatUSD(kunalIncome - kunalExpenses)}</div>
        </div>
        <div class="hero-person-card tilt-3d" data-tilt-intensity="15" data-tilt-perspective="800">
          <div class="person-name" style="color: var(--mint-dark);">💚 Murali</div>
          <div class="person-balance" style="color: var(--mint-dark);">${formatUSD(muraliIncome - muraliExpenses)}</div>
        </div>
      </div>
      <div class="download-actions" style="justify-content:center; margin-top: var(--space-md);">
        <button class="btn btn-ghost btn-sm" id="download-summary-btn" style="font-size: var(--fs-xs);">📄 Download Summary</button>
        <button class="btn btn-ghost btn-sm" id="download-monthly-btn" style="font-size: var(--fs-xs);">📋 Monthly Salary Report</button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid-4 stats-3d-grid" style="margin-bottom: var(--space-xl);">
      <div class="stat-card tilt-3d" data-tilt-intensity="20" data-tilt-perspective="600">
        <div class="stat-card-shine"></div>
        <div class="stat-icon">💵</div>
        <div class="stat-label">Total Income</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(totalIncome)}</div>
      </div>
      <div class="stat-card tilt-3d" data-tilt-intensity="20" data-tilt-perspective="600">
        <div class="stat-card-shine"></div>
        <div class="stat-icon">🛒</div>
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value" style="color: var(--coral-dark);">${formatUSD(totalExpenses)}</div>
      </div>
      <div class="stat-card tilt-3d" data-tilt-intensity="20" data-tilt-perspective="600">
        <div class="stat-card-shine"></div>
        <div class="stat-icon">🏦</div>
        <div class="stat-label">Loan EMI/mo</div>
        <div class="stat-value" style="font-size: ${hasBothCurrencies ? 'var(--fs-sm)' : 'var(--fs-xl)'}">${loanEMIDisplay}</div>
        ${totalLoanEMI_INR > 0 ? `<div class="stat-subtitle" style="font-size: var(--fs-xs); color: var(--text-muted); margin-top: 4px;">≈ ${formatUSD(totalEMI_CombinedUSD)} USD total</div>` : ''}
      </div>
      <div class="stat-card tilt-3d" data-tilt-intensity="20" data-tilt-perspective="600">
        <div class="stat-card-shine"></div>
        <div class="stat-icon">💳</div>
        <div class="stat-label">CC Debt</div>
        <div class="stat-value" style="color: var(--coral);">${formatUSD(totalCCDebt)}</div>
      </div>
    </div>

    <!-- Charts + Flow -->
    <div class="grid-2" style="margin-bottom: var(--space-xl);">
      <!-- Spending Breakdown -->
      <div class="chart-card tilt-3d" data-tilt-intensity="10" data-tilt-perspective="800">
        <div class="chart-title">Spending Breakdown</div>
        <div class="chart-container" style="max-height:280px; display:flex; align-items:center; justify-content:center; position:relative;">
          ${Object.keys(catTotals).length > 0
      ? '<canvas id="spending-chart" width="280" height="280"></canvas>'
      : '<div class="empty-state" style="padding: var(--space-lg);"><div class="empty-icon">📊</div><div class="empty-text">Add expenses to see breakdown</div></div>'}
        </div>
      </div>
      <!-- Money Flow -->
      <div class="chart-card tilt-3d" data-tilt-intensity="10" data-tilt-perspective="800">
        <div class="chart-title">Where Money Goes</div>
        <div class="money-flow-grid">
          <div class="flow-card tilt-3d" data-tilt-intensity="18" data-tilt-perspective="500">
            <div class="flow-card-shine"></div>
            <div class="flow-icon" style="background: var(--coral-light);">🛒</div>
            <div class="flow-info">
              <div class="flow-label">Expenses</div>
              <div class="flow-value">${formatUSD(totalExpenses)}</div>
            </div>
          </div>
          <div class="flow-card tilt-3d" data-tilt-intensity="18" data-tilt-perspective="500">
            <div class="flow-card-shine"></div>
            <div class="flow-icon" style="background: var(--sky-light);">🏦</div>
            <div class="flow-info">
              <div class="flow-label">Loan EMIs</div>
              <div class="flow-value" style="font-size: ${hasBothCurrencies ? '0.8rem' : ''}">${loanEMIDisplay}</div>
            </div>
          </div>
          <div class="flow-card tilt-3d" data-tilt-intensity="18" data-tilt-perspective="500">
            <div class="flow-card-shine"></div>
            <div class="flow-icon" style="background: var(--peach-light);">💳</div>
            <div class="flow-info">
              <div class="flow-label">Credit Cards</div>
              <div class="flow-value">${formatUSD(totalCCDebt)}</div>
            </div>
          </div>
          <div class="flow-card tilt-3d" data-tilt-intensity="18" data-tilt-perspective="500">
            <div class="flow-card-shine"></div>
            <div class="flow-icon" style="background: var(--lilac-light);">🛡️</div>
            <div class="flow-info">
              <div class="flow-label">Insurance</div>
              <div class="flow-value">${formatUSD(totalInsurance)}</div>
            </div>
          </div>
          <div class="flow-card tilt-3d" data-tilt-intensity="18" data-tilt-perspective="500">
            <div class="flow-card-shine"></div>
            <div class="flow-icon" style="background: var(--lavender-light);">🏖️</div>
            <div class="flow-info">
              <div class="flow-label">401k Balance</div>
              <div class="flow-value">${formatUSD(totalRetirement)}</div>
            </div>
          </div>
          <div class="flow-card tilt-3d" data-tilt-intensity="18" data-tilt-perspective="500">
            <div class="flow-card-shine"></div>
            <div class="flow-icon" style="background: var(--mint-light);">🏥</div>
            <div class="flow-info">
              <div class="flow-label">HSA Balance</div>
              <div class="flow-value">${formatUSD(totalHSA)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="glass-card tilt-3d" data-tilt-intensity="6" data-tilt-perspective="1000">
      <div class="section-header">
        <h3 class="section-title">Recent Activity</h3>
      </div>
      ${allTransactions.length > 0 ? `
        <div class="transaction-list">
          ${allTransactions.map(t => `
            <div class="transaction-item tx-3d-hover">
              <div class="transaction-icon" style="background: ${t.txType === 'income' ? 'var(--mint-light)' : 'var(--coral-light)'};">
                ${t.txType === 'income' ? '💵' : '🛒'}
              </div>
              <div class="transaction-details">
                <div class="transaction-desc">${t.desc}</div>
                <div class="transaction-meta">
                  <span class="badge-person ${t.person?.toLowerCase()}">${t.person}</span>
                  <span>${t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                </div>
              </div>
              <div class="transaction-amount ${t.txType}">
                ${t.txType === 'income' ? '+' : '-'}${formatUSD(t.amount)}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-text">No transactions yet. Start by adding income or expenses!</div>
        </div>
      `}
    </div>
  `;
}

// ============================
// 3D Tilt Effect Engine
// ============================
function init3DTiltEffects() {
  const tiltElements = document.querySelectorAll('.tilt-3d');

  tiltElements.forEach(el => {
    const intensity = parseFloat(el.dataset.tiltIntensity) || 12;
    const perspective = parseFloat(el.dataset.tiltPerspective) || 800;

    el.style.transformStyle = 'preserve-3d';
    el.style.willChange = 'transform';

    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let rafId = null;
    let isHovered = false;

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function animate() {
      currentX = lerp(currentX, targetX, 0.12);
      currentY = lerp(currentY, targetY, 0.12);

      el.style.transform = `perspective(${perspective}px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(0)`;

      // Move shine effect
      const shine = el.querySelector('.stat-card-shine, .flow-card-shine');
      if (shine) {
        const shineX = 50 + (currentY / intensity) * 50;
        const shineY = 50 - (currentX / intensity) * 50;
        shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)`;
      }

      if (Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01 || isHovered) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    }

    function startAnimation() {
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    }

    el.addEventListener('mouseenter', () => {
      isHovered = true;
      el.classList.add('tilt-active');
      startAnimation();
    });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      targetX = (0.5 - y) * intensity;
      targetY = (x - 0.5) * intensity;
    });

    el.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
      el.classList.remove('tilt-active');
      startAnimation();
    });

    // Touch support for mobile
    el.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = el.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;

        if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
          targetX = (0.5 - y) * intensity * 0.6;
          targetY = (x - 0.5) * intensity * 0.6;
          if (!isHovered) {
            isHovered = true;
            el.classList.add('tilt-active');
            startAnimation();
          }
        }
      }
    }, { passive: true });

    el.addEventListener('touchend', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
      el.classList.remove('tilt-active');
      startAnimation();
    });
  });
}

export function initDashboard() {
  const expenses = Store.getExpenses();
  const catTotals = {};
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount || 0);
  });

  // Spending chart
  const canvas = document.getElementById('spending-chart');
  if (canvas && Object.keys(catTotals).length > 0) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    // Ensure canvas has proper dimensions
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, 280);
    canvas.style.maxWidth = size + 'px';
    canvas.style.maxHeight = size + 'px';

    const labels = Object.keys(catTotals);
    const data = Object.values(catTotals);
    const colors = labels.map(l => getCategoryColor(l));

    chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: 'rgba(255,255,255,0.9)',
          borderWidth: 3,
          hoverBorderWidth: 0,
          hoverOffset: 12,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        cutout: '62%',
        layout: {
          padding: 8
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 14,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: 'Inter', size: 12, weight: 500 },
              color: '#2D2A3E',
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            titleColor: '#2D2A3E',
            bodyColor: '#6B6580',
            borderColor: 'rgba(195, 177, 225, 0.3)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 14,
            displayColors: true,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatUSD(ctx.raw)}`,
            }
          }
        }
      }
    });
  }

  // Animate hero balance
  const heroEl = document.getElementById('hero-balance');
  if (heroEl) {
    const income = Store.getIncome().reduce((s, i) => s + Number(i.amount || 0), 0);
    const exp = Store.getExpenses().reduce((s, e) => s + Number(e.amount || 0), 0);
    animateCounter(heroEl, income - exp, 1200);
  }

  // Stagger animations
  const container = document.getElementById('page-container');
  staggerChildren(container, '.stat-card', 100);
  staggerChildren(container, '.flow-card', 60);
  staggerChildren(container, '.transaction-item', 50);

  // Initialize 3D tilt effects
  init3DTiltEffects();

  // Download buttons
  document.getElementById('download-summary-btn')?.addEventListener('click', () => downloadSummaryPDF(Store));
  document.getElementById('download-monthly-btn')?.addEventListener('click', () => downloadMonthlySalaryReport(Store));
}
