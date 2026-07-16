import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
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
