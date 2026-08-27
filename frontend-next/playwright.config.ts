import { defineConfig, devices } from '@playwright/test';

const isUiMode = process.argv.some((arg) => arg === '--ui' || arg.startsWith('--ui-port'));
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results',
  fullyParallel: !isUiMode,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isUiMode ? 1 : isCI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:3003',
    trace: isUiMode || !isCI ? 'on' : 'on-first-retry',
    screenshot: isUiMode ? 'on' : 'only-on-failure',
    video: isUiMode ? 'on' : 'off',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3003',
    url: 'http://127.0.0.1:3003',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: isCI && !isUiMode,
      },
    },
  ],
});
