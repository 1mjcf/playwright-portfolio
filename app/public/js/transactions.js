'use strict';

requireAuth();
initHeader();

const tbody = document.querySelector('#transactions-body');
const emptyEl = document.querySelector('[data-testid="transactions-empty"]');
const searchInput = document.querySelector('#filter-search');
const accountSelect = document.querySelector('#filter-account');
const typeSelect = document.querySelector('#filter-type');

let transactions = [];
let accountNames = new Map();
const filters = { search: '', account: 'all', type: 'all' };
const sort = { key: 'date', dir: 'desc' };

function applyFilters() {
  const search = filters.search.trim().toLowerCase();
  return transactions.filter((txn) => {
    if (filters.account !== 'all' && txn.accountId !== filters.account) return false;
    if (filters.type !== 'all' && txn.type !== filters.type) return false;
    if (search && !txn.description.toLowerCase().includes(search)) return false;
    return true;
  });
}

function applySort(rows) {
  const dir = sort.dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => {
    if (sort.key === 'amount') return (a.amount - b.amount) * dir;
    return a.date.localeCompare(b.date) * dir;
  });
}

function render() {
  const rows = applySort(applyFilters());
  tbody.innerHTML = '';
  emptyEl.classList.toggle('hidden', rows.length > 0);

  for (const txn of rows) {
    const row = document.createElement('tr');
    row.dataset.testid = 'transaction-row';
    const kind = txn.amount >= 0 ? 'credit' : 'debit';

    const dateCell = document.createElement('td');
    dateCell.textContent = new Date(txn.date).toLocaleDateString('en-AU');

    const accountCell = document.createElement('td');
    accountCell.textContent = accountNames.get(txn.accountId) || txn.accountId;

    const descCell = document.createElement('td');
    descCell.textContent = txn.description;

    const amountCell = document.createElement('td');
    amountCell.className = `amount ${kind}`;
    amountCell.textContent = formatMoney(txn.amount);

    row.append(dateCell, accountCell, descCell, amountCell);
    tbody.appendChild(row);
  }

  for (const th of document.querySelectorAll('th.sortable')) {
    const active = th.dataset.sort === sort.key;
    th.dataset.dir = active ? sort.dir : '';
    th.setAttribute('aria-sort', active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none');
  }
}

async function load() {
  const [txns, accounts] = await Promise.all([
    apiFetch('/api/transactions'),
    apiFetch('/api/accounts'),
  ]);
  transactions = txns;
  accountNames = new Map(accounts.map((a) => [a.id, a.name]));

  accountSelect.innerHTML = '<option value="all">All accounts</option>';
  for (const account of accounts) {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    accountSelect.appendChild(option);
  }

  render();
}

searchInput.addEventListener('input', () => { filters.search = searchInput.value; render(); });
accountSelect.addEventListener('change', () => { filters.account = accountSelect.value; render(); });
typeSelect.addEventListener('change', () => { filters.type = typeSelect.value; render(); });

for (const th of document.querySelectorAll('th.sortable')) {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      sort.key = key;
      sort.dir = 'desc';
    }
    render();
  });
}

load();
