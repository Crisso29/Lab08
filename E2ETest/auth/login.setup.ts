import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Ruta ABSOLUTA al archivo de sesión
const authFile = path.join(process.cwd(), 'E2ETest', 'auth', 'spotify_state.json');

setup('autenticar en Spotify', async ({ page }) => {

  // ─── VERIFICAR SI YA HAY SESIÓN GUARDADA ───
  if (fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile);
    // Si el archivo pesa más de 5 KB, la sesión es válida
    if (stats.size > 5000) {
      console.log('\n✅ Sesión ya guardada previamente, saltando login...');
      console.log(`📁 Archivo: ${authFile}`);
      console.log(`📊 Tamaño: ${stats.size} bytes\n`);
      return; // ← se salta el login
    }
  }

  // ─── SI NO HAY SESIÓN, PEDIR LOGIN MANUAL ───
  await page.goto('https://accounts.spotify.com/login');

  console.log('\n══════════════════════════════════════════════════════');
  console.log('🔑 INICIA SESIÓN MANUALMENTE EN CHROMIUM');
  console.log('══════════════════════════════════════════════════════');
  console.log('⏳ Tienes 3 minutos para completar el login...\n');

  await page.waitForURL('https://open.spotify.com/**', { timeout: 180000 });
  await expect(page.locator('[aria-label="Crear"]')).toBeVisible({ timeout: 30000 });

  console.log('\n✅ Login exitoso, guardando sesión...');

  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.context().storageState({ path: authFile });

  const stats = fs.statSync(authFile);
  console.log(`✅ Sesión guardada: ${stats.size} bytes\n`);
});