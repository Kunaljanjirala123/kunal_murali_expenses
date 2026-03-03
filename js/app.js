// Main App - Router & Navigation
import { closeModal } from './utils.js';

// Page modules
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderIncome, initIncome } from './pages/income.js';
import { renderExpenses, initExpenses } from './pages/expenses.js';
import { renderLoans, initLoans } from './pages/loans.js';
import { renderCreditCards, initCreditCards } from './pages/creditcards.js';
import { renderInsurance, initInsurance } from './pages/insurance.js';
import { renderTax, initTax } from './pages/tax.js';
import { renderRetirement, initRetirement } from './pages/retirement.js';
import { renderHSA, initHSA } from './pages/hsa.js';
import { renderSettings, initSettings } from './pages/settings.js';

const routes = {
    dashboard: { title: 'Dashboard', render: renderDashboard, init: initDashboard },
    income: { title: 'Income Tracker', render: renderIncome, init: initIncome },
    expenses: { title: 'Expense Tracker', render: renderExpenses, init: initExpenses },
    loans: { title: 'Loans Manager', render: renderLoans, init: initLoans },
    creditcards: { title: 'Credit Cards', render: renderCreditCards, init: initCreditCards },
    insurance: { title: 'Insurance', render: renderInsurance, init: initInsurance },
    tax: { title: 'Tax Details', render: renderTax, init: initTax },
    retirement: { title: '401k Retirement', render: renderRetirement, init: initRetirement },
    hsa: { title: 'HSA Account', render: renderHSA, init: initHSA },
    settings: { title: 'Settings', render: renderSettings, init: initSettings },
};

function getPageFromHash() {
    const hash = window.location.hash.replace('#/', '') || 'dashboard';
    return routes[hash] ? hash : 'dashboard';
}

function navigate(page) {
    const route = routes[page];
    if (!route) return;

    // Update page title
    document.getElementById('page-title').textContent = route.title;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Render page content with fade transition
    const container = document.getElementById('page-container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    setTimeout(() => {
        container.innerHTML = route.render();
        if (route.init) route.init();
        container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 150);

    // Close sidebar on mobile
    closeSidebar();
}

// Sidebar toggle
function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
}

// Initialize
function initMainApp() {
    // Date display
    const dateDisplay = document.getElementById('date-display');
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Navigation
    window.addEventListener('hashchange', () => navigate(getPageFromHash()));
    navigate(getPageFromHash());

    // Sidebar toggle
    document.getElementById('menu-toggle').addEventListener('click', openSidebar);
    document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

function init() {
    const isAuthenticated = localStorage.getItem('isDuoBudgetAuthenticated') === 'true';
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('login-password');
    const errorMsg = document.getElementById('login-error');

    if (isAuthenticated) {
        // Hide overlay immediately and init app
        loginOverlay.classList.add('hidden');
        initMainApp();
    } else {
        // Handle login form submission
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = passwordInput.value;

            if (password === 'Sanvitha@12') {
                localStorage.setItem('isDuoBudgetAuthenticated', 'true');
                loginOverlay.classList.add('hidden');
                errorMsg.style.display = 'none';
                initMainApp();
            } else {
                errorMsg.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();

                // Add a small shake animation to the modal
                const modal = document.querySelector('.login-modal');
                modal.style.transform = 'translateY(0) translateX(-10px)';
                setTimeout(() => modal.style.transform = 'translateY(0) translateX(10px)', 50);
                setTimeout(() => modal.style.transform = 'translateY(0) translateX(-10px)', 100);
                setTimeout(() => modal.style.transform = 'translateY(0) translateX(10px)', 150);
                setTimeout(() => modal.style.transform = 'translateY(0)', 200);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
