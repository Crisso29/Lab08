import { test, expect } from '@playwright/test';

test('TC-011: Búsqueda vacía / solo espacios (Edge Case)', async ({ page }) => {

  // navegar a la búsqueda
  await page.goto('https://open.spotify.com/search');

  // esperar el input
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 30000 });

  // escribir SOLO espacios en blanco
  await page.locator('[data-testid="search-input"]').click();
  await page.locator('[data-testid="search-input"]').fill('     ');
  await page.keyboard.press('Enter');

  // esperar 2 segundos
  await page.waitForTimeout(2000);

  // verificar que la URL sigue en /search
  const urlActual = page.url();
  console.log('URL después de buscar espacios:', urlActual);

  await expect(urlActual).toContain('search');

  // verificar que NO hay grid de resultados visible
  const gridResultados = page.locator('[role="grid"][aria-label*="earch"]');
  const hayResultados = await gridResultados.isVisible().catch(() => false);

  console.log('¿Hay resultados visibles?:', hayResultados);

  await expect(hayResultados).toBe(false);

  console.log('✅ TC-011 exitoso: Sistema no ejecuta búsqueda con campo vacío');
});