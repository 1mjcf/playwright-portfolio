// spec: specs/transactions.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures/test';
import { SEED_ACCOUNTS, SEED_TRANSACTIONS, SEED_TRANSACTION_COUNT, aud } from '../helpers/testData';

const T = SEED_TRANSACTIONS;

test.describe('Transaction history', () => {
  test('lists every seeded transaction, newest first', { tag: '@smoke' }, async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await expect(transactionsPage.rows).toHaveCount(SEED_TRANSACTION_COUNT);
    // Default order is date descending.
    await expect(transactionsPage.descriptions).toHaveText([
      T.dinner.description,
      T.interest.description,
      T.groceries.description,
      T.rent.description,
      T.salary.description,
    ]);
  });

  test('search filters by description (case-insensitive substring)', async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await transactionsPage.search('rent');
    await expect(transactionsPage.descriptions).toHaveText([T.rent.description]);

    await transactionsPage.search('GROCER');
    await expect(transactionsPage.descriptions).toHaveText([T.groceries.description]);
  });

  test('account filter narrows to a single account', async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await transactionsPage.filterByAccount(SEED_ACCOUNTS.savings.id);
    await expect(transactionsPage.descriptions).toHaveText([T.interest.description]);
  });

  test('filtering to an account with no activity shows the empty state', async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await transactionsPage.filterByAccount(SEED_ACCOUNTS.travel.id);

    await expect(transactionsPage.rows).toHaveCount(0);
    await expect(transactionsPage.emptyState).toBeVisible();
    await expect(transactionsPage.emptyState).toHaveText('No transactions match your filters.');
  });

  test('type filter separates credits from debits', async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await transactionsPage.filterByType('credit');
    await expect(transactionsPage.descriptions).toHaveText([T.interest.description, T.salary.description]);

    await transactionsPage.filterByType('debit');
    await expect(transactionsPage.descriptions).toHaveText([
      T.dinner.description,
      T.groceries.description,
      T.rent.description,
    ]);
  });

  test('filters combine with logical AND', async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await transactionsPage.filterByAccount(SEED_ACCOUNTS.checking.id);
    await transactionsPage.filterByType('credit');

    await expect(transactionsPage.descriptions).toHaveText([T.salary.description]);
  });

  test('sorting by amount toggles descending then ascending', async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await transactionsPage.sortByAmount.click();
    await expect(transactionsPage.sortByAmount).toHaveAttribute('aria-sort', 'descending');
    await expect(transactionsPage.amounts).toHaveText([
      aud(T.salary.amount),
      aud(T.interest.amount),
      aud(T.dinner.amount),
      aud(T.groceries.amount),
      aud(T.rent.amount),
    ]);

    await transactionsPage.sortByAmount.click();
    await expect(transactionsPage.sortByAmount).toHaveAttribute('aria-sort', 'ascending');
    await expect(transactionsPage.amounts).toHaveText([
      aud(T.rent.amount),
      aud(T.groceries.amount),
      aud(T.dinner.amount),
      aud(T.interest.amount),
      aud(T.salary.amount),
    ]);
  });

  test('a search with no matches shows the empty state', async ({ transactionsPage }) => {
    await transactionsPage.goto();

    await transactionsPage.search('zzznomatch');

    await expect(transactionsPage.rows).toHaveCount(0);
    await expect(transactionsPage.emptyState).toBeVisible();
    await expect(transactionsPage.emptyState).toHaveText('No transactions match your filters.');
  });
});
