import { test, expect } from '@playwright/test';

test('TC-007: Búsqueda válida "Dua Lipa" (PE-Válida)', async ({ page }) => {

  // navegar directamente a la página de búsqueda
  await page.goto('https://open.spotify.com/search');

  // esperar a que aparezca el input de búsqueda
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 30000 });

  // hacer clic en el input y escribir "Dua Lipa"
  await page.locator('[data-testid="search-input"]').click();
  await page.locator('[data-testid="search-input"]').fill('Dua Lipa');

  // presionar Enter para ejecutar la búsqueda
  await page.keyboard.press('Enter');

  // esperar a que aparezca al menos un resultado con el texto "Dua Lipa"
  await page.getByText('Dua Lipa').first().waitFor({ state: 'visible', timeout: 20000 });

  // verificar que el nombre del artista aparece en los resultados
  const dualipaVisible = await page.getByText('Dua Lipa').first().isVisible();
  console.log('¿"Dua Lipa" visible en resultados?:', dualipaVisible);

  await expect(page.getByText('Dua Lipa').first()).toBeVisible();

  console.log('✅ TC-007 exitoso: Búsqueda válida retorna resultados relevantes');
});