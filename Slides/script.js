let currentSlide = 1;
const totalSlides = 3;

function updateIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        indicator.classList.remove('active', 'completed');
        
        if (stepNumber < currentSlide) {
            indicator.classList.add('completed');
        } else if (stepNumber === currentSlide) {
            indicator.classList.add('active');
        }
    });
}

function showSlide(slideNumber) {
    // Ocultar todos los slides
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Mostrar el slide actual
    const currentSlideElement = document.querySelector(`[data-slide="${slideNumber}"]`);
    if (currentSlideElement) {
        currentSlideElement.classList.add('active');
    }
    
    // Actualizar indicadores
    updateIndicators();
}

function validateSlide(slideNumber) {
    switch(slideNumber) {
        case 1:
            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            if (!nombre || !apellido) {
                alert('Por favor completa todos los campos');
                return false;
            }
            return true;
        
        case 2:
            const edad = document.getElementById('edad').value.trim();
            const ciudad = document.getElementById('ciudad').value.trim();
            if (!edad || !ciudad) {
                alert('Por favor completa todos los campos');
                return false;
            }
            return true;
        
        case 3:
            const experiencia = document.getElementById('experiencia').value.trim();
            const rol = document.getElementById('rol').value.trim();
            if (!experiencia || !rol) {
                alert('Por favor completa todos los campos');
                return false;
            }
            return true;
        
        default:
            return true;
    }
}

function nextSlide() {
    if (!validateSlide(currentSlide)) {
        return;
    }
    
    if (currentSlide < totalSlides) {
        currentSlide++;
        showSlide(currentSlide);
    }
}

function prevSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        showSlide(currentSlide);
    }
}

function finishForm() {
    if (!validateSlide(currentSlide)) {
        return;
    }
    
    // Recopilar todos los datos
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        edad: document.getElementById('edad').value.trim(),
        ciudad: document.getElementById('ciudad').value.trim(),
        experiencia: document.getElementById('experiencia').value.trim(),
        rol: document.getElementById('rol').value.trim()
    };
    
    // Mostrar resumen
    const summary = `
        Resumen de datos:
        
        Nombre: ${formData.nombre}
        Apellido: ${formData.apellido}
        Edad: ${formData.edad}
        Ciudad: ${formData.ciudad}
        Años de Experiencia: ${formData.experiencia}
        Rol: ${formData.rol}
    `;
    
    alert(summary);
    console.log('Datos del formulario:', formData);
}

// Permitir navegación con Enter en los campos de texto
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const slideNumber = parseInt(this.closest('.slide').dataset.slide);
                
                if (slideNumber < totalSlides) {
                    nextSlide();
                } else {
                    finishForm();
                }
            }
        });
    });
    
    // Inicializar el primer slide
    showSlide(1);
});

