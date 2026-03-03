// Income Tracker Page
import Store from '../store.js';
import { formatUSD, formatDate, today, showToast, openModal, closeModal, INCOME_TYPES, staggerChildren, showQuoteToast } from '../utils.js';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

let incomeChartInstance = null;

function getFormHTML(existing = null) {
  return `
    <form id="income-form">
      <div class="form-group">
        <label>Person</label>
        <select class="form-input" name="person" required>
          <option value="Kunal" ${existing?.person === 'Kunal' ? 'selected' : ''}>Kunal</option>
          <option value="Murali" ${existing?.person === 'Murali' ? 'selected' : ''}>Murali</option>
        </select>
      </div>
      <div class="form-group">
        <label>Amount (USD)</label>
        <input type="number" class="form-input" name="amount" step="0.01" min="0" placeholder="0.00" value="${existing?.amount || ''}" required />
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" class="form-input" name="date" value="${existing?.date || today()}" required />
      </div>
      <div class="form-group">
        <label>Type</label>
        <select class="form-input" name="type">
          ${INCOME_TYPES.map(t => `<option value="${t}" ${existing?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <input type="text" class="form-input" name="notes" placeholder="Optional notes" value="${existing?.notes || ''}" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Update' : 'Add Income'}</button>
      </div>
    </form>
  `;
}

export function renderIncome() {
  const incomeList = Store.getIncome().sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalIncome = incomeList.reduce((s, i) => s + Number(i.amount || 0), 0);
  const kunalTotal = incomeList.filter(i => i.person === 'Kunal').reduce((s, i) => s + Number(i.amount || 0), 0);
  const muraliTotal = incomeList.filter(i => i.person === 'Murali').reduce((s, i) => s + Number(i.amount || 0), 0);

  return `
    <div class="section-header">
      <h3 class="section-title">Income Tracker</h3>
      <button class="btn btn-primary" id="add-income-btn">+ Add Income</button>
    </div>

    <!-- Summary Cards -->
    <div class="grid-3" style="margin-bottom: var(--space-xl);">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Total Income</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(totalIncome)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💜</div>
        <div class="stat-label">Kunal's Income</div>
        <div class="stat-value" style="color: var(--lavender-dark);">${formatUSD(kunalTotal)}</div>
        <div class="stat-change" style="color: var(--text-muted); font-size: var(--fs-xs);">Shipt • Full-Time • $165k/yr</div>
        <div class="stat-change" style="color: var(--lavender); font-size: var(--fs-xs);">Start: March 15, 2026</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💚</div>
        <div class="stat-label">Murali's Income</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(muraliTotal)}</div>
        <div class="stat-change" style="color: var(--text-muted); font-size: var(--fs-xs);">State of Michigan • Contract • $37.50/hr</div>
      </div>
    </div>

    <!-- Income Chart -->
    <div class="chart-card" style="margin-bottom: var(--space-xl);">
      <div class="chart-title">Monthly Income Comparison</div>
      <div class="chart-container" style="max-height:250px;">
        <canvas id="income-chart"></canvas>
      </div>
    </div>

    <!-- Income List -->
    <div class="glass-card">
      <div class="section-header">
        <h3 class="section-title">Income History</h3>
      </div>
      ${incomeList.length > 0 ? `
        <div class="table-responsive" style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${incomeList.map(item => `
                <tr>
                  <td><span class="badge-person ${item.person?.toLowerCase()}">${item.person}</span></td>
                  <td style="font-weight:var(--fw-semibold); color: var(--mint-dark);">${formatUSD(item.amount)}</td>
                  <td><span class="badge-category">${item.type || 'Salary'}</span></td>
                  <td>${formatDate(item.date)}</td>
                  <td style="color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.notes || '—'}</td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      <button class="btn btn-ghost btn-sm edit-income" data-id="${item.id}">✏️</button>
                      <button class="btn btn-ghost btn-sm delete-income" data-id="${item.id}">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">💵</div>
          <div class="empty-text">No income records yet. Add your first income entry!</div>
          <button class="btn btn-primary" id="add-income-empty">+ Add Income</button>
        </div>
      `}
    </div>
  `;
}

export function initIncome() {
  function openAddModal() {
    openModal('Add Income', getFormHTML());
    document.getElementById('income-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Store.addIncome({
        person: fd.get('person'),
        amount: parseFloat(fd.get('amount')),
        date: fd.get('date'),
        type: fd.get('type'),
        notes: fd.get('notes'),
      });
      closeModal();
      showQuoteToast('Income added successfully!');
      refresh();
    });
  }

  document.getElementById('add-income-btn')?.addEventListener('click', openAddModal);
  document.getElementById('add-income-empty')?.addEventListener('click', openAddModal);

  // Edit/Delete
  document.querySelectorAll('.edit-income').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = Store.getIncome().find(i => i.id === id);
      if (!item) return;
      openModal('Edit Income', getFormHTML(item));
      document.getElementById('income-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        Store.updateIncome(id, {
          person: fd.get('person'),
          amount: parseFloat(fd.get('amount')),
          date: fd.get('date'),
          type: fd.get('type'),
          notes: fd.get('notes'),
        });
        closeModal();
        showToast('Income updated!', 'success');
        refresh();
      });
    });
  });

  document.querySelectorAll('.delete-income').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this income entry?')) {
        Store.deleteIncome(btn.dataset.id);
        showToast('Income deleted', 'warning');
        refresh();
      }
    });
  });

  // Chart
  buildIncomeChart();
  staggerChildren(document.getElementById('page-container'), '.stat-card', 100);
}

function buildIncomeChart() {
  const canvas = document.getElementById('income-chart');
  if (!canvas) return;
  if (incomeChartInstance) { incomeChartInstance.destroy(); incomeChartInstance = null; }

  const income = Store.getIncome();
  const months = {};
  income.forEach(i => {
    const m = i.date?.substring(0, 7);
    if (!m) return;
    if (!months[m]) months[m] = { Kunal: 0, Murali: 0 };
    months[m][i.person] = (months[m][i.person] || 0) + Number(i.amount || 0);
  });

  const labels = Object.keys(months).sort();
  if (labels.length === 0) return;

  incomeChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels.map(l => {
        const [y, m] = l.split('-');
        return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }),
      datasets: [
        {
          label: 'Kunal',
          data: labels.map(l => months[l].Kunal),
          backgroundColor: 'rgba(195, 177, 225, 0.7)',
          borderColor: '#C3B1E1',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Murali',
          data: labels.map(l => months[l].Murali),
          backgroundColor: 'rgba(181, 234, 215, 0.7)',
          borderColor: '#B5EAD7',
          borderWidth: 2,
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true } },
        tooltip: {
          backgroundColor: 'white', titleColor: '#2D2A3E', bodyColor: '#6B6580',
          borderColor: 'rgba(195, 177, 225, 0.3)', borderWidth: 1, cornerRadius: 12, padding: 12,
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(195, 177, 225, 0.1)' }, ticks: { font: { family: 'Inter', size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
      }
    }
  });
}

function refresh() {
  const container = document.getElementById('page-container');
  container.innerHTML = renderIncome();
  initIncome();
}
