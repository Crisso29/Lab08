import { test, expect } from '@playwright/test';

test('TC-003: Descripción excede 300 caracteres (PE-Inválida)', async ({ page }) => {

  // generar cadena de 500 caracteres (excede el límite de 300)
  const descripcionLarga = 'A'.repeat(500);

  // navegar al home de Spotify
  await page.goto('https://open.spotify.com/');

  // esperar a que cargue el botón "Crear"
  await expect(page.locator('[aria-label="Crear"]')).toBeVisible({ timeout: 30000 });

  // crear una playlist nueva
  await page.locator('[aria-label="Crear"]').click();
  await page.locator('[aria-describedby="subtitle-global-create-playlist"]').click();

  // esperar que cargue la playlist recién creada
  await expect(page.locator('h1.encore-text-headline-large')).toBeVisible();

  // abrir el editor haciendo clic en el título
  await page.locator('h1.encore-text-headline-large').click();

  // escribir un nombre válido
  await page.locator('[data-testid="playlist-edit-details-name-input"]').fill('Test descripcion larga');

  // intentar escribir 500 caracteres en la descripción
  await page.locator('[data-testid="playlist-edit-details-description-input"]').fill(descripcionLarga);

  // obtener el valor que realmente quedó guardado en el input
  const valorGuardado = await page.locator('[data-testid="playlist-edit-details-description-input"]').inputValue();

  // imprimir en consola para evidencia
  console.log('Longitud ingresada:', descripcionLarga.length);
  console.log('Longitud guardada:', valorGuardado.length);
  console.log('Límite esperado: 300');

  // verificar que Spotify truncó la descripción a máximo 300 caracteres
  await expect(valorGuardado.length).toBeLessThanOrEqual(300);

  // guardar los cambios
  await page.getByRole('button', { name: 'Guardar' }).click();

  console.log('✅ TC-003 exitoso: Spotify trunca correctamente la descripción a 300 caracteres');
});