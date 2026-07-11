import { test, expect } from '@playwright/test';

test('TC-009: Término regional "Vinchos Ayacucho" (PE-Inválida)', async ({ page }) => {

  // término regional muy específico
  const terminoRegional = 'Vinchos Ayacucho';

  // navegar a la búsqueda
  await page.goto('https://open.spotify.com/search');

  // esperar el input
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 30000 });

  // buscar el término regional
  await page.locator('[data-testid="search-input"]').click();
  await page.locator('[data-testid="search-input"]').fill(terminoRegional);
  await page.keyboard.press('Enter');

  // esperar 3 segundos
  await page.waitForTimeout(3000);

  // verificar que la URL sigue en /search (no crasheó)
  const urlActual = page.url();
  console.log('Término buscado:', terminoRegional);
  console.log('URL actual:', urlActual);

  await expect(urlActual).toContain('search');

  // verificar que el input sigue visible (sistema estable)
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

  console.log('✅ TC-009 exitoso: Sistema responde sin errores ante término regional');
});