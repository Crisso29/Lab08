/**
 * TC-006: Comportamiento al crear una playlist con nombre vacío o solo espacios en blanco
 * Técnica : PE — Edge Case
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { crearPlaylist } = require("../../src/Spotify/Playlist/playlist");

describe("TC-006: Nombre vacío o solo espacios debe ser rechazado (Edge Case)", () => {
  test("Caso A: debe retornar error cuando el nombre está completamente vacío", () => {
    // Arrange
    const nombreVacio = "";
    const descripcion = "";

    // Act
    const resultado = crearPlaylist(nombreVacio, descripcion);

    // Assert
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/nombre/i);
  });

  test("Caso B: debe retornar error cuando el nombre contiene solo espacios en blanco", () => {
    // Arrange
    const nombreEspacios = "      ";
    const descripcion = "";

    // Act
    const resultado = crearPlaylist(nombreEspacios, descripcion);

    // Assert
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/nombre/i);
  });
});