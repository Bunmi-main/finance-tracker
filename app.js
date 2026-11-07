/**
 * VaultFlow - Personal Finance Dashboard
 * Pure Vanilla JavaScript (No libraries, zero external runtime dependencies)
 * Offline persistence via localStorage.
 */

(function () {
  'use strict';

  // --- Constants & Category Configuration ---
  const STORAGE_KEYS = {
    TRANSACTIONS: 'vaultflow_transactions_v1',
    BUDGETS: 'vaultflow_budgets_v1',
    GOALS: 'vaultflow_goals_v1',
    CURRENCY: 'vaultflow_currency_v1',
  };

  const CATEGORIES = {
    expense: [
      { id: 'groceries', name: 'Groceries & Food', color: '#f59e0b', icon: '🛒' },
      { id: 'housing', name: 'Housing & Rent', color: '#6366f1', icon: '🏠' },
      { id: 'dining', name: 'Dining & Drinks', color: '#ec4899', icon: '🍽️' },
      { id: 'transport', name: 'Transport & Fuel', color: '#06b6d4', icon: '🚗' },
      { id: 'utilities', name: 'Utilities & Bills', color: '#8b5cf6', icon: '⚡' },
      { id: 'entertainment', name: 'Entertainment & Subs', color: '#14b8a6', icon: '🎬' },
      { id: 'shopping', name: 'Shopping & Gadgets', color: '#3b82f6', icon: '🛍️' },
      { id: 'health', name: 'Health & Fitness', color: '#10b981', icon: '💊' },
      { id: 'travel', name: 'Travel & Vacations', color: '#eab308', icon: '✈️' },
      { id: 'other_exp', name: 'Other Expense', color: '#64748b', icon: '📦' },
    ],
    income: [
      { id: 'salary', name: 'Salary & Wages', color: '#10b981', icon: '💼' },
      { id: 'freelance', name: 'Freelance & Consulting', color: '#06b6d4', icon: '💻' },
      { id: 'investments', name: 'Investments & Dividends', color: '#8b5cf6', icon: '📈' },
      { id: 'side_hustle', name: 'Side Project', color: '#f59e0b', icon: '⚡' },
      { id: 'gifts', name: 'Gifts & Bonus', color: '#ec4899', icon: '🎁' },
      { id: 'other_inc', name: 'Other Income', color: '#3b82f6', icon: '💰' },
    ]
  };

  // Helper to get category definition
  function findCategory(type, catIdOrName) {
    const list = CATEGORIES[type] || [...CATEGORIES.expense, ...CATEGORIES.income];
    return list.find(c => c.id === catIdOrName || c.name === catIdOrName) || {
      id: catIdOrName,
      name: catIdOrName,
      color: '#64748b',
      icon: '🏷️'
    };
  }

  // Initial Demo Data
  const DEFAULT_DATA = {
    currency: '$',
    transactions: [
      { id: 'tx-1', type: 'income', amount: 4850.00, category: 'Salary & Wages', date: '2026-11-01', description: 'Tech Corp Monthly Salary', notes: 'Direct deposit' },
      { id: 'tx-2', type: 'income', amount: 750.00, category: 'Freelance & Consulting', date: '2026-11-04', description: 'Frontend UI Consultation', notes: 'Invoiced client' },
      { id: 'tx-3', type: 'expense', amount: 1450.00, category: 'Housing & Rent', date: '2026-11-02', description: 'Apartment Monthly Rent', notes: 'Wire transfer' },
      { id: 'tx-4', type: 'expense', amount: 165.40, category: 'Groceries & Food', date: '2026-11-03', description: 'Whole Foods Market', notes: 'Weekly grocery run' },
      { id: 'tx-5', type: 'expense', amount: 82.50, category: 'Dining & Drinks', date: '2026-11-05', description: 'Sushi Dinner with Team', notes: 'Social outing' },
      { id: 'tx-6', type: 'expense', amount: 55.00, category: 'Transport & Fuel', date: '2026-11-06', description: 'Gasoline Station', notes: 'Full tank' },
      { id: 'tx-7', type: 'expense', amount: 120.00, category: 'Utilities & Bills', date: '2026-11-04', description: 'Fiber Internet & Electricity', notes: 'Monthly utility bundle' },
      { id: 'tx-8', type: 'expense', amount: 24.99, category: 'Entertainment & Subs', date: '2026-11-02', description: 'Cloud & Media Subscriptions', notes: 'Netflix & Spotify' },
      { id: 'tx-9', type: 'income', amount: 320.00, category: 'Investments & Dividends', date: '2026-10-28', description: 'Index Fund Dividend', notes: 'Q3 yield' },
      { id: 'tx-10', type: 'expense', amount: 240.00, category: 'Groceries & Food', date: '2026-10-25', description: 'Supermarket Grocery Stockup', notes: 'Bulk food' },
      { id: 'tx-11', type: 'expense', amount: 95.00, category: 'Health & Fitness', date: '2026-10-20', description: 'Gym Membership & Classes', notes: 'Monthly pass' },
      { id: 'tx-12', type: 'expense', amount: 180.00, category: 'Shopping & Gadgets', date: '2026-10-15', description: 'Ergonomic Desk Accessories', notes: 'Home office' },
    ],
    budgets: [
      { category: 'Groceries & Food', limit: 500 },
      { category: 'Dining & Drinks', limit: 250 },
      { category: 'Transport & Fuel', limit: 180 },
      { category: 'Entertainment & Subs', limit: 100 },
      { category: 'Shopping & Gadgets', limit: 300 },
    ],
    goals: [
      { id: 'g-1', name: 'Emergency Reserve Fund', target: 10000, current: 6500 },
      { id: 'g-2', name: 'Japan Travel Adventure', target: 4000, current: 2200 },
      { id: 'g-3', name: 'New M4 Workstation', target: 2500, current: 1800 }
    ]
  };

  // --- State Application Container ---
  const state = {
    currency: '$',
    period: 'all',
    transactions: [],
    budgets: [],
    goals: [],
    filters: {
      search: '',
      type: 'all',
      category: 'all',
      sort: 'date-desc'
    },
    pagination: {
      page: 1,
      pageSize: 8
    }
  };

  // --- Persistence Handlers ---
  function loadState() {
    try {
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      const storedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY);

      if (storedTx) {
        state.transactions = JSON.parse(storedTx);
      } else {
        state.transactions = [...DEFAULT_DATA.transactions];
        saveTransactions();
      }

      if (storedBudgets) {
        state.budgets = JSON.parse(storedBudgets);
      } else {
        state.budgets = [...DEFAULT_DATA.budgets];
        saveBudgets();
      }

      if (storedGoals) {
        state.goals = JSON.parse(storedGoals);
      } else {
        state.goals = [...DEFAULT_DATA.goals];
        saveGoals();
      }

      if (storedCurrency) {
        state.currency = storedCurrency;
      } else {
        state.currency = DEFAULT_DATA.currency;
        saveCurrency();
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
      state.transactions = [...DEFAULT_DATA.transactions];
      state.budgets = [...DEFAULT_DATA.budgets];
      state.goals = [...DEFAULT_DATA.goals];
      state.currency = '$';
    }
  }

  function saveTransactions() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
  }

  function saveBudgets() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgets));
  }

  function saveGoals() {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(state.goals));
  }

  function saveCurrency() {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, state.currency);
  }

  // Helper for local ISO date (YYYY-MM-DD)
  function getLocalTodayISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- Formatting Helpers ---
  function formatMoney(amount) {
    const val = Number(amount) || 0;
    const isNegative = val < 0;
    const formatted = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${isNegative ? '-' : ''}${state.currency}${formatted}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Filter transactions according to selected dashboard period
  function getPeriodTransactions() {
    if (state.period === 'all') return state.transactions;
    const now = new Date();
    if (state.period === 'this-month') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return state.transactions.filter(t => t.date && t.date.startsWith(monthPrefix));
    }
    if (state.period === 'last-30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isoThreshold = thirtyDaysAgo.toISOString().split('T')[0];
      return state.transactions.filter(t => t.date && t.date >= isoThreshold);
    }
    if (state.period === 'this-year') {
      const yearPrefix = `${now.getFullYear()}-`;
      return state.transactions.filter(t => t.date && t.date.startsWith(yearPrefix));
    }
    return state.transactions;
  }

  // --- KPI Metrics Calculation & Rendering ---
  function renderKPIs() {
    const periodTxns = getPeriodTransactions();

    const totalIncome = periodTxns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = periodTxns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const netBalance = totalIncome - totalExpense;
    const txCount = periodTxns.length;
    const incomeCount = periodTxns.filter(t => t.type === 'income').length;

    // Elements
    const kpiBalance = document.getElementById('kpiTotalBalance');
    const kpiIncome = document.getElementById('kpiTotalIncome');
    const kpiExpense = document.getElementById('kpiTotalExpense');
    const kpiSavingsRate = document.getElementById('kpiSavingsRate');
    const kpiSavingsFill = document.getElementById('kpiSavingsFill');
    const kpiTxnCount = document.getElementById('kpiTxnCount');
    const kpiIncomeCount = document.getElementById('kpiIncomeCount');
    const kpiExpenseRatio = document.getElementById('kpiExpenseRatio');
    const kpiNetBadge = document.getElementById('kpiNetBadge');
    const kpiSavingsStatus = document.getElementById('kpiSavingsStatus');

    kpiBalance.textContent = formatMoney(netBalance);
    kpiIncome.textContent = formatMoney(totalIncome);
    kpiExpense.textContent = formatMoney(totalExpense);
    kpiTxnCount.textContent = `${txCount} record${txCount === 1 ? '' : 's'}`;
    kpiIncomeCount.textContent = `${incomeCount} credit${incomeCount === 1 ? '' : 's'} recorded`;

    if (netBalance >= 0) {
      kpiNetBadge.textContent = 'Surplus (+)';
      kpiNetBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
      kpiNetBadge.style.color = '#34d399';
    } else {
      kpiNetBadge.textContent = 'Deficit (-)';
      kpiNetBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
      kpiNetBadge.style.color = '#f87171';
    }

    // Expense Ratio
    const expenseRatio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : (totalExpense > 0 ? 100 : 0);
    kpiExpenseRatio.textContent = `${expenseRatio}% of total income`;

    // Savings Rate
    let savingsRate = 0;
    if (totalIncome > 0) {
      savingsRate = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
    }
    const clampedRate = Math.max(0, Math.min(100, savingsRate));
    kpiSavingsRate.textContent = `${savingsRate}%`;
    kpiSavingsFill.style.width = `${clampedRate}%`;

    if (savingsRate >= 20) {
      kpiSavingsStatus.textContent = 'Target met (20%+)';
      kpiSavingsStatus.style.color = '#34d399';
    } else if (savingsRate > 0) {
      kpiSavingsStatus.textContent = 'Building up momentum';
      kpiSavingsStatus.style.color = '#f59e0b';
    } else {
      kpiSavingsStatus.textContent = 'Expenses exceed income';
      kpiSavingsStatus.style.color = '#f87171';
    }
  }

  // Cached chart layout data for hover tooltip
  let cashflowChartLayout = null;

  // --- High-Resolution Canvas Rendering Helpers ---
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.clientWidth || 600;
    const height = rect.height || canvas.clientHeight || 240;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  }

  // --- Monthly Cash Flow Bar Chart ---
  function renderCashflowChart() {
    const canvas = document.getElementById('cashflowCanvas');
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    // Group transactions by month for the last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: `${monthNames[month]}`,
        yearLabel: `${monthNames[month]} ${year}`,
        income: 0,
        expense: 0
      });
    }

    state.transactions.forEach(t => {
      if (!t.date) return;
      const monthKey = t.date.substring(0, 7);
      const bucket = months.find(m => m.key === monthKey);
      if (bucket) {
        if (t.type === 'income') {
          bucket.income += Number(t.amount || 0);
        } else if (t.type === 'expense') {
          bucket.expense += Number(t.amount || 0);
        }
      }
    });

    // Determine max value for Y-axis scale
    let maxVal = 1000;
    months.forEach(m => {
      if (m.income > maxVal) maxVal = m.income;
      if (m.expense > maxVal) maxVal = m.expense;
    });
    // Add 15% headroom
    maxVal = Math.ceil((maxVal * 1.15) / 500) * 500;

    // Margins
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;
    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    // Draw horizontal grid lines & Y labels
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = (maxVal / gridLines) * i;
      const yPos = paddingTop + chartH - (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, yPos);
      ctx.lineTo(width - paddingRight, yPos);
      ctx.stroke();

      const label = yVal >= 1000 ? `${state.currency}${(yVal / 1000).toFixed(1)}k` : `${state.currency}${Math.round(yVal)}`;
      ctx.fillText(label, paddingLeft - 10, yPos);
    }

    // Draw grouped bars
    const groupW = chartW / months.length;
    const barW = Math.min(24, Math.max(12, (groupW - 24) / 2));
    const gap = 4;

    const hitBoxes = [];

    months.forEach((m, idx) => {
      const groupCenterX = paddingLeft + (idx * groupW) + (groupW / 2);
      const incBarX = groupCenterX - barW - (gap / 2);
      const expBarX = groupCenterX + (gap / 2);

      const incHeight = (m.income / maxVal) * chartH;
      const expHeight = (m.expense / maxVal) * chartH;

      const incY = paddingTop + chartH - incHeight;
      const expY = paddingTop + chartH - expHeight;

      // Income bar (Emerald)
      ctx.fillStyle = '#10b981';
      drawRoundedRect(ctx, incBarX, incY, barW, Math.max(3, incHeight), 4, true);

      // Expense bar (Rose)
      ctx.fillStyle = '#f43f5e';
      drawRoundedRect(ctx, expBarX, expY, barW, Math.max(3, expHeight), 4, true);

      // Month label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11.5px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(m.label, groupCenterX, height - paddingBottom + 10);

      hitBoxes.push({
        x1: incBarX - 6,
        x2: expBarX + barW + 6,
        centerX: groupCenterX,
        topY: Math.min(incY, expY),
        data: m
      });
    });

    cashflowChartLayout = { hitBoxes, canvasRect: canvas.getBoundingClientRect() };
  }

  function drawRoundedRect(ctx, x, y, width, height, radius, topOnly = false) {
    if (height < radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    if (topOnly) {
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
    } else {
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
    }
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  // --- Category Expense Donut Chart ---
  function renderExpenseDonut() {
    const canvas = document.getElementById('categoryDonutCanvas');
    const legendList = document.getElementById('categoryLegendList');
    const centerVal = document.getElementById('donutTotalVal');
    if (!canvas || !legendList) return;

    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    // Sum expenses by category
    const categoryTotals = {};
    let totalExpense = 0;
    const periodTxns = getPeriodTransactions();

    periodTxns.forEach(t => {
      if (t.type === 'expense') {
        const amt = Number(t.amount || 0);
        const catName = t.category || 'Other Expense';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + amt;
        totalExpense += amt;
      }
    });

    centerVal.textContent = totalExpense > 0 ? `${state.currency}${Math.round(totalExpense).toLocaleString()}` : `${state.currency}0`;

    // Sort categories by highest amount
    const sortedCategories = Object.keys(categoryTotals)
      .map(name => {
        const catDef = findCategory('expense', name);
        return {
          name,
          amount: categoryTotals[name],
          color: catDef.color,
          icon: catDef.icon,
          percent: totalExpense > 0 ? (categoryTotals[name] / totalExpense) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);

    legendList.innerHTML = '';

    if (totalExpense === 0 || sortedCategories.length === 0) {
      // Draw placeholder circle
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 22;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      legendList.innerHTML = '<div class="donut-legend-row text-muted" style="justify-content:center; padding:16px;">No expense data recorded yet</div>';
      return;
    }

    // Draw donut arcs
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 8;
    const lineWidth = 24;
    let currentAngle = -Math.PI / 2;

    sortedCategories.forEach(item => {
      const sliceAngle = (item.amount / totalExpense) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius - (lineWidth / 2), currentAngle, currentAngle + sliceAngle, false);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = item.color;
      ctx.stroke();
      currentAngle += sliceAngle;

      // Populate Legend row
      const row = document.createElement('div');
      row.className = 'donut-legend-row';
      row.innerHTML = `
        <div class="donut-legend-label">
          <span class="donut-legend-color" style="background-color: ${item.color};"></span>
          <span>${item.icon} ${escapeHtml(item.name)}</span>
        </div>
        <div class="donut-legend-values">
          <span>${formatMoney(item.amount)}</span>
          <span class="donut-legend-pct">${item.percent.toFixed(0)}%</span>
        </div>
      `;
      legendList.appendChild(row);
    });
  }

  // --- Budgets Rendering ---
  function renderBudgets() {
    const listEl = document.getElementById('budgetsList');
    if (!listEl) return;

    if (state.budgets.length === 0) {
      listEl.innerHTML = `
        <div class="text-muted text-sm" style="text-align: center; padding: 24px;">
          No monthly budgets set yet. Click "Set Budget" to configure your spending boundaries.
        </div>
      `;
      return;
    }

    // Calculate current month's expenses per category
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlySpending = {};

    state.transactions.forEach(t => {
      if (t.type === 'expense' && t.date && t.date.startsWith(currentMonthKey)) {
        monthlySpending[t.category] = (monthlySpending[t.category] || 0) + Number(t.amount || 0);
      }
    });

    listEl.innerHTML = '';

    state.budgets.forEach((budget, idx) => {
      const spent = monthlySpending[budget.category] || 0;
      const limit = Number(budget.limit) || 1;
      const percent = Math.min(100, Math.round((spent / limit) * 100));
      const remaining = limit - spent;
      const catDef = findCategory('expense', budget.category);

      let statusColorClass = 'fill-safe';
      let statusText = `${formatMoney(remaining)} remaining`;
      if (percent >= 100) {
        statusColorClass = 'fill-danger';
        statusText = `Over by ${formatMoney(Math.abs(remaining))}`;
      } else if (percent >= 80) {
        statusColorClass = 'fill-warning';
        statusText = `Warning: ${formatMoney(remaining)} left`;
      }

      const item = document.createElement('div');
      item.className = 'budget-item';
      item.innerHTML = `
        <div class="budget-item-top">
          <span class="budget-item-title">${catDef.icon} ${escapeHtml(budget.category)}</span>
          <div class="budget-item-amounts">
            <span class="budget-spent-val">${formatMoney(spent)}</span> of ${formatMoney(limit)}
          </div>
        </div>
        <div class="budget-bar-track">
          <div class="budget-bar-fill ${statusColorClass}" style="width: ${percent}%;"></div>
        </div>
        <div class="budget-item-meta">
          <span>${percent}% spent</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight: 600; color: ${percent >= 100 ? '#ef4444' : percent >= 80 ? '#f59e0b' : '#10b981'};">${statusText}</span>
            <button class="btn-table-action delete btn-delete-budget" data-index="${idx}" title="Remove budget limit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
      listEl.appendChild(item);
    });

    // Wire delete buttons
    listEl.querySelectorAll('.btn-delete-budget').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index, 10);
        const catName = state.budgets[index].category;
        state.budgets.splice(index, 1);
        saveBudgets();
        renderBudgets();
        showToast(`Budget for "${catName}" removed.`, 'info');
      });
    });
  }

  // --- Savings Goals Rendering ---
  function renderGoals() {
    const listEl = document.getElementById('goalsList');
    if (!listEl) return;

    if (state.goals.length === 0) {
      listEl.innerHTML = `
        <div class="text-muted text-sm" style="text-align: center; padding: 24px;">
          No savings goals created. Click "New Goal" to establish a target vault!
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';

    state.goals.forEach((goal) => {
      const current = Number(goal.current) || 0;
      const target = Number(goal.target) || 1;
      const percent = Math.min(100, Math.round((current / target) * 100));
      const remaining = Math.max(0, target - current);

      const item = document.createElement('div');
      item.className = 'goal-item';
      item.innerHTML = `
        <div class="goal-item-top">
          <span class="goal-item-title">🎯 ${escapeHtml(goal.name)}</span>
          <div class="goal-item-amounts">
            <span class="goal-current-val">${formatMoney(current)}</span> / ${formatMoney(target)}
          </div>
        </div>
        <div class="goal-bar-track">
          <div class="goal-bar-fill fill-goal" style="width: ${percent}%;"></div>
        </div>
        <div class="goal-item-meta">
          <span>${percent}% achieved (${formatMoney(remaining)} to target)</span>
          <div class="goal-actions-row">
            <button class="btn btn-ghost btn-sm btn-deposit-goal" data-id="${goal.id}" style="padding: 3px 8px; font-size: 11px;">
              + Deposit
            </button>
            <button class="btn-table-action delete btn-delete-goal" data-id="${goal.id}" title="Delete goal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
      listEl.appendChild(item);
    });

    // Wire goal deposit buttons
    listEl.querySelectorAll('.btn-deposit-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const goalId = btn.dataset.id;
        openDepositModal(goalId);
      });
    });

    // Wire goal delete buttons
    listEl.querySelectorAll('.btn-delete-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const goalId = btn.dataset.id;
        state.goals = state.goals.filter(g => g.id !== goalId);
        saveGoals();
        renderGoals();
        showToast('Savings goal deleted', 'info');
      });
    });
  }

  // --- Transactions Table & Filtering ---
  function getFilteredTransactions() {
    return state.transactions.filter(t => {
      // Type filter
      if (state.filters.type !== 'all' && t.type !== state.filters.type) {
        return false;
      }
      // Category filter
      if (state.filters.category !== 'all' && t.category !== state.filters.category) {
        return false;
      }
      // Search term (description, notes, category, amount)
      if (state.filters.search.trim()) {
        const query = state.filters.search.toLowerCase().trim();
        const desc = (t.description || '').toLowerCase();
        const notes = (t.notes || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        const amt = String(t.amount || '');
        if (!desc.includes(query) && !notes.includes(query) && !cat.includes(query) && !amt.includes(query)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (state.filters.sort === 'date-desc') {
        return (b.date || '').localeCompare(a.date || '');
      } else if (state.filters.sort === 'date-asc') {
        return (a.date || '').localeCompare(b.date || '');
      } else if (state.filters.sort === 'amount-desc') {
        return Number(b.amount || 0) - Number(a.amount || 0);
      } else if (state.filters.sort === 'amount-asc') {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }
      return 0;
    });
  }

  function renderTransactions() {
    const tbody = document.getElementById('transactionTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableSummaryText = document.getElementById('tableSummaryText');
    const pageIndicator = document.getElementById('pageIndicator');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    if (!tbody) return;

    const filtered = getFilteredTransactions();
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / state.pagination.pageSize));

    if (state.pagination.page > totalPages) {
      state.pagination.page = totalPages;
    }

    const startIndex = (state.pagination.page - 1) * state.pagination.pageSize;
    const endIndex = Math.min(startIndex + state.pagination.pageSize, totalCount);
    const pageItems = filtered.slice(startIndex, endIndex);

    if (totalCount === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'flex';
      tableSummaryText.textContent = 'Showing 0 of 0 entries';
      pageIndicator.textContent = 'Page 1 of 1';
      btnPrev.disabled = true;
      btnNext.disabled = true;
      return;
    }

    emptyState.style.display = 'none';
    tableSummaryText.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalCount} entries`;
    pageIndicator.textContent = `Page ${state.pagination.page} of ${totalPages}`;
    btnPrev.disabled = state.pagination.page <= 1;
    btnNext.disabled = state.pagination.page >= totalPages;

    tbody.innerHTML = pageItems.map(t => {
      const isIncome = t.type === 'income';
      const catDef = findCategory(t.type, t.category);
      const formattedAmt = `${isIncome ? '+' : '-'}${formatMoney(t.amount)}`;
      const amtClass = isIncome ? 'txn-amount-income' : 'txn-amount-expense';
      const pillClass = isIncome ? 'pill-income' : 'pill-expense';

      return `
        <tr>
          <td style="white-space: nowrap; font-weight: 500; color: #cbd5e1;">${formatDate(t.date)}</td>
          <td>
            <div style="font-weight: 600; color: #ffffff;">${escapeHtml(t.description)}</div>
            ${t.notes ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">${escapeHtml(t.notes)}</div>` : ''}
          </td>
          <td>
            <span class="category-badge" style="background-color: ${catDef.color}22; color: ${catDef.color}; border: 1px solid ${catDef.color}44;">
              <span>${catDef.icon}</span> ${escapeHtml(t.category)}
            </span>
          </td>
          <td>
            <span class="type-pill ${pillClass}">${isIncome ? 'Income' : 'Expense'}</span>
          </td>
          <td class="text-right ${amtClass}">
            ${formattedAmt}
          </td>
          <td class="text-center">
            <div class="txn-actions">
              <button class="btn-table-action btn-edit-txn" data-id="${t.id}" title="Edit transaction">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="btn-table-action delete btn-delete-txn" data-id="${t.id}" title="Delete transaction">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Wire edit buttons
    tbody.querySelectorAll('.btn-edit-txn').forEach(btn => {
      btn.addEventListener('click', () => {
        const txn = state.transactions.find(t => t.id === btn.dataset.id);
        if (txn) openTransactionModal(txn);
      });
    });

    // Wire delete buttons
    tbody.querySelectorAll('.btn-delete-txn').forEach(btn => {
      btn.addEventListener('click', () => {
        const txnId = btn.dataset.id;
        state.transactions = state.transactions.filter(t => t.id !== txnId);
        saveTransactions();
        updateDashboard();
        showToast('Transaction removed', 'info');
      });
    });
  }

  // Populate dynamic category dropdown in Filter bar
  function populateFilterCategories() {
    const filterSelect = document.getElementById('filterCategory');
    if (!filterSelect) return;

    const currentVal = filterSelect.value;
    const allCategories = [
      ...CATEGORIES.expense.map(c => c.name),
      ...CATEGORIES.income.map(c => c.name)
    ];

    // Unique
    const uniqueCats = Array.from(new Set(allCategories));

    filterSelect.innerHTML = '<option value="all">All Categories</option>' + 
      uniqueCats.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');

    if (currentVal && uniqueCats.includes(currentVal)) {
      filterSelect.value = currentVal;
    }
  }

  // --- Master Dashboard Refresh ---
  function updateDashboard() {
    renderKPIs();
    renderCashflowChart();
    renderExpenseDonut();
    renderBudgets();
    renderGoals();
    renderTransactions();
  }

  // --- Modals Management ---

  // 1. Transaction Modal (Add / Edit)
  function openTransactionModal(editTxn = null) {
    const modal = document.getElementById('modalTransaction');
    const modalTitle = document.getElementById('modalTxnTitle');
    const form = document.getElementById('formTransaction');
    const idInput = document.getElementById('txnId');
    const radioExpense = document.getElementById('radioExpense');
    const radioIncome = document.getElementById('radioIncome');
    const amountInput = document.getElementById('txnAmount');
    const dateInput = document.getElementById('txnDate');
    const descInput = document.getElementById('txnDescription');
    const notesInput = document.getElementById('txnNotes');
    const catSelect = document.getElementById('txnCategory');

    form.reset();

    if (editTxn) {
      modalTitle.textContent = 'Edit Transaction';
      idInput.value = editTxn.id;
      if (editTxn.type === 'income') {
        radioIncome.checked = true;
      } else {
        radioExpense.checked = true;
      }
      populateTxnCategories(editTxn.type, editTxn.category);
      amountInput.value = editTxn.amount;
      dateInput.value = editTxn.date;
      descInput.value = editTxn.description;
      notesInput.value = editTxn.notes || '';
    } else {
      modalTitle.textContent = 'Log Transaction';
      idInput.value = '';
      radioExpense.checked = true;
      populateTxnCategories('expense');
      // Default to today in local timezone
      dateInput.value = getLocalTodayISO();
    }

    modal.style.display = 'flex';
    amountInput.focus();
  }

  function closeTransactionModal() {
    document.getElementById('modalTransaction').style.display = 'none';
  }

  function populateTxnCategories(type, selectedCategory = '') {
    const select = document.getElementById('txnCategory');
    const list = CATEGORIES[type] || [];
    select.innerHTML = list.map(c => `
      <option value="${escapeHtml(c.name)}" ${c.name === selectedCategory ? 'selected' : ''}>
        ${c.icon} ${escapeHtml(c.name)}
      </option>
    `).join('');
  }

  // 2. Budget Modal
  function openBudgetModal() {
    const modal = document.getElementById('modalBudget');
    const catSelect = document.getElementById('budgetCategory');
    const limitInput = document.getElementById('budgetLimit');

    catSelect.innerHTML = CATEGORIES.expense.map(c => `
      <option value="${escapeHtml(c.name)}">${c.icon} ${escapeHtml(c.name)}</option>
    `).join('');

    limitInput.value = '';
    modal.style.display = 'flex';
    limitInput.focus();
  }

  function closeBudgetModal() {
    document.getElementById('modalBudget').style.display = 'none';
  }

  // 3. Goal Modal
  function openGoalModal() {
    const modal = document.getElementById('modalGoal');
    const form = document.getElementById('formGoal');
    form.reset();
    document.getElementById('goalId').value = '';
    modal.style.display = 'flex';
    document.getElementById('goalName').focus();
  }

  function closeGoalModal() {
    document.getElementById('modalGoal').style.display = 'none';
  }

  // 4. Goal Deposit Modal
  function openDepositModal(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const modal = document.getElementById('modalDepositGoal');
    document.getElementById('depositGoalId').value = goal.id;
    document.getElementById('depositGoalNameText').textContent = `Add funds towards "${goal.name}".`;
    document.getElementById('depositAmount').value = '';
    modal.style.display = 'flex';
    document.getElementById('depositAmount').focus();
  }

  function closeDepositModal() {
    document.getElementById('modalDepositGoal').style.display = 'none';
  }

  // 5. Data Tools Modal
  function openDataToolsModal() {
    document.getElementById('modalDataTools').style.display = 'flex';
  }

  function closeDataToolsModal() {
    document.getElementById('modalDataTools').style.display = 'none';
  }

  // --- Export CSV & Backup/Restore ---
  function exportCSV() {
    if (state.transactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['ID', 'Type', 'Amount', 'Category', 'Date', 'Description', 'Notes'];
    const rows = state.transactions.map(t => [
      t.id,
      t.type,
      t.amount,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vaultflow_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('CSV export downloaded!', 'success');
  }

  function downloadJSONBackup() {
    const payload = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      currency: state.currency,
      transactions: state.transactions,
      budgets: state.budgets,
      goals: state.goals
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vaultflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded successfully!', 'success');
  }

  function importJSONBackup(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.transactions && Array.isArray(data.transactions)) {
          state.transactions = data.transactions;
          state.budgets = data.budgets || [];
          state.goals = data.goals || [];
          if (data.currency) state.currency = data.currency;

          saveTransactions();
          saveBudgets();
          saveGoals();
          saveCurrency();

          updateCurrencyPrefixes();
          document.getElementById('currencySelect').value = state.currency;
          updateDashboard();
          closeDataToolsModal();
          showToast('Data backup restored successfully!', 'success');
        } else {
          showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        showToast('Error parsing JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function updateCurrencyPrefixes() {
    const ids = ['currencyPrefix', 'budgetCurrencyPrefix', 'goalCurrencyPrefix1', 'goalCurrencyPrefix2', 'depositCurrencyPrefix'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = state.currency;
    });
  }

  // --- Event Listeners Setup ---
  function initEventListeners() {
    // Cashflow Chart Hover Tooltip
    const cashflowCanvas = document.getElementById('cashflowCanvas');
    const cashflowTooltip = document.getElementById('cashflowTooltip');

    if (cashflowCanvas && cashflowTooltip) {
      cashflowCanvas.addEventListener('mousemove', (e) => {
        if (!cashflowChartLayout || !cashflowChartLayout.hitBoxes) return;
        const rect = cashflowCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const match = cashflowChartLayout.hitBoxes.find(box => mouseX >= box.x1 && mouseX <= box.x2);
        if (match) {
          const m = match.data;
          cashflowTooltip.innerHTML = `
            <div style="font-weight:700; color:#ffffff; margin-bottom:4px;">${m.yearLabel}</div>
            <div style="color:#10b981;">Income: <strong>${formatMoney(m.income)}</strong></div>
            <div style="color:#f43f5e;">Expense: <strong>${formatMoney(m.expense)}</strong></div>
            <div style="color:#94a3b8; font-size:11px; margin-top:2px;">Net: <strong>${formatMoney(m.income - m.expense)}</strong></div>
          `;
          cashflowTooltip.style.left = `${match.centerX}px`;
          cashflowTooltip.style.top = `${Math.max(20, match.topY)}px`;
          cashflowTooltip.style.display = 'block';
        } else {
          cashflowTooltip.style.display = 'none';
        }
      });

      cashflowCanvas.addEventListener('mouseleave', () => {
        cashflowTooltip.style.display = 'none';
      });
    }

    // Period Filter Chips
    document.querySelectorAll('#periodFilterGroup .period-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#periodFilterGroup .period-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.period = chip.dataset.period;
        renderKPIs();
        renderExpenseDonut();
      });
    });

    // Currency Selector
    const currencySelect = document.getElementById('currencySelect');
    currencySelect.value = state.currency;
    currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      saveCurrency();
      updateCurrencyPrefixes();
      updateDashboard();
      showToast(`Active currency updated to ${state.currency}`, 'info');
    });

    // Top Navigation Buttons
    document.getElementById('btnOpenAddModal').addEventListener('click', () => openTransactionModal());
    document.getElementById('btnExportData').addEventListener('click', exportCSV);
    document.getElementById('btnBackupData').addEventListener('click', openDataToolsModal);
    document.getElementById('btnOpenBudgetModal').addEventListener('click', openBudgetModal);
    document.getElementById('btnOpenGoalModal').addEventListener('click', openGoalModal);
    document.getElementById('btnEmptyAdd').addEventListener('click', () => openTransactionModal());

    // Transaction Modal Controls
    document.getElementById('btnCloseTxnModal').addEventListener('click', closeTransactionModal);
    document.getElementById('btnCancelTxnModal').addEventListener('click', closeTransactionModal);

    // Transaction Type Radio Toggle (Income vs Expense categories update)
    document.querySelectorAll('input[name="txnType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        populateTxnCategories(e.target.value);
      });
    });

    // Save Transaction Form Submit
    document.getElementById('formTransaction').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('txnId').value;
      const type = document.querySelector('input[name="txnType"]:checked').value;
      const amount = parseFloat(document.getElementById('txnAmount').value);
      const date = document.getElementById('txnDate').value;
      const description = document.getElementById('txnDescription').value.trim();
      const category = document.getElementById('txnCategory').value;
      const notes = document.getElementById('txnNotes').value.trim();

      if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount greater than 0', 'error');
        return;
      }
      if (!description) {
        showToast('Please provide a title or description', 'error');
        return;
      }
      if (!date) {
        showToast('Please select a date', 'error');
        return;
      }

      if (id) {
        // Edit existing
        const index = state.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          state.transactions[index] = { id, type, amount, date, description, category, notes };
          showToast('Transaction updated', 'success');
        }
      } else {
        // Create new
        const newTxn = {
          id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          type,
          amount,
          date,
          description,
          category,
          notes
        };
        state.transactions.unshift(newTxn);
        showToast('Transaction recorded!', 'success');
      }

      saveTransactions();
      closeTransactionModal();
      populateFilterCategories();
      updateDashboard();
    });

    // Budget Modal Controls
    document.getElementById('btnCloseBudgetModal').addEventListener('click', closeBudgetModal);
    document.getElementById('btnCancelBudgetModal').addEventListener('click', closeBudgetModal);
    document.getElementById('formBudget').addEventListener('submit', (e) => {
      e.preventDefault();
      const category = document.getElementById('budgetCategory').value;
      const limit = parseFloat(document.getElementById('budgetLimit').value);

      if (isNaN(limit) || limit <= 0) {
        showToast('Please specify a positive budget limit', 'error');
        return;
      }

      const existingIndex = state.budgets.findIndex(b => b.category === category);
      if (existingIndex !== -1) {
        state.budgets[existingIndex].limit = limit;
      } else {
        state.budgets.push({ category, limit });
      }

      saveBudgets();
      closeBudgetModal();
      renderBudgets();
      showToast(`Budget for ${category} set to ${formatMoney(limit)}`, 'success');
    });

    // Goal Modal Controls
    document.getElementById('btnCloseGoalModal').addEventListener('click', closeGoalModal);
    document.getElementById('btnCancelGoalModal').addEventListener('click', closeGoalModal);
    document.getElementById('formGoal').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('goalName').value.trim();
      const target = parseFloat(document.getElementById('goalTarget').value);
      const current = parseFloat(document.getElementById('goalCurrent').value) || 0;

      if (!name) {
        showToast('Please provide a goal name', 'error');
        return;
      }
      if (isNaN(target) || target <= 0) {
        showToast('Please specify a valid target amount', 'error');
        return;
      }

      state.goals.push({
        id: 'g-' + Date.now(),
        name,
        target,
        current
      });

      saveGoals();
      closeGoalModal();
      renderGoals();
      showToast(`Savings target "${name}" created!`, 'success');
    });

    // Goal Deposit Modal Controls
    document.getElementById('btnCloseDepositModal').addEventListener('click', closeDepositModal);
    document.getElementById('btnCancelDepositModal').addEventListener('click', closeDepositModal);
    document.getElementById('formDepositGoal').addEventListener('submit', (e) => {
      e.preventDefault();
      const goalId = document.getElementById('depositGoalId').value;
      const amount = parseFloat(document.getElementById('depositAmount').value);

      if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid deposit amount', 'error');
        return;
      }

      const goal = state.goals.find(g => g.id === goalId);
      if (goal) {
        goal.current = (Number(goal.current) || 0) + amount;
        saveGoals();
        renderGoals();
        closeDepositModal();
        showToast(`Deposited ${formatMoney(amount)} into ${goal.name}!`, 'success');
      }
    });

    // Data Tools Modal Controls
    document.getElementById('btnCloseDataTools').addEventListener('click', closeDataToolsModal);
    document.getElementById('btnCloseDataToolsBtn').addEventListener('click', closeDataToolsModal);
    document.getElementById('btnDownloadJSON').addEventListener('click', downloadJSONBackup);

    const inputFileJSON = document.getElementById('inputFileJSON');
    inputFileJSON.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importJSONBackup(e.target.files[0]);
        inputFileJSON.value = '';
      }
    });

    // Load Demo Data
    document.getElementById('btnLoadDemo').addEventListener('click', () => {
      if (confirm('Load demo transactions, budgets, and savings goals?')) {
        state.transactions = JSON.parse(JSON.stringify(DEFAULT_DATA.transactions));
        state.budgets = JSON.parse(JSON.stringify(DEFAULT_DATA.budgets));
        state.goals = JSON.parse(JSON.stringify(DEFAULT_DATA.goals));
        state.currency = DEFAULT_DATA.currency;
        saveTransactions();
        saveBudgets();
        saveGoals();
        saveCurrency();
        updateCurrencyPrefixes();
        document.getElementById('currencySelect').value = state.currency;
        updateDashboard();
        closeDataToolsModal();
        showToast('Sample dataset loaded successfully!', 'success');
      }
    });

    // Wipe All Data
    document.getElementById('btnClearAllData').addEventListener('click', () => {
      if (confirm('Are you sure you want to completely erase all data? This cannot be undone.')) {
        state.transactions = [];
        state.budgets = [];
        state.goals = [];
        saveTransactions();
        saveBudgets();
        saveGoals();
        updateDashboard();
        closeDataToolsModal();
        showToast('All data erased from local storage.', 'info');
      }
    });

    // Table Filters
    document.getElementById('filterSearch').addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      state.pagination.page = 1;
      renderTransactions();
    });

    // Type filter chips
    document.querySelectorAll('#filterTypeGroup .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#filterTypeGroup .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.filters.type = chip.dataset.type;
        state.pagination.page = 1;
        renderTransactions();
      });
    });

    // Category filter dropdown
    document.getElementById('filterCategory').addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      state.pagination.page = 1;
      renderTransactions();
    });

    // Sort dropdown
    document.getElementById('filterSort').addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      renderTransactions();
    });

    // Pagination buttons
    document.getElementById('btnPrevPage').addEventListener('click', () => {
      if (state.pagination.page > 1) {
        state.pagination.page--;
        renderTransactions();
      }
    });

    document.getElementById('btnNextPage').addEventListener('click', () => {
      state.pagination.page++;
      renderTransactions();
    });

    // Window Resize Redraw (for dynamic canvas width adjustments)
    window.addEventListener('resize', debounce(() => {
      renderCashflowChart();
      renderExpenseDonut();
    }, 150));

    // Close modals when clicking backdrop
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.style.display = 'none';
      }
    });

    // Close modals with Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
          modal.style.display = 'none';
        });
      }
    });
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // --- Bootstrap Application ---
  function init() {
    loadState();
    updateCurrencyPrefixes();
    populateFilterCategories();
    initEventListeners();
    updateDashboard();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
