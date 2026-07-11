import { test, expect } from '@playwright/test';

test('TC-010: Cadena de 800 caracteres (PE-Inválida)', async ({ page }) => {

  // generar cadena excesivamente larga
  const cadenaExcesiva = 'Z'.repeat(800);

  // navegar a la búsqueda
  await page.goto('https://open.spotify.com/search');

  // esperar el input
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 30000 });

  // pegar la cadena de 800 caracteres
  await page.locator('[data-testid="search-input"]').click();
  await page.locator('[data-testid="search-input"]').fill(cadenaExcesiva);
  await page.keyboard.press('Enter');

  // esperar 3 segundos
  await page.waitForTimeout(3000);

  // verificar que la página NO crasheó
  const urlActual = page.url();
  console.log('Longitud cadena ingresada:', cadenaExcesiva.length);
  console.log('URL actual:', urlActual);

  await expect(urlActual).toContain('spotify.com');

  // verificar que el input sigue funcional
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

  // ver cuánto del texto quedó realmente (probablemente Spotify lo truncó)
  const valorInput = await page.locator('[data-testid="search-input"]').inputValue();
  console.log('Longitud valor guardado:', valorInput.length);

  console.log('✅ TC-010 exitoso: Sistema maneja cadena excesiva sin crashear');
});