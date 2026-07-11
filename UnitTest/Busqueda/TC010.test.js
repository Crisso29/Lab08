/**
 * TC-010: Búsqueda rechazada o truncada con cadena de longitud excesiva
 * Técnica : PE — Clase Inválida (PEI) | más de 800 caracteres
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { buscar, MAX_LONGITUD_BUSQUEDA } = require("../../src/Spotify/Busqueda/busqueda");

describe("TC-010: Cadena mayor a 800 caracteres es manejada de forma controlada (PEI)", () => {
  test("debe retornar respuesta controlada sin errores de aplicación para cadena de 800+ caracteres", () => {
    // Arrange
    // Bloque repetido dos veces para superar los 800 caracteres (~1424 chars)
    const bloque =
      "musica andina peruana ayacucho huamanga vinchos cangallo vilcashuaman victor fajardo huanta la mar " +
      "sucre lucanas parinacochas paucar del sara sara folklore huayno marinera tunantada pasacalle " +
      "carnaval andino ayacuchano chicha cumbia tropical instrumentos tipicos charango quena zampoña " +
      "tinya mandolina arpa violin guitarra trompeta bombo wankara platillos cantantes grupos musicales " +
      "orquestas representativas de la region sur central del peru departamento de ayacucho semana santa " +
      "turismo gastronomia puca picante mondongo caldo de cabeza chicharron jamon del pais mazamorra de " +
      "cochino ponche de frutas chicha de jora festividades carnavales navidad pascua corpus christi " +
      "patron san juan bautista virgen asuncion ";
    const cadenaLarga = bloque + bloque;

    // Act
    const resultado = buscar(cadenaLarga);

    // Assert
    expect(cadenaLarga.length).toBeGreaterThan(MAX_LONGITUD_BUSQUEDA);
    expect(resultado).toBeDefined();
    expect(resultado.exito).toBe(true);
    expect(resultado.error).toBeUndefined();
  });
});