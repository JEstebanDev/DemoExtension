/**
 * Archivo de ejemplo para demostrar cómo usar la clase ExcelReader
 * 
 * Para usar este archivo:
 * 1. Asegúrate de que xlsx.full.min.js esté cargado antes de este script
 * 2. Incluye este archivo en tu HTML o ejecútalo en la consola
 */

// Ejemplo de uso básico
async function testExcelReader() {
    try {
        // Crear instancia de ExcelReader
        const reader = new ExcelReader(
            'example_data.xlsm',  // Ruta al archivo Excel
            'example_data.json'   // Ruta al archivo de mapeo JSON
        );

        // Ejecutar la lectura
        const data = await reader.read();
        
        // Los datos ya se muestran en console.log dentro del método read()
        // Pero también puedes acceder a ellos aquí
        console.log('Datos disponibles:', data);
        
        return data;
    } catch (error) {
        console.error('Error en la prueba:', error);
    }
}

// Ejecutar automáticamente si se carga en un contexto adecuado
// (comentar esta línea si prefieres ejecutarlo manualmente)
// testExcelReader();
