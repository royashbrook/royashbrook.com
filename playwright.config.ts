import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:4277', browserName: 'chromium' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4277',
    url: 'http://127.0.0.1:4277',
    reuseExistingServer: !process.env.CI,
  },
});
