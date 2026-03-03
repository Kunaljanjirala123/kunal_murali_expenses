// Expense Tracker Page
import Store from '../store.js';
import { formatUSD, formatDate, today, showToast, openModal, closeModal, EXPENSE_CATEGORIES, getCategoryColor, staggerChildren } from '../utils.js';
import { Chart, DoughnutController, ArcElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

let pieChart = null, lineChart = null;

function getFormHTML(existing = null) {
    return `
    <form id="expense-form">
      <div class="form-group">
        <label>Person</label>
        <select class="form-input" name="person" required>
          <option value="Kunal" ${existing?.person === 'Kunal' ? 'selected' : ''}>Kunal</option>
          <option value="Murali" ${existing?.person === 'Murali' ? 'selected' : ''}>Murali</option>
        </select>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select class="form-input" name="category" required>
          ${EXPENSE_CATEGORIES.map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
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
        <label>Description</label>
        <input type="text" class="form-input" name="description" placeholder="What was this for?" value="${existing?.description || ''}" />
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('modal-overlay').classList.remove('active')">Cancel</button>
        <button type="submit" class="btn btn-primary">${existing ? 'Update' : 'Add Expense'}</button>
      </div>
    </form>
  `;
}

export function renderExpenses() {
    const expenseList = Store.getExpenses().sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalExpenses = expenseList.reduce((s, e) => s + Number(e.amount || 0), 0);
    const kunalTotal = expenseList.filter(e => e.person === 'Kunal').reduce((s, e) => s + Number(e.amount || 0), 0);
    const muraliTotal = expenseList.filter(e => e.person === 'Murali').reduce((s, e) => s + Number(e.amount || 0), 0);

    return `
    <div class="section-header">
      <h3 class="section-title">Expense Tracker</h3>
      <button class="btn btn-primary" id="add-expense-btn">+ Add Expense</button>
    </div>

    <div class="grid-3" style="margin-bottom: var(--space-xl);">
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value" style="color: var(--coral-dark);">${formatUSD(totalExpenses)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💜</div>
        <div class="stat-label">Kunal's Spending</div>
        <div class="stat-value" style="color: var(--lavender-dark);">${formatUSD(kunalTotal)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💚</div>
        <div class="stat-label">Murali's Spending</div>
        <div class="stat-value" style="color: var(--mint-dark);">${formatUSD(muraliTotal)}</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: var(--space-xl);">
      <div class="chart-card">
        <div class="chart-title">By Category</div>
        <div class="chart-container" style="max-height:250px; display:flex; align-items:center; justify-content:center;">
          <canvas id="expense-pie-chart"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Monthly Trend</div>
        <div class="chart-container" style="max-height:250px;">
          <canvas id="expense-line-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <select class="form-input" id="filter-person" style="max-width:140px;">
        <option value="">All People</option>
        <option value="Kunal">Kunal</option>
        <option value="Murali">Murali</option>
      </select>
      <select class="form-input" id="filter-category" style="max-width:160px;">
        <option value="">All Categories</option>
        ${EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
    </div>

    <div class="glass-card">
      <div id="expense-table-container">
        ${renderExpenseTable(expenseList)}
      </div>
    </div>
  `;
}

function renderExpenseTable(list) {
    if (list.length === 0) {
        return `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <div class="empty-text">No expenses found. Start tracking your spending!</div>
      </div>
    `;
    }
    return `
    <div class="table-responsive" style="overflow-x:auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(item => `
            <tr>
              <td><span class="badge-person ${item.person?.toLowerCase()}">${item.person}</span></td>
              <td><span class="badge-category" style="background: ${getCategoryColor(item.category)}22; color: ${getCategoryColor(item.category)};">${item.category}</span></td>
              <td style="font-weight:var(--fw-semibold); color: var(--coral-dark);">${formatUSD(item.amount)}</td>
              <td>${formatDate(item.date)}</td>
              <td style="color: var(--text-secondary); max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.description || '—'}</td>
              <td>
                <div style="display:flex;gap:4px;">
                  <button class="btn btn-ghost btn-sm edit-expense" data-id="${item.id}">✏️</button>
                  <button class="btn btn-ghost btn-sm delete-expense" data-id="${item.id}">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function initExpenses() {
    function openAddModal() {
        openModal('Add Expense', getFormHTML());
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            Store.addExpense({
                person: fd.get('person'),
                category: fd.get('category'),
                amount: parseFloat(fd.get('amount')),
                date: fd.get('date'),
                description: fd.get('description'),
            });
            closeModal();
            showToast('Expense added!', 'success');
            refresh();
        });
    }

    document.getElementById('add-expense-btn')?.addEventListener('click', openAddModal);

    // Edit/Delete
    document.querySelectorAll('.edit-expense').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const item = Store.getExpenses().find(i => i.id === id);
            if (!item) return;
            openModal('Edit Expense', getFormHTML(item));
            document.getElementById('expense-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                Store.updateExpense(id, {
                    person: fd.get('person'),
                    category: fd.get('category'),
                    amount: parseFloat(fd.get('amount')),
                    date: fd.get('date'),
                    description: fd.get('description'),
                });
                closeModal();
                showToast('Expense updated!', 'success');
                refresh();
            });
        });
    });

    document.querySelectorAll('.delete-expense').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this expense?')) {
                Store.deleteExpense(btn.dataset.id);
                showToast('Expense deleted', 'warning');
                refresh();
            }
        });
    });

    // Filters
    const filterPerson = document.getElementById('filter-person');
    const filterCategory = document.getElementById('filter-category');
    function applyFilters() {
        let list = Store.getExpenses().sort((a, b) => new Date(b.date) - new Date(a.date));
        if (filterPerson.value) list = list.filter(e => e.person === filterPerson.value);
        if (filterCategory.value) list = list.filter(e => e.category === filterCategory.value);
        document.getElementById('expense-table-container').innerHTML = renderExpenseTable(list);
        // Re-attach events
        document.querySelectorAll('.edit-expense').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const item = Store.getExpenses().find(i => i.id === id);
                if (!item) return;
                openModal('Edit Expense', getFormHTML(item));
                document.getElementById('expense-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    Store.updateExpense(id, {
                        person: fd.get('person'), category: fd.get('category'),
                        amount: parseFloat(fd.get('amount')), date: fd.get('date'), description: fd.get('description'),
                    });
                    closeModal(); showToast('Expense updated!', 'success'); refresh();
                });
            });
        });
        document.querySelectorAll('.delete-expense').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this expense?')) { Store.deleteExpense(btn.dataset.id); showToast('Expense deleted', 'warning'); refresh(); }
            });
        });
    }
    filterPerson?.addEventListener('change', applyFilters);
    filterCategory?.addEventListener('change', applyFilters);

    buildExpenseCharts();
    staggerChildren(document.getElementById('page-container'), '.stat-card', 100);
}

function buildExpenseCharts() {
    const expenses = Store.getExpenses();

    // Category Pie
    const canvas1 = document.getElementById('expense-pie-chart');
    if (canvas1) {
        if (pieChart) { pieChart.destroy(); pieChart = null; }
        const catTotals = {};
        expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount || 0); });
        const labels = Object.keys(catTotals);
        if (labels.length > 0) {
            pieChart = new Chart(canvas1, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{ data: Object.values(catTotals), backgroundColor: labels.map(l => getCategoryColor(l)), borderColor: 'white', borderWidth: 3, hoverOffset: 8 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true, cutout: '60%',
                    plugins: {
                        legend: { position: 'right', labels: { padding: 10, usePointStyle: true, font: { family: 'Inter', size: 11 } } },
                        tooltip: { backgroundColor: 'white', titleColor: '#2D2A3E', bodyColor: '#6B6580', borderColor: 'rgba(195,177,225,0.3)', borderWidth: 1, cornerRadius: 12, padding: 12 }
                    }
                }
            });
        }
    }

    // Monthly trend
    const canvas2 = document.getElementById('expense-line-chart');
    if (canvas2) {
        if (lineChart) { lineChart.destroy(); lineChart = null; }
        const months = {};
        expenses.forEach(e => {
            const m = e.date?.substring(0, 7);
            if (!m) return;
            months[m] = (months[m] || 0) + Number(e.amount || 0);
        });
        const sortedMonths = Object.keys(months).sort();
        if (sortedMonths.length > 0) {
            lineChart = new Chart(canvas2, {
                type: 'line',
                data: {
                    labels: sortedMonths.map(l => { const [y, m] = l.split('-'); return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); }),
                    datasets: [{
                        label: 'Total Spending',
                        data: sortedMonths.map(m => months[m]),
                        borderColor: '#F4978E',
                        backgroundColor: 'rgba(244, 151, 142, 0.15)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#F4978E',
                        pointBorderColor: 'white',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: 'white', titleColor: '#2D2A3E', bodyColor: '#6B6580', borderColor: 'rgba(244,151,142,0.3)', borderWidth: 1, cornerRadius: 12, padding: 12 }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(195,177,225,0.1)' }, ticks: { font: { family: 'Inter', size: 11 } } },
                        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
                    }
                }
            });
        }
    }
}

function refresh() {
    const container = document.getElementById('page-container');
    container.innerHTML = renderExpenses();
    initExpenses();
}
