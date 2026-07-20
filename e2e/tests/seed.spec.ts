// Seed for the Playwright Test Agents (planner / generator / healer).
//
// The agents run this test to bootstrap the environment before planning or
// generating. It intentionally reuses the suite's custom fixtures (see
// fixtures/test.ts), so every generated test inherits worker-scoped auth and a
// freshly reset per-session data sandbox — i.e. it starts signed in with the
// five seeded transactions in place.
import { test, expect } from '../fixtures/test';
import { SEED_TRANSACTION_COUNT } from '../helpers/testData';

test('seed', async ({ transactionsPage }) => {
  await transactionsPage.goto();
  await expect(transactionsPage.rows).toHaveCount(SEED_TRANSACTION_COUNT);
});
