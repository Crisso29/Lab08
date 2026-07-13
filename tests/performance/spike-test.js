// =============================================================
//  LAB 10 — Pruebas de Rendimiento con k6
//  Caso Práctico 3: Spike Test sobre MusicBrainz API
//  Autor: Crisologo Aguilar Flores
//  Sistema bajo prueba: https://musicbrainz.org/ws/2
//  Escenario: pico repentino de 0 a 50 VUs en segundos
//             Simula un evento viral o campaña publicitaria
// =============================================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS } from './config.js';

export const options = {
  stages: [
    { duration: '10s', target: 0  }, // Inicio: sin carga
    { duration: '10s', target: 50 }, // PICO: 0 → 50 VUs en 10s
    { duration: '20s', target: 50 }, // Mantener el pico 20s
    { duration: '10s', target: 0  }, // Recuperación
  ],
  thresholds: {
    // El 95% de peticiones debe responder en menos de 5000ms
    'http_req_duration': ['p(95)<5000'],
    // Menos del 20% de peticiones pueden fallar
    // (spike es agresivo — se esperan más errores por rate limiting)
    'http_req_failed': ['rate<0.20'],
  },
};

export default function () {

  const res = http.get(
    `${BASE_URL}/artist?query=Bad+Bunny&limit=3&fmt=json`,
    { headers: HEADERS }
  );

  check(res, {
    'status 200 o 503':  (r) => r.status === 200 || r.status === 503,
    'menos de 5000ms':   (r) => r.timings.duration < 5000,
  });

  sleep(1);
}