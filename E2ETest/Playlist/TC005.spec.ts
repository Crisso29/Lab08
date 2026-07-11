import { test, expect } from '@playwright/test';

test('TC-005: Nombre con 101 caracteres (AVL - Límite N+1)', async ({ page }) => {

  // generar cadena de 101 caracteres (excede el límite en 1)
  const nombre101 = 'B'.repeat(101);

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

  // intentar escribir 101 caracteres
  await page.locator('[data-testid="playlist-edit-details-name-input"]').fill(nombre101);

  // obtener el valor que quedó realmente en el campo
  const valorGuardado = await page.locator('[data-testid="playlist-edit-details-name-input"]').inputValue();

  // imprimir en consola
  console.log('Longitud ingresada:', nombre101.length);
  console.log('Longitud guardada:', valorGuardado.length);
  console.log('Límite máximo esperado: 100');

  // verificar que Spotify bloquea el carácter 101 y trunca a 100
  await expect(valorGuardado.length).toBe(100);

  // guardar los cambios
  await page.getByRole('button', { name: 'Guardar' }).click();

  console.log('✅ TC-005 exitoso: Spotify trunca correctamente a 100 caracteres (N+1 rechazado)');
});