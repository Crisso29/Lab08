import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './E2ETest',
  timeout: 90000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/resultados.json' }],
    ['list'],
  ],

  use: {
    baseURL: 'https://open.spotify.com',
    // En CI (GitHub Actions) corre headless, en local se ve el navegador
    headless: !!process.env.CI,
    locale: 'es-ES',
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled'],
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\/login\.setup\.ts/,
    },
    {
      name: 'playlist',
      testMatch: /Playlist\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'E2ETest/auth/spotify_state.json',
      },
    },
    {
      name: 'busqueda',
      testMatch: /Busqueda\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'E2ETest/auth/spotify_state.json',
      },
    },
  ],
});