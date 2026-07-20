# Transaction history — test plan

Produced by the **Playwright test planner** agent (`.claude/agents/playwright-test-planner.md`)
by exploring the live app through Playwright MCP (accessibility snapshots), then reviewed by a
human. Covers `/transactions` — the search / filter / sort surface that previously had no tests.

**Seed:** `tests/seed.spec.ts` — every scenario starts authenticated with a freshly reset data
sandbox (5 seeded transactions across 3 accounts), so scenarios are independent and order-free.

Seeded transactions (newest first), for reference:

| Date (UTC)  | Account            | Description             | Amount     | Type   |
|-------------|--------------------|-------------------------|------------|--------|
| 2026-07-13  | Everyday Checking  | Dinner — Harbour Bistro | -$96.80    | debit  |
| 2026-07-12  | High-Interest Saver| Interest payment        | $38.62     | credit |
| 2026-07-11  | Everyday Checking  | Groceries — FreshMart   | -$212.40   | debit  |
| 2026-07-09  | Everyday Checking  | Rent — July             | -$1,850.00 | debit  |
| 2026-07-08  | Everyday Checking  | Salary — Acme Corp      | $4,200.00  | credit |

> Note: rendered dates are locale/timezone dependent, so scenarios assert on **row order by
> description**, never on the displayed date string.

## 1. Transaction history

### 1.1 Lists every seeded transaction, newest first  `@smoke`
**Steps:**
1. Navigate to the transactions page.
**Expected:**
- Exactly 5 transaction rows are shown.
- Rows are ordered by date descending: `Dinner — Harbour Bistro` first, `Salary — Acme Corp` last.

### 1.2 Search filters by description (case-insensitive substring)
**Steps:**
1. Navigate to the transactions page.
2. Type `rent` into the Search box.
**Expected:**
- Exactly 1 row remains: `Rent — July`.
3. Replace the search text with `GROCER`.
**Expected:**
- Exactly 1 row remains: `Groceries — FreshMart` (match is case-insensitive).

### 1.3 Account filter narrows to one account
**Steps:**
1. Navigate to the transactions page.
2. Select `High-Interest Saver` in the Account dropdown.
**Expected:**
- Exactly 1 row remains: `Interest payment`.

### 1.4 Filtering to an account with no activity shows the empty state
**Steps:**
1. Navigate to the transactions page.
2. Select `Travel Fund` in the Account dropdown.
**Expected:**
- No transaction rows are shown.
- The message `No transactions match your filters.` is visible.

### 1.5 Type filter separates credits from debits
**Steps:**
1. Navigate to the transactions page.
2. Select `Credit` in the Type dropdown.
**Expected:**
- Exactly 2 rows remain: `Interest payment` and `Salary — Acme Corp`.
3. Select `Debit` in the Type dropdown.
**Expected:**
- Exactly 3 rows remain (`Dinner — Harbour Bistro`, `Groceries — FreshMart`, `Rent — July`).

### 1.6 Filters combine (logical AND)
**Steps:**
1. Navigate to the transactions page.
2. Select `Everyday Checking` in the Account dropdown.
3. Select `Credit` in the Type dropdown.
**Expected:**
- Exactly 1 row remains: `Salary — Acme Corp`.

### 1.7 Sorting by amount toggles ascending / descending
**Steps:**
1. Navigate to the transactions page.
2. Click the `Amount` column header.
**Expected:**
- Rows are ordered by amount descending: `$4,200.00, $38.62, -$96.80, -$212.40, -$1,850.00`.
- The header reports `aria-sort="descending"`.
3. Click the `Amount` column header again.
**Expected:**
- Rows are ordered by amount ascending: `-$1,850.00, -$212.40, -$96.80, $38.62, $4,200.00`.
- The header reports `aria-sort="ascending"`.

### 1.8 A search with no matches shows the empty state
**Steps:**
1. Navigate to the transactions page.
2. Type a string that matches nothing (e.g. `zzznomatch`) into the Search box.
**Expected:**
- No transaction rows are shown.
- The message `No transactions match your filters.` is visible.
