/**
 * TC-011: Comportamiento de la búsqueda con campo vacío o solo espacios en blanco
 * Técnica : PE — Edge Case
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { buscar } = require("../../src/Spotify/Busqueda/busqueda");

describe("TC-011: Campo vacío o solo espacios no procesa búsqueda al servidor (Edge Case)", () => {
  test("Caso A: campo completamente vacío debe retornar vista de exploración de categorías", () => {
    // Arrange
    const campoVacio = "";

    // Act
    const resultado = buscar(campoVacio);

    // Assert
    expect(resultado.exito).toBe(false);
    expect(resultado.tipo).toBe("exploracion");
    expect(resultado.resultados).toBeUndefined();
  });

  test("Caso B: solo espacios en blanco debe retornar mensaje de sin resultados", () => {
    // Arrange
    const soloEspacios = "      ";

    // Act
    const resultado = buscar(soloEspacios);

    // Assert
    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toMatch(/no se encontr[oó]/i);
  });
});