import { defineConfig, devices } from '@playwright/test';
import type { Fixtures } from './src/fixtures/test';

const isCI = Boolean(process.env.CI);
export default defineConfig<Fixtures>({
  testDir: './tests',
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://practicesoftwaretesting.com',
    apiURL: 'https://api.practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
