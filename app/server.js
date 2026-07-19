'use strict';

const express = require('express');
const crypto = require('node:crypto');
const path = require('node:path');
const { BASE_RATES } = require('./data/seed');
const { createSessionDb, authenticate } = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;
const ENABLE_TEST_ROUTES = process.env.ENABLE_TEST_ROUTES === 'true';

app.use(express.json());

// token -> { username, displayName, db }
// Each session gets its own sandboxed copy of the data, so parallel test
// workers (each holding their own token) never interfere with each other.
const sessions = new Map();

const round2 = (n) => Math.round(n * 100) / 100;

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};
  const user = authenticate(username, password);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const token = crypto.randomUUID();
  sessions.set(token, { username: user.username, displayName: user.displayName, db: createSessionDb() });
  res.json({ token, user });
});

function auth(req, res, next) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.session = session;
  next();
}

app.get('/api/accounts', auth, (req, res) => res.json(req.session.db.accounts.all()));

app.get('/api/transactions', auth, (req, res) => {
  const sorted = req.session.db.transactions.sort((a, b) => b.date.localeCompare(a.date));
  res.json(sorted);
});

app.post('/api/transfers', auth, (req, res) => {
  const { fromAccountId, toAccountId, amount, description } = req.body ?? {};
  const { db } = req.session;
  const from = db.accounts.find(fromAccountId);
  const to = db.accounts.find(toAccountId);
  const value = Number(amount);

  if (!from || !to) return res.status(404).json({ error: 'Account not found' });
  if (from.id === to.id) return res.status(422).json({ error: 'Cannot transfer to the same account' });
  if (!Number.isFinite(value) || value <= 0) return res.status(422).json({ error: 'Amount must be greater than zero' });
  if (value > from.balance) return res.status(422).json({ error: 'Insufficient funds' });

  db.accounts.update(from.id, { balance: round2(from.balance - value) });
  db.accounts.update(to.id, { balance: round2(to.balance + value) });

  const now = new Date().toISOString();
  const transferId = `txn-${crypto.randomUUID().slice(0, 8)}`;
  db.transactions.insert({ id: `${transferId}-out`, date: now, accountId: from.id, description: description || `Transfer to ${to.name}`, amount: -value, type: 'debit' });
  db.transactions.insert({ id: `${transferId}-in`, date: now, accountId: to.id, description: description || `Transfer from ${from.name}`, amount: value, type: 'credit' });

  res.status(201).json({
    transfer: { id: transferId, fromAccountId, toAccountId, amount: value, date: now },
    accounts: db.accounts.all(),
  });
});

// Simulated third-party FX provider. Deliberately slow so the UI has a real
// loading state — and so tests have a good reason to mock it.
app.get('/api/rates', (_req, res) => {
  setTimeout(() => {
    res.json({
      base: 'AUD',
      provider: 'GlobalFX (simulated)',
      fetchedAt: new Date().toISOString(),
      rates: BASE_RATES,
    });
  }, 400);
});

if (ENABLE_TEST_ROUTES) {
  // Resets only the calling session's sandbox — parallel workers stay isolated.
  app.post('/api/test/reset', auth, (req, res) => {
    req.session.db = createSessionDb();
    res.json({ ok: true });
  });
}

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/dashboard', (_req, res) => res.sendFile(path.join(publicDir, 'dashboard.html')));
app.get('/transfer', (_req, res) => res.sendFile(path.join(publicDir, 'transfer.html')));

app.listen(PORT, () => {
  console.log(`FinBank listening on http://localhost:${PORT} (test routes ${ENABLE_TEST_ROUTES ? 'enabled' : 'disabled'})`);
});
