'use strict';

const { USERS, seedAccounts, seedTransactions } = require('./seed');

// A tiny in-memory database. No disk, no dependencies — data lives for the
// life of the process. Each Collection owns its own rows and hands out copies
// on read, so callers can never mutate stored state by accident; writes go
// through insert()/update() only.
//
// server.js creates one Database per session (see createSessionDb), which keeps
// parallel Playwright workers fully isolated from each other.
class Collection {
  #rows;
  #key;

  constructor(rows = [], key = 'id') {
    this.#key = key;
    this.#rows = rows.map((row) => ({ ...row }));
  }

  // All rows, as copies.
  all() {
    return this.#rows.map((row) => ({ ...row }));
  }

  // Single row by primary key, or null. Returns a copy.
  find(id) {
    const row = this.#rows.find((r) => r[this.#key] === id);
    return row ? { ...row } : null;
  }

  // Rows matching a predicate, as copies.
  where(predicate) {
    return this.#rows.filter(predicate).map((row) => ({ ...row }));
  }

  // Rows sorted by the given comparator, as copies. The comparator sees copies,
  // so it cannot mutate stored rows either.
  sort(comparator) {
    return this.all().sort(comparator);
  }

  // Append a row. Returns a copy of the inserted row.
  insert(row) {
    const stored = { ...row };
    this.#rows.push(stored);
    return { ...stored };
  }

  // Patch a row by primary key. Returns the updated row (copy), or null if the
  // key does not exist.
  update(id, patch) {
    const row = this.#rows.find((r) => r[this.#key] === id);
    if (!row) return null;
    Object.assign(row, patch);
    return { ...row };
  }

  get length() {
    return this.#rows.length;
  }
}

// A fresh, fully-seeded database for one session. Reseeding on every call is
// what gives each session (and therefore each parallel test worker) its own
// isolated copy of the data.
function createSessionDb() {
  return {
    accounts: new Collection(seedAccounts()),
    transactions: new Collection(seedTransactions()),
  };
}

// Users are shared across sessions and only ever read (for login), so they live
// outside the per-session database.
const users = new Collection(USERS, 'username');

// Returns a sanitized user (no password) on a credential match, else null.
function authenticate(username, password) {
  const [user] = users.where((u) => u.username === username && u.password === password);
  return user ? { username: user.username, displayName: user.displayName } : null;
}

module.exports = { Collection, createSessionDb, authenticate };
