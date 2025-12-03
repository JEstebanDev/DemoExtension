let currentSlide = 1;
const totalSlides = 3;

function nextSlide() {
    if (currentSlide < totalSlides) {
        // Ocultar slide actual
        const currentSlideElement = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
        const currentIndicator = document.querySelector(`.step-indicator[data-step="${currentSlide}"]`);
        
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
        }
        if (currentIndicator) {
            currentIndicator.classList.remove('active');
        }
        
        // Mostrar siguiente slide
        currentSlide++;
        const nextSlideElement = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
        const nextIndicator = document.querySelector(`.step-indicator[data-step="${currentSlide}"]`);
        
        if (nextSlideElement) {
            nextSlideElement.classList.add('active');
        }
        if (nextIndicator) {
            nextIndicator.classList.add('active');
        }
    }
}

function prevSlide() {
    if (currentSlide > 1) {
        // Ocultar slide actual
        const currentSlideElement = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
        const currentIndicator = document.querySelector(`.step-indicator[data-step="${currentSlide}"]`);
        
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
        }
        if (currentIndicator) {
            currentIndicator.classList.remove('active');
        }
        
        // Mostrar slide anterior
        currentSlide--;
        const prevSlideElement = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
        const prevIndicator = document.querySelector(`.step-indicator[data-step="${currentSlide}"]`);
        
        if (prevSlideElement) {
            prevSlideElement.classList.add('active');
        }
        if (prevIndicator) {
            prevIndicator.classList.add('active');
        }
    }
}

function finishForm() {
    // Validar todos los campos antes de terminar
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const edad = document.getElementById('edad').value.trim();
    const ciudad = document.getElementById('ciudad').value.trim();
    const experiencia = document.getElementById('experiencia').value.trim();
    const rol = document.getElementById('rol').value.trim();
    
    if (!nombre || !apellido || !edad || !ciudad || !experiencia || !rol) {
        alert('Por favor completa todos los campos antes de terminar.');
        return;
    }
    
    // Recopilar todos los datos
    const formData = {
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        ciudad: ciudad,
        experiencia: experiencia,
        rol: rol
    };
    
    console.log('Datos del formulario:', formData);
    alert('¡Formulario completado exitosamente!\n\nDatos:\n' + 
          `Nombre: ${nombre} ${apellido}\n` +
          `Edad: ${edad}\n` +
          `Ciudad: ${ciudad}\n` +
          `Años de Experiencia: ${experiencia}\n` +
          `Rol: ${rol}`);
}

