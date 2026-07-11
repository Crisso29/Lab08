/**
 * TC-005: Restricción del campo nombre al superar el límite máximo
 * Técnica : Análisis de Valores Límite (AVL) — N+1 = 101 caracteres
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { crearPlaylist, MAX_NOMBRE } = require("../../src/Spotify/Playlist/playlist");

describe("TC-005: Nombre con 101 caracteres debe ser rechazado (AVL — N+1)", () => {
  test("debe retornar error cuando el nombre supera los 100 caracteres permitidos", () => {
    // Arrange
    // 101 caracteres: base de 100 chars + 'O' extra
    const nombre101 =
      "Musica Andina Peruana Tradicional de la Region de Ayacucho Para Escuchar y Disfrutar ABCDEFGHAIJKLMNO";
    const descripcion = "Descripción válida de prueba";

    // Act
    const resultado = crearPlaylist(nombre101, descripcion);

    // Assert
    expect(nombre101.length).toBeGreaterThan(MAX_NOMBRE);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/nombre/i);
  });
});