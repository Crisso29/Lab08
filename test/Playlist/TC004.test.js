/**
 * TC-004: Creación de playlist con nombre en el límite máximo exacto
 * Técnica : Análisis de Valores Límite (AVL) — N = 100 caracteres
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { crearPlaylist, MAX_NOMBRE } = require("../../src/Spotify/Playlist/playlist");

describe("TC-004: Nombre con exactamente 100 caracteres debe ser aceptado (AVL — N)", () => {
  test("debe crear la playlist cuando el nombre tiene exactamente 100 caracteres", () => {
    // Arrange
    // 100 caracteres exactos
    const nombre100 =
      "Musica Andina Peruana Tradicional de la Region de Ayacucho Para Escuchar y Disfrutar!!!!!!!!!!!!!!!!";
    const descripcion = "Descripción válida de prueba";

    // Act
    const resultado = crearPlaylist(nombre100, descripcion);

    // Assert
    expect(nombre100.length).toBe(MAX_NOMBRE);
    expect(resultado.exito).toBe(true);
    expect(resultado.playlist.nombre.length).toBe(MAX_NOMBRE);
  });
});