import { test as base, expect, request, type APIRequestContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { CREDENTIALS } from '../helpers/testData';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TransferPage } from '../pages/TransferPage';
import { TransactionsPage } from '../pages/TransactionsPage';

interface WorkerAuth {
  storageStatePath: string;
  token: string;
}

interface TestFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  transferPage: TransferPage;
  transactionsPage: TransactionsPage;
  /** APIRequestContext pre-authenticated with this worker's token. */
  api: APIRequestContext;
  /** Auto fixture: resets this worker's server-side sandbox before every test. */
  resetData: void;
}

interface WorkerFixtures {
  workerAuth: WorkerAuth;
}

/**
 * Auth strategy: each parallel worker logs in once via the API and saves a
 * storageState file. The server keeps a sandboxed data set per token, so
 * workers can mutate data (transfers, resets) without racing each other.
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  workerAuth: [
    async ({ browser }, use, workerInfo) => {
      const baseURL = workerInfo.project.use.baseURL!;
      const storageStatePath = path.join(
        workerInfo.project.outputDir,
        `.auth/worker-${workerInfo.parallelIndex}.json`,
      );
      fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

      const context = await browser.newContext({ baseURL });
      const response = await context.request.post('/api/login', { data: CREDENTIALS });
      if (!response.ok()) {
        throw new Error(`Worker login failed: ${response.status()} ${await response.text()}`);
      }
      const { token, user } = await response.json();

      // localStorage is per-origin, so visit the app before writing the token.
      const page = await context.newPage();
      await page.goto('/');
      await page.evaluate(
        ([tokenValue, displayName]) => {
          localStorage.setItem('finbank.token', tokenValue);
          localStorage.setItem('finbank.user', displayName);
        },
        [token as string, user.displayName as string],
      );
      await context.storageState({ path: storageStatePath });
      await context.close();

      await use({ storageStatePath, token });
    },
    { scope: 'worker' },
  ],

  // Every page/context in this worker starts already signed in.
  storageState: async ({ workerAuth }, use) => {
    await use(workerAuth.storageStatePath);
  },

  api: async ({ workerAuth }, use, testInfo) => {
    const context = await request.newContext({
      baseURL: testInfo.project.use.baseURL,
      extraHTTPHeaders: { Authorization: `Bearer ${workerAuth.token}` },
    });
    await use(context);
    await context.dispose();
  },

  resetData: [
    async ({ api }, use) => {
      const response = await api.post('/api/test/reset');
      expect(response.ok(), 'test data reset should succeed').toBeTruthy();
      await use();
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  transferPage: async ({ page }, use) => {
    await use(new TransferPage(page));
  },

  transactionsPage: async ({ page }, use) => {
    await use(new TransactionsPage(page));
  },
});

export { expect };
