/**
 * ============================================================
 *  Spotify Web — Módulo: Búsqueda y Filtrado
 *  Autor: Crisologo Aguilar Flores
 *  Lab 05 - TDD | Fase GREEN
 *  Técnicas: PE Clase Válida / Clase Inválida, Edge Case
 * ============================================================
 */

/** Límite máximo de caracteres aceptado por el buscador */
const MAX_LONGITUD_BUSQUEDA = 800;

/**
 * Catálogo simulado de artistas disponibles en Spotify.
 * Representa el subset mínimo necesario para los casos de prueba.
 */
const CATALOGO = [
  { tipo: "artista", nombre: "Dua Lipa", verificado: true },
  { tipo: "cancion", nombre: "Levitating - Dua Lipa", artista: "Dua Lipa" },
  { tipo: "album",   nombre: "Future Nostalgia - Dua Lipa", artista: "Dua Lipa" },
];

/**
 * Sanitiza una cadena de entrada eliminando etiquetas HTML/JS
 * y neutralizando patrones de inyección SQL.
 * Devuelve la cadena como texto plano seguro.
 *
 * @param {string} entrada - Cadena de texto a sanitizar
 * @returns {string}       - Cadena sanitizada como texto plano
 */
function sanitizarEntrada(entrada) {
  if (typeof entrada !== "string") return "";

  return entrada
    // Eliminar cualquier etiqueta HTML incluyendo <script>...</script>
    .replace(/<[^>]*>/g, "")
    // Neutralizar llamadas a funciones JS peligrosas (alert, eval, etc.)
    .replace(/alert\s*\([^)]*\)/gi, "")
    .replace(/eval\s*\([^)]*\)/gi, "")
    // Neutralizar sentencias SQL peligrosas
    .replace(/DROP\s+TABLE/gi, "")
    .replace(/;\s*--/g, "")
    // Escapar comillas simples que podrían romper queries
    .replace(/'/g, "&#39;")
    .trim();
}

/**
 * Ejecuta la búsqueda en el catálogo de Spotify simulado.
 *
 * Comportamientos cubiertos:
 * - Campo vacío        → tipo "exploracion", sin ejecutar búsqueda (TC-011 Caso A)
 * - Solo espacios      → mensaje "no se encontró" (TC-011 Caso B)
 * - Cadena muy larga   → trunca al límite y procesa controladamente (TC-010)
 * - Inyección XSS/SQL  → sanitiza antes de buscar (TC-012)
 * - Término inexistente → resultados vacíos con mensaje (TC-008, TC-009)
 * - Término válido     → retorna resultados del catálogo (TC-007)
 *
 * @param {string} termino - Término de búsqueda ingresado por el usuario
 * @returns {{ exito: boolean, resultados?: Array, mensaje?: string, tipo?: string, error?: string }}
 */
function buscar(termino) {
  // CASO A — Campo completamente vacío → vista de exploración (TC-011 Caso A)
  if (termino === "") {
    return {
      exito: false,
      tipo: "exploracion",
    };
  }

  // CASO B — Solo espacios en blanco → mensaje de sin resultados (TC-011 Caso B)
  if (termino.trim().length === 0) {
    return {
      exito: false,
      mensaje: "No se encontró ningún resultado para \"  \".",
    };
  }

  // Sanitizar entrada antes de procesar (TC-012 — XSS / SQL Injection)
  const terminoLimpio = sanitizarEntrada(termino);

  // Truncar cadenas excesivamente largas (TC-010 — más de 800 chars)
  const terminoProcesado = terminoLimpio.length > MAX_LONGITUD_BUSQUEDA
    ? terminoLimpio.substring(0, MAX_LONGITUD_BUSQUEDA)
    : terminoLimpio;

  // Si tras sanitizar queda cadena vacía (ej: solo era "<script>")
  // se trata como búsqueda vacía pero controlada → cero resultados
  if (terminoProcesado.trim().length === 0) {
    return {
      exito: true,
      resultados: [],
      mensaje: `No se encontraron resultados de '${termino}'.`,
    };
  }

  // Búsqueda en el catálogo (insensible a mayúsculas)
  const terminoNormalizado = terminoProcesado.toLowerCase();
  const encontrados = CATALOGO.filter((item) =>
    item.nombre.toLowerCase().includes(terminoNormalizado)
  );

  // Resultado con cero coincidencias (TC-008, TC-009)
  if (encontrados.length === 0) {
    return {
      exito: true,
      resultados: [],
      mensaje: `No se encontraron resultados de '${terminoProcesado}'.`,
    };
  }

  // Resultado exitoso (TC-007)
  return {
    exito: true,
    resultados: encontrados,
  };
}

module.exports = {
  buscar,
  sanitizarEntrada,
  MAX_LONGITUD_BUSQUEDA,
};