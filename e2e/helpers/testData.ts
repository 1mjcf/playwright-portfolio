export const CREDENTIALS = { username: 'demo', password: 'demo123' };

/** Mirrors app/data/seed.js — the state every test starts from after a reset. */
export const SEED_ACCOUNTS = {
  checking: { id: 'acc-checking', name: 'Everyday Checking', balance: 5240.5 },
  savings: { id: 'acc-savings', name: 'High-Interest Saver', balance: 12980 },
  travel: { id: 'acc-travel', name: 'Travel Fund', balance: 860.25 },
} as const;

export const SEED_TRANSACTION_COUNT = 5;

/** Formats a number exactly the way the app does, so assertions stay readable. */
export function aud(amount: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
}
