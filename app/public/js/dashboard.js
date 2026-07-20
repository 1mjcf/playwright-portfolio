'use strict';

requireAuth();
initHeader();

async function loadAccounts() {
  const accounts = await apiFetch('/api/accounts');
  const grid = document.querySelector('#accounts-grid');
  grid.innerHTML = '';
  for (const account of accounts) {
    const card = document.createElement('article');
    card.className = 'card account-card';
    card.dataset.testid = 'account-card';

    const nameEl = document.createElement('h3');
    nameEl.textContent = account.name;

    const numberEl = document.createElement('p');
    numberEl.className = 'account-number';
    numberEl.textContent = account.number;

    const balanceEl = document.createElement('p');
    balanceEl.className = 'balance';
    balanceEl.dataset.testid = 'account-balance';
    balanceEl.textContent = formatMoney(account.balance);

    card.append(nameEl, numberEl, balanceEl);
    grid.appendChild(card);
  }
}

async function loadTransactions() {
  const transactions = await apiFetch('/api/transactions');
  const tbody = document.querySelector('#transactions-body');
  tbody.innerHTML = '';
  for (const txn of transactions) {
    const row = document.createElement('tr');
    row.dataset.testid = 'transaction-row';
    const kind = txn.amount >= 0 ? 'credit' : 'debit';

    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(txn.date).toLocaleDateString('en-AU');

    const descCell = document.createElement('td');
    descCell.textContent = txn.description;

    const amountCell = document.createElement('td');
    amountCell.className = `amount ${kind}`;
    amountCell.textContent = formatMoney(txn.amount);

    row.append(dateCell, descCell, amountCell);
    tbody.appendChild(row);
  }
}

async function loadRates() {
  const loading = document.querySelector('[data-testid="rates-loading"]');
  const error = document.querySelector('[data-testid="rates-error"]');
  const list = document.querySelector('#rates-list');

  loading.classList.remove('hidden');
  error.classList.add('hidden');
  list.innerHTML = '';

  try {
    const res = await fetch('/api/rates');
    if (!res.ok) throw new Error(`FX provider returned ${res.status}`);
    const data = await res.json();
    for (const [currency, rate] of Object.entries(data.rates)) {
      const item = document.createElement('li');
      item.dataset.testid = 'rate-row';
      item.dataset.currency = currency;
      item.innerHTML = `
        <span>${data.base}/${currency}</span>
        <span data-testid="rate-value">${Number(rate).toFixed(4)}</span>
      `;
      list.appendChild(item);
    }
  } catch {
    error.textContent = 'Exchange rates are currently unavailable.';
    error.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
  }
}

loadAccounts();
loadTransactions();
loadRates();
