import { defineConfig } from '@playwright/test';

// Browser tests run the show, phones and buzz worker locally: a throwaway
// `wrangler dev` stands in for game-night-buzz, so nothing touches the live room.
export default defineConfig({
  testDir: 'tests/e2e',
  // One at a time: two shows in one room clear each other's questions.
  workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:5179/', viewport: { width: 1180, height: 820 } },
  webServer: [
    { command: 'npx wrangler dev --port 8788 --ip 127.0.0.1', cwd: 'buzz', port: 8788, reuseExistingServer: true },
    {
      command: 'npx vite --port 5179 --strictPort --host 127.0.0.1',
      env: { VITE_BUZZ_API: 'http://127.0.0.1:8788' },
      url: 'http://127.0.0.1:5179/',
      reuseExistingServer: false,
    },
  ],
});
