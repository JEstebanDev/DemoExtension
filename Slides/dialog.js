// Funcionalidad del stepper y diálogo

(function() {
    'use strict';

    let currentStep = 0;
    const totalSteps = 4;

    // Inicialización cuando el DOM está listo
    document.addEventListener('DOMContentLoaded', function() {
        initializeStepper();
        initializeSelects();
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
        getCurrentStep: function() { return currentStep; }
    };

})();

