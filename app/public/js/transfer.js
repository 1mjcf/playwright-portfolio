'use strict';

requireAuth();
initHeader();

const form = document.querySelector('#transfer-form');
const fromSelect = document.querySelector('#from-account');
const toSelect = document.querySelector('#to-account');
const successEl = document.querySelector('[data-testid="transfer-success"]');
const errorEl = document.querySelector('[data-testid="transfer-error"]');

async function loadAccounts() {
  const accounts = await apiFetch('/api/accounts');
  for (const select of [fromSelect, toSelect]) {
    const previous = select.value;
    select.innerHTML = '';
    for (const account of accounts) {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = `${account.name} — ${formatMoney(account.balance)}`;
      select.appendChild(option);
    }
    if (previous) select.value = previous;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  successEl.classList.add('hidden');
  errorEl.classList.add('hidden');

  try {
    const result = await apiFetch('/api/transfers', {
      method: 'POST',
      body: JSON.stringify({
        fromAccountId: fromSelect.value,
        toAccountId: toSelect.value,
        amount: Number(document.querySelector('#amount').value),
        description: document.querySelector('#description').value,
      }),
    });
    const to = result.accounts.find((a) => a.id === result.transfer.toAccountId);
    successEl.textContent = `Transferred ${formatMoney(result.transfer.amount)} to ${to.name}.`;
    successEl.classList.remove('hidden');
    document.querySelector('#amount').value = '';
    document.querySelector('#description').value = '';
    await loadAccounts();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

loadAccounts();
