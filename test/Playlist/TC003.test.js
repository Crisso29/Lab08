/**
 * TC-003: Edición rechazada al superar el límite de caracteres en la descripción
 * Técnica : PE — Clase Inválida (PEI) | AVL N+1 (301 caracteres)
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { editarPlaylist, MAX_DESCRIPCION } = require("../../src/Spotify/Playlist/playlist");

describe("TC-003: Descripción con 301 caracteres debe ser rechazada (PEI)", () => {
  test("debe retornar error cuando la descripción supera los 300 caracteres permitidos", () => {
    // Arrange
    const playlistExistente = {
      id: "pl-001",
      nombre: "Playlist válida",
      descripcion: "",
    };
    // 311 caracteres — supera el límite de 300
    const descripcion301 =
      "Seleccion especial de huaynos, musica andina y folklore tradicional del departamento de Ayacucho, Peru. " +
      "Esta playlist incluye artistas y agrupaciones representativas de las provincias de Huamanga, Cangallo, " +
      "Vilcashuaman, Vinchos y Victor Fajardo. Para escuchar personalmente y en familia. Comparte y disfruta!!!";

    // Act
    const resultado = editarPlaylist(playlistExistente, playlistExistente.nombre, descripcion301);

    // Assert
    expect(descripcion301.length).toBeGreaterThan(MAX_DESCRIPCION);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/descripci[oó]n/i);
  });
});