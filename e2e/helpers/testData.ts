export const CREDENTIALS = { username: 'demo', password: 'demo123' };

/** Mirrors app/data/seed.js — the state every test starts from after a reset. */
export const SEED_ACCOUNTS = {
  checking: { id: 'acc-checking', name: 'Everyday Checking', balance: 5240.5 },
  savings: { id: 'acc-savings', name: 'High-Interest Saver', balance: 12980 },
  travel: { id: 'acc-travel', name: 'Travel Fund', balance: 860.25 },
} as const;

export const SEED_TRANSACTION_COUNT = 5;

/** Mirrors app/data/seed.js — seeded transactions, newest first (the order the API returns). */
export const SEED_TRANSACTIONS = {
  dinner: { description: 'Dinner — Harbour Bistro', amount: -96.8, type: 'debit', accountId: SEED_ACCOUNTS.checking.id },
  interest: { description: 'Interest payment', amount: 38.62, type: 'credit', accountId: SEED_ACCOUNTS.savings.id },
  groceries: { description: 'Groceries — FreshMart', amount: -212.4, type: 'debit', accountId: SEED_ACCOUNTS.checking.id },
  rent: { description: 'Rent — July', amount: -1850, type: 'debit', accountId: SEED_ACCOUNTS.checking.id },
  salary: { description: 'Salary — Acme Corp', amount: 4200, type: 'credit', accountId: SEED_ACCOUNTS.checking.id },
} as const;

/** Formats a number exactly the way the app does, so assertions stay readable. */
export function aud(amount: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}
