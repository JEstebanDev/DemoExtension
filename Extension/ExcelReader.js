/**
 * Clase para leer archivos Excel (.xlsx, .xlsm) usando un mapeo JSON
 * que especifica qué celdas contienen cada campo de datos.
 * Soporta formatos .xlsx y .xlsm (Excel con macros).
 */
class ExcelReader {
    // Listas de valores permitidos para validación
    static ALLOWED_SENIORITY_LEVELS = ["JUNIOR", "SEMI-SENIOR", "SENIOR"];

    static ALLOWED_LANGUAGES = [
        "Java SE",
        "Python",
        "GO",
        "C# (.NET Framework)",
        "CL",
        "Elixir",
        "RPG/ILE",
        "javascript",
        "Cobol",
        "Dart",
        "Typescript",
        "Fundamento CSS",
        "React",
        "Fundamento HTML"
    ];

    static ALLOWED_DATABASES = [
        "SQL Server",
        "PostgreSQL",
        "MySQL",
        "AWS DynamoDB",
        "DB2",
        "IBM Cloudant",
        "MongoDB",
        "ORACLE",
        "REDIS"
    ];

    static ALLOWED_APPLICATIONS = [
        "Artifactory",
        "SWIFT",
        "Amazon EC2"
    ];

    static ALLOWED_FRAMEWORKS = [
        "Spring Boot",
        "ASP MVC",
        "Express",
        "Flask",
        "NPA/NHibernate",
        "Pandas",
        "Scikit-learn",
        "Spring Cloud",
        "Spring Web",
        "Angular",
        "Redux",
        "Universal (SSR)",
        "Next.js (SSR)"
    ];

    static ALLOWED_PLATFORMS = [
        "Docker",
        "Kubernetes",
        "Clear Path",
        "Apache Kafka",
        "Apache Tomcat",
        "IIS",
        "Mockito",
        "Node js",
        "PowerMock",
        "Spark",
        "WAS",
        "WMQ"
    ];

    static ALLOWED_TOOLS = [
        "Análisis estático (SonarQube)",
        "Appium",
        "Gradle",
        "GraphQL",
        "NPM",
        "Postman",
        "Rabbit MQ",
        "Selenium",
        "UrbanCode",
        "WebSocket",
        "Git",
        "Junit",
        "Jscrambler",
        "Webpack",
        "Google Analytics"
    ];

    static ALLOWED_OTHERS = [
        "AMQP",
        "Apache Camel",
        "Azure Active Directory",
        "BDD (Gherkin/Serenity)",
        "Event-driven Architecture",
        "JMS",
        "OAuth 2.0",
        "OpenAPI",
        "Open ID",
        "Pruebas Performance",
        "Web Security",
        "Sterling",
        "Caching",
        "LocalStorage",
        "Service Worker",
        "PWA",
        "DOM y Browser Engine",
        "Flex",
        "DDD"
    ];

    /**
     * Constructor de la clase
     * @param {string} excelPath - Ruta al archivo Excel (.xlsx o .xlsm)
     * @param {string} mappingPath - Ruta al archivo JSON de mapeo
     */
    constructor(excelPath, mappingPath) {
        this.excelPath = excelPath;
        this.mappingPath = mappingPath;
        this.workbook = null;
        this.worksheet = null;
        this.mapping = null;
    }

    /**
     * Carga el archivo Excel desde un objeto File
     * @param {File} file - Archivo Excel seleccionado por el usuario (.xlsx o .xlsm)
     * @returns {Promise<void>}
     */
    async loadExcelFileFromFile(file) {
        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        
                        // Verificar que XLSX esté disponible
                        if (typeof XLSX === 'undefined') {
                            throw new Error('La librería XLSX no está disponible. Asegúrate de incluir xlsx.full.min.js');
                        }

                        // Leer el workbook
                        this.workbook = XLSX.read(data, { type: 'array' });
                        
                        // Obtener la primera hoja
                        if (this.workbook.SheetNames.length === 0) {
                            throw new Error('El archivo Excel no contiene hojas');
                        }
                        
                        const firstSheetName = this.workbook.SheetNames[0];
                        this.worksheet = this.workbook.Sheets[firstSheetName];
                        
                        console.log(`Archivo Excel cargado correctamente. Hoja: ${firstSheetName}`);
                        resolve();
                    } catch (error) {
                        console.error('Error al procesar el archivo Excel:', error);
                        reject(error);
                    }
                };
                
                reader.onerror = (error) => {
                    console.error('Error al leer el archivo:', error);
                    reject(new Error('Error al leer el archivo Excel'));
                };
                
                reader.readAsArrayBuffer(file);
            });
        } catch (error) {
            console.error('Error al cargar el archivo Excel:', error);
            throw error;
        }
    }

    /**
     * Carga el archivo Excel desde la ruta especificada (.xlsx o .xlsm)
     * @returns {Promise<void>}
     */
    async loadExcelFile() {
        try {
            // Intentar cargar usando chrome.runtime.getURL si está disponible (contexto de extensión)
            let url = this.excelPath;
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                url = chrome.runtime.getURL(this.excelPath);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo Excel: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            
            // Verificar que XLSX esté disponible
            if (typeof XLSX === 'undefined') {
                throw new Error('La librería XLSX no está disponible. Asegúrate de incluir xlsx.full.min.js');
            }

            // Leer el workbook
            this.workbook = XLSX.read(data, { type: 'array' });
            
            // Obtener la primera hoja
            if (this.workbook.SheetNames.length === 0) {
                throw new Error('El archivo Excel no contiene hojas');
            }
            
            const firstSheetName = this.workbook.SheetNames[0];
            this.worksheet = this.workbook.Sheets[firstSheetName];
            
            console.log(`Archivo Excel cargado correctamente. Hoja: ${firstSheetName}`);
        } catch (error) {
            console.error('Error al cargar el archivo Excel:', error);
            throw error;
        }
    }

    /**
     * Carga el archivo JSON de mapeo
     * @returns {Promise<void>}
     */
    async loadMapping() {
        try {
            // Intentar cargar usando chrome.runtime.getURL si está disponible
            let url = this.mappingPath;
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                url = chrome.runtime.getURL(this.mappingPath);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo de mapeo: ${response.status} ${response.statusText}`);
            }

            this.mapping = await response.json();
            console.log('Mapeo JSON cargado correctamente');
        } catch (error) {
            console.error('Error al cargar el archivo de mapeo:', error);
            throw error;
        }
    }

    /**
     * Obtiene el valor de una celda específica usando su referencia (ej: "B2")
     * @param {Object} worksheet - Objeto worksheet de XLSX
     * @param {string} cellRef - Referencia de la celda (ej: "B2", "A12")
     * @returns {*} Valor de la celda o null si no existe o está vacía
     */
    getCellValue(worksheet, cellRef) {
        if (!worksheet || !cellRef) {
            return null;
        }

        // XLSX permite acceso directo a celdas usando la referencia como clave
        const cell = worksheet[cellRef];
        
        if (!cell) {
            console.warn(`Celda ${cellRef} no encontrada o vacía`);
            return null;
        }

        // El valor está en la propiedad .v
        // Si tiene formato, podemos usar .w para el valor formateado
        return cell.v !== undefined ? cell.v : null;
    }

    /**
     * Procesa recursivamente el mapeo JSON para extraer valores del Excel
     * @param {Object} worksheet - Objeto worksheet de XLSX
     * @param {*} mappingValue - Valor del mapeo (puede ser string, objeto o array)
     * @returns {*} Valor procesado según el tipo de mapeo
     */
    processMapping(worksheet, mappingValue) {
        // Si es un string, es una referencia de celda directa
        if (typeof mappingValue === 'string') {
            return this.getCellValue(worksheet, mappingValue);
        }

        // Si es un array, procesar cada elemento
        if (Array.isArray(mappingValue)) {
            return mappingValue.map(item => {
                if (typeof item === 'object' && item !== null) {
                    // Es un objeto dentro del array, procesar recursivamente
                    const processedItem = {};
                    for (const [key, value] of Object.entries(item)) {
                        processedItem[key] = this.processMapping(worksheet, value);
                    }
                    return processedItem;
                } else {
                    // Es un valor directo en el array
                    return this.processMapping(worksheet, item);
                }
            });
        }

        // Si es un objeto, procesar recursivamente sus propiedades
        if (typeof mappingValue === 'object' && mappingValue !== null) {
            const processedObject = {};
            for (const [key, value] of Object.entries(mappingValue)) {
                processedObject[key] = this.processMapping(worksheet, value);
            }
            return processedObject;
        }

        // Si no es ninguno de los casos anteriores, retornar el valor tal cual
        return mappingValue;
    }

    /**
     * Formatea y valida el campo nivel_seniority
     * @param {*} value - Valor del campo nivel_seniority
     * @returns {string|null} Valor normalizado o null si no es válido
     */
    formatSeniorityLevel(value) {
        if (!value || typeof value !== 'string') {
            return null;
        }

        // Normalizar a mayúsculas y limpiar espacios
        const normalized = value.toUpperCase().trim();

        // Validar contra la lista de valores permitidos
        if (ExcelReader.ALLOWED_SENIORITY_LEVELS.includes(normalized)) {
            return normalized;
        }

        return null;
    }

    /**
     * Formatea y valida un campo de array separado por comas
     * @param {*} value - Valor del campo (puede ser string o array)
     * @param {string[]} allowedList - Lista de valores permitidos
     * @param {number|null} maxItems - Número máximo de elementos a retornar (null = sin límite)
     * @returns {string} String con los valores válidos separados por comas
     */
    formatArrayField(value, allowedList, maxItems = null) {
        // Si el valor es null/undefined/vacío, retornar string vacío
        if (!value) {
            return '';
        }

        // Convertir a string si no lo es
        let valueStr = typeof value === 'string' ? value : String(value);

        // Si está vacío después de convertir, retornar string vacío
        if (!valueStr.trim()) {
            return '';
        }

        // Dividir por comas y limpiar espacios
        let items = valueStr.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0); // Filtrar elementos vacíos

        // Validar cada elemento contra la lista permitida (coincidencia exacta)
        let validItems = items.filter(item => allowedList.includes(item));

        // Aplicar límite de items si se especifica
        if (maxItems !== null && maxItems > 0) {
            validItems = validItems.slice(0, maxItems);
        }

        // Retornar como string separado por comas
        return validItems.join(', ');
    }

    /**
     * Convierte nombre de mes (español o inglés) a número de mes (01-12)
     * @param {string} monthName - Nombre del mes
     * @returns {string|null} Número de mes en formato "01"-"12" o null si no es válido
     */
    parseMonthNameToNumber(monthName) {
        if (!monthName || typeof monthName !== 'string') {
            return null;
        }

        const normalized = monthName.trim().toLowerCase();

        const monthMap = {
            // Español
            'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
            'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
            'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12',
            // Inglés
            'january': '01', 'february': '02', 'march': '03', 'april': '04',
            'may': '05', 'june': '06', 'july': '07', 'august': '08',
            'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };

        return monthMap[normalized] || null;
    }

    /**
     * Retorna la fecha actual en formato mm/yyyy
     * @returns {string} Fecha actual en formato "mm/yyyy"
     */
    getCurrentDateMMYYYY() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${month}/${year}`;
    }

    /**
     * Formatea una fecha a formato dd/mm/yyyy
     * @param {*} value - Valor de la fecha (puede ser número de Excel, string, Date)
     * @returns {string|null} Fecha formateada como "dd/mm/yyyy" o null si no es válida
     */
    formatDateToDDMMYYYY(value) {
        if (!value) {
            return null;
        }

        let date = null;

        // Si es un número (fecha serializada de Excel)
        if (typeof value === 'number') {
            // Excel cuenta días desde 1900-01-01, pero tiene un bug: cuenta 1900 como año bisiesto
            // La fecha serializada 1 = 1900-01-01
            const excelEpoch = new Date(1899, 11, 30); // 30 de diciembre de 1899
            date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        }
        // Si es un objeto Date
        else if (value instanceof Date) {
            date = value;
        }
        // Si es un string
        else if (typeof value === 'string') {
            const trimmed = value.trim();
            
            // Si ya está en formato dd/mm/yyyy, validar y retornar
            const ddmmYYYYPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const match = trimmed.match(ddmmYYYYPattern);
            if (match) {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10);
                const year = parseInt(match[3], 10);
                
                // Validar que la fecha sea válida
                const testDate = new Date(year, month - 1, day);
                if (testDate.getFullYear() === year && 
                    testDate.getMonth() === month - 1 && 
                    testDate.getDate() === day) {
                    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                }
            }
            
            // Intentar parsear como fecha estándar
            date = new Date(trimmed);
            if (isNaN(date.getTime())) {
                return null;
            }
        }
        else {
            return null;
        }

        // Validar que la fecha sea válida
        if (!date || isNaN(date.getTime())) {
            return null;
        }

        // Formatear a dd/mm/yyyy
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    /**
     * Formatea una fecha a formato mm/yyyy
     * @param {*} value - Valor de la fecha (puede ser número de Excel, string, Date, o nombre de mes)
     * @returns {string|null} Fecha formateada como "mm/yyyy" o null si no es válida
     */
    formatDateToMMYYYY(value) {
        // Manejar null, undefined o valores vacíos
        if (value === null || value === undefined) {
            return null;
        }

        // Si es string vacío o solo espacios
        if (typeof value === 'string' && !value.trim()) {
            return null;
        }

        let date = null;
        let month = null;
        let year = null;

        // Si es un número (fecha serializada de Excel)
        if (typeof value === 'number') {
            // Verificar que sea un número válido
            if (isNaN(value) || !isFinite(value)) {
                return null;
            }
            const excelEpoch = new Date(1899, 11, 30);
            date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        }
        // Si es un objeto Date
        else if (value instanceof Date) {
            date = value;
        }
        // Si es un string
        else if (typeof value === 'string') {
            const trimmed = value.trim();
            
            // Intentar parsear formato "Mes Año" (ej: "Agosto 2023")
            const monthYearPattern = /^([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+(\d{4})$/i;
            const monthYearMatch = trimmed.match(monthYearPattern);
            if (monthYearMatch) {
                const monthName = monthYearMatch[1];
                const yearStr = monthYearMatch[2];
                const monthNum = this.parseMonthNameToNumber(monthName);
                if (monthNum) {
                    return `${monthNum}/${yearStr}`;
                }
            }
            
            // Intentar parsear formato mm/yyyy
            const mmYYYYPattern = /^(\d{1,2})\/(\d{4})$/;
            const mmYYYYMatch = trimmed.match(mmYYYYPattern);
            if (mmYYYYMatch) {
                const monthNum = parseInt(mmYYYYMatch[1], 10);
                const yearNum = parseInt(mmYYYYMatch[2], 10);
                if (monthNum >= 1 && monthNum <= 12) {
                    return `${String(monthNum).padStart(2, '0')}/${yearNum}`;
                }
            }
            
            // Intentar parsear formato dd/mm/yyyy y extraer mm/yyyy
            const ddmmYYYYPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            const ddmmYYYYMatch = trimmed.match(ddmmYYYYPattern);
            if (ddmmYYYYMatch) {
                const monthNum = parseInt(ddmmYYYYMatch[2], 10);
                const yearNum = parseInt(ddmmYYYYMatch[3], 10);
                if (monthNum >= 1 && monthNum <= 12) {
                    return `${String(monthNum).padStart(2, '0')}/${yearNum}`;
                }
            }
            
            // Intentar parsear como fecha estándar
            date = new Date(trimmed);
            if (isNaN(date.getTime())) {
                return null;
            }
        }
        else {
            // Intentar convertir a string y parsear
            try {
                const valueStr = String(value);
                if (valueStr && valueStr.trim()) {
                    return this.formatDateToMMYYYY(valueStr);
                }
            } catch (e) {
                // Si falla la conversión, retornar null
            }
            return null;
        }

        // Si tenemos un objeto Date válido
        if (date && !isNaN(date.getTime())) {
            month = String(date.getMonth() + 1).padStart(2, '0');
            year = date.getFullYear();
            return `${month}/${year}`;
        }

        return null;
    }

    /**
     * Parsea un rango de periodo y lo separa en inicio y fin
     * @param {string} periodValue - Valor del periodo (ej: "Agosto 2023 - Agosto 2025" o "Agosto 2023 - Actualidad")
     * @returns {Object|null} Objeto con periodo_inicio y periodo_fin en formato "mm/yyyy" o null si no es válido
     */
    parsePeriodRange(periodValue) {
        // Si el valor es null, undefined o no es string, intentar convertir a string
        if (!periodValue) {
            return null;
        }

        // Convertir a string si no lo es
        const valueStr = typeof periodValue === 'string' ? periodValue : String(periodValue);
        const trimmed = valueStr.trim();
        
        if (!trimmed) {
            return null;
        }

        // Dividir por " - ", "–" (guión largo), o "-" (con espacios opcionales)
        // Manejar tanto guión corto (-) como guión largo (–)
        const parts = trimmed.split(/\s*[–-]\s*/);
        
        if (parts.length < 2) {
            // Si solo hay una parte, usar como inicio y fin igual
            const singleDate = this.formatDateToMMYYYY(trimmed);
            if (singleDate) {
                return {
                    periodo_inicio: singleDate,
                    periodo_fin: singleDate
                };
            }
            return null;
        }

        const inicioStr = parts[0].trim();
        const finStr = parts[1].trim();

        // Si alguna parte está vacía después del split, retornar null
        if (!inicioStr || !finStr) {
            return null;
        }

        // Formatear inicio
        const periodo_inicio = this.formatDateToMMYYYY(inicioStr);
        if (!periodo_inicio) {
            return null;
        }

        // Formatear fin - verificar si es "Actualidad", "Actual", "Presente", "Hoy", etc.
        const finLower = finStr.toLowerCase();
        const currentKeywords = ['actualidad', 'actual', 'presente', 'hoy', 'now', 'current', 'present'];
        const isCurrent = currentKeywords.some(keyword => finLower.includes(keyword));

        let periodo_fin;
        if (isCurrent) {
            periodo_fin = this.getCurrentDateMMYYYY();
        } else {
            periodo_fin = this.formatDateToMMYYYY(finStr);
            if (!periodo_fin) {
                return null;
            }
        }

        return {
            periodo_inicio: periodo_inicio,
            periodo_fin: periodo_fin
        };
    }

    /**
     * Separa un nombre completo en nombre, primer_apellido y segundo_apellido
     * @param {string} fullName - Nombre completo (ej: "Sebastian Narvaez Lopera" o "Juan Esteban Castano Holguin")
     * @returns {Object} Objeto con nombre, primer_apellido y segundo_apellido
     */
    splitFullName(fullName) {
        if (!fullName || typeof fullName !== 'string') {
            return {
                nombre: null,
                primer_apellido: null,
                segundo_apellido: null
            };
        }

        const trimmed = fullName.trim();
        if (!trimmed) {
            return {
                nombre: null,
                primer_apellido: null,
                segundo_apellido: null
            };
        }

        // Dividir por espacios y filtrar elementos vacíos
        const parts = trimmed.split(/\s+/).filter(part => part.length > 0);

        if (parts.length === 0) {
            return {
                nombre: null,
                primer_apellido: null,
                segundo_apellido: null
            };
        }

        // Si solo hay una palabra, es el nombre
        if (parts.length === 1) {
            return {
                nombre: parts[0] + ' ',
                primer_apellido: null,
                segundo_apellido: null
            };
        }

        // Si hay dos palabras, primera es nombre, segunda es primer apellido
        if (parts.length === 2) {
            return {
                nombre: parts[0] + ' ',
                primer_apellido: parts[1] + ' ',
                segundo_apellido: null
            };
        }

        // Si hay tres o más palabras:
        // - Las primeras (todas menos las últimas 2) son el nombre
        // - La penúltima es el primer apellido
        // - La última es el segundo apellido
        const nombre = parts.slice(0, parts.length - 2).join(' ');
        const primer_apellido = parts[parts.length - 2];
        const segundo_apellido = parts[parts.length - 1];

        return {
            nombre: nombre,
            primer_apellido: primer_apellido,
            segundo_apellido: segundo_apellido
        };
    }

    /**
     * Categoriza una profesión según niveles educativos
     * @param {string} profession - Texto de la profesión
     * @returns {string|null} Categoría detectada o null si no hay coincidencias
     */
    categorizeProfession(profession) {
        if (!profession || typeof profession !== 'string') {
            return null;
        }

        const normalized = profession.trim();
        if (!normalized) {
            return null;
        }

        // Convertir a minúsculas para búsqueda case-insensitive
        const lowerProfession = normalized.toLowerCase();

        // Definir patrones de búsqueda por nivel educativo (de mayor a menor)
        // POSTDOCTORADO
        if (lowerProfession.includes('postdoc') || 
            lowerProfession.includes('estancia postdoctoral') ||
            lowerProfession.includes('post-doctorado') ||
            lowerProfession.includes('postdoctorado')) {
            return 'POSTDOCTORADO';
        }

        // DOCTORADO
        if (lowerProfession.includes('doctor') || 
            lowerProfession.includes('phd') ||
            lowerProfession.includes('doctorado') ||
            lowerProfession.match(/\bph\.?d\.?\b/i)) {
            return 'DOCTORADO';
        }

        // MAESTRÍA
        if (lowerProfession.includes('magíster') || 
            lowerProfession.includes('magister') ||
            lowerProfession.includes('máster') ||
            lowerProfession.includes('master') ||
            lowerProfession.includes('maestría') ||
            lowerProfession.includes('maestria') ||
            lowerProfession.match(/\bmsc\b/i) ||
            lowerProfession.match(/\bm\.?s\.?\b/i)) {
            return 'MAESTRÍA';
        }

        // ESPECIALIZACIÓN
        if (lowerProfession.includes('especialista') || 
            lowerProfession.includes('especialización') ||
            lowerProfession.includes('especializacion')) {
            return 'ESPECIALIZACIÓN';
        }

        // PREGRADO
        if (lowerProfession.includes('ingeniero') || 
            lowerProfession.includes('ingeniería') ||
            lowerProfession.includes('ingenieria') ||
            lowerProfession.includes('bachelor') ||
            lowerProfession.match(/\bb\.?s\.?\b/i) ||
            lowerProfession.includes('licenciatura') ||
            lowerProfession.includes('licenciado') ||
            lowerProfession.includes('pregrado')) {
            return 'PREGRADO';
        }

        // TECNÓLOGO
        if (lowerProfession.includes('tecnología en') || 
            lowerProfession.includes('tecnologia en') ||
            lowerProfession.includes('tecnólogo') ||
            lowerProfession.includes('tecnologo') ||
            lowerProfession.includes('análisis y desarrollo de sistemas') ||
            lowerProfession.includes('analisis y desarrollo de sistemas')) {
            return 'TECNÓLOGO';
        }

        // TÉCNICO
        if (lowerProfession.includes('técnico en sistemas') || 
            lowerProfession.includes('tecnico en sistemas') ||
            lowerProfession.includes('técnico en programación') ||
            lowerProfession.includes('tecnico en programacion') ||
            lowerProfession.includes('sena técnico') ||
            lowerProfession.includes('sena tecnico') ||
            (lowerProfession.includes('técnico') && lowerProfession.includes('sena')) ||
            (lowerProfession.includes('tecnico') && lowerProfession.includes('sena'))) {
            return 'TÉCNICO';
        }

        // Si no hay coincidencias, retornar null
        return null;
    }

    /**
     * Aplica formateo y validación a los datos extraídos del Excel
     * @param {Object} data - Objeto con los datos extraídos
     * @returns {Object} Objeto con los datos formateados
     */
    formatExtractedData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const formattedData = { ...data };

        // Procesar nombre, primer_apellido y segundo_apellido si todos apuntan a la misma celda
        if ('nombre' in formattedData && 'primer_apellido' in formattedData && 'segundo_apellido' in formattedData) {
            const nombreValue = formattedData.nombre;
            const primerApellidoValue = formattedData.primer_apellido;
            const segundoApellidoValue = formattedData.segundo_apellido;

            // Si los tres valores son iguales (mismo string), significa que vienen de la misma celda
            if (nombreValue === primerApellidoValue && nombreValue === segundoApellidoValue && nombreValue) {
                // Separar el nombre completo
                const splitName = this.splitFullName(nombreValue);
                formattedData.nombre = splitName.nombre;
                formattedData.primer_apellido = splitName.primer_apellido;
                formattedData.segundo_apellido = splitName.segundo_apellido;
            }
        }

        // Categorizar profesion
        if ('profesion' in formattedData) {
            const categoria = this.categorizeProfession(formattedData.profesion);
            if (categoria) {
                formattedData.profesion = categoria;
            }
        }

        // Formatear fecha_nacimiento
        if ('fecha_nacimiento' in formattedData) {
            formattedData.fecha_nacimiento = this.formatDateToDDMMYYYY(formattedData.fecha_nacimiento);
        }

        // Formatear nivel_seniority
        if ('nivel_seniority' in formattedData) {
            formattedData.nivel_seniority = this.formatSeniorityLevel(formattedData.nivel_seniority);
        }

        // Formatear anos_experiencia - extraer solo números
        if ('anos_experiencia' in formattedData && formattedData.anos_experiencia) {
            const experienciaValue = formattedData.anos_experiencia.toString();
            // Extraer solo los números del string (ej: "6 años" -> "6")
            const numeros = experienciaValue.match(/\d+/);
            if (numeros && numeros.length > 0) {
                formattedData.anos_experiencia = numeros[0];
            } else {
                // Si no hay números, dejar vacío o null
                formattedData.anos_experiencia = '';
            }
        }

        // Formatear experiencia - procesar periodo_inicio y periodo_fin
        if ('experiencia' in formattedData && Array.isArray(formattedData.experiencia)) {
            formattedData.experiencia = formattedData.experiencia.map(exp => {
                const formattedExp = { ...exp };
                
                // Verificar si periodo_inicio y periodo_fin tienen el mismo valor (rango completo)
                const inicioValue = formattedExp.periodo_inicio;
                const finValue = formattedExp.periodo_fin;
                
                // Si ambos valores son iguales y contienen un guión, es un rango que hay que parsear
                const isRange = inicioValue === finValue && 
                               inicioValue && 
                               typeof inicioValue === 'string' && 
                               (inicioValue.includes(' - ') || inicioValue.includes('–') || inicioValue.includes('-'));
                
                if (isRange) {
                    // Parsear el rango completo
                    const periodRange = this.parsePeriodRange(inicioValue);
                    if (periodRange) {
                        formattedExp.periodo_inicio = periodRange.periodo_inicio;
                        formattedExp.periodo_fin = periodRange.periodo_fin;
                    } else {
                        // Si el parseo falla, intentar formatear cada parte individualmente
                        formattedExp.periodo_inicio = null;
                        formattedExp.periodo_fin = null;
                    }
                } else {
                    // Si son valores separados, formatear cada uno individualmente
                    
                    // Formatear periodo_inicio a mm/yyyy
                    if ('periodo_inicio' in formattedExp && inicioValue !== null && inicioValue !== undefined) {
                        formattedExp.periodo_inicio = this.formatDateToMMYYYY(inicioValue);
                    }
                    
                    // Formatear periodo_fin a mm/yyyy
                    // Si es "Actualidad" o similar, usar fecha actual
                    if ('periodo_fin' in formattedExp && finValue !== null && finValue !== undefined) {
                        if (typeof finValue === 'string') {
                            const finLower = finValue.toLowerCase().trim();
                            const currentKeywords = ['actualidad', 'actual', 'presente', 'hoy', 'now', 'current', 'present'];
                            const isCurrent = currentKeywords.some(keyword => finLower.includes(keyword));
                            
                            if (isCurrent) {
                                formattedExp.periodo_fin = this.getCurrentDateMMYYYY();
                            } else {
                                formattedExp.periodo_fin = this.formatDateToMMYYYY(finValue);
                            }
                        } else {
                            formattedExp.periodo_fin = this.formatDateToMMYYYY(finValue);
                        }
                    }
                }
                
                return formattedExp;
            });
        }

        // Formatear lenguajes_programacion (máximo 4 elementos)
        if ('lenguajes_programacion' in formattedData) {
            formattedData.lenguajes_programacion = this.formatArrayField(
                formattedData.lenguajes_programacion,
                ExcelReader.ALLOWED_LANGUAGES,
                4 // Máximo 4 elementos
            );
        }

        // Formatear bases_datos
        if ('bases_datos' in formattedData) {
            formattedData.bases_datos = this.formatArrayField(
                formattedData.bases_datos,
                ExcelReader.ALLOWED_DATABASES
            );
        }

        // Formatear aplicaciones
        if ('aplicaciones' in formattedData) {
            formattedData.aplicaciones = this.formatArrayField(
                formattedData.aplicaciones,
                ExcelReader.ALLOWED_APPLICATIONS
            );
        }

        // Formatear frameworks
        if ('frameworks' in formattedData) {
            formattedData.frameworks = this.formatArrayField(
                formattedData.frameworks,
                ExcelReader.ALLOWED_FRAMEWORKS
            );
        }

        // Formatear plataformas
        if ('plataformas' in formattedData) {
            formattedData.plataformas = this.formatArrayField(
                formattedData.plataformas,
                ExcelReader.ALLOWED_PLATFORMS
            );
        }

        // Formatear herramientas
        if ('herramientas' in formattedData) {
            formattedData.herramientas = this.formatArrayField(
                formattedData.herramientas,
                ExcelReader.ALLOWED_TOOLS
            );
        }

        // Formatear otros
        if ('otros' in formattedData) {
            formattedData.otros = this.formatArrayField(
                formattedData.otros,
                ExcelReader.ALLOWED_OTHERS
            );
        }

        // Formatear cursos_certificaciones - procesar fecha_obtencion
        if ('cursos_certificaciones' in formattedData && Array.isArray(formattedData.cursos_certificaciones)) {
            formattedData.cursos_certificaciones = formattedData.cursos_certificaciones.map(curso => {
                const formattedCurso = { ...curso };
                
                // Formatear fecha_obtencion a mm/yyyy
                if ('fecha_obtencion' in formattedCurso) {
                    formattedCurso.fecha_obtencion = this.formatDateToMMYYYY(formattedCurso.fecha_obtencion);
                }
                
                return formattedCurso;
            });
        }

        return formattedData;
    }

    /**
     * Lee datos desde un archivo File seleccionado por el usuario
     * @param {File} file - Archivo Excel seleccionado (.xlsx o .xlsm)
     * @param {string} mappingPath - Ruta al archivo JSON de mapeo
     * @returns {Promise<Object>} Datos extraídos y formateados
     */
    async readFromFile(file, mappingPath) {
        try {
            // Cargar el archivo Excel desde el File
            await this.loadExcelFileFromFile(file);

            // Establecer el mapping path temporalmente
            const originalMappingPath = this.mappingPath;
            this.mappingPath = mappingPath;

            // Cargar el mapeo JSON
            await this.loadMapping();

            // Restaurar el mapping path original
            this.mappingPath = originalMappingPath;

            // Verificar que tenemos todo lo necesario
            if (!this.worksheet) {
                throw new Error('No se pudo cargar la hoja de Excel');
            }

            if (!this.mapping) {
                throw new Error('No se pudo cargar el mapeo JSON');
            }

            // Procesar el mapeo completo
            const extractedData = this.processMapping(this.worksheet, this.mapping);

            // Formatear y validar los datos extraídos
            const formattedData = this.formatExtractedData(extractedData);

            // Mostrar el resultado en console.log con formato legible
            console.log('=== Datos extraídos del Excel (formateados) ===');
            console.log(JSON.stringify(formattedData, null, 2));
            console.log('================================');

            return formattedData;
        } catch (error) {
            console.error('Error durante la lectura del Excel:', error);
            throw error;
        }
    }

    async read() {
        try {
            // Cargar el archivo Excel
            await this.loadExcelFile();

            // Cargar el mapeo JSON
            await this.loadMapping();

            // Verificar que tenemos todo lo necesario
            if (!this.worksheet) {
                throw new Error('No se pudo cargar la hoja de Excel');
            }

            if (!this.mapping) {
                throw new Error('No se pudo cargar el mapeo JSON');
            }

            // Procesar el mapeo completo
            const extractedData = this.processMapping(this.worksheet, this.mapping);

            // Formatear y validar los datos extraídos
            const formattedData = this.formatExtractedData(extractedData);

            // Mostrar el resultado en console.log con formato legible
            console.log('=== Datos extraídos del Excel (formateados) ===');
            console.log(JSON.stringify(formattedData, null, 2));
            console.log('================================');

            return formattedData;
        } catch (error) {
            console.error('Error durante la lectura del Excel:', error);
            throw error;
        }
    }
}

// Exportar la clase para uso en otros módulos (si se usa módulos ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExcelReader;
}
