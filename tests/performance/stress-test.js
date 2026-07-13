// =============================================================
//  LAB 10 — Pruebas de Rendimiento con k6
//  Caso Práctico 2: Stress Test sobre MusicBrainz API
//  Autor: Crisologo Aguilar Flores
//  Sistema bajo prueba: https://musicbrainz.org/ws/2
//  Escenario: aumento gradual de 0 a 30 VUs para encontrar
//             el punto de degradación del sistema
// =============================================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, HEADERS } from './config.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Etapa 1: subir a 10 VUs
    { duration: '30s', target: 20 }, // Etapa 2: subir a 20 VUs
    { duration: '30s', target: 30 }, // Etapa 3: subir a 30 VUs
    { duration: '30s', target: 0  }, // Etapa 4: enfriamiento
  ],
  thresholds: {
    // El 95% de peticiones debe responder en menos de 3000ms
    'http_req_duration': ['p(95)<3000'],
    // Menos del 10% de peticiones pueden fallar
    'http_req_failed': ['rate<0.10'],
  },
};

export default function () {

  // Alternar entre búsqueda de artista y canción
  // según el número de iteración
  const queries = [
    `${BASE_URL}/artist?query=Bad+Bunny&limit=5&fmt=json`,
    `${BASE_URL}/recording?query=Titi+Me+Pregunto&limit=5&fmt=json`,
    `${BASE_URL}/release?query=Un+Verano+Sin+Ti&limit=5&fmt=json`,
  ];

  const url = queries[__ITER % queries.length];
  const res = http.get(url, { headers: HEADERS });

  check(res, {
    'status 200 o 429':     (r) => r.status === 200 || r.status === 429,
    'menos de 3000ms':      (r) => r.timings.duration < 3000,
    'responde JSON válido': (r) => {
      try { JSON.parse(r.body); return true; }
      catch (e) { return false; }
    },
  });

  sleep(1);
}