/**
 * TC-001: Creación exitosa de playlist con nombre y descripción válidos
 * Técnica : PE — Clase Válida (PEV)
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { crearPlaylist } = require("../../src/Spotify/Playlist/playlist");

describe("TC-001: Creación exitosa de playlist con datos válidos (PEV)", () => {
  test("debe crear la playlist con nombre y descripción dentro de los límites", () => {
    // Arrange
    const nombre = "Para Llullu sara";
    const descripcion =
      "Huaynos y música andina tradicional para los momentos en el campo. Dedicado a la comunidad de Vinchos, Ayacucho.";

    // Act
    const resultado = crearPlaylist(nombre, descripcion);

    // Assert
    expect(resultado.exito).toBe(true);
    expect(resultado.playlist.nombre).toBe(nombre);
    expect(resultado.playlist.descripcion).toBe(descripcion);
  });
});