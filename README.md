# LAB 08 — Pipeline CI/CD con GitHub Actions

**Asignatura:** IS-489 Pruebas y Aseguramiento de Calidad de Software  
**Docente:** Ing. Lizbeth Jaico Quispe  
**Autor:** Crisologo Aguilar Flores  
**Semestre:** 2026-I  

---
[Informe monográfico completo](https://docs.google.com/document/d/19gNATomIo4GUQjpCRedExc5zItGn3hN6/edit?usp=drive_link&ouid=102948391865322967982&rtpof=true&sd=true)
## 📋 Descripción general

Este laboratorio implementa un pipeline de Integración Continua y Entrega Continua (CI/CD) utilizando GitHub Actions sobre el repositorio del curso. El objetivo es automatizar la ejecución de las suites de pruebas cada vez que el equipo introduce cambios en el código, garantizando que ningún defecto llegue a la rama principal sin haber pasado por una verificación automática.

El pipeline está compuesto por dos flujos independientes:

| Pipeline | Herramienta | Cuándo se activa | Tests que ejecuta |
|---|---|---|---|
| `ci-jest.yml` | Jest 30 | Push y Pull Request a `main` | 12 tests unitarios (TC-001 al TC-012) |
| `ci-playwright.yml` | Playwright | Pull Request a `main` | 12 tests E2E (TC-001 al TC-012) |

---

## 🗂️ Estructura del proyecto

```
LAB08/
├── .github/
│   └── workflows/
│       ├── ci-jest.yml            ← Pipeline 1: tests unitarios en cada Push
│       └── ci-playwright.yml      ← Pipeline 2: tests E2E en cada Pull Request
│
├── E2ETest/
│   ├── auth/
│   │   ├── login.setup.ts         ← setup de sesión de Spotify (login manual)
│   │   └── spotify_state.json     ← sesión guardada (en .gitignore — no subir)
│   ├── Busqueda/
│   │   ├── TC007.spec.ts          ← Búsqueda exitosa (PEV)
│   │   ├── TC008.spec.ts          ← Término inexistente (PEI)
│   │   ├── TC009.spec.ts          ← Término regional (PEI)
│   │   ├── TC010.spec.ts          ← Cadena 800+ chars (PEI)
│   │   ├── TC011.spec.ts          ← Campo vacío/espacios (Edge Case)
│   │   └── TC012.spec.ts          ← Inyección XSS/SQL (Edge Case - Seguridad)
│   └── Playlist/
│       ├── TC001.spec.ts          ← Creación exitosa (PEV)
│       ├── TC002.spec.ts          ← Edición exitosa (PEV)
│       ├── TC003.spec.ts          ← Descripción > 300 chars (PEI)
│       ├── TC004.spec.ts          ← Nombre = 100 chars exactos (AVL N)
│       ├── TC005.spec.ts          ← Nombre = 101 chars (AVL N+1)
│       └── TC006.spec.ts          ← Nombre vacío/espacios (Edge Case)
│
├── src/
│   └── Spotify/
│       ├── Busqueda/
│       │   └── busqueda.js        ← módulo de búsqueda (minúsculas obligatorio)
│       └── Playlist/
│           └── playlist.js        ← módulo de playlist (minúsculas obligatorio)
│
├── UnitTest/
│   ├── Busqueda/
│   │   ├── TC007.test.js
│   │   ├── TC008.test.js
│   │   ├── TC009.test.js
│   │   ├── TC010.test.js
│   │   ├── TC011.test.js
│   │   └── TC012.test.js
│   └── Playlist/
│       ├── TC001.test.js
│       ├── TC002.test.js
│       ├── TC003.test.js
│       ├── TC004.test.js
│       ├── TC005.test.js
│       └── TC006.test.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── playwright.config.ts
```

---

## ⚠️ Errores comunes — léelos antes de empezar

Estos errores ocurren frecuentemente y cuestan tiempo. Conócelos de antemano para evitarlos.

---

### Error 1 — Archivos `src/` con mayúscula inicial

**El problema:** Windows no distingue entre `Busqueda.js` y `busqueda.js`. El servidor Linux de GitHub Actions sí lo hace. Si el archivo está registrado en Git con mayúscula, el pipeline falla con `Cannot find module`.

**Cómo detectarlo:**
```bash
git ls-files src/
# Si aparece: src/Spotify/Busqueda/Busqueda.js  ← MAL
# Debe ser:   src/Spotify/Busqueda/busqueda.js  ← BIEN
```

**Cómo corregirlo** (no renombrar desde el explorador de Windows, Git no lo detecta):
```bash
git mv src/Spotify/Busqueda/Busqueda.js src/Spotify/Busqueda/busqueda.js
git mv src/Spotify/Playlist/Playlist.js src/Spotify/Playlist/playlist.js
git commit -m "fix: renombrar archivos src a minúsculas para compatibilidad Linux"
git push origin main
```

---

### Error 2 — Jest intenta correr los archivos `.spec.ts` de Playwright

**El problema:** Si Jest no está configurado para buscar solo en `UnitTest/`, va a intentar parsear los archivos TypeScript de Playwright y falla con `SyntaxError: Cannot use import statement outside a module`.

**La solución** — configurar el bloque `"jest"` en `package.json`:
```json
"jest": {
  "testMatch": [
    "**/UnitTest/**/*.test.js"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/E2ETest/"
  ]
}
```

Y en el pipeline usar el flag explícito:
```yaml
run: npx jest --testPathPatterns="UnitTest"
```

> ⚠️ En Jest 30 el flag es `--testPathPatterns` (plural). En versiones anteriores era `--testPathPattern` (singular). Si pones el singular en Jest 30, el pipeline falla.

---

### Error 3 — `headless: false` rompe el pipeline en GitHub Actions

**El problema:** El servidor de GitHub no tiene pantalla (no hay entorno gráfico). Si `playwright.config.ts` tiene `headless: false`, el pipeline falla con:
```
Looks like you launched a headed browser without having a XServer running.
```

**La solución** — detectar automáticamente si se está en CI:
```ts
headless: !!process.env.CI,
// En GitHub Actions: CI=true  → headless: true  ✅
// En tu máquina:    CI=false  → headless: false ✅
```

---

### Error 4 — `echo` y `printenv` rompen el JSON de sesión en bash

**El problema:** El `spotify_state.json` contiene paréntesis, comillas y otros caracteres especiales que bash interpreta como sintaxis. Usar `echo '${{ secrets.SPOTIFY_AUTH_JSON }}'` o `printenv` produce:
```
syntax error near unexpected token ')'
```

**La solución** — usar `node -e` para escribir el archivo:
```yaml
- name: Restaurar sesión de Spotify
  env:
    SPOTIFY_AUTH_JSON: ${{ secrets.SPOTIFY_AUTH_JSON }}
  run: |
    node -e "
      const fs = require('fs');
      fs.mkdirSync('E2ETest/auth', { recursive: true });
      fs.writeFileSync('E2ETest/auth/spotify_state.json', process.env.SPOTIFY_AUTH_JSON);
      console.log('Sesión restaurada:', fs.statSync('E2ETest/auth/spotify_state.json').size, 'bytes');
    "
```

---

### Error 5 — Spotify usa OAuth de Google — el login no se puede automatizar

**El problema:** Cuando intentas automatizar el login con `page.fill('#login-username')`, Spotify redirige a `accounts.google.com`, donde Google bloquea los intentos automatizados.

**La solución** — login manual una sola vez con `page.pause()` y guardar la sesión con `storageState`.

---

### Error 6 — El `package-lock.json` en el `.gitignore` rompe el cache de npm

**El problema:** Si tienes `/package-lock.json` en el `.gitignore` y usas `cache: 'npm'` en el pipeline, GitHub Actions falla porque no encuentra el lock file.

**La solución** — elimina `/package-lock.json` del `.gitignore` o quita `cache: 'npm'` del yml:
```yaml
# En lugar de esto:
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'    ← quitar esta línea si package-lock.json está en .gitignore

# Usar esto:
- uses: actions/setup-node@v4
  with:
    node-version: 20
```

---

## 🛠️ Instalación paso a paso

### Paso 1 — Clonar el repositorio
```bash
git clone https://github.com/Crisso29/Lab08
cd Lab08
```

### Paso 2 — Instalar dependencias
```bash
npm install
```

### Paso 3 — Instalar navegadores de Playwright
```bash
npx playwright install chromium
```

### Paso 4 — Verificar que los tests unitarios corren localmente
```bash
npm test
```

Salida esperada:
```
PASS  UnitTest/Playlist/TC001.test.js
PASS  UnitTest/Playlist/TC002.test.js
PASS  UnitTest/Playlist/TC003.test.js
PASS  UnitTest/Playlist/TC004.test.js
PASS  UnitTest/Playlist/TC005.test.js
PASS  UnitTest/Playlist/TC006.test.js
PASS  UnitTest/Busqueda/TC007.test.js
PASS  UnitTest/Busqueda/TC008.test.js
PASS  UnitTest/Busqueda/TC009.test.js
PASS  UnitTest/Busqueda/TC010.test.js
PASS  UnitTest/Busqueda/TC011.test.js
PASS  UnitTest/Busqueda/TC012.test.js

Test Suites: 12 passed, 12 total
Tests:       16 passed, 16 total
```

---

## 🔐 Configurar la sesión de Spotify (una sola vez)

Spotify requiere autenticación para los tests E2E. Como usa OAuth de Google, el flujo automatizado no funciona. La solución es hacer el login manualmente una vez y guardar la sesión en un archivo JSON que Playwright reutiliza en todos los tests.

### Paso 1 — Correr el setup de login
```bash
npx playwright test --project=setup --headed
```

### Paso 2 — El navegador se abre en `open.spotify.com`

Se abrirá Chromium con el Inspector de Playwright pausado. En el navegador:

1. Haz click en **"Iniciar sesión"**
2. Selecciona **"Continuar con Google"**
3. Completa el login con tu cuenta de Google normalmente
4. Espera a que cargue el **home de Spotify** (debe verse tu biblioteca y playlists)
5. Regresa a la terminal — verás el Inspector pausado
6. Presiona el botón **Resume ▶** en el Inspector

### Paso 3 — Verificar que se creó el archivo de sesión
```bash
ls -la E2ETest/auth/spotify_state.json
# Debe existir y pesar más de 5 KB
```

### Paso 4 — Verificar que los tests E2E corren localmente
```bash
# Tests de Playlist (6 tests)
npx playwright test --project=playlist --headed

# Tests de Búsqueda (6 tests)
npx playwright test --project=busqueda --headed
```

Salida esperada en cada proyecto:
```
Running 6 tests using 1 worker
6 passed
```

> ⚠️ `spotify_state.json` contiene tu sesión activa de Spotify. Está en el `.gitignore` por seguridad. **Nunca lo subas a GitHub.**

---

## 🔑 Configurar el secreto en GitHub

El pipeline de Playwright necesita acceder a la sesión de Spotify en el servidor de GitHub. Como `spotify_state.json` está ignorado por Git, se guarda como secreto cifrado en GitHub.

### Paso 1 — Copiar el contenido del archivo de sesión
```bash
cat E2ETest/auth/spotify_state.json
```
Selecciona y copia **todo** el contenido que aparece.

### Paso 2 — Crear el secreto en GitHub
1. Ve a tu repositorio en GitHub
2. Click en **Settings** (pestaña superior)
3. En el menú lateral: **Secrets and variables** → **Actions**
4. Click en **"New repository secret"**
5. Configura:
   - **Name:** `SPOTIFY_AUTH_JSON`
   - **Secret:** pega el contenido copiado en el paso anterior
6. Click en **"Add secret"**

### Paso 3 — Verificar
El secreto aparecerá en la lista como `SPOTIFY_AUTH_JSON`. GitHub lo cifra automáticamente y nunca lo muestra en texto plano, ni siquiera en los logs del pipeline.

---

## ⚙️ Pipeline 1 — Tests Unitarios Jest

**Archivo:** `.github/workflows/ci-jest.yml`  
**Se activa en:** Push y Pull Request a `main`  
**Ejecuta:** 12 tests unitarios organizados en 12 suites independientes

```yaml
# .github/workflows/ci-jest.yml
# Pipeline 1: ejecuta SOLO los tests unitarios de Jest

name: CI — Tests Unitarios Jest

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-unitarios:
    name: Ejecutar suite Jest
    runs-on: ubuntu-latest

    steps:

      # Descarga el código del repositorio al servidor de GitHub
      - name: Descargar código
        uses: actions/checkout@v4

      # Instala Node.js 20 — misma versión que en desarrollo local
      - name: Instalar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      # Instala Jest y todas las dependencias del package.json
      - name: Instalar dependencias
        run: npm install

      # Ejecuta solo los archivos .test.js dentro de UnitTest/
      # --testPathPatterns es el flag correcto en Jest 30 (plural)
      - name: Ejecutar tests unitarios
        run: npx jest --testPathPatterns="UnitTest"
```

### Casos de prueba ejecutados

| Suite | TC | Funcionalidad | Técnica | Estado esperado |
|---|---|---|---|---|
| TC001.test.js | TC-001 | Creación exitosa de playlist | PEV — Clase Válida | PASS |
| TC002.test.js | TC-002 | Edición exitosa de playlist | PEV — Clase Válida | PASS |
| TC003.test.js | TC-003 | Descripción > 300 caracteres | PEI — Clase Inválida | PASS |
| TC004.test.js | TC-004 | Nombre = 100 caracteres exactos | AVL — N | PASS |
| TC005.test.js | TC-005 | Nombre = 101 caracteres | AVL — N+1 | PASS |
| TC006.test.js | TC-006 | Nombre vacío o solo espacios | Edge Case | PASS |
| TC007.test.js | TC-007 | Búsqueda exitosa "Dua Lipa" | PEV — Clase Válida | PASS |
| TC008.test.js | TC-008 | Término inexistente | PEI — Clase Inválida | PASS |
| TC009.test.js | TC-009 | Término regional hiperespecífico | PEI — Clase Inválida | PASS |
| TC010.test.js | TC-010 | Cadena de 800+ caracteres | PEI — Clase Inválida | PASS |
| TC011.test.js | TC-011 | Campo vacío / solo espacios | Edge Case | PASS |
| TC012.test.js | TC-012 | Inyección XSS y SQL | Edge Case — Seguridad | PASS |

### Resultado en GitHub Actions
```
Test Suites: 12 passed, 12 total
Tests:       16 passed, 16 total
Time:        ~15s
```

---

## ⚙️ Pipeline 2 — Tests E2E Playwright

**Archivo:** `.github/workflows/ci-playwright.yml`  
**Se activa en:** Pull Request a `main` únicamente  
**Ejecuta:** 12 tests E2E divididos en dos proyectos (`playlist` y `busqueda`)

```yaml
# .github/workflows/ci-playwright.yml
# Pipeline 2: ejecuta los tests E2E de Playwright en cada Pull Request

name: CI — Tests E2E Playwright

on:
  pull_request:
    branches: [ main ]

jobs:
  test-e2e:
    name: Ejecutar suite Playwright
    runs-on: ubuntu-latest

    steps:

      - name: Descargar código
        uses: actions/checkout@v4

      - name: Instalar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Instalar dependencias
        run: npm install

      # Instala solo Chromium — Firefox y WebKit están comentados en el config
      - name: Instalar navegadores Playwright
        run: npx playwright install --with-deps chromium

      # Restaurar la sesión de Spotify desde el secreto de GitHub
      # IMPORTANTE: usar node -e y NO echo/printenv
      # El JSON tiene paréntesis que rompen la sintaxis de bash
      - name: Restaurar sesión de Spotify
        env:
          SPOTIFY_AUTH_JSON: ${{ secrets.SPOTIFY_AUTH_JSON }}
        run: |
          node -e "
            const fs = require('fs');
            fs.mkdirSync('E2ETest/auth', { recursive: true });
            fs.writeFileSync('E2ETest/auth/spotify_state.json', process.env.SPOTIFY_AUTH_JSON);
            console.log('Sesión restaurada:', fs.statSync('E2ETest/auth/spotify_state.json').size, 'bytes');
          "

      # Ejecuta los 6 tests de Gestión de Playlists
      - name: Ejecutar tests E2E Playlist
        run: npx playwright test --project=playlist

      # Ejecuta los 6 tests de Búsqueda y Filtrado
      - name: Ejecutar tests E2E Búsqueda
        run: npx playwright test --project=busqueda

      # Sube el reporte HTML como artefacto descargable
      # if: always() → se sube aunque los tests fallen (para ver el error)
      - name: Subir reporte Playwright
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Casos de prueba ejecutados

| Suite | TC | Funcionalidad | Técnica | Estado esperado |
|---|---|---|---|---|
| TC001.spec.ts | TC-001 | Creación exitosa de playlist | PEV — Clase Válida | PASS |
| TC002.spec.ts | TC-002 | Edición exitosa de playlist | PEV — Clase Válida | PASS |
| TC003.spec.ts | TC-003 | Descripción > 300 caracteres | PEI — Clase Inválida | PASS |
| TC004.spec.ts | TC-004 | Nombre = 100 caracteres exactos | AVL — N | PASS |
| TC005.spec.ts | TC-005 | Nombre = 101 caracteres | AVL — N+1 | PASS |
| TC006.spec.ts | TC-006 | Nombre vacío o solo espacios | Edge Case | PASS |
| TC007.spec.ts | TC-007 | Búsqueda exitosa "Dua Lipa" | PEV — Clase Válida | PASS |
| TC008.spec.ts | TC-008 | Término inexistente | PEI — Clase Inválida | PASS |
| TC009.spec.ts | TC-009 | Término regional hiperespecífico | PEI — Clase Inválida | PASS |
| TC010.spec.ts | TC-010 | Cadena de 800+ caracteres | PEI — Clase Inválida | PASS |
| TC011.spec.ts | TC-011 | Campo vacío / solo espacios | Edge Case | PASS |
| TC012.spec.ts | TC-012 | Inyección XSS y SQL | Edge Case — Seguridad | PASS |

### Resultado en GitHub Actions
```
Ejecutar tests E2E Playlist:
  Running 6 tests using 1 worker
  6 passed

Ejecutar tests E2E Búsqueda:
  Running 6 tests using 1 worker
  6 passed

Time: ~2m
```

---

## 🌿 Flujo de trabajo con ramas (Git Flow simplificado)

El pipeline de Playwright **solo se activa en Pull Request**, no en Push directo a `main`. El flujo profesional es el siguiente:

```
┌─────────────┐     push      ┌──────────────────────────┐
│  rama QA    │ ────────────► │  ci-jest.yml corre       │
│  (trabajo)  │               │  ✅ 12 tests unitarios    │
└─────────────┘               └──────────────────────────┘
       │
       │  Pull Request QA → main
       ▼
┌──────────────────────────────────────────────┐
│  Checks del Pull Request                     │
│  ✅ CI — Tests Unitarios Jest  (~15s)        │
│  ✅ CI — Tests E2E Playwright  (~2m)         │
└──────────────────────────────────────────────┘
       │
       │  Merge (solo si todos los checks pasan)
       ▼
┌─────────────┐
│    main     │  ← código verificado ✅
└─────────────┘
```

### Comandos paso a paso

```bash
# 1. Asegurarse de estar en la rama de trabajo
git checkout QA

# 2. Sincronizar con los cambios remotos
git pull origin QA

# 3. Agregar los cambios
git add .
git commit -m "feat: descripción del cambio"

# 4. Subir a GitHub
git push origin QA

# 5. En GitHub: crear Pull Request
#    base: main ← compare: QA
#    Esperar a que los checks pasen

# 6. Hacer Merge cuando todos estén en verde
#    Click en "Merge pull request" → "Confirm merge"

# 7. Sincronizar main localmente
git checkout main
git pull origin main
```

---

## 📄 Configuración de `package.json`

```json
{
  "name": "lab05_",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "type": "commonjs",
  "devDependencies": {
    "@playwright/test": "^1.61.1",
    "@types/node": "^26.1.1",
    "jest": "^30.4.2"
  },
  "jest": {
    "testMatch": [
      "**/UnitTest/**/*.test.js"
    ],
    "testPathIgnorePatterns": [
      "/node_modules/",
      "/E2ETest/"
    ]
  }
}
```

---

## 📄 Configuración de `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './E2ETest',
  timeout: 90000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/resultados.json' }],
    ['list'],
  ],

  use: {
    baseURL: 'https://open.spotify.com',
    // En CI (GitHub Actions) corre headless — en local se ve el navegador
    headless: !!process.env.CI,
    locale: 'es-ES',
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled'],
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    // Setup: login manual una sola vez
    {
      name: 'setup',
      testMatch: /auth\/login\.setup\.ts/,
    },
    // Proyecto 1: tests de Gestión de Playlists
    {
      name: 'playlist',
      testMatch: /Playlist\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'E2ETest/auth/spotify_state.json',
      },
    },
    // Proyecto 2: tests de Búsqueda y Filtrado
    {
      name: 'busqueda',
      testMatch: /Busqueda\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'E2ETest/auth/spotify_state.json',
      },
    },
  ],
});
```

---

## 📁 `.gitignore`

```gitignore
# Dependencias
node_modules/

# Cobertura de pruebas (Jest)
coverage/
*.lcov

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/

# Sistema operativo
.DS_Store
Thumbs.db

# Playwright — reportes y caché
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/

# Sesión de Spotify — NUNCA subir a GitHub
E2ETest/auth/spotify_state.json
E2ETest/.chromium-session/
```

---

## 🧪 Referencia rápida de comandos

```bash
# ── Tests Unitarios ──────────────────────────────────────────
npm test                                        # correr los 12 tests unitarios
npx jest --testPathPatterns="UnitTest"          # equivalente explícito

# ── Tests E2E ────────────────────────────────────────────────
npx playwright test --project=setup --headed    # login manual (solo la primera vez)
npx playwright test --project=playlist --headed # 6 tests de Playlist
npx playwright test --project=busqueda --headed # 6 tests de Búsqueda
npx playwright test --headed                    # todos los tests E2E

# ── Reporte ──────────────────────────────────────────────────
npx playwright show-report                      # abrir reporte HTML en el navegador

# ── Git ──────────────────────────────────────────────────────
git checkout QA                                 # cambiar a rama de trabajo
git pull origin QA                              # sincronizar con GitHub
git push origin QA                              # subir cambios
```

---

## 📊 Resultados obtenidos

### Pipeline 1 — Jest (local y CI)
```
Test Suites: 12 passed, 12 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        3.534s
```

### Pipeline 2 — Playwright (local)
```
Running 6 tests using 1 worker   ← proyecto playlist
6 passed

Running 6 tests using 1 worker   ← proyecto busqueda  
6 passed
```

### GitHub Actions — Checks del Pull Request
```
✅ CI — Tests Unitarios Jest / Ejecutar suite Jest      Successful in 15s
✅ CI — Tests E2E Playwright / Ejecutar suite Playwright  Successful in 1m
```

---

## 🔗 Referencias

- [GitHub Actions — Documentación oficial](https://docs.github.com/es/actions)
- [Jest 30 — CLI Options](https://jestjs.io/docs/cli)
- [Playwright — Autenticación con storageState](https://playwright.dev/docs/auth)
- [Playwright — Configuración de proyectos](https://playwright.dev/docs/test-projects)
- [Guía 08 — IS-489 UNSCH 2026-I](https://github.com/Crisso29/Lab08)


---

# LAB 09 — Quality Gate y Reporte de Calidad

**Asignatura:** IS-489 Pruebas y Aseguramiento de Calidad de Software  
**Docente:** Ing. Lizbeth Jaico Quispe  
**Autor:** Crisologo Aguilar Flores  
**Semestre:** 2026-I  

> **Continuación del Lab 08.** Este laboratorio extiende la infraestructura CI/CD ya construida agregando una capa de control de calidad activo: Quality Gate con umbrales de cobertura y análisis estático con SonarCloud. No se crea un repositorio nuevo — todo opera sobre el mismo repositorio LAB08.

[Informe detallado y completo aquí](https://docs.google.com/document/d/10-r0ya3Q8w2eKWNgGsabeqwqysg8Vjc9/edit?usp=drive_link&ouid=102948391865322967982&rtpof=true&sd=true)
---
# LAB08 — Suite de Pruebas Automatizadas | IS-489 UNSCH 2026-I

![CI Jest](https://github.com/Crisso29/Lab08/actions/workflows/ci-jest.yml/badge.svg)
![CI Playwright](https://github.com/Crisso29/Lab08/actions/workflows/ci-playwright.yml/badge.svg)
![CI SonarCloud](https://github.com/Crisso29/Lab08/actions/workflows/sonarcloud.yml/badge.svg)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=Crisso29_Lab08&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Crisso29_Lab08)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Crisso29_Lab08&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Crisso29_Lab08)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Crisso29_Lab08&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Crisso29_Lab08)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Crisso29_Lab08&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Crisso29_Lab08)
---
## 📋 ¿Qué agrega el Lab 09 al Lab 08?

| Componente | Lab 08 | Lab 09 |
|---|---|---|
| Tests unitarios (Jest) | ✅ Ejecuta y reporta | ✅ + Quality Gate con umbrales |
| Tests E2E (Playwright) | ✅ Ejecuta y reporta | ✅ Sin cambios |
| Cobertura de código | ❌ | ✅ 97.29% global |
| Quality Gate automático | ❌ | ✅ Falla el pipeline si baja del umbral |
| Análisis estático | ❌ | ✅ SonarCloud (bugs, smells, duplicados) |

---

## 📁 Archivos nuevos agregados en este lab

```
LAB08/                              ← mismo repositorio del Lab 08
├── .github/
│   └── workflows/
│       ├── ci-jest.yml             ← MODIFICADO: agrega --coverage y Quality Gate
│       ├── ci-playwright.yml       ← sin cambios
│       └── sonarcloud.yml          ← NUEVO: análisis estático en cada Push/PR
│
├── sonar-project.properties        ← NUEVO: descriptor del proyecto para SonarCloud
│
├── UnitTest/
│   └── Playlist/
│       ├── TC001.test.js           ← MODIFICADO: +1 test para cobertura línea 44
│       └── TC002.test.js           ← MODIFICADO: +2 tests para cobertura líneas 73 y 81
│
└── coverage/                       ← generado automáticamente (.gitignore)
    └── lcov-report/
        └── index.html              ← reporte HTML de cobertura (abrir en navegador)
```

---

## 📊 Caso Práctico 1 — Reporte de Cobertura con Jest

### ¿Qué es la cobertura de código?

La cobertura mide qué porcentaje del código fuente fue ejecutado durante los tests. Jest genera 4 métricas:

| Métrica | ¿Qué mide? | Ejemplo |
|---|---|---|
| **Statements** | % de instrucciones ejecutadas | `if`, `return`, asignaciones |
| **Branches** | % de ramas condicionales cubiertas | El `true` Y el `false` de cada `if` |
| **Functions** | % de funciones invocadas al menos una vez | `crearPlaylist()`, `buscar()` |
| **Lines** | % de líneas ejecutadas | Similar a Statements |

> ⚠️ **El 100% no es el objetivo.** Lo importante es cubrir los flujos críticos y los casos de error. La industria usa 70-80% como umbral mínimo para producción.

### Paso 1 — Ejecutar el reporte

```bash
npm run test:coverage
```

### Paso 2 — Leer la tabla en la terminal

```
--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------|---------|----------|---------|---------|-------------------
All files     |   97.29 |    93.33 |     100 |     100 |
 Busqueda     |      95 |    91.66 |     100 |     100 |
  busqueda.js |      95 |    91.66 |     100 |     100 | 32
 Playlist     |     100 |    94.44 |     100 |     100 |
  playlist.js |     100 |    94.44 |     100 |     100 | 25
--------------|---------|----------|---------|---------|-------------------
Test Suites: 12 passed, 12 total
Tests:       19 passed, 19 total
Time:        2.69s
```

### Paso 3 — Ver el reporte HTML detallado

Jest genera un reporte HTML que muestra exactamente qué líneas están cubiertas:

```bash
# Opción 1: arrastra el archivo al navegador
coverage/lcov-report/index.html

# Opción 2: en VS Code → clic derecho → Open with Live Server
```

**Colores en el reporte HTML:**
- 🟢 **Verde** → línea ejecutada por los tests
- 🔴 **Rojo** → línea nunca ejecutada (sin cobertura)
- 🟡 **Amarillo** → línea parcialmente cubierta (solo un branch del `if`)

### Cobertura inicial vs final

El análisis del reporte HTML reveló 3 ramas no cubiertas en `playlist.js`:

| Línea | Función | Branch no cubierto | Test que faltaba |
|---|---|---|---|
| 44 | `crearPlaylist()` | `descripcion > MAX_DESCRIPCION` | TC-001b |
| 73 | `editarPlaylist()` | `nombre vacío o espacios` | TC-002b |
| 81 | `editarPlaylist()` | `nombre > MAX_NOMBRE` | TC-002c |

Se agregaron 3 tests adicionales en `TC001.test.js` y `TC002.test.js`:

```javascript
// En TC001.test.js — cubre línea 44 de playlist.js
describe("TC-001b: Creación rechazada cuando descripción supera 300 caracteres", () => {
  test("debe retornar error cuando la descripción supera los 300 caracteres en crearPlaylist", () => {
    // Arrange
    const nombre = "Playlist válida";
    const descripcion301 =
      "Seleccion especial de huaynos, musica andina y folklore tradicional " +
      "del departamento de Ayacucho, Peru. Esta playlist incluye artistas y " +
      "agrupaciones de Huamanga, Cangallo, Vilcashuaman, Vinchos y Victor " +
      "Fajardo. Para escuchar personalmente y en familia. Comparte y disfruta!!!";

    // Act
    const resultado = crearPlaylist(nombre, descripcion301);

    // Assert
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/descripci[oó]n/i);
  });
});
```

```javascript
// En TC002.test.js — cubre línea 73 de playlist.js
describe("TC-002b: Edición rechazada con nombre vacío en editarPlaylist", () => {
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

// En TC002.test.js — cubre línea 81 de playlist.js
describe("TC-002c: Edición rechazada con nombre > 100 caracteres en editarPlaylist", () => {
  test("debe retornar error cuando el nuevo nombre supera los 100 caracteres", () => {
    // Arrange
    const playlistExistente = { id: "pl-001", nombre: "Original", descripcion: "" };
    const nombre101 =
      "Musica Andina Peruana Tradicional de la Region de Ayacucho " +
      "Para Escuchar y Disfrutar ABCDEFGHAIJKLMNO";

    // Act
    const resultado = editarPlaylist(playlistExistente, nombre101);

    // Assert
    expect(nombre101.length).toBeGreaterThan(100);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toMatch(/nombre/i);
  });
});
```

**Resultado final:** de 16 tests con 89.18% de cobertura → **19 tests con 97.29% de cobertura**.

---

## 🚦 Caso Práctico 2 — Quality Gate en el Pipeline CI/CD

### ¿Qué es un Quality Gate?

Es como el control de calidad de una fábrica — antes de que el código llegue a `main`, debe pasar por una revisión automática. Si no cumple los estándares mínimos, **el pipeline falla y bloquea el merge**.

### Paso 1 — Definir los umbrales en `package.json`

Agrega el atributo `coverageThreshold` al bloque `"jest"`:

```json
"jest": {
  "testMatch": [
    "**/UnitTest/**/*.test.js"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/E2ETest/"
  ],
  "coverageThreshold": {
    "global": {
      "statements": 90,
      "branches":   85,
      "functions":  100,
      "lines":      95
    }
  }
}
```

Con esta configuración, `npm run test:coverage` falla automáticamente si:
- Statements baja de **90%**
- Branches baja de **85%**
- Functions baja de **100%**
- Lines baja de **95%**

### Resultado del Quality Gate

| Métrica | Umbral | Cobertura real | Estado |
|---|---|---|---|
| Statements | 90% | 97.29% | ✅ PASS |
| Branches | 85% | 93.33% | ✅ PASS |
| Functions | 100% | 100.00% | ✅ PASS |
| Lines | 95% | 100.00% | ✅ PASS |

### Paso 2 — Actualizar `ci-jest.yml` para incluir cobertura

El único cambio al pipeline es agregar `--coverage` al comando de Jest y un paso para subir el reporte:

```yaml
# .github/workflows/ci-jest.yml
name: CI — Tests Unitarios Jest

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-unitarios:
    name: Ejecutar suite Jest
    runs-on: ubuntu-latest

    steps:

      - name: Descargar código
        uses: actions/checkout@v4

      - name: Instalar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Instalar dependencias
        run: npm install

      # --coverage activa el Quality Gate definido en package.json
      # Si la cobertura baja del umbral, este paso falla y bloquea el merge
      - name: Ejecutar tests unitarios con Quality Gate
        run: npx jest --testPathPatterns="UnitTest" --coverage

      # Sube el reporte HTML como artefacto descargable
      # if: always() → se sube aunque el Quality Gate falle
      - name: Subir reporte de cobertura
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7
```

> **¿Por qué `if: always()`?** Si el Quality Gate falla, el artefacto se sube de todas formas para que puedas revisar exactamente qué líneas no están cubiertas y diagnosticar el problema.

---

## 🔍 Caso Práctico 3 — Análisis Estático con SonarCloud

### ¿Qué es SonarCloud?

SonarCloud analiza el código **sin ejecutarlo** y detecta problemas que los tests no pueden encontrar: bugs estructurales, vulnerabilidades de seguridad, código duplicado y deuda técnica. Es gratuito para repositorios públicos.

| Lo que detecta | Ejemplo |
|---|---|
| **Bug** | Variable usada antes de inicializarse |
| **Vulnerability** | Credencial hardcodeada en el código |
| **Code Smell** | Función con más de 50 líneas sin comentarios |
| **Duplication** | Mismo bloque de validación en 3 archivos |

### Paso 1 — Crear cuenta y conectar el repositorio

1. Ve a **https://sonarcloud.io**
2. Click en **Log in with GitHub**
3. En el dashboard → **+** → **Analyze new project**
4. Selecciona el repositorio **Lab08**
5. Click en **Set Up**

### ⚠️ Paso crítico — Desactivar el Automatic Analysis

SonarCloud activa el análisis automático por defecto. Si no lo desactivas, el pipeline fallará con:
```
You are running CI analysis while Automatic Analysis is enabled.
```

**Solución:**
1. En SonarCloud → tu proyecto → **Administration**
2. Click en **Analysis Method**
3. Cambia **Automatic Analysis** de **ON** a **OFF**

### Paso 2 — Obtener el token de autenticación

1. En SonarCloud → tu nombre (arriba a la derecha) → **My Account**
2. Click en **Security**
3. En **Generate Tokens** → Name: `LAB08_TOKEN` → Click **Generate**
4. **Copia el token** — solo se muestra una vez

### Paso 3 — Guardar el token como secreto en GitHub

1. Ve a tu repo en GitHub → **Settings**
2. **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Name: `SONAR_TOKEN` | Secret: pega el token
5. Click **Add secret**

### Paso 4 — Crear `sonar-project.properties`

Crea este archivo en la **raíz del proyecto** (al mismo nivel que `package.json`):

```properties
# sonar-project.properties

# Identificador único del proyecto en SonarCloud
sonar.projectKey=Crisso29_Lab08

# Nombre que aparece en el dashboard
sonar.projectName=Lab08 - Pipeline CI/CD

# Organización en SonarCloud (tu usuario de GitHub en minúsculas)
sonar.organization=crisso29

# Solo código fuente — NO incluir los tests aquí
# ⚠️ Si pones UnitTest/ aquí Y en sonar.tests, SonarCloud falla
sonar.sources=src

# Carpeta de tests — separada de sonar.sources
sonar.tests=UnitTest

# Exclusiones del análisis
sonar.exclusions=**/node_modules/**,**/coverage/**

# Ruta al reporte de cobertura generado por Jest
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
```

> ⚠️ **Error común:** Si incluyes `UnitTest/` tanto en `sonar.sources` como en `sonar.tests`, SonarCloud falla con `File can't be indexed twice`. La solución es que `sonar.sources` apunte **solo a `src/`** y `sonar.tests` apunte **solo a `UnitTest/`**.

### Paso 5 — Crear `.github/workflows/sonarcloud.yml`

```yaml
# .github/workflows/sonarcloud.yml
name: CI — Análisis SonarCloud

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  sonarcloud:
    name: Análisis SonarCloud
    runs-on: ubuntu-latest

    steps:

      - name: Descargar código
        uses: actions/checkout@v4
        with:
          # fetch-depth: 0 descarga el historial COMPLETO del repo
          # Sin esto, SonarCloud no puede comparar código nuevo vs existente
          fetch-depth: 0

      - name: Instalar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Instalar dependencias
        run: npm install

      # Generar coverage/lcov.info para que SonarCloud muestre la cobertura
      - name: Generar reporte de cobertura
        run: npx jest --testPathPatterns="UnitTest" --coverage --coverageReporters=lcov

      # Ejecutar el análisis estático
      - name: Análisis SonarCloud
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN:  ${{ secrets.SONAR_TOKEN }}
```

> **¿Por qué `fetch-depth: 0`?** Sin el historial completo, SonarCloud trata todo el código como "nuevo" y no puede calcular métricas de deuda técnica acumulada ni comparar con análisis anteriores.

### Paso 6 — Hacer push y verificar en SonarCloud

```bash
git add sonar-project.properties
git add .github/workflows/sonarcloud.yml
git commit -m "lab09: agregar análisis estático SonarCloud"
git push origin main
```

Ve a **sonarcloud.io** → tu proyecto y verifica el dashboard.

---

## 📊 Resultados obtenidos en SonarCloud

```
✅ Quality Gate Status:  PASSED — All conditions passed
📊 Open Issues:          7 (code smells menores de legibilidad)
🔄 Duplications:         0.0% — sin código duplicado
📈 Coverage:             95.6% — por encima del umbral industrial
🔒 Security:             0 vulnerabilidades — calificación A
🐛 Reliability:          0 bugs — calificación A
🔧 Maintainability:      7 code smells — calificación A
```

### ¿Por qué SonarCloud muestra 95.6% y Jest muestra 97.29%?

Es normal — usan métodos de instrumentación diferentes:
- **Jest** analiza solo los módulos cargados durante la ejecución de los tests
- **SonarCloud** analiza todos los archivos en `sonar.sources` incluyendo los que no tienen tests asociados

Ambas métricas están muy por encima del estándar industrial del 70-80%.

---

## 🗂️ Estado final de los tres pipelines

```
✅ CI — Tests Unitarios Jest      → ci-jest.yml       → Push y PR a main  → 19 tests + Quality Gate
✅ CI — Tests E2E Playwright      → ci-playwright.yml → PR a main          → 12 tests E2E
✅ CI — Análisis SonarCloud       → sonarcloud.yml    → Push y PR a main   → Quality Gate PASSED
```

---

## 🧪 Referencia rápida de comandos

```bash
# Generar reporte de cobertura local
npm run test:coverage

# Ver el reporte HTML en el navegador
# Arrastra este archivo al navegador:
coverage/lcov-report/index.html

# Verificar que el Quality Gate pasa localmente
npx jest --testPathPatterns="UnitTest" --coverage

# Forzar re-ejecución del pipeline de SonarCloud sin cambios de código
git commit --allow-empty -m "chore: re-ejecutar análisis SonarCloud"
git push origin main
```

---

## 🔗 Referencias

- [Jest — coverageThreshold](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [SonarCloud Documentation](https://docs.sonarsource.com/sonarcloud/)
- [SonarCloud — GitHub Actions Integration](https://github.com/SonarSource/sonarcloud-github-action)
- [Guía 09 — IS-489 UNSCH 2026-I](https://github.com/Crisso29/Lab08)