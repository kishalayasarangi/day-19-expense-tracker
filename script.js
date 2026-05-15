let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
let currentType = 'expense';

const categoryColors = {
  food: '#f59e0b',
  transport: '#3b82f6',
  shopping: '#ec4899',
  education: '#8b5cf6',
  health: '#10b981',
  entertainment: '#f97316',
  salary: '#10b981',
  other: '#6b7280'
};

const categoryIcons = {
  food: '🍔', transport: '🚗', shopping: '🛍️',
  education: '📚', health: '💊', entertainment: '🎮',
  salary: '💰', other: '📦'
};

function selectType(type, btn) {
  currentType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function addTransaction() {
  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];

  if (!desc || isNaN(amount) || amount <= 0) {
    alert('Please fill in description and a valid amount!');
    return;
  }

  transactions.unshift({
    id: Date.now(),
    desc, amount, category, date,
    type: currentType
  });

  localStorage.setItem('transactions', JSON.stringify(transactions));
  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
  renderAll();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderAll();
}

function clearAll() {
  if (!confirm('Clear all transactions?')) return;
  transactions = [];
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderAll();
}

function renderAll() {
  renderSummary();
  renderTransactions();
  renderBreakdown();
}

function renderSummary() {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;
  document.getElementById('totalIncome').textContent = `₹${income.toFixed(2)}`;
  document.getElementById('totalExpense').textContent = `₹${expense.toFixed(2)}`;
}

function renderTransactions() {
  const list = document.getElementById('transactionList');
  if (transactions.length === 0) {
    list.innerHTML = '<li class="trans-empty">No transactions yet — add one above!</li>';
    return;
  }
  list.innerHTML = transactions.map(t => `
    <li class="trans-item ${t.type}">
      <span class="trans-icon">${categoryIcons[t.category]}</span>
      <div class="trans-info">
        <div class="trans-desc">${t.desc}</div>
        <div class="trans-meta">${t.category} · ${t.date}</div>
      </div>
      <span class="trans-amount">${t.type === 'income' ? '+' : '-'}₹${t.amount.toFixed(2)}</span>
      <button class="trans-delete" onclick="deleteTransaction(${t.id})">✕</button>
    </li>
  `).join('');
}

function renderBreakdown() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  const byCategory = {};

  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const container = document.getElementById('categoryBreakdown');

  if (Object.keys(byCategory).length === 0) {
    container.innerHTML = '<div class="empty-breakdown">No expenses yet</div>';
    return;
  }

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  container.innerHTML = sorted.map(([cat, amt]) => {
    const pct = total > 0 ? (amt / total * 100).toFixed(1) : 0;
    const color = categoryColors[cat] || '#7c3aed';
    return `
      <div class="category-row">
        <div class="category-info">
          <span class="cat-name">${categoryIcons[cat]} ${cat}</span>
          <span class="cat-amount">₹${amt.toFixed(2)} (${pct}%)</span>
        </div>
        <div class="category-bar-wrap">
          <div class="category-bar" style="width:${pct}%;background:${color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

window.onload = () => {
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  renderAll();
};