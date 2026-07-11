/**
 * TC-009: Búsqueda de contenido regional muy específico con resultados aproximados o vacíos
 * Técnica : PE — Clase Inválida (PEI)
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { buscar } = require("../../src/Spotify/Busqueda/busqueda");

describe("TC-009: Búsqueda regional hiperespecífica se maneja sin errores de aplicación (PEI)", () => {
  test("debe retornar resultados aproximados o lista vacía sin lanzar errores de aplicación", () => {
    // Arrange
    const terminoRegional = "Música tradicional de Vinchos Ayacucho";

    // Act
    const resultado = buscar(terminoRegional);

    // Assert
    expect(resultado).toBeDefined();
    expect(resultado.exito).toBe(true);
    expect(Array.isArray(resultado.resultados)).toBe(true);
    // Acepta tanto resultados aproximados como lista vacía — ambos son válidos
    expect(resultado.resultados.length).toBeGreaterThanOrEqual(0);
  });
});