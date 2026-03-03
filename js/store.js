// Data Store - LocalStorage based persistence
const STORE_KEY = 'duobudget_data';

const DEFAULT_DATA = {
  income: [],
  expenses: [],
  loans: [],
  creditCards: [],
  insurance: [],
  tax: [],
  retirement: { balance: 0, contributions: [], employerMatchPct: 100, vestingPct: 0 },
  hsa: { balance: 0, contributions: [], expenses: [] },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...data };
    }
  } catch (e) {
    console.warn('Failed to load data:', e);
  }
  return { ...DEFAULT_DATA };
}

function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

let _data = loadData();

const Store = {
  get data() { return _data; },

  // Income
  getIncome() { return _data.income || []; },
  addIncome(entry) {
    entry.id = crypto.randomUUID();
    entry.createdAt = new Date().toISOString();
    _data.income.push(entry);
    saveData(_data);
    return entry;
  },
  updateIncome(id, updates) {
    const idx = _data.income.findIndex(i => i.id === id);
    if (idx !== -1) { _data.income[idx] = { ..._data.income[idx], ...updates }; saveData(_data); }
  },
  deleteIncome(id) {
    _data.income = _data.income.filter(i => i.id !== id);
    saveData(_data);
  },

  // Expenses
  getExpenses() { return _data.expenses || []; },
  addExpense(entry) {
    entry.id = crypto.randomUUID();
    entry.createdAt = new Date().toISOString();
    _data.expenses.push(entry);
    saveData(_data);
    return entry;
  },
  updateExpense(id, updates) {
    const idx = _data.expenses.findIndex(i => i.id === id);
    if (idx !== -1) { _data.expenses[idx] = { ..._data.expenses[idx], ...updates }; saveData(_data); }
  },
  deleteExpense(id) {
    _data.expenses = _data.expenses.filter(i => i.id !== id);
    saveData(_data);
  },

  // Loans
  getLoans() { return _data.loans || []; },
  addLoan(entry) {
    entry.id = crypto.randomUUID();
    _data.loans.push(entry);
    saveData(_data);
    return entry;
  },
  updateLoan(id, updates) {
    const idx = _data.loans.findIndex(i => i.id === id);
    if (idx !== -1) { _data.loans[idx] = { ..._data.loans[idx], ...updates }; saveData(_data); }
  },
  deleteLoan(id) {
    _data.loans = _data.loans.filter(i => i.id !== id);
    saveData(_data);
  },

  // Credit Cards
  getCreditCards() { return _data.creditCards || []; },
  addCreditCard(entry) {
    entry.id = crypto.randomUUID();
    _data.creditCards.push(entry);
    saveData(_data);
    return entry;
  },
  updateCreditCard(id, updates) {
    const idx = _data.creditCards.findIndex(i => i.id === id);
    if (idx !== -1) { _data.creditCards[idx] = { ..._data.creditCards[idx], ...updates }; saveData(_data); }
  },
  deleteCreditCard(id) {
    _data.creditCards = _data.creditCards.filter(i => i.id !== id);
    saveData(_data);
  },

  // Insurance
  getInsurance() { return _data.insurance || []; },
  addInsurance(entry) {
    entry.id = crypto.randomUUID();
    _data.insurance.push(entry);
    saveData(_data);
    return entry;
  },
  updateInsurance(id, updates) {
    const idx = _data.insurance.findIndex(i => i.id === id);
    if (idx !== -1) { _data.insurance[idx] = { ..._data.insurance[idx], ...updates }; saveData(_data); }
  },
  deleteInsurance(id) {
    _data.insurance = _data.insurance.filter(i => i.id !== id);
    saveData(_data);
  },

  // Tax
  getTax() { return _data.tax || []; },
  addTax(entry) {
    entry.id = crypto.randomUUID();
    _data.tax.push(entry);
    saveData(_data);
    return entry;
  },
  updateTax(id, updates) {
    const idx = _data.tax.findIndex(i => i.id === id);
    if (idx !== -1) { _data.tax[idx] = { ..._data.tax[idx], ...updates }; saveData(_data); }
  },
  deleteTax(id) {
    _data.tax = _data.tax.filter(i => i.id !== id);
    saveData(_data);
  },

  // Retirement (401k)
  getRetirement() { return _data.retirement || DEFAULT_DATA.retirement; },
  updateRetirement(updates) {
    _data.retirement = { ..._data.retirement, ...updates };
    saveData(_data);
  },
  addRetirementContribution(entry) {
    entry.id = crypto.randomUUID();
    if (!_data.retirement.contributions) _data.retirement.contributions = [];
    _data.retirement.contributions.push(entry);
    _data.retirement.balance = (_data.retirement.balance || 0) + (entry.amount || 0) + (entry.employerMatch || 0);
    saveData(_data);
  },

  // HSA
  getHSA() { return _data.hsa || DEFAULT_DATA.hsa; },
  updateHSA(updates) {
    _data.hsa = { ..._data.hsa, ...updates };
    saveData(_data);
  },
  addHSAContribution(entry) {
    entry.id = crypto.randomUUID();
    if (!_data.hsa.contributions) _data.hsa.contributions = [];
    _data.hsa.contributions.push(entry);
    _data.hsa.balance = (_data.hsa.balance || 0) + (entry.amount || 0);
    saveData(_data);
  },
  addHSAExpense(entry) {
    entry.id = crypto.randomUUID();
    if (!_data.hsa.expenses) _data.hsa.expenses = [];
    _data.hsa.expenses.push(entry);
    _data.hsa.balance = (_data.hsa.balance || 0) - (entry.amount || 0);
    saveData(_data);
  },

  // Import / Export
  exportData() {
    return JSON.stringify(_data, null, 2);
  },
  importData(jsonStr) {
    const imported = JSON.parse(jsonStr);
    _data = { ...DEFAULT_DATA, ...imported };
    saveData(_data);
  },
  clearAll() {
    _data = { ...DEFAULT_DATA };
    saveData(_data);
  },
  reload() {
    _data = loadData();
  }
};

export default Store;
