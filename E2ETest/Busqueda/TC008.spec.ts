import { test, expect } from '@playwright/test';

/**
 * TC-008: Búsqueda sin sentido (PE-Inválida)
 *
 * ⚠️ BUG CONOCIDO DE SPOTIFY (BUG-001)
 * ─────────────────────────────────────────────────
 * Este test documenta un defecto real del SUT:
 * Spotify aplica búsqueda fuzzy demasiado permisiva,
 * retornando resultados para términos sin sentido.
 *
 * COMPORTAMIENTO ESPERADO: 0 resultados
 * COMPORTAMIENTO REAL:     21+ resultados
 *
 * Usamos test.fail() para que el pipeline SIGA en verde
 * mientras el bug queda documentado en el reporte.
 * Si Spotify algún día lo arregla, este test empezará a
 * "pasar" (y test.fail marcará que hay que revisar).
 */
test('TC-008: Búsqueda sin sentido (Bug conocido - BUG-001)', async ({ page }) => {

  // marcamos este test como "se espera que falle" - documenta el bug
  test.fail(true, 'BUG-001: Spotify aplica búsqueda fuzzy excesivamente permisiva. Ver reporte de defectos.');

  // término completamente sin sentido
  const terminoSinSentido = 'xkqzlmpaowsi';

  // navegar a la búsqueda
  await page.goto('https://open.spotify.com/search');

  // esperar el input
  await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 30000 });

  // buscar el término sin sentido
  await page.locator('[data-testid="search-input"]').click();
  await page.locator('[data-testid="search-input"]').fill(terminoSinSentido);
  await page.keyboard.press('Enter');

  // esperar a que carguen los resultados
  await page.waitForTimeout(4000);

  // contar los resultados encontrados
  const resultados = await page.locator('[role="row"], [data-testid*="card"], [role="gridcell"]').count();

  // imprimir evidencia en consola
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  TC-008: BUG-001 documentado                   ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('Término buscado:', terminoSinSentido);
  console.log('Resultados obtenidos:', resultados);
  console.log('Resultados esperados: 0');
  console.log('Estado del bug: CONFIRMADO ⚠️');
  console.log('Severidad: Baja | Prioridad: Media');
  console.log('Recomendación: Implementar umbral mínimo de similitud');

  // este assert va a "fallar" (como esperamos), pero test.fail lo captura
  await expect(resultados).toBe(0);
});