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
        const status = document.getElementById('status');
        if (status) {
            status.textContent = 'Error: No se pudo cargar la librería XLSX. Por favor recarga la extensión.';
            status.className = 'status error';
            status.classList.remove('hidden');
        }
        console.error('XLSX no está disponible');
        return;
    }

    const fileInput = document.getElementById('excelFile');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const status = document.getElementById('status');
    const dataPreview = document.getElementById('dataPreview');
    const dataList = document.getElementById('dataList');
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

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            showStatus('Por favor selecciona un archivo Excel (.xlsx o .xls)', 'error');
            return;
        }

        showStatus('Leyendo archivo...', 'loading');
        dataPreview.classList.add('hidden');
        fillFormBtn.classList.add('hidden');

        try {
            const data = await readExcelFile(file);
            excelData = data;
            
            if (data && data.length > 0) {
                displayData(data[0]); // Mostrar primera fila
                dataPreview.classList.remove('hidden');
                fillFormBtn.classList.remove('hidden');
                showStatus(`Archivo leído correctamente. ${data.length} registro(s) encontrado(s).`, 'success');
            } else {
                showStatus('No se encontraron datos en el archivo Excel', 'error');
            }
        } catch (error) {
            console.error('Error al leer archivo:', error);
            showStatus('Error al leer el archivo: ' + error.message, 'error');
        }
    });

    // Rellenar formulario
    fillFormBtn.addEventListener('click', async () => {
        if (!excelData || excelData.length === 0) {
            showStatus('No hay datos para rellenar', 'error');
            return;
        }

        try {
            // Obtener la pestaña activa
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Enviar datos al content script
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'fillForm',
                data: excelData[0] // Usar primera fila
            });

            // Verificar la respuesta del content script
            if (response && response.success) {
                showSuccessMessage();
            } else if (response && response.error) {
                // Mostrar el error específico del content script
                showStatus(response.error, 'error');
            } else {
                showSuccessMessage();
            }
        } catch (error) {
            console.error('Error al rellenar formulario:', error);
            // Si el error es porque no hay content script inyectado
            if (error.message && error.message.includes('Could not establish connection')) {
                showStatus('Error: No se pudo conectar con la página. Asegúrate de estar en la página correcta con el formulario.', 'error');
            } else {
                showStatus('Error al rellenar formulario: ' + error.message, 'error');
            }
        }
    });

    function readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Obtener la primera hoja
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Convertir a JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    // Mapear columnas (soporta diferentes nombres de columnas)
                    const mappedData = jsonData.map(row => {
                        const mapped = {};
                        
                        // Buscar columnas por diferentes nombres posibles
                        mapped.nombre = findColumnValue(row, ['nombre', 'Nombre', 'NOMBRE', 'name', 'Name']);
                        mapped.apellido = findColumnValue(row, ['apellido', 'Apellido', 'APELLIDO', 'lastname', 'Lastname', 'last name']);
                        mapped.edad = findColumnValue(row, ['edad', 'Edad', 'EDAD', 'age', 'Age']);
                        mapped.ciudad = findColumnValue(row, ['ciudad', 'Ciudad', 'CIUDAD', 'city', 'City']);
                        mapped.experiencia = findColumnValue(row, ['años de experiencia', 'Años de Experiencia', 'AÑOS DE EXPERIENCIA', 'experiencia', 'Experiencia', 'years of experience', 'years']);
                        mapped.rol = findColumnValue(row, ['rol', 'Rol', 'ROL', 'role', 'Role']);
                        
                        return mapped;
                    });
                    
                    resolve(mappedData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    function findColumnValue(row, possibleNames) {
        for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                return row[name];
            }
        }
        return null;
    }

    function displayData(data) {
        dataList.innerHTML = '';
        const fields = [
            { label: 'Nombre', key: 'nombre' },
            { label: 'Apellido', key: 'apellido' },
            { label: 'Edad', key: 'edad' },
            { label: 'Ciudad', key: 'ciudad' },
            { label: 'Años de Experiencia', key: 'experiencia' },
            { label: 'Rol', key: 'rol' }
        ];

        fields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'data-item';
            const value = data[field.key] || 'N/A';
            item.innerHTML = `<strong>${field.label}:</strong> <span>${value}</span>`;
            dataList.appendChild(item);
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
    }

    function showSuccessMessage() {
        // Ocultar todos los elementos excepto el mensaje de éxito
        const fileInputContainer = document.querySelector('.file-input-container');
        const statusElement = document.getElementById('status');
        const dataPreview = document.getElementById('dataPreview');
        const successMessage = document.getElementById('successMessage');
        
        if (fileInputContainer) fileInputContainer.classList.add('hidden');
        if (statusElement) statusElement.classList.add('hidden');
        if (dataPreview) dataPreview.classList.add('hidden');
        
        // Mostrar mensaje de éxito
        if (successMessage) {
            successMessage.classList.remove('hidden');
            
            // Cerrar popup después de 3 segundos para que el usuario vea el mensaje
            setTimeout(() => {
                window.close();
            }, 3000);
        } else {
            // Fallback si no existe el elemento
            showStatus('Formulario rellenado correctamente', 'success');
            setTimeout(() => {
                window.close();
            }, 1000);
        }
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

