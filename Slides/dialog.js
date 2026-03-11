// Funcionalidad del stepper y diálogo

(function() {
    'use strict';

    let currentStep = 0;
    const totalSteps = 4;
    const MAX_SKILLS_PER_CATEGORY = 4;

    const ROLE_TECH_CATALOG = {
        frontend: {
            lenguaje: ['C# (.NET Framework)', 'Fundamentos CSS', 'JavaScript', 'REACT', 'TYPESCRIPT', 'Fundamentos HTML'],
            framework: ['Angular', 'Next.js (SSR)', 'Redux', 'Universal (SSR)'],
            otros: ['Caching', 'LocalStorage', 'DDD', 'DOM y Browser Engine', 'Event-driven Architecture (EDA)', 'Flex', 'PWA', 'Service Worker'],
            herramienta: ['Jscrambler', 'NPM', 'WebPack'],
            plataforma: ['DOCKER', 'Kubernetes'],
            aplicacion: [],
            baseDeDatos: []
        },
        automatizaciones: {
            lenguaje: ['Conceptos generales Programacion reactiva', 'Java', 'Python', 'SQL', 'XPATH'],
            framework: ['Playwright', 'BDD Framework', 'Data Driven Framework', 'Karate Framework', 'Winium'],
            otros: ['Arquitectura de microservicios', 'Murex AWS Essentials', 'BDD (Gherkin / Serenity)', 'DevOps CI', 'DevOps CT', 'Patron de diseno ScreenPlay', 'Pruebas Unitarias', 'REST', 'SOLID', 'WinAppDriver'],
            herramienta: ['Analisis Estatico (SonarQube)', 'Appium', 'Azure DevOps', 'Git', 'GraphQL', 'Postman', 'Selenium', 'SoapUI'],
            plataforma: ['AWS RDS', 'Kobiton'],
            aplicacion: ['Micro Focus Extra! X-treme (MyExtra)'],
            baseDeDatos: ['DynamoDB', 'DB2', 'MongoDB', 'MYSQL', 'ORACLE', 'PostgreSQL', 'SQL Server']
        },
        backend: {
            lenguaje: ['C# (.NET Framework)', 'CL', 'COBOL', 'Dart', 'Elixir', 'Java', 'Python', 'RPG/ILE'],
            framework: ['ASP MVC', 'Express', 'Flask', 'NPA/NHibernate', 'Pandas', 'Scikit-learn', 'Spring Boot', 'Spring Cloud', 'Spring Web', 'Django'],
            otros: ['AMQP', 'Apache Camel', 'Azure Active Directory', 'BDD (Gherkin / Serenity)', 'Event-driven Architecture (EDA)', 'Jmeter', 'JMS', 'OAuth 2.0', 'OpenAPI', 'OpenID', 'OWASP', 'SOLID', 'Sterling'],
            herramienta: ['Analisis Estatico (SonarQube)', 'Appium', 'Git', 'Gradle', 'GraphQL', 'JUNIT', 'NPM', 'Postman', 'RabbitMQ', 'Selenium', 'UrbanCode', 'WebSocket', 'GoAnywhere'],
            plataforma: ['Apache Kafka', 'Apache Tomcat', 'DOCKER', 'IIS', 'Kubernetes', 'Mockito', 'Node.js', 'PowerMock', 'SPARK', 'WAS', 'WMQ'],
            aplicacion: ['Artifactory', 'SWIFT'],
            baseDeDatos: ['DynamoDB', 'DB2', 'IBM Cloudant', 'MongoDB', 'MYSQL', 'ORACLE', 'PostgreSQL', 'REDIS', 'SQL Server']
        },
        fullstack: {
            lenguaje: [],
            framework: ['Angular', 'ASP MVC', 'Express', 'Flask', 'Next.js (SSR)', 'NPA/NHibernate', 'Pandas', 'QUARKUS', 'Redux', 'Scikit-learn', 'Spring Boot', 'Spring Cloud', 'Spring Web', 'Spring Framework', 'Universal (SSR)', 'Django'],
            otros: [],
            herramienta: [],
            plataforma: ['Apache Kafka', 'Apache Tomcat', 'DOCKER', 'IIS', 'Kubernetes', 'Mockito', 'Node.js', 'PowerMock', 'SPARK', 'WAS', 'WMQ'],
            aplicacion: ['Artifactory'],
            baseDeDatos: ['DynamoDB', 'DB2', 'IBM Cloudant', 'MongoDB', 'MYSQL', 'ORACLE', 'PostgreSQL', 'REDIS', 'SQL Server']
        },
        mobile: {
            lenguaje: ['C# (.NET Framework)', 'Dart', 'Java', 'JavaScript', 'Kotlin', 'Objective C'],
            framework: ['No SQL', 'Flutter'],
            otros: ['BDD (Gherkin / Serenity)', 'Despliegue en Tiendas', 'Device Farm', 'Jmeter', 'Material Design', 'Mobile First Design', 'OpenAPI', 'Push Notification', 'PWA', 'Responsive Design', 'Service Worker', 'Xamarin'],
            herramienta: ['Analisis Estatico (SonarQube)', 'Android Studio', 'Appium', 'ESLint', 'Git', 'GraphQL', 'JSHint', 'JUNIT', 'Postman', 'Prettier', 'Selenium', 'UrbanCode', 'WebSocket'],
            plataforma: ['Mockito', 'PowerMock'],
            aplicacion: ['Artifactory', 'SWIFT'],
            baseDeDatos: ['Couchbase Mobile', 'LevelDB', 'SQL Server', 'SQLite']
        },
        devops: {
            lenguaje: ['C# (.NET Framework)', 'CL', 'COBOL', 'Dart', 'Elixir', 'Python', 'RPG/ILE', 'Swift (Lenguaje)', 'Java'],
            framework: ['ASP MVC', 'Express', 'Flask', 'NPA/NHibernate', 'Pandas', 'Scikit-learn', 'Spring Boot', 'Spring Cloud', 'Spring Web', 'SLIs / SLOs / Blameless Postmortems / Error Budgets / SRE', 'Chaos Engineering / Reducing Toil / SRE'],
            otros: ['AMQP', 'Apache Camel', 'Azure Active Directory', 'BDD (Gherkin / Serenity)', 'Event-driven Architecture (EDA)', 'Jmeter', 'JMS', 'OAuth 2.0', 'OpenAPI', 'OpenID', 'OWASP', 'SOLID', 'Sterling'],
            herramienta: ['Analisis Estatico (SonarQube)', 'Appium', 'Git', 'Gradle', 'GraphQL', 'JUNIT', 'NPM', 'Postman', 'RabbitMQ', 'Selenium', 'UrbanCode', 'WebSocket', 'Azure DevOps', 'Grafana', 'Thanos'],
            plataforma: ['Apache Kafka', 'Apache Tomcat', 'DOCKER', 'IIS', 'Kubernetes', 'Mockito', 'Node.js', 'PowerMock', 'SPARK', 'WAS', 'WMQ', 'Prometheus'],
            aplicacion: ['Artifactory', 'DYNATRACE'],
            baseDeDatos: ['DB2', 'IBM Cloudant', 'MongoDB', 'MYSQL', 'ORACLE', 'PostgreSQL', 'REDIS', 'SQL Server', 'DynamoDB']
        },
        arquitectura: {
            lenguaje: ['Java', 'C# (.NET Framework)', 'RPG/ILE', 'CL', 'COBOL', 'Python', 'JavaScript', 'REACT', 'TYPESCRIPT', 'Fundamentos CSS'],
            framework: ['Angular', 'Spring Boot', 'Spring Cloud', 'Spring Web', 'NPA/NHibernate', 'ASP MVC', 'Express', 'Flask', 'Pandas', 'Scikit-learn', 'Redux', 'Universal (SSR)'],
            otros: ['Certificacion en AWS Solutions Architect - Associate', 'Especializacion o Maestria en: Tecnologias de Informacion, Desarrollo y Arquitectura de Software', 'DESIGN THINKING', 'Patrones de diseno', 'DDD', 'DevOps', 'Analitica', 'Blockchain', 'OAuth 2.0', 'Microservicios', 'SOA', 'Clean Architecture', 'Arquitectura Reactiva - Tacticas Arquitectura', 'DISENO ORIENTADO A OBJETOS', 'Inteligencia de negocios (Business Intelligence - BI)', 'INTEGRACION API', 'ARQUITECTURA CLOUD', 'ARQUITECTURA DE SOFTWARE'],
            herramienta: [],
            plataforma: ['Node.js', 'Apache Kafka'],
            aplicacion: [],
            baseDeDatos: ['SQL Server', 'ORACLE', 'MYSQL', 'DB2', 'PostgreSQL', 'IBM Cloudant', 'REDIS', 'MongoDB', 'DynamoDB']
        },
        analista: {
            lenguaje: ['Fundamentos HTML', 'Java', 'JavaScript', 'SQL', 'Python'],
            framework: [],
            otros: ['API GATEWAY', 'REST', 'Acceso Remoto', 'Analisis de datos', 'API', 'Certificados digitales', 'Direccionamiento/subneting/vlan/mac', 'EXCEL', 'Fundamentos basicos financieros', 'Lectura de logs', 'Metodologias agiles', 'Protocolos de comunicacion segura (SSL/TLS/FTP/HTTPS)', 'Automatizacion'],
            herramienta: ['POWER AUTOMATE'],
            plataforma: ['Bizagi Process Modeler', 'AWS Essentials', 'ISERIES', 'RPA'],
            aplicacion: ['DataPower', 'Power Apps'],
            baseDeDatos: ['SQL Server']
        }
    };

    const CATEGORY_CONFIG = [
        { key: 'lenguaje', fieldName: 'lenguajes_programacion', placeholderContains: 'Lenguajes de programaci', overlayId: 'skills-overlay-lenguaje' },
        { key: 'baseDeDatos', fieldName: 'bases_datos', placeholderContains: 'Bases de datos', overlayId: 'skills-overlay-baseDeDatos' },
        { key: 'aplicacion', fieldName: 'aplicaciones', placeholderContains: 'Aplicaciones', overlayId: 'skills-overlay-aplicacion' },
        { key: 'framework', fieldName: 'frameworks', placeholderContains: 'Frameworks', overlayId: 'skills-overlay-framework' },
        { key: 'plataforma', fieldName: 'plataformas', placeholderContains: 'Plataformas', overlayId: 'skills-overlay-plataforma' },
        { key: 'herramienta', fieldName: 'herramientas', placeholderContains: 'Herramientas', overlayId: 'skills-overlay-herramienta' },
        { key: 'otros', fieldName: 'otros', placeholderContains: 'Otros', overlayId: 'skills-overlay-otros' }
    ];

    const knowledgeOverlayState = {
        roleKey: '',
        roleRaw: '',
        candidateData: {},
        categories: {}
    };

    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        initializeStepper();
        initializeSelects();
        initializeKnowledgeOverlays();
        initializeButtons();
        initializeOpenDialogButton();
        initializeOpenTrainingDialogButton();
        initializeCloseButton();
    });

    // Inicializar el stepper
    function initializeStepper() {
        // Mostrar el primer paso
        showStep(0);
        
        // Agregar event listeners a los headers del stepper
        const stepHeaders = document.querySelectorAll('.mat-step-header');
        stepHeaders.forEach((header, index) => {
            header.addEventListener('click', function() {
                if (index <= currentStep) {
                    goToStep(index);
                }
            });
        });
    }

    // Mostrar un paso específico
    function showStep(stepIndex) {
        // Ocultar todos los pasos
        const allSteps = document.querySelectorAll('.mat-horizontal-stepper-content');
        allSteps.forEach((step, index) => {
            if (index === stepIndex) {
                // Mostrar este paso
                step.classList.remove('mat-horizontal-stepper-content-inactive');
                step.classList.add('mat-horizontal-stepper-content-active');
                step.style.visibility = 'visible';
                step.style.transform = 'none';
                step.style.display = 'block';
                step.style.position = 'relative';
            } else {
                // Ocultar este paso
                step.classList.remove('mat-horizontal-stepper-content-active');
                step.classList.add('mat-horizontal-stepper-content-inactive');
                step.style.visibility = 'hidden';
                step.style.transform = 'translate3d(100%, 0px, 0px)';
                step.style.display = 'none';
                step.style.position = 'absolute';
            }
        });

        // Actualizar los headers del stepper
        const stepHeaders = document.querySelectorAll('.mat-step-header');
        stepHeaders.forEach((header, index) => {
            const icon = header.querySelector('.mat-step-icon');
            const label = header.querySelector('.mat-step-label');
            
            if (index === stepIndex) {
                header.classList.add('mat-step-header-selected');
                header.setAttribute('aria-selected', 'true');
                header.setAttribute('tabindex', '0');
                if (icon) {
                    icon.classList.add('mat-step-icon-selected');
                }
                if (label) {
                    label.classList.add('mat-step-label-active', 'mat-step-label-selected');
                }
            } else if (index < stepIndex) {
                header.classList.remove('mat-step-header-selected');
                header.setAttribute('aria-selected', 'false');
                header.setAttribute('tabindex', '-1');
                if (icon) {
                    icon.classList.remove('mat-step-icon-selected');
                }
                if (label) {
                    label.classList.remove('mat-step-label-active', 'mat-step-label-selected');
                }
            } else {
                header.classList.remove('mat-step-header-selected');
                header.setAttribute('aria-selected', 'false');
                header.setAttribute('aria-disabled', 'true');
                header.setAttribute('tabindex', '-1');
                if (icon) {
                    icon.classList.remove('mat-step-icon-selected');
                }
                if (label) {
                    label.classList.remove('mat-step-label-active', 'mat-step-label-selected');
                }
            }
        });
    }

    // Ir a un paso específico
    function goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < totalSteps) {
            currentStep = stepIndex;
            showStep(currentStep);
        }
    }

    // Ir al siguiente paso
    function nextStep() {
        if (currentStep < totalSteps - 1) {
            goToStep(currentStep + 1);
        }
    }

    // Ir al paso anterior
    function previousStep() {
        if (currentStep > 0) {
            goToStep(currentStep - 1);
        }
    }

    // Inicializar botones
    function initializeButtons() {
        // Botones "Siguiente"
        const nextButtons = document.querySelectorAll('.mat-stepper-next');
        nextButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                nextStep();
            });
        });

        // Botones "Atrás"
        const previousButtons = document.querySelectorAll('.mat-stepper-previous');
        previousButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                previousStep();
            });
        });
    }

    // Inicializar selects
    function initializeSelects() {
        const selectInputs = document.querySelectorAll('.bc-input-select input[type="text"]');
        
        selectInputs.forEach(input => {
            const selectContainer = input.closest('.bc-input-select');
            const dropdown = selectContainer.querySelector('.bc-input-select-content');
            const toggle = selectContainer.querySelector('.bc-input-select-toggle');
            
            if (dropdown && toggle) {
                // Toggle del dropdown
                toggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleDropdown(dropdown);
                });

                // Click en el input
                input.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleDropdown(dropdown);
                });

                // Seleccionar un item
                const items = dropdown.querySelectorAll('.bc-input-select-item');
                items.forEach(item => {
                    item.addEventListener('click', function() {
                        const text = this.querySelector('.bc-span-single')?.textContent || '';
                        input.value = text;
                        dropdown.classList.remove('show');
                        updateInputLabel(input, text);
                    });
                });

                // Cerrar al hacer click fuera
                document.addEventListener('click', function(e) {
                    if (!selectContainer.contains(e.target)) {
                        dropdown.classList.remove('show');
                    }
                });
            }
        });
    }

    // Toggle del dropdown
    function toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('show');
        
        // Cerrar todos los otros dropdowns
        document.querySelectorAll('.bc-input-select-content.show').forEach(dd => {
            if (dd !== dropdown) {
                dd.classList.remove('show');
            }
        });
        
        // Toggle del dropdown actual
        if (isOpen) {
            dropdown.classList.remove('show');
        } else {
            dropdown.classList.add('show');
        }
    }

    // Actualizar label del input
    function updateInputLabel(input, value) {
        const label = input.parentElement.querySelector('.bc-input-select-label');
        if (label && value) {
            input.setAttribute('placeholder', value);
        }
    }

    // Función para abrir el diálogo
    function openDialog() {
        const dialogWrapper = document.querySelector('.dialog-wrapper');
        if (dialogWrapper) {
            dialogWrapper.style.display = 'block';
            // Reiniciar el stepper al primer paso
            currentStep = 0;
            showStep(0);
        }
    }

    // Función para cerrar el diálogo
    function closeDialog() {
        const dialogWrapper = document.querySelector('.dialog-wrapper');
        if (dialogWrapper) {
            dialogWrapper.style.display = 'none';
        }
    }

    // Inicializar botón de abrir diálogo
    function initializeOpenDialogButton() {
        // Buscar el botón que está FUERA del dialog-wrapper (el botón de abrir)
        // Buscamos el primer botón que no tenga id (el botón original)
        const openButton = document.querySelector('body > button.bc-fab-button-mini:not(#btnAddPersonInTraining)');
        if (openButton) {
            openButton.addEventListener('click', function(e) {
                e.preventDefault();
                openDialog();
            });
        }
    }

    // Inicializar botón de abrir diálogo de entrenamiento
    function initializeOpenTrainingDialogButton() {
        // Buscar el botón con id btnAddPersonInTraining
        const trainingButton = document.getElementById('btnAddPersonInTraining');
        if (trainingButton) {
            trainingButton.addEventListener('click', function(e) {
                e.preventDefault();
                openDialog();
            });
        }
    }

    // Inicializar botón de cerrar
    function initializeCloseButton() {
        // Buscar el botón que está DENTRO del dialog-wrapper (el botón de cerrar)
        const dialogWrapper = document.querySelector('.dialog-wrapper');
        if (dialogWrapper) {
            // Buscar el botón dentro del diálogo que tiene el estilo float:right
            let closeButton = dialogWrapper.querySelector('.col-2 .bc-fab-button-mini, [style*="float: right"] .bc-fab-button-mini, .bc-fab-button-mini[style*="float: right"]');
            if (!closeButton) {
                // Fallback: buscar cualquier botón bc-fab-button-mini dentro del dialog-wrapper
                const allButtons = dialogWrapper.querySelectorAll('.bc-fab-button-mini');
                if (allButtons.length > 0) {
                    // Tomar el último botón encontrado (que debería ser el de cerrar)
                    closeButton = allButtons[allButtons.length - 1];
                }
            }
            if (closeButton) {
                closeButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    closeDialog();
                });
            }
        }
    }

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function resolveRoleKey(rawRole) {
        const normalized = normalizeText(rawRole);
        if (!normalized) return '';
        if (normalized.includes('automat')) return 'automatizaciones';
        if (normalized.includes('full')) return 'fullstack';
        if (normalized.includes('devops')) return 'devops';
        if (normalized.includes('arquitect')) return 'arquitectura';
        if (normalized.includes('analista')) return 'analista';
        if (normalized.includes('mobile') || normalized.includes('movil')) return 'mobile';
        if (normalized.includes('front')) return 'frontend';
        if (normalized.includes('back')) return 'backend';
        if (ROLE_TECH_CATALOG[normalized]) return normalized;
        return '';
    }

    function getRoleFromCandidateData() {
        const fromWindow = window.candidateData?.rol || window.demoData?.rol || window.excelData?.rol || '';
        if (fromWindow) return fromWindow;
        const fromStorage = localStorage.getItem('candidateRol') || localStorage.getItem('rol') || '';
        if (fromStorage) return fromStorage;
        return '';
    }

    function ensureCategoryState(categoryKey) {
        if (!knowledgeOverlayState.categories[categoryKey]) {
            knowledgeOverlayState.categories[categoryKey] = {
                selected: [],
                filtered: []
            };
        }
        return knowledgeOverlayState.categories[categoryKey];
    }

    function getCategoryInput(config) {
        const inputs = Array.from(document.querySelectorAll('input[placeholder]'));
        return inputs.find(input => normalizeText(input.getAttribute('placeholder')).includes(normalizeText(config.placeholderContains)));
    }

    function createOrGetHiddenInput(visibleInput, fieldName) {
        const hiddenId = `${visibleInput.id || fieldName}-hidden`;
        let hidden = document.getElementById(hiddenId);
        if (!hidden) {
            hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.id = hiddenId;
            hidden.name = fieldName;
            visibleInput.parentElement.appendChild(hidden);
        }
        return hidden;
    }

    function syncCategoryValue(visibleInput, fieldName, selectedValues) {
        const serialized = selectedValues.join(', ');
        const hidden = createOrGetHiddenInput(visibleInput, fieldName);
        hidden.value = serialized;
        visibleInput.dataset.selectedValues = serialized;
        visibleInput.value = serialized;
        visibleInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function closeAllKnowledgePanels(exceptPanel) {
        document.querySelectorAll('.skills-overlay-panel.open').forEach(panel => {
            if (panel !== exceptPanel) panel.classList.remove('open');
        });
    }

    function getPanelListElement(panel) {
        return panel.querySelector('.skills-overlay-list') || panel;
    }

    function buildOptionElement(value, onSelect) {
        const option = document.createElement('div');
        option.className = 'skills-overlay-option mat-mdc-option mdc-list-item';
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');

        const textSpan = document.createElement('span');
        textSpan.className = 'mdc-list-item__primary-text';
        textSpan.textContent = ` ${value} `;
        option.appendChild(textSpan);
        option.addEventListener('click', function(e) {
            e.preventDefault();
            onSelect(value);
        });
        return option;
    }

    function renderKnowledgeChips(config, input, chipContainer) {
        chipContainer.querySelectorAll('.skills-chip').forEach(node => node.remove());
    }

    function renderKnowledgePanel(config, input, panel, searchText) {
        const list = getPanelListElement(panel);
        const categoryState = ensureCategoryState(config.key);
        const roleData = ROLE_TECH_CATALOG[knowledgeOverlayState.roleKey] || {};
        const options = roleData[config.key] || [];
        const selectedSet = new Set(categoryState.selected.map(normalizeText));
        const filtered = options.filter(option => {
            const matchesFilter = !searchText || normalizeText(option).includes(normalizeText(searchText));
            const notSelected = !selectedSet.has(normalizeText(option));
            return matchesFilter && notSelected;
        });
        categoryState.filtered = filtered;
        list.innerHTML = '';
        if (!knowledgeOverlayState.roleKey) {
            const empty = document.createElement('div');
            empty.className = 'skills-overlay-empty';
            empty.textContent = 'Rol no definido.';
            list.appendChild(empty);
            return;
        }
        if (filtered.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'skills-overlay-empty';
            empty.textContent = options.length ? 'Sin coincidencias.' : 'Sin opciones para este rol.';
            list.appendChild(empty);
            return;
        }
        filtered.forEach(option => {
            list.appendChild(buildOptionElement(option, function(value) {
                if (categoryState.selected.length >= MAX_SKILLS_PER_CATEGORY) return;
                if (categoryState.selected.some(item => normalizeText(item) === normalizeText(value))) return;
                categoryState.selected.push(value);
                syncCategoryValue(input, config.fieldName, categoryState.selected);
                renderKnowledgeChips(config, input, input.parentElement);
                renderKnowledgePanel(config, input, panel, '');
                panel.classList.remove('open');
            }));
        });
    }

    function positionPanel(panel, input) {
        const rect = input.getBoundingClientRect();
        panel.style.width = `${Math.max(rect.width, 280)}px`;
        panel.style.left = `${window.scrollX + rect.left}px`;
        panel.style.top = `${window.scrollY + rect.bottom + 4}px`;
    }

    function getOrCreateOverlayPanel(config) {
        let panel = document.getElementById(config.overlayId);
        if (panel) return panel;
        panel = document.createElement('div');
        panel.id = config.overlayId;
        panel.className = 'skills-overlay-panel cdk-overlay-pane';
        panel.innerHTML = '<div role="listbox" class="skills-overlay-list mat-mdc-autocomplete-panel mdc-menu-surface mat-primary"></div>';
        document.body.appendChild(panel);
        return panel;
    }

    function bindCategoryOverlay(config) {
        const input = getCategoryInput(config);
        if (!input) return;
        if (input.dataset.skillsOverlayBound === 'true') return;

        input.dataset.skillsOverlayBound = 'true';
        input.setAttribute('autocomplete', 'off');
        const chipContainer = input.closest('.mdc-evolution-chip-set__chips') || input.parentElement;
        const panel = getOrCreateOverlayPanel(config);
        panel.dataset.category = config.key;

        ensureCategoryState(config.key);
        syncCategoryValue(input, config.fieldName, []);
        renderKnowledgeChips(config, input, chipContainer);

        const openPanel = function(searchText) {
            closeAllKnowledgePanels(panel);
            positionPanel(panel, input);
            renderKnowledgePanel(config, input, panel, searchText || '');
            panel.classList.add('open');
        };

        input.addEventListener('focus', function() {
            openPanel('');
        });
        input.addEventListener('click', function(e) {
            e.stopPropagation();
            openPanel('');
        });
        input.addEventListener('input', function() {
            openPanel(input.value);
        });

        window.addEventListener('resize', function() {
            if (panel.classList.contains('open')) positionPanel(panel, input);
        });
        window.addEventListener('scroll', function() {
            if (panel.classList.contains('open')) positionPanel(panel, input);
        }, true);
    }

    function refreshRoleCatalog() {
        const roleRaw = knowledgeOverlayState.candidateData?.rol || getRoleFromCandidateData();
        const resolvedRoleKey = resolveRoleKey(roleRaw);
        const roleKey = resolvedRoleKey || 'backend';
        const changed = knowledgeOverlayState.roleKey !== roleKey;
        knowledgeOverlayState.roleRaw = roleRaw;
        knowledgeOverlayState.roleKey = roleKey;

        if (!resolvedRoleKey && roleRaw) {
            console.warn(`[dialog] Rol no reconocido para conocimientos: ${roleRaw}. Se usara backend por defecto.`);
        }
        if (!changed) return;

        CATEGORY_CONFIG.forEach(config => {
            const input = getCategoryInput(config);
            if (!input) return;
            const categoryState = ensureCategoryState(config.key);
            categoryState.selected = [];
            syncCategoryValue(input, config.fieldName, []);
            const chipContainer = input.closest('.mdc-evolution-chip-set__chips') || input.parentElement;
            renderKnowledgeChips(config, input, chipContainer);
        });
    }

    function initializeKnowledgeOverlays() {
        CATEGORY_CONFIG.forEach(bindCategoryOverlay);
        const cargoInput = document.querySelector('input[placeholder="Cargo"]');
        if (cargoInput) {
            cargoInput.addEventListener('input', refreshRoleCatalog);
            cargoInput.addEventListener('change', refreshRoleCatalog);
        }

        refreshRoleCatalog();
        setInterval(refreshRoleCatalog, 1500);

        document.addEventListener('click', function(e) {
            const target = e.target;
            if (target.closest('.skills-overlay-panel')) return;
            closeAllKnowledgePanels(null);
        });
    }

    // Actualizar contadores de caracteres
    function updateCharacterCounters() {
        const inputs = document.querySelectorAll('input[bc-input][maxlength]');
        inputs.forEach(input => {
            const maxLength = parseInt(input.getAttribute('maxlength'));
            const counter = input.parentElement.querySelector('.bc-input-span-info');
            
            if (counter && !counter.textContent.includes('/')) {
                return; // Ya tiene contador
            }
            
            input.addEventListener('input', function() {
                const length = this.value.length;
                const counterText = counter?.textContent.split('/')[0] || '';
                if (counter) {
                    counter.textContent = `${length} / ${maxLength}`;
                }
            });
        });
    }

    // Inicializar contadores después de un pequeño delay
    setTimeout(updateCharacterCounters, 100);

    // Exponer funciones globales si es necesario
    window.dialogStepper = {
        goToStep: goToStep,
        nextStep: nextStep,
        previousStep: previousStep,
        getCurrentStep: function() { return currentStep; },
        setCandidateData: function(data) {
            knowledgeOverlayState.candidateData = data || {};
            refreshRoleCatalog();
        }
    };

})();

