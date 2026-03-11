# Excel Stepper Form Filler (MV3 modular)

## Arquitectura

Extensión MV3 refactorizada en módulos funcionales bajo `src/`, sin bundler.

- `popup` solo gestiona UI y orquestación de caso de uso.
- `content` solo interactúa con el DOM de la página objetivo.
- `excel` contiene pipeline de datos (`load -> map -> format -> validate`).
- `shared` centraliza contratos, utilidades y logging.

## Módulos y Responsabilidad Técnica

### `src/background/`

- `index.js`: service worker MV3.
- Responsabilidad: ciclo de vida (`onInstalled`) y endpoint de salud (`HEALTH_CHECK`).
- Interacción: recibe mensajes de runtime y responde estado de worker.

### `src/popup/`

- `index.js`: controlador principal del popup.
- `state/popupState.js`: estado local (`idle`, `loading`, `ready`, `error`).
- `services/excelService.js`: delega lectura/validación de Excel a `src/excel/`.
- `services/contentBridge.js`: puente de mensajería con content script.

Interacción:
- Lee archivo Excel.
- Obtiene `payload` validado.
- Envía `FILL_FORM_REQUEST` al content script.

### `src/content/`

- `index.js`: router de mensajes (`PING_CONTENT`, `FILL_FORM_REQUEST`).
- `orchestrator/fillFormFlow.js`: flujo secuencial global de llenado.
- `orchestrator/navigation.js`: navegación entre pasos y apertura de formulario.
- `steps/*.js`: lógica aislada por paso.
- `dom/waiters.js`: espera robusta de elementos.
- `dom/selectors.js`: resolución por estrategias declarativas.
- `dom/actions.js`: escritura robusta en inputs/selects y fallbacks.

Interacción:
- Recibe `payload` desde popup.
- Ejecuta flujo paso a paso sobre DOM objetivo.
- Retorna resultado normalizado `{ ok, data, error }`.

### `src/excel/`

- `core/excelLoader.js`: carga workbook desde `File` o ruta.
- `core/mappingProcessor.js`: resuelve mapeo JSON recursivo (celda -> campo).
- `formatters/dateFormatter.js`: transformación de fechas y periodos.
- `formatters/profileFormatter.js`: seniority, profesión y arreglos categóricos.
- `validators/requiredFieldsValidator.js`: validación de campos obligatorios.
- `constants/allowedValues.js`: catálogos permitidos.
- `index.js`: fachada única de lectura para popup.

Interacción:
- Entrada: archivo Excel + mapping path.
- Salida: objeto normalizado y validado listo para `content`.

### `src/shared/`

- `messages.js`: contrato único de acciones y shape de respuesta.
- `logger.js`: logger por contexto.
- `errors.js`: errores de dominio.
- `utils/text.js`: normalización de texto.
- `utils/time.js`: `sleep` y reintentos.

Interacción:
- Es la base reutilizada por `popup`, `content` y `background`.

### `config/mapping/`

- `example_data.json`: esquema de mapeo Excel -> JSON versionado.
- Interacción: consumido por `src/excel/core/mappingProcessor.js`.

### `scripts/`

- `buildless-sync.ps1`: helper operativo para flujo sin bundler.

## Flujo de Comunicación

1. Popup carga Excel y valida datos.
2. Popup resuelve pestaña activa e inyección de scripts (si falta).
3. Popup envía `FILL_FORM_REQUEST` a content.
4. Content ejecuta `fillFormFlow`.
5. Content responde con `{ ok, data, error }`.

## Carga de la extensión

1. Abre `chrome://extensions/`.
2. Activa modo desarrollador.
3. Carga carpeta `Extension`.
4. Verifica que `manifest.json` apunte a `src/background/index.js` y scripts `src/content/*`.

## Testing recomendado

- Caso 1: archivo válido -> `fillFormBtn` visible -> formulario completo.
- Caso 2: faltan obligatorios -> error de validación en popup.
- Caso 3: página abierta antes de cargar extensión -> `ensureContentScriptLoaded` inyecta correctamente.
- Caso 4: fallback de selectores ante cambios menores del DOM.

## Compatibilidad y operación

- Implementación buildless: no requiere pipeline de build.
- Dependencia de lectura Excel: `xlsx.full.min.js`.
- El mapeo se mantiene desacoplado del código en `config/mapping/`.

