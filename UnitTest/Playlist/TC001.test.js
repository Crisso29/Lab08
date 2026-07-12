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

// ─── Test adicional para cobertura — línea 44 de playlist.js ───
describe("TC-001b: Creación rechazada cuando descripción supera 300 caracteres (PEI)", () => {
  test("debe retornar error cuando la descripción supera los 300 caracteres en crearPlaylist", () => {
    // Arrange
    const nombre = "Playlist válida";
    const descripcion301 =
      "Seleccion especial de huaynos, musica andina y folklore tradicional del departamento de Ayacucho, Peru. " +
      "Esta playlist incluye artistas y agrupaciones representativas de las provincias de Huamanga, Cangallo, " +
      "Vilcashuaman, Vinchos y Victor Fajardo. Para escuchar personalmente y en familia. Comparte y disfruta!!!";

    // Act
    const resultado = crearPlaylist(nombre, descripcion301);

    // Assert
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/descripci[oó]n/i);
  });
});