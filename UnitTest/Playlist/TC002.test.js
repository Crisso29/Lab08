/**
 * TC-002: Edición exitosa del nombre y descripción de una playlist existente
 * Técnica : PE — Clase Válida (PEV)
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { editarPlaylist } = require("../../src/Spotify/Playlist/playlist");

describe("TC-002: Edición exitosa de nombre y descripción de playlist existente (PEV)", () => {
  test("debe actualizar el nombre y la descripción con valores válidos", () => {
    // Arrange
    const playlistExistente = {
      id: "pl-001",
      nombre: "Para Llullu sara",
      descripcion: "Descripción original",
    };
    const nuevoNombre = "Mejores Huaynos Ayacuchanos 2026";
    const nuevaDescripcion =
      "Selección especial de huaynos y música andina del departamento de Ayacucho. Incluye artistas de Vinchos, Huamanga y Cangallo.";

    // Act
    const resultado = editarPlaylist(playlistExistente, nuevoNombre, nuevaDescripcion);

    // Assert
    expect(resultado.exito).toBe(true);
    expect(resultado.playlist.nombre).toBe(nuevoNombre);
    expect(resultado.playlist.descripcion).toBe(nuevaDescripcion);
  });
});