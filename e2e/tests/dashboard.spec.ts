import { test, expect } from '../fixtures/test';
import { SEED_ACCOUNTS, SEED_TRANSACTION_COUNT, aud } from '../helpers/testData';

test.describe('Dashboard', () => {
  test('shows every seeded account with its formatted balance', { tag: '@smoke' }, async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.accountCards).toHaveCount(Object.keys(SEED_ACCOUNTS).length);
    for (const account of Object.values(SEED_ACCOUNTS)) {
      await expect(dashboardPage.balanceOf(account.name)).toHaveText(aud(account.balance));
    }
  });

  test('lists recent transactions, newest first', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.transactionRows).toHaveCount(SEED_TRANSACTION_COUNT);
    await expect(dashboardPage.transactionRows.first()).toContainText('Dinner — Harbour Bistro');
    await expect(dashboardPage.transactionRows.last()).toContainText('Salary — Acme Corp');
  });
});
