import { test, expect } from '@playwright/test';

test('TC-006: Nombre vacío (Edge Case)', async ({ page }) => {

  // navegar al home
  await page.goto('https://open.spotify.com/');

  // esperar a que cargue
  await expect(page.locator('[aria-label="Crear"]')).toBeVisible({ timeout: 30000 });

  // crear playlist nueva
  await page.locator('[aria-label="Crear"]').click();
  await page.locator('[aria-describedby="subtitle-global-create-playlist"]').click();

  // esperar el título
  await expect(page.locator('h1.encore-text-headline-large')).toBeVisible();

  // abrir editor
  await page.locator('h1.encore-text-headline-large').click();

  // limpiar el campo nombre (dejar vacío)
  await page.locator('[data-testid="playlist-edit-details-name-input"]').fill('');

  // intentar guardar con el nombre vacío
  await page.getByRole('button', { name: 'Guardar' }).click();

  // esperar 1 segundo a que aparezca el mensaje de error
  await page.waitForTimeout(1000);

  // verificar que aparece el mensaje de error obligatorio
  const mensajeError = page.getByText('El nombre de la lista de reproducción es obligatorio');
  await expect(mensajeError).toBeVisible({ timeout: 5000 });

  console.log('✅ TC-006 exitoso: Sistema muestra mensaje de error cuando el nombre está vacío');
});