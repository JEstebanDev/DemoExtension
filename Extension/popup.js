// Esperar a que XLSX esté disponible
function waitForXLSX() {
    return new Promise((resolve) => {
        if (typeof XLSX !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof XLSX !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
            
            // Timeout después de 5 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
                if (typeof XLSX === 'undefined') {
                    console.error('XLSX no se pudo cargar');
                }
                resolve();
            }, 5000);
        }
    });
}

function initPopup() {
    // Esperar a que tanto el DOM como XLSX estén listos
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForXLSX().then(() => {
                setupPopup();
            });
        });
    } else {
        waitForXLSX().then(() => {
            setupPopup();
        });
    }
}

function setupPopup() {
    // Verificar que XLSX esté disponible
    if (typeof XLSX === 'undefined') {
        console.error('XLSX no está disponible');
        return;
    }

    const fileInput = document.getElementById('excelFile');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fillFormBtn = document.getElementById('fillFormBtn');

    let excelData = null;

    // Abrir selector de archivos al hacer click en el botón
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Manejar selección de archivo
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls|xlsm)$/i)) {
            console.error('Por favor selecciona un archivo Excel (.xlsx, .xls o .xlsm)');
            return;
        }

        // Verificar que ExcelReader esté disponible
        if (typeof ExcelReader === 'undefined') {
            console.error('Error: ExcelReader no está disponible. Asegúrate de que ExcelReader.js esté cargado.');
            return;
        }

        fillFormBtn.classList.add('hidden');
        const errorMessage = document.getElementById('errorMessage');
        const errorDetails = document.getElementById('errorDetails');
        errorMessage.classList.add('hidden');

        try {
            const reader = new ExcelReader(null, 'example_data.json');
            const data = await reader.readFromFile(file, 'example_data.json');
            
            excelData = data;
            
            if (data && typeof data === 'object') {
                fillFormBtn.classList.remove('hidden');
            }

            console.log('✅ Datos extraídos exitosamente:', data);
        } catch (error) {
            console.error('Error al leer el Excel:', error);
            // Mostrar mensaje de validación al usuario en el popup
            if (errorMessage && errorDetails) {
                errorDetails.textContent = error.message;
                errorMessage.classList.remove('hidden');
            }
        }
    });
    // Manejar click en botón "Rellenar Formulario"
    fillFormBtn.addEventListener('click', async () => {
        if (!excelData) {
            console.error('Error: No hay datos cargados. Por favor selecciona un archivo Excel primero.');
            return;
        }

        try {
            // Obtener la pestaña activa
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                console.error('Error: No se pudo encontrar la pestaña activa');
                return;
            }

            // Asegurarse de que el content script esté inyectado
            try {
                await ensureContentScriptLoaded(tab.id);
            } catch (error) {
                console.error('Error al inyectar content script:', error);
                return;
            }

            // Enviar mensaje al content script con los datos
            chrome.tabs.sendMessage(
                tab.id,
                {
                    action: 'fillForm',
                    data: excelData
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error al enviar mensaje:', chrome.runtime.lastError);
                        return;
                    }

                    if (response && response.success) {
                        // Mostrar mensaje de éxito animado
                        const successMessage = document.getElementById('successMessage');
                        if (successMessage) {
                            successMessage.classList.remove('hidden');
                            setTimeout(() => {
                                successMessage.classList.add('hidden');
                            }, 5000);
                        }
                        console.log('✅ Formulario completado exitosamente');
                    } else {
                        const errorMsg = response && response.error ? response.error : 'Error desconocido';
                        console.error('Error al completar formulario: ' + errorMsg);
                    }
                }
            );
        } catch (error) {
            console.error('Error al rellenar formulario:', error);
        }
    });

    /**
     * Asegura que el content script esté cargado en la pestaña
     * Si no está, lo inyecta manualmente
     */
    async function ensureContentScriptLoaded(tabId) {
        try {
            // Intentar hacer ping al content script
            const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            
            if (response && response.ready) {
                console.log('Content script ya está cargado');
                return;
            }
        } catch (error) {
            // Si falla, el content script no está cargado, lo inyectamos
            console.log('Content script no detectado, inyectando...');
        }

        // Inyectar el content script manualmente
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        // Esperar un momento para que se inicialice
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Content script inyectado exitosamente');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopup);
} else {
    // Si XLSX ya está cargado, inicializar inmediatamente
    if (typeof XLSX !== 'undefined') {
        initPopup();
    } else {
        // Esperar a que XLSX se cargue
        window.addEventListener('load', initPopup);
    }
}

