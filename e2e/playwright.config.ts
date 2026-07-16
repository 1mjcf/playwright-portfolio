import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['github'],
        // Rules-based analysis only in CI: no API key required, no network calls.
        // Output/history dirs are set per-step via PW_ORACLE_* env vars.
        ['playwright-oracle-reporter', { openReport: false, aiMode: 'rules' }],
        ['html', { open: 'never' }],
      ]
    : [
        ['list'],
        ['playwright-oracle-reporter', { openReport: false }],
        ['html', { open: 'never' }],
      ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Locally, Playwright boots the app itself. In CI the app is already
  // running in Docker (docker compose up --wait), so no webServer is needed.
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm start --prefix ../app',
        url: `${baseURL}/health`,
        reuseExistingServer: true,
        env: { ENABLE_TEST_ROUTES: 'true' },
      },
});
