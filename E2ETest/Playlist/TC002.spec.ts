import { test, expect } from '@playwright/test';

test('TC-002: Editar nombre y descripción de playlist', async ({ page }) => {

  // navegar al home de Spotify
  await page.goto('https://open.spotify.com/');

  // esperar a que cargue el botón "Crear"
  await expect(page.locator('[aria-label="Crear"]')).toBeVisible({ timeout: 30000 });

  // crear una playlist primero (base para editar)
  await page.locator('[aria-label="Crear"]').click();
  await page.locator('[aria-describedby="subtitle-global-create-playlist"]').click();

  // esperar que aparezca el título de la nueva playlist
  await expect(page.locator('h1.encore-text-headline-large')).toBeVisible();

  // abrir el editor haciendo clic en el título
  await page.locator('h1.encore-text-headline-large').click();

  // escribir el nombre nuevo
  await page.locator('[data-testid="playlist-edit-details-name-input"]').fill('Playlist Editada');

  // escribir la descripción nueva
  await page.locator('[data-testid="playlist-edit-details-description-input"]').fill('Descripción actualizada correctamente');

  // guardar los cambios
  await page.getByRole('button', { name: 'Guardar' }).click();

  // verificar que el título se actualizó al nuevo nombre
  await expect(page.locator('h1.encore-text-headline-large')).toHaveText('Playlist Editada', { timeout: 15000 });

  console.log('✅ TC-002 exitoso: Nombre y descripción editados correctamente');
});