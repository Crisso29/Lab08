import { test, expect } from '@playwright/test';

test('TC-012: Inyección XSS + SQL (Edge Case - Seguridad)', async ({ page }) => {

  // payload combinado XSS + SQL injection
  const payloadMalicioso = "<script>alert('XSS')</script>' OR 1=1--";

  // variable para detectar si se ejecutó algún alert
  let alertEjecutado = false;

  // escuchar cualquier diálogo (alerts) que aparezca
  page.on('dialog', async dialog => {
    alertEjecutado = true;
    console.log('⚠️ ALERT DETECTADO:', dialog.message());
    await dialog.dismiss();
  });

  // navegar a la búsqueda
  await page.goto('https://open.spotify.com/search');

  // esperar el input
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 30000 });

  // inyectar el payload malicioso
  await page.locator('[data-testid="search-input"]').click();
  await page.locator('[data-testid="search-input"]').fill(payloadMalicioso);
  await page.keyboard.press('Enter');

  // esperar 3 segundos para dar tiempo a que se ejecute (si es vulnerable)
  await page.waitForTimeout(3000);

  // verificar que el alert NO se ejecutó (XSS bloqueado)
  console.log('Payload inyectado:', payloadMalicioso);
  console.log('¿Se ejecutó alert()?:', alertEjecutado);

  await expect(alertEjecutado).toBe(false);

  // verificar que la página sigue funcional (no crasheó por SQL injection)
  const urlActual = page.url();
  await expect(urlActual).toContain('spotify.com');

  // verificar que el input sigue accesible
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible();

  console.log('✅ TC-012 exitoso: Spotify sanitiza correctamente XSS + SQL injection');
});