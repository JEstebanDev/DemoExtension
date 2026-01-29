# 📖 Cómo usar ExcelReader

Esta guía te explica cómo poner a funcionar la clase `ExcelReader` que lee archivos Excel (.xlsm) usando un mapeo JSON.

## 📋 Requisitos Previos

1. Los archivos deben estar en la carpeta `Extension/`:
   - `example_data.xlsm` - Archivo Excel con los datos
   - `example_data.json` - Archivo JSON con el mapeo de celdas
   - `ExcelReader.js` - La clase lectora
   - `xlsx.full.min.js` - Librería para leer Excel

2. La extensión debe estar cargada en Chrome con los permisos necesarios

## 🚀 Formas de Usar ExcelReader

### Opción 1: Desde el Popup de la Extensión (Más Fácil)

1. **Abre Chrome** y navega a `chrome://extensions/`
2. **Asegúrate** de que la extensión esté cargada y activa
3. **Haz clic** en el icono de la extensión en la barra de herramientas
4. **Haz clic** en el botón **"📊 Probar ExcelReader (example_data.xlsm)"**
5. **Abre la consola** (F12) para ver los resultados detallados
6. Los datos también se mostrarán en el popup

### Opción 2: Desde la Página de Prueba HTML

1. **Abre Chrome** y navega a `chrome://extensions/`
2. **Copia el ID** de tu extensión (aparece debajo del nombre)
3. **Abre una nueva pestaña** y navega a:
   ```
   chrome-extension://[TU-ID]/test-excel-reader.html
   ```
   Reemplaza `[TU-ID]` con el ID de tu extensión
4. **Haz clic** en el botón **"📊 Leer Excel"**
5. **Revisa** la consola (F12) y la página para ver los resultados

### Opción 3: Desde la Consola del Navegador

1. **Abre** cualquier página web
2. **Abre la consola** (F12 → pestaña Console)
3. **Ejecuta** el siguiente código:

```javascript
// Cargar los scripts necesarios (si no están ya cargados)
const script1 = document.createElement('script');
script1.src = chrome.runtime.getURL('xlsx.full.min.js');
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = chrome.runtime.getURL('ExcelReader.js');
document.head.appendChild(script2);

// Esperar a que se carguen y luego ejecutar
setTimeout(async () => {
    const reader = new ExcelReader('example_data.xlsm', 'example_data.json');
    const data = await reader.read();
    console.log('Datos:', data);
}, 1000);
```

### Opción 4: Integrar en tu Código

```javascript
// En cualquier archivo JavaScript de la extensión
async function leerExcel() {
    try {
        const reader = new ExcelReader(
            'example_data.xlsm',  // Ruta al archivo Excel
            'example_data.json'   // Ruta al archivo de mapeo
        );
        
        const datos = await reader.read();
        
        // Los datos ya se muestran en console.log automáticamente
        // Pero también puedes usarlos aquí
        console.log('Datos disponibles:', datos);
        
        return datos;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Ejecutar
leerExcel();
```

## 📝 Estructura del Mapeo JSON

El archivo `example_data.json` define qué celdas del Excel contienen cada campo:

```json
{
  "nombre": "B2",           // Campo simple: celda B2
  "ciudad": "B3",           // Campo simple: celda B3
  "experiencia": [          // Array de objetos
    {
      "compania": "A12",    // Cada objeto tiene múltiples celdas
      "cargo": "B12",
      "actividades": "C12",
      "periodo": "D12"
    }
  ]
}
```

## 🔍 Verificar que Funciona

Cuando ejecutes la clase, deberías ver en la consola:

```
Archivo Excel cargado correctamente. Hoja: [Nombre de la hoja]
Mapeo JSON cargado correctamente
=== Datos extraídos del Excel ===
{
  "nombre": "...",
  "ciudad": "...",
  ...
}
================================
```

## ⚠️ Solución de Problemas

### Error: "La librería XLSX no está disponible"
- **Solución**: Asegúrate de que `xlsx.full.min.js` esté cargado antes de `ExcelReader.js`
- En HTML: `<script src="xlsx.full.min.js"></script>` debe ir ANTES de `<script src="ExcelReader.js"></script>`

### Error: "Error al cargar el archivo Excel: 404"
- **Solución**: Verifica que `example_data.xlsm` esté en la carpeta `Extension/`
- Verifica que el `manifest.json` incluya el archivo en `web_accessible_resources`

### Error: "Error al cargar el archivo de mapeo: 404"
- **Solución**: Verifica que `example_data.json` esté en la carpeta `Extension/`
- Verifica que el `manifest.json` incluya el archivo en `web_accessible_resources`

### No se muestran datos en la consola
- **Solución**: Abre la consola del navegador (F12) y busca mensajes de error
- Verifica que los nombres de las celdas en el JSON coincidan con las celdas del Excel

## 📚 Ejemplo Completo

```javascript
// Crear instancia
const reader = new ExcelReader('example_data.xlsm', 'example_data.json');

// Leer y procesar
reader.read()
    .then(data => {
        console.log('✅ Éxito!', data);
        // Usar los datos aquí
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
```

## 🎯 Próximos Pasos

Una vez que funcione correctamente, puedes:
- Modificar `example_data.json` para mapear diferentes celdas
- Integrar los datos en tu aplicación
- Usar los datos para rellenar formularios automáticamente
- Procesar múltiples filas del Excel
