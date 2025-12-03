// Content script para rellenar el formulario con steppers

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        // Verificar que la página es correcta antes de proceder
        const isValidPage = verifyPage();
        if (!isValidPage) {
            sendResponse({ 
                success: false, 
                error: 'Esta página no contiene el formulario esperado. Por favor, asegúrate de estar en la página con el título "Paso 1: Datos Personales".' 
            });
            return true;
        }
        
        fillFormWithData(request.data);
        sendResponse({ success: true });
    }
    return true;
});

function verifyPage() {
    // Buscar el título "Paso 1: Datos Personales" en la página
    // Puede estar en un h2, h1, o cualquier elemento de texto
    const pageText = document.body.innerText || document.body.textContent || '';
    
    // Verificar que existe el título específico
    if (pageText.includes('Paso 1: Datos Personales')) {
        // También verificar que existe el campo nombre para mayor seguridad
        const nombreInput = document.getElementById('nombre');
        return nombreInput !== null;
    }
    
    return false;
}

function fillFormWithData(data) {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            executeFillForm(data);
        });
    } else {
        executeFillForm(data);
    }
}

function executeFillForm(data) {
    try {
        // Paso 1: Rellenar nombre y apellido
        const nombreInput = document.getElementById('nombre');
        const apellidoInput = document.getElementById('apellido');
        
        if (nombreInput && data.nombre) {
            setInputValue(nombreInput, data.nombre);
        }
        
        if (apellidoInput && data.apellido) {
            setInputValue(apellidoInput, data.apellido);
        }
        
        // Avanzar al siguiente paso después de un breve delay
        setTimeout(() => {
            if (typeof nextSlide === 'function') {
                nextSlide();
            } else {
                // Si la función no existe, intentar hacer click en el botón
                const nextBtn1 = document.querySelector('.slide[data-slide="1"] .btn-primary');
                if (nextBtn1) {
                    nextBtn1.click();
                }
            }
            
            // Paso 2: Rellenar edad y ciudad
            setTimeout(() => {
                const edadInput = document.getElementById('edad');
                const ciudadInput = document.getElementById('ciudad');
                
                if (edadInput && data.edad) {
                    setInputValue(edadInput, data.edad);
                }
                
                if (ciudadInput && data.ciudad) {
                    setInputValue(ciudadInput, data.ciudad);
                }
                
                // Avanzar al siguiente paso
                setTimeout(() => {
                    if (typeof nextSlide === 'function') {
                        nextSlide();
                    } else {
                        const nextBtn2 = document.querySelector('.slide[data-slide="2"] .btn-primary');
                        if (nextBtn2) {
                            nextBtn2.click();
                        }
                    }
                    
                    // Paso 3: Rellenar experiencia y rol
                    setTimeout(() => {
                        const experienciaInput = document.getElementById('experiencia');
                        const rolInput = document.getElementById('rol');
                        
                        if (experienciaInput && data.experiencia) {
                            setInputValue(experienciaInput, data.experiencia);
                        }
                        
                        if (rolInput && data.rol) {
                            setInputValue(rolInput, data.rol);
                        }
                        
                        // Finalizar formulario
                        setTimeout(() => {
                            if (typeof finishForm === 'function') {
                                finishForm();
                            } else {
                                const finishBtn = document.querySelector('.slide[data-slide="3"] .btn-primary');
                                if (finishBtn) {
                                    finishBtn.click();
                                }
                            }
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
        
    } catch (error) {
        console.error('Error al rellenar formulario:', error);
    }
}

function setInputValue(input, value) {
    // Crear y disparar eventos para simular entrada del usuario
    input.value = value;
    
    // Disparar eventos para que el formulario los detecte
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // También disparar eventos de focus y blur para mayor compatibilidad
    input.focus();
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
}

