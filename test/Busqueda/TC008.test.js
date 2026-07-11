/**
 * TC-008: Búsqueda sin resultados con término inexistente o sin sentido
 * Técnica : PE — Clase Inválida (PEI)
 * Prioridad: MEDIA
 * Estado   : FAIL (comportamiento documentado: sistema muestra cero resultados)
 * Autor    : Crisologo Aguilar Flores
 */

const { buscar } = require("../../src/Spotify/Busqueda/busqueda");

describe("TC-008: Búsqueda con término inexistente retorna cero resultados (PEI)", () => {
  test("debe retornar lista vacía y mensaje informativo para término sin sentido semántico", () => {
    // Arrange
    const terminoInexistente = "xkqzmpwvlrfbnt2026ayacucho";

    // Act
    const resultado = buscar(terminoInexistente);

    // Assert
    expect(resultado.exito).toBe(true);
    expect(resultado.resultados.length).toBe(0);
    expect(resultado.mensaje).toMatch(/no se encontraron resultados/i);
  });
});