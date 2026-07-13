// =============================================================
//  LAB 10 — Pruebas de Rendimiento con k6
//  Caso Práctico 1: Load Test sobre MusicBrainz API
//  Autor: Crisologo Aguilar Flores
//  Sistema bajo prueba: https://musicbrainz.org/ws/2
//  Escenario: 3 usuarios virtuales durante 30 segundos
//  Nota: MusicBrainz permite 1 req/s por IP — se ajusta
//        el sleep para respetar el rate limit de la API
// =============================================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS } from './config.js';

export const options = {
  vus: 3,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed':   ['rate<0.05'],
  },
};

export default function () {

  // ── Petición 1: buscar artista "Dua Lipa" ─────────────────
  const res1 = http.get(
    `${BASE_URL}/artist?query=Dua+Lipa&limit=5&fmt=json`,
    { headers: HEADERS }
  );

  check(res1, {
    'GET /artist — status 200':       (r) => r.status === 200,
    'GET /artist — menos de 2000ms':  (r) => r.timings.duration < 2000,
    'GET /artist — tiene resultados': (r) => {
      const body = JSON.parse(r.body);
      return body.artists && body.artists.length > 0;
    },
  });

  // Respetar el rate limit de MusicBrainz (1 req/s)
  sleep(2);

  // ── Petición 2: buscar canción "Levitating" ───────────────
  const res2 = http.get(
    `${BASE_URL}/recording?query=Levitating+Dua+Lipa&limit=5&fmt=json`,
    { headers: HEADERS }
  );

  check(res2, {
    'GET /recording — status 200':      (r) => r.status === 200,
    'GET /recording — menos de 2000ms': (r) => r.timings.duration < 2000,
    'GET /recording — tiene canciones': (r) => {
      const body = JSON.parse(r.body);
      return body.recordings && body.recordings.length > 0;
    },
  });

  sleep(2);

  // ── Petición 3: buscar álbum "Future Nostalgia" ───────────
  const res3 = http.get(
    `${BASE_URL}/release?query=Future+Nostalgia&limit=5&fmt=json`,
    { headers: HEADERS }
  );

  check(res3, {
    'GET /release — status 200':      (r) => r.status === 200,
    'GET /release — menos de 2000ms': (r) => r.timings.duration < 2000,
    'GET /release — tiene álbumes':   (r) => {
      const body = JSON.parse(r.body);
      return body.releases && body.releases.length > 0;
    },
  });

  sleep(2);
}