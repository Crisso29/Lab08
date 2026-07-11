import { test, expect } from '@playwright/test';

test('TC-001: Crear playlist con datos válidos', async ({ page }) => {

  // page.goto, le indico que navege al home de Spotify
  await page.goto('https://open.spotify.com/');

  // esperar a que cargue el botón "Crear" (indica que ya está logueado)
  await expect(page.locator('[aria-label="Crear"]')).toBeVisible({ timeout: 30000 });

  // hacer clic en el botón Crear del sidebar
  await page.locator('[aria-label="Crear"]').click();

  // seleccionar la opción "Lista de reproducción"
  await page.locator('[aria-describedby="subtitle-global-create-playlist"]').click();

  // esperar a que aparezca el título de la nueva playlist (por defecto es "Mi lista n.º X")
  await expect(page.locator('h1.encore-text-headline-large')).toBeVisible();

  // hacer clic en el título para abrir el editor de detalles
  await page.locator('h1.encore-text-headline-large').click();

  // limpiar y escribir el nuevo nombre
  await page.locator('[data-testid="playlist-edit-details-name-input"]').fill('Para Llullu sara');

  // escribir la descripción
  await page.locator('[data-testid="playlist-edit-details-description-input"]').fill('Música andina tradicional de Vinchos');

  // hacer clic en el botón Guardar
  await page.getByRole('button', { name: 'Guardar' }).click();

  // esperar a que el título se actualice con el nuevo nombre
  await expect(page.locator('h1.encore-text-headline-large')).toHaveText('Para Llullu sara', { timeout: 15000 });

  // verificar que la URL contenga "playlist"
  await expect(page).toHaveURL(/playlist/);

  console.log('✅ TC-001 exitoso: Playlist "Para Llullu sara" creada correctamente');
});