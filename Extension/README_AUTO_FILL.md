# Auto-Llenado de Formulario desde Excel

## Descripción

Esta extensión permite cargar datos desde un archivo Excel (.xlsx, .xlsm) y llenar automáticamente el formulario stepper de la aplicación, siguiendo el flujo definido en las pruebas de Playwright.

## Cómo Usar

### 1. Instalar la Extensión

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo de desarrollador" (esquina superior derecha)
3. Click en "Cargar extensión sin empaquetar"
4. Selecciona la carpeta `Extension`

### 2. Preparar el Archivo Excel

El archivo Excel debe seguir el mapeo definido en `example_data.json`:

**Hoja de Excel:**
- Celda B2: Nombre completo (se separará automáticamente)
- Celda B3: Ciudad
- Celda B4: Profesión
- Celda B5: Fecha de nacimiento (dd/mm/yyyy)
- Celda B6: Cédula
- Celda B7: Nivel de seniority (JUNIOR, SEMI-SENIOR, SENIOR)
- Celda B9: Años de experiencia

**Experiencia Profesional (3 entradas):**
- Fila 12: Compañía (A12), Cargo (B12), Actividades (C12), Periodo (D12)
- Fila 13: Segunda experiencia
- Fila 14: Tercera experiencia

**Conocimientos:**
- B16: Lenguajes de programación (separados por comas, máx 4)
- B17: Bases de datos
- B18: Aplicaciones
- B19: Frameworks
- B20: Plataformas
- B21: Herramientas
- B22: Otros

**Cursos/Certificaciones:**
- Fila 25: Institución (A25), Curso (B25), Fecha (D25)
- Filas 26-27: Certificaciones adicionales

### 3. Usar la Extensión

1. **Abre la página del formulario** en una pestaña del navegador
   - Debe ser la página con el botón `person_add` que abre el diálogo
   - Ejemplo: `file:///ruta/a/Slides/dialog.html`

2. **Abre el popup de la extensión**
   - Click en el ícono de la extensión en la barra de herramientas

3. **Selecciona el archivo Excel**
   - Click en "Seleccionar Archivo Excel"
   - Elige tu archivo .xlsx o .xlsm
   - Espera a que se procesen los datos

4. **Revisa los datos**
   - Los datos procesados se mostrarán en el preview
   - Verifica que todo sea correcto

5. **Rellena el formulario**
   - Click en "Rellenar Formulario"
   - La extensión automáticamente:
     - Buscará y hará click en el botón `person_add` para abrir el diálogo
     - Completará todos los pasos del formulario
     - Navegará entre los pasos automáticamente

**Nota:** Si la página ya estaba abierta antes de instalar la extensión, la extensión inyectará automáticamente el código necesario. No necesitas recargar la página.

## Flujo de Llenado

El llenado sigue este orden:

### Paso 0: Abrir Diálogo
- Busca el botón con icono `person_add`
- Hace click para abrir el diálogo del formulario
- Espera a que el diálogo se abra completamente

### Paso 1: Información Básica
- Nombre
- Primer apellido
- Segundo apellido
- Documento de identidad
- Edad (calculada desde fecha de nacimiento)
- Ciudad

### Paso 2: Experiencia Profesional
Para cada una de las 3 experiencias:
- Compañía
- Cargo
- Actividades/Funciones
- Periodo inicio
- Periodo fin

### Paso 3: Conocimientos Técnicos
- Lenguajes de programación
- Bases de datos
- Aplicaciones
- Frameworks
- Plataformas
- Herramientas
- Otros conocimientos

### Paso 4: Formación Académica
- Nivel académico (derivado de la profesión)
- Institución principal + Título
- Hasta 3 cursos/certificaciones adicionales con fechas

## Características

✅ **Inyección Automática:**
- Detecta si el content script está cargado
- Si no lo está, lo inyecta automáticamente
- No necesitas recargar la página si ya estaba abierta

✅ **Apertura Automática del Formulario:**
- Busca y hace click en el botón `person_add` automáticamente
- Abre el diálogo del formulario antes de llenarlo
- Espera a que esté completamente cargado

✅ **Transformación Automática de Datos:**
- Separa nombres completos en nombre y apellidos
- Convierte fechas de Excel a formato dd/mm/yyyy
- Calcula edad desde fecha de nacimiento
- Normaliza niveles de seniority
- Valida y filtra valores contra listas permitidas
- Maneja fechas en formato "Mes Año" (ej: "Agosto 2023")
- Detecta "Actualidad" en periodos de trabajo

✅ **Navegación Inteligente:**
- Espera a que los elementos estén disponibles
- Navega automáticamente entre pasos
- Maneja elementos dinámicos de Angular Material
- Delays realistas entre acciones

✅ **Manejo de Errores:**
- Continúa aunque falten datos
- Registra advertencias en consola
- Proporciona feedback visual al usuario

## Solución de Problemas

### "Could not establish connection"
Este error indica que el content script no estaba cargado. La extensión ahora lo inyecta automáticamente, pero si el problema persiste:
- Recarga la página del formulario (F5)
- Recarga la extensión en `chrome://extensions/`
- Verifica los permisos de la extensión

### El formulario no se llena
- Verifica que estés en la página correcta (debe tener el botón `person_add`)
- Abre la consola del navegador (F12) para ver logs detallados
- Busca mensajes que empiecen con ✅, 📝, o ⚠️
- Verifica que el diálogo se abra correctamente

### No encuentra el botón person_add
- Verifica que la página tenga el botón con el icono Material `person_add`
- Si el diálogo ya está abierto, la extensión continuará con el llenado
- Revisa la consola para ver el mensaje específico

### Algunos campos quedan vacíos
- Revisa que el Excel tenga los datos en las celdas correctas
- Algunos campos no están en el JSON (email, país, departamento)
- Verifica la consola para ver advertencias específicas

### La extensión no aparece
- Recarga la extensión en `chrome://extensions/`
- Verifica que no haya errores en el background script

## Archivos Importantes

- `ExcelReader.js`: Procesa el archivo Excel y transforma los datos
- `popup.js`: Interfaz de usuario y envío de datos
- `content.js`: Lógica de auto-llenado del formulario
- `example_data.json`: Mapeo de celdas Excel → campos JSON
- `example_data.xlsm`: Archivo de ejemplo con datos de prueba

## Desarrollo

Para modificar el mapeo de datos:
1. Edita `example_data.json` con las referencias de celdas
2. ExcelReader procesará automáticamente según el nuevo mapeo

Para agregar nuevos campos al formulario:
1. Identifica los selectores en el HTML
2. Agrega la lógica en `content.js` en la función del paso correspondiente
3. Actualiza el mapeo en `example_data.json` si es necesario

## Pruebas

Se incluye un conjunto de pruebas con Playwright en `playwright/tests/example.spec.js` que documenta el flujo completo del formulario y los selectores de cada campo.

Para ejecutar las pruebas:
```bash
cd playwright
npm install
npx playwright test
```
