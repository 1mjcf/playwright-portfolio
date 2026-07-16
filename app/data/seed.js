'use strict';

const USERS = [
  { username: 'demo', password: 'demo123', displayName: 'Demo User' },
];

// Rates quoted against AUD by the simulated third-party FX provider.
const BASE_RATES = {
  USD: 0.6621,
  EUR: 0.6114,
  GBP: 0.5237,
  JPY: 97.84,
};

function seedAccounts() {
  return [
    { id: 'acc-checking', name: 'Everyday Checking', number: 'XXX-XXX 1042', balance: 5240.5, currency: 'AUD' },
    { id: 'acc-savings', name: 'High-Interest Saver', number: 'XXX-XXX 2205', balance: 12980, currency: 'AUD' },
    { id: 'acc-travel', name: 'Travel Fund', number: 'XXX-XXX 3417', balance: 860.25, currency: 'AUD' },
  ];
}

function seedTransactions() {
  return [
    { id: 'txn-0001', date: '2026-07-08T09:15:00Z', accountId: 'acc-checking', description: 'Salary — Acme Corp', amount: 4200, type: 'credit' },
    { id: 'txn-0002', date: '2026-07-09T11:42:00Z', accountId: 'acc-checking', description: 'Rent — July', amount: -1850, type: 'debit' },
    { id: 'txn-0003', date: '2026-07-11T08:03:00Z', accountId: 'acc-checking', description: 'Groceries — FreshMart', amount: -212.4, type: 'debit' },
    { id: 'txn-0004', date: '2026-07-12T14:27:00Z', accountId: 'acc-savings', description: 'Interest payment', amount: 38.62, type: 'credit' },
    { id: 'txn-0005', date: '2026-07-13T19:55:00Z', accountId: 'acc-checking', description: 'Dinner — Harbour Bistro', amount: -96.8, type: 'debit' },
  ];
}

module.exports = { USERS, BASE_RATES, seedAccounts, seedTransactions };
