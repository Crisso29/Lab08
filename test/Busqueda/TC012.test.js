/**
 * TC-012: Búsqueda con inyección de caracteres especiales y código malicioso
 * Técnica : PE — Edge Case (Seguridad)
 * Prioridad: ALTA
 * Estado   : PASS
 * Autor    : Crisologo Aguilar Flores
 */

const { buscar, sanitizarEntrada } = require("../../src/Spotify/Busqueda/busqueda");

describe("TC-012: Inyección XSS y SQL es sanitizada correctamente (Edge Case — Seguridad)", () => {
  test("debe neutralizar etiquetas HTML y código JavaScript sin ejecutar el script", () => {
    // Arrange
    const entradaXSS = "<script>alert('XSS-TEST')</script>";

    // Act
    const sanitizada = sanitizarEntrada(entradaXSS);

    // Assert
    expect(sanitizada).not.toContain("<script>");
    expect(sanitizada).not.toContain("</script>");
    expect(sanitizada).not.toContain("alert(");
  });

  test("debe neutralizar inyección SQL y devolver cadena como texto plano sin errores", () => {
    // Arrange
    const entradaSQL = "'; DROP TABLE tracks;--";

    // Act
    const sanitizada = sanitizarEntrada(entradaSQL);
    const resultado = buscar(entradaSQL);

    // Assert
    expect(sanitizada).not.toContain("DROP TABLE");
    expect(resultado.exito).toBe(true);
    expect(resultado.resultados.length).toBe(0);
    expect(resultado.error).toBeUndefined();
  });

  test("debe retornar cero resultados al buscar cadena XSS sin alert box emergente", () => {
    // Arrange
    const entradaXSS = "<script>alert('XSS-TEST')</script>";

    // Act
    const resultado = buscar(entradaXSS);

    // Assert
    expect(resultado.exito).toBe(true);
    expect(resultado.resultados.length).toBe(0);
    expect(resultado.error).toBeUndefined();
  });
});