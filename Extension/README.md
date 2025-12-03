# Extensión Excel Stepper Form Filler

Extensión de Chrome que permite cargar un archivo Excel (.xlsx) y rellenar automáticamente un formulario con steppers en una página web.

## Características

- Carga archivos Excel (.xlsx) desde el popup de la extensión
- Lee datos de usuario: nombre, apellido, edad, ciudad, años de experiencia y rol
- Rellena automáticamente formularios con steppers
- Avanza automáticamente por todos los pasos del formulario

## Estructura del Proyecto

```
Extension/
├── manifest.json          # Configuración de la extensión (Manifest V3)
├── popup.html            # Interfaz del popup
├── popup.css             # Estilos del popup
├── popup.js              # Lógica para leer Excel y enviar datos
├── content.js            # Script que rellena el formulario
├── background.js         # Service worker
├── index.html            # Página de ejemplo con formulario stepper
├── styles.css            # Estilos del formulario
├── script.js             # Funciones del formulario (nextSlide, prevSlide, finishForm)
└── README.md            # Este archivo
```

## Instalación

1. Abre Chrome y navega a `chrome://extensions/`
2. Activa el "Modo de desarrollador" (Developer mode) en la esquina superior derecha
3. Haz clic en "Cargar extensión sin empaquetar" (Load unpacked)
4. Selecciona la carpeta del proyecto

## Uso

1. Abre la página web que contiene el formulario con steppers (por ejemplo, `index.html`)
2. Haz clic en el icono de la extensión en la barra de herramientas
3. En el popup, haz clic en "Seleccionar Archivo Excel"
4. Selecciona un archivo Excel (.xlsx) con las siguientes columnas:
   - nombre
   - apellido
   - edad
   - ciudad
   - años de experiencia (o "experiencia")
   - rol
5. Verifica los datos leídos en el preview
6. Haz clic en "Rellenar Formulario"
7. La extensión rellenará automáticamente todos los campos y avanzará por los steppers

## Archivo de Ejemplo

Se incluye un archivo `ejemplo_datos.csv` que puedes usar como referencia. Para convertirlo a Excel:
1. Abre el archivo CSV en Excel
2. Guarda como formato .xlsx

## Formato del Archivo Excel

El archivo Excel debe tener las siguientes columnas (los nombres pueden variar en mayúsculas/minúsculas):

- **nombre** (o "Nombre", "NOMBRE", "name", "Name")
- **apellido** (o "Apellido", "APELLIDO", "lastname", "Lastname", "last name")
- **edad** (o "Edad", "EDAD", "age", "Age")
- **ciudad** (o "Ciudad", "CIUDAD", "city", "City")
- **años de experiencia** (o "Años de Experiencia", "experiencia", "Experiencia", "years of experience", "years")
- **rol** (o "Rol", "ROL", "role", "Role")

La extensión procesará la primera fila de datos del archivo Excel.

## Notas Técnicas

- La extensión usa SheetJS (xlsx.js) vía CDN para leer archivos Excel
- El content script se inyecta en todas las páginas (`<all_urls>`)
- Los campos del formulario deben tener los IDs: `#nombre`, `#apellido`, `#edad`, `#ciudad`, `#experiencia`, `#rol`
- La página debe tener las funciones `nextSlide()` y `finishForm()` disponibles globalmente

## Iconos

Nota: El `manifest.json` hace referencia a iconos (`icon16.png`, `icon48.png`, `icon128.png`) que son opcionales. La extensión funcionará sin ellos, pero Chrome mostrará un icono por defecto. Si deseas iconos personalizados:
- Crea imágenes PNG de 16x16, 48x48 y 128x128 píxeles
- Nómbralas como `icon16.png`, `icon48.png`, `icon128.png`
- Colócalas en la raíz del proyecto

## Solución de Problemas

- Si el formulario no se rellena, verifica que los IDs de los campos coincidan
- Si los steppers no avanzan, asegúrate de que las funciones `nextSlide()` y `finishForm()` estén disponibles globalmente
- Revisa la consola del navegador (F12) para ver mensajes de error

