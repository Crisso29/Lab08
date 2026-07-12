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