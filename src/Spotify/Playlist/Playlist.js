/**
 * ============================================================
 *  Spotify Web — Módulo: Gestión de Playlists
 *  Autor: Crisologo Aguilar Flores
 *  Lab 05 - TDD | Fase GREEN
 *  Técnicas: PE Clase Válida / Clase Inválida, AVL, Edge Case
 * ============================================================
 */

/** Límite máximo de caracteres para el nombre de la playlist */
const MAX_NOMBRE = 100;

/** Límite máximo de caracteres para la descripción de la playlist */
const MAX_DESCRIPCION = 300;

/**
 * Crea una nueva playlist con nombre y descripción.
 * Valida que el nombre no esté vacío, no sea solo espacios,
 * y que ambos campos respeten los límites de caracteres.
 *
 * @param {string} nombre      - Nombre de la nueva playlist
 * @param {string} descripcion - Descripción opcional de la playlist
 * @returns {{ exito: boolean, playlist?: object, error?: string }}
 */
function crearPlaylist(nombre, descripcion = "") {
  // Validación: nombre vacío o solo espacios
  if (!nombre || nombre.trim().length === 0) {
    return {
      exito: false,
      error: "El nombre de la lista de reproducción es obligatorio.",
    };
  }

  // Validación: nombre supera el límite máximo (AVL N+1)
  if (nombre.length > MAX_NOMBRE) {
    return {
      exito: false,
      error: `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`,
    };
  }

  // Validación: descripción supera el límite máximo
  if (descripcion.length > MAX_DESCRIPCION) {
    return {
      exito: false,
      error: `La descripción no puede superar los ${MAX_DESCRIPCION} caracteres.`,
    };
  }

  // Creación exitosa
  return {
    exito: true,
    playlist: {
      id: `pl-${Date.now()}`,
      nombre: nombre,
      descripcion: descripcion,
    },
  };
}

/**
 * Edita el nombre y la descripción de una playlist existente.
 * Aplica las mismas validaciones de longitud que la creación.
 *
 * @param {object} playlist        - Objeto playlist existente
 * @param {string} nuevoNombre     - Nuevo nombre de la playlist
 * @param {string} nuevaDescripcion - Nueva descripción de la playlist
 * @returns {{ exito: boolean, playlist?: object, error?: string }}
 */
function editarPlaylist(playlist, nuevoNombre, nuevaDescripcion = "") {
  // Validación: nombre vacío o solo espacios
  if (!nuevoNombre || nuevoNombre.trim().length === 0) {
    return {
      exito: false,
      error: "El nombre de la lista de reproducción es obligatorio.",
    };
  }

  // Validación: nombre supera el límite máximo
  if (nuevoNombre.length > MAX_NOMBRE) {
    return {
      exito: false,
      error: `El nombre no puede superar los ${MAX_NOMBRE} caracteres.`,
    };
  }

  // Validación: descripción supera el límite máximo
  if (nuevaDescripcion.length > MAX_DESCRIPCION) {
    return {
      exito: false,
      error: `La descripción no puede superar los ${MAX_DESCRIPCION} caracteres.`,
    };
  }

  // Edición exitosa: devuelve nueva referencia con cambios aplicados
  return {
    exito: true,
    playlist: {
      ...playlist,
      nombre: nuevoNombre,
      descripcion: nuevaDescripcion,
    },
  };
}

module.exports = {
  crearPlaylist,
  editarPlaylist,
  MAX_NOMBRE,
  MAX_DESCRIPCION,
};