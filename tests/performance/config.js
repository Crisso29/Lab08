// =============================================================
//  LAB 10 — Configuración compartida para k6
//  Autor: Crisologo Aguilar Flores
//  Sistema bajo prueba: MusicBrainz API
//  API similar a Spotify — base de datos musical open source
//  Sin autenticación — solo requiere User-Agent
// =============================================================

export const BASE_URL = 'https://musicbrainz.org/ws/2';

// MusicBrainz requiere un User-Agent descriptivo
// sin esto devuelve 403
export const HEADERS = {
  'User-Agent': 'LAB10-IS489-UNSCH/1.0 (crisologo.aguilar.27@unsch.edu.pe)',
  'Accept': 'application/json',
};