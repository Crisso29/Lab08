/**
 * TC-007: Búsqueda exitosa con término válido y resultado existente
 * Técnica : PE — Clase Válida (PEV)
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { buscar } = require("../../src/Spotify/Busqueda/busqueda");

describe("TC-007: Búsqueda con término válido retorna resultados relevantes (PEV)", () => {
  test("debe retornar resultados con el artista buscado como resultado más relevante", () => {
    // Arrange
    const termino = "Dua Lipa";

    // Act
    const resultado = buscar(termino);

    // Assert
    expect(resultado.exito).toBe(true);
    expect(resultado.resultados.length).toBeGreaterThan(0);
    expect(resultado.resultados[0].nombre.toLowerCase()).toContain("dua lipa");
  });
});