import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Carpeta donde están todos los tests
  testDir: './E2ETest',

  // Timeout global por test (90 segundos porque Spotify es lento)
  timeout: 90000,

  // Si un test falla, se reintenta 2 veces (retry automático)
  retries: 2,

  // Un solo worker para evitar problemas de sesión concurrente
  workers: 1,

  // Reportes: HTML + JSON + terminal
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/resultados.json' }],
    ['list'],
  ],

  use: {
    // URL base para no repetirla en cada test
    baseURL: 'https://open.spotify.com',

    // Ver el navegador (no headless)
    headless: false,

    // Idioma español
    locale: 'es-ES',

    // Tamaño de ventana
    viewport: { width: 1280, height: 720 },

    // Argumento anti-detección de bots
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled'],
    },

    // Screenshots y videos solo cuando falla
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ────────────── PROYECTO 1: Setup de login (corre PRIMERO) ──────────────
    {
      name: 'setup',
      testMatch: /auth\/login\.setup\.ts/,
    },

    // ────────────── PROYECTO 2: Tests de Playlist ──────────────
    {
      name: 'playlist',
      testMatch: /Playlist\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        // Carga la sesión guardada por el setup
        storageState: 'E2ETest/auth/spotify_state.json',
      },
    },

    // ────────────── PROYECTO 3: Tests de Búsqueda ──────────────
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