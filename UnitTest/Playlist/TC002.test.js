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

// ─── Test adicional para cobertura — línea 73 de playlist.js ───
describe("TC-002b: Edición rechazada con nombre vacío en editarPlaylist (Edge Case)", () => {
  test("debe retornar error cuando el nuevo nombre está vacío", () => {
    // Arrange
    const playlistExistente = { id: "pl-001", nombre: "Original", descripcion: "" };
    const nombreVacio = "";

    // Act
    const resultado = editarPlaylist(playlistExistente, nombreVacio);

    // Assert
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/nombre/i);
  });
});

// ─── Test adicional para cobertura — línea 81 de playlist.js ───
describe("TC-002c: Edición rechazada con nombre > 100 caracteres en editarPlaylist (AVL N+1)", () => {
  test("debe retornar error cuando el nuevo nombre supera los 100 caracteres", () => {
    // Arrange
    const playlistExistente = { id: "pl-001", nombre: "Original", descripcion: "" };
    const nombre101 =
      "Musica Andina Peruana Tradicional de la Region de Ayacucho Para Escuchar y Disfrutar ABCDEFGHAIJKLMNO";

    // Act
    const resultado = editarPlaylist(playlistExistente, nombre101);

    // Assert
    expect(nombre101.length).toBeGreaterThan(100);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/nombre/i);
  });
});