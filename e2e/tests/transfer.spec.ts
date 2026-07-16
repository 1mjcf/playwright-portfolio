import { test, expect } from '../fixtures/test';
import { SEED_ACCOUNTS, aud } from '../helpers/testData';

const { checking, travel } = SEED_ACCOUNTS;

test.describe('Transfers', () => {
  test('moves funds between accounts and updates balances', { tag: '@smoke' }, async ({ transferPage, dashboardPage }) => {
    await transferPage.goto();
    await transferPage.sendTransfer({
      fromAccountId: checking.id,
      toAccountId: travel.id,
      amount: 500,
      description: 'Holiday savings',
    });

    await expect(transferPage.successMessage).toContainText(`Transferred ${aud(500)} to ${travel.name}`);

    await dashboardPage.goto();
    await expect(dashboardPage.balanceOf(checking.name)).toHaveText(aud(checking.balance - 500));
    await expect(dashboardPage.balanceOf(travel.name)).toHaveText(aud(travel.balance + 500));
  });

  test('records the transfer in recent transactions', async ({ transferPage, dashboardPage }) => {
    await transferPage.goto();
    await transferPage.sendTransfer({
      fromAccountId: checking.id,
      toAccountId: travel.id,
      amount: 75.5,
      description: 'Rainy day top-up',
    });
    await expect(transferPage.successMessage).toBeVisible();

    await dashboardPage.goto();
    await expect(dashboardPage.transactionRows.first()).toContainText('Rainy day top-up');
  });

  test('blocks transfers that exceed the available balance', async ({ transferPage, dashboardPage }) => {
    await transferPage.goto();
    await transferPage.sendTransfer({
      fromAccountId: travel.id,
      toAccountId: checking.id,
      amount: travel.balance + 1,
    });

    await expect(transferPage.errorMessage).toHaveText('Insufficient funds');

    // Nothing moved.
    await dashboardPage.goto();
    await expect(dashboardPage.balanceOf(travel.name)).toHaveText(aud(travel.balance));
    await expect(dashboardPage.balanceOf(checking.name)).toHaveText(aud(checking.balance));
  });

  test('rejects a transfer to the same account', async ({ transferPage }) => {
    await transferPage.goto();
    await transferPage.sendTransfer({
      fromAccountId: checking.id,
      toAccountId: checking.id,
      amount: 10,
    });

    await expect(transferPage.errorMessage).toHaveText('Cannot transfer to the same account');
  });
});
