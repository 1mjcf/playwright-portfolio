import { test, expect } from '../fixtures/test';
import { CREDENTIALS } from '../helpers/testData';

// Authentication is under test here, so opt out of the shared signed-in state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  test('signs in with valid credentials', { tag: '@smoke' }, async ({ loginPage, dashboardPage, page }) => {
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);

    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.userName).toHaveText('Demo User');
  });

  test('rejects invalid credentials', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, 'not-the-password');

    await expect(loginPage.errorMessage).toHaveText('Invalid username or password');
    await expect(page).toHaveURL('/');
  });

  test('redirects unauthenticated visitors to the login page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });

  test('logging out ends the session', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.goto();
    await loginPage.login(CREDENTIALS.username, CREDENTIALS.password);
    await expect(page).toHaveURL('/dashboard');

    await dashboardPage.logout();
    await expect(page).toHaveURL('/');

    // The session really is gone: protected pages bounce back to login.
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });
});
