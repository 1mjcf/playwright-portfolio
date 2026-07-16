import { test, expect } from '../fixtures/test';
import { MOCK_RATES } from '../mocks/rates';
import { SEED_ACCOUNTS } from '../helpers/testData';

/**
 * The FX rates widget calls a third-party provider (`GET /api/rates`).
 * These tests never touch the real service — Playwright intercepts the
 * request at the network layer so every scenario (happy path, outage,
 * network failure) is deterministic.
 */
test.describe('FX rates widget (provider mocked)', () => {
  test('renders the rates returned by the provider', async ({ page, dashboardPage }) => {
    await page.route('**/api/rates', (route) => route.fulfill({ json: MOCK_RATES }));

    await dashboardPage.goto();

    await expect(dashboardPage.rateRows).toHaveCount(Object.keys(MOCK_RATES.rates).length);
    await expect(dashboardPage.rateFor('USD')).toContainText('0.9900');
    await expect(dashboardPage.rateFor('EUR')).toContainText('0.8800');
    await expect(dashboardPage.rateFor('GBP')).toContainText('0.7700');
  });

  test('degrades gracefully when the provider returns an error', async ({ page, dashboardPage }) => {
    await page.route('**/api/rates', (route) =>
      route.fulfill({ status: 503, json: { error: 'upstream unavailable' } }),
    );

    await dashboardPage.goto();

    await expect(dashboardPage.ratesError).toHaveText('Exchange rates are currently unavailable.');
    // The outage is contained — the rest of the dashboard still works.
    await expect(dashboardPage.accountCards).toHaveCount(Object.keys(SEED_ACCOUNTS).length);
  });

  test('degrades gracefully when the request fails at the network level', async ({ page, dashboardPage }) => {
    await page.route('**/api/rates', (route) => route.abort('connectionrefused'));

    await dashboardPage.goto();

    await expect(dashboardPage.ratesError).toHaveText('Exchange rates are currently unavailable.');
  });
});
