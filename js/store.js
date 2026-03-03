// Data Store - LocalStorage based persistence
const STORE_KEY = 'duobudget_data';

const DEFAULT_DATA = {
  "income": [],
  "expenses": [
    {
      "person": "Kunal",
      "category": "Rent",
      "amount": 500,
      "date": "2026-03-03",
      "description": "Dinner",
      "id": "a097615c-0a2e-43bf-989e-0ea676ddb937",
      "createdAt": "2026-03-03T03:40:07.125Z"
    }
  ],
  "loans": [
    {
      "person": "Kunal",
      "lender": "SBI",
      "loanType": "Student Loan",
      "currency": "INR",
      "principal": 1000000,
      "interestRate": 10,
      "emi": 21247,
      "balance": 1000000,
      "id": "af0ab3df-a8b3-4a28-bfc7-399380a075be"
    }
  ],
  "creditCards": [
    {
      "person": "Kunal",
      "cardName": "Chase Saphire",
      "creditLimit": 8000,
      "balance": 564,
      "dueDate": "2026-03-28",
      "minPayment": 30,
      "last4": "2997",
      "id": "df687095-bacd-4ba0-872d-bcc3e6042d4d"
    },
    {
      "person": "Murali",
      "cardName": "Chase Freedom",
      "creditLimit": 14200,
      "balance": 10614,
      "dueDate": "2026-03-14",
      "minPayment": 93,
      "last4": "8412",
      "id": "d632789f-915c-48ab-95cb-173f97c5d8a6"
    },
    {
      "person": "Murali",
      "cardName": "Discover",
      "creditLimit": 7800,
      "balance": 7601,
      "dueDate": "2026-03-17",
      "minPayment": 152,
      "last4": "5836",
      "id": "0a0cc2a2-419f-4254-aaf8-29da0a497f98"
    },
    {
      "person": "Kunal",
      "cardName": "Discover",
      "creditLimit": 7000,
      "balance": 6849.56,
      "dueDate": "2026-03-16",
      "minPayment": 136,
      "last4": "9588",
      "id": "f1e2e4f8-a684-4196-b919-dd4dbf84dd73"
    },
    {
      "person": "Kunal",
      "cardName": "Apple Wallet",
      "creditLimit": 5000,
      "balance": 785.27,
      "dueDate": "2026-03-31",
      "minPayment": 181,
      "last4": "3064",
      "id": "b90a3323-a92b-4a55-9fb9-49f7afa05312"
    }
  ],
  "insurance": [],
  "tax": [],
  "retirement": {
    "balance": 0,
    "contributions": [],
    "employerMatchPct": 100,
    "vestingPct": 0
  },
  "hsa": {
    "balance": 0,
    "contributions": [],
    "expenses": []
  }
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
