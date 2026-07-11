import { test, expect } from '@playwright/test';

test('TC-004: Nombre con 100 caracteres exactos (AVL - Límite N)', async ({ page }) => {

  // generar cadena de EXACTAMENTE 100 caracteres (límite válido)
  const nombre100 = 'A'.repeat(100);

  // navegar al home de Spotify
  await page.goto('https://open.spotify.com/');

  // esperar a que cargue el botón "Crear"
  await expect(page.locator('[aria-label="Crear"]')).toBeVisible({ timeout: 30000 });

  // crear una playlist nueva
  await page.locator('[aria-label="Crear"]').click();
  await page.locator('[aria-describedby="subtitle-global-create-playlist"]').click();

  // esperar que aparezca el título
  await expect(page.locator('h1.encore-text-headline-large')).toBeVisible();

  // abrir el editor
  await page.locator('h1.encore-text-headline-large').click();

  // escribir el nombre de 100 caracteres exactos
  await page.locator('[data-testid="playlist-edit-details-name-input"]').fill(nombre100);

  // obtener el valor que quedó en el input
  const valorGuardado = await page.locator('[data-testid="playlist-edit-details-name-input"]').inputValue();

  // imprimir en consola para evidencia
  console.log('Longitud ingresada:', nombre100.length);
  console.log('Longitud guardada:', valorGuardado.length);
  console.log('Límite permitido: 100');

  // verificar que se guardaron los 100 caracteres completos
  await expect(valorGuardado.length).toBe(100);

  // guardar los cambios
  await page.getByRole('button', { name: 'Guardar' }).click();

  console.log('✅ TC-004 exitoso: Spotify acepta el nombre en el límite exacto de 100 caracteres');
});