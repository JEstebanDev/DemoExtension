/**
 * Content script para auto-llenado de formulario stepper
 * Escucha mensajes del popup y completa el formulario paso por paso
 */

// Escuchar mensajes del popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Responder a ping para verificar que el content script está cargado
  if (request.action === "ping") {
    sendResponse({ ready: true });
    return;
  }

  if (request.action === "fillForm") {
    console.log("Recibidos datos para llenar formulario:", request.data);

    fillFormSequentially(request.data)
      .then(() => {
        console.log("Formulario completado exitosamente");
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error al llenar formulario:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Retornar true para indicar que la respuesta será asíncrona
    return true;
  }
});

/**
 * Función principal que ejecuta el llenado del formulario paso por paso
 */
async function fillFormSequentially(data) {
  try {
    console.log("═══════════════════════════════════════");
    console.log("🚀 INICIANDO LLENADO DEL FORMULARIO");
    console.log("═══════════════════════════════════════");
    console.log("📦 Datos completos recibidos:");
    console.log(JSON.stringify(data, null, 2));
    console.log("═══════════════════════════════════════");

    // Paso 0: Buscar y hacer click en el botón person_add para abrir el diálogo
    console.log("\n🔍 PASO 0: Buscando botón para abrir el formulario...");
    await clickOpenFormButton();
    console.log(
      "⏳ Esperando que el diálogo se abra completamente (2 segundos)...",
    );
    await delay(2000); // Esperar más tiempo para que el diálogo se abra completamente

    // Paso 1: Llenar información básica
    console.log("\n═══════════════════════════════════════");
    await fillStep1InfoBasica(data);
    await delay(500);
    console.log('\n🔘 Haciendo click en "Siguiente"...');
    await clickNextButton();
    await delay(1000); // Esperar transición al siguiente paso

    // Paso 2: Llenar experiencia profesional
    await fillStep2Experiencia(data);
    await delay(500);
    await clickNextButton();
    await delay(1000);

    // Paso 3: Llenar conocimientos técnicos
    await fillStep3Conocimientos(data);
    await delay(500);
    await clickNextButton();
    await delay(1000);

    // Paso 4: Llenar formación académica
    await fillStep4Formacion(data);
    await delay(500);

    console.log("✅ Formulario completado exitosamente");
    
    // Volver al inicio haciendo click en "Atrás" 3 veces
    console.log("\n🔙 Volviendo al inicio del formulario...");
    for (let i = 0; i < 3; i++) {
      console.log(`🔘 Haciendo click en "Atrás" (${i + 1}/3)...`);
      await clickBackButton();
      await delay(500);
    }
    
    console.log("✅ Formulario completado y regresado al inicio");
  } catch (error) {
    console.error("❌ Error durante el llenado del formulario:", error);
    throw error;
  }
}

/**
 * PASO 1: Llenar información básica
 */
async function fillStep1InfoBasica(data) {
  console.log("📝 Llenando Paso 1: Información Básica");
  console.log("Datos recibidos:", {
    nombre: data.nombre,
    primer_apellido: data.primer_apellido,
    segundo_apellido: data.segundo_apellido,
    cedula: data.cedula,
    fecha_nacimiento: data.fecha_nacimiento,
    ciudad: data.ciudad,
  });

  // Nombre
  if (data.nombre) {
    console.log("  Llenando Nombre:", data.nombre);
    await fillInputByPlaceholder("Nombre", data.nombre);
    await delay(300);
  } else {
    console.warn("  ⚠️  data.nombre está vacío o es null");
  }

  // Primer apellido
  if (data.primer_apellido) {
    console.log("  Llenando Primer apellido:", data.primer_apellido);
    await fillInputByPlaceholder("Primer apellido", data.primer_apellido);
    await delay(300);
  } else {
    console.warn("  ⚠️  data.primer_apellido está vacío o es null");
  }

  // Segundo apellido
  if (data.segundo_apellido) {
    console.log("  Llenando Segundo apellido:", data.segundo_apellido);
    await fillInputByPlaceholder("Segundo apellido", data.segundo_apellido);
    await delay(300);
  } else {
    console.warn("  ⚠️  data.segundo_apellido está vacío o es null");
  }

  // Documento de identidad
  if (data.cedula) {
    console.log("  Llenando Documento identidad:", data.cedula);
    await fillInputByPlaceholder("Documento identidad", data.cedula.toString());
    await delay(300);
  } else {
    console.warn("  ⚠️  data.cedula está vacío o es null");
  }

  // E-mail
  if (data.email) {
    console.log("  Llenando E-mail:", data.email);
    await fillInputByPlaceholder("E-mail", data.email);
    await delay(300);
  } else {
    console.warn("  ⚠️  data.email está vacío o es null");
  }

  // Años de experiencia
  if (data.anos_experiencia) {
    console.log("  Llenando Años de experiencia:", data.anos_experiencia);
    await fillInputByAriaLabel(
      "custom-aria-label",
      data.anos_experiencia.toString(),
    );
    await delay(300);
  } else {
    console.warn("  ⚠️  data.anos_experiencia está vacío o es null");
  }

  // País (valor por defecto: Colombia)
  console.log("  Llenando País: Colombia");
  await fillBcInputSelect("countrySelect", "Colombia");
  await delay(300);

  // Departamento
  if (data.departamento) {
    console.log("  Llenando Departamento:", data.departamento);
    await fillBcInputSelect("stateSelect", data.departamento);
    await delay(300);
  } else {
    console.warn("  ⚠️  data.departamento está vacío o es null");
  }

  // Ciudad
  if (data.ciudad) {
    console.log("  Llenando Ciudad:", data.ciudad);
    await fillBcInputSelect("citySelect", data.ciudad);
    await delay(300);
  } else {
    console.warn("  ⚠️  data.ciudad está vacío o es null");
  }

  // Perfil facturación (no presente en JSON, se omite)
  // await fillMatSelectByLabel('Perfil facturación', '');

  console.log("✅ Paso 1 completado");
}

/**
 * PASO 2: Llenar experiencia profesional (últimas 3)
 */
async function fillStep2Experiencia(data) {
  console.log("📝 Llenando Paso 2: Experiencia Profesional");

  if (!data.experiencia || !Array.isArray(data.experiencia)) {
    console.warn("No hay datos de experiencia");
    return;
  }

  // Llenar hasta 3 experiencias
  const experiencias = data.experiencia.slice(0, 3);

  for (let i = 0; i < experiencias.length; i++) {
    const exp = experiencias[i];
    console.log(`Llenando experiencia ${i + 1}:`, exp);

    // Compañía
    if (exp.compania) {
      await fillInputByPlaceholderNth("Compañía", i, exp.compania);
      await delay(200);
    }

    // Cargo
    if (exp.cargo) {
      await fillInputByPlaceholderNth("Cargo", i, exp.cargo);
      await delay(200);
    }

    // Actividades - usar índice calculado para mat-input
    if (exp.actividades) {
      const actividadesId = `mat-input-${2 + i * 3}`;
      await fillInputById(actividadesId, exp.actividades);
      await delay(200);
    }

    // Periodo inicio - usar índice calculado
    if (exp.periodo_inicio) {
      const inicioId = `mat-input-${i * 3}`;
      await fillInputById(inicioId, exp.periodo_inicio);
      await delay(200);
    }

    // Periodo fin - usar índice calculado
    if (exp.periodo_fin) {
      const finId = `mat-input-${1 + i * 3}`;
      await fillInputById(finId, exp.periodo_fin);
      await delay(200);
    }
  }

  console.log("✅ Paso 2 completado");
}

/**
 * PASO 3: Llenar conocimientos técnicos
 */
async function fillStep3Conocimientos(data) {
  console.log("📝 Llenando Paso 3: Conocimientos Técnicos");

  // Lenguajes de programación (máximo 4)
  if (data.lenguajes_programacion) {
    await fillInputByPlaceholder(
      "Lenguajes de programación  (Escriba 4)",
      data.lenguajes_programacion,
    );
    await delay(200);
  }

  // Bases de datos
  if (data.bases_datos) {
    await fillInputByPlaceholder(
      "Bases de datos (Escriba 4)",
      data.bases_datos,
    );
    await delay(200);
  }

  // Aplicaciones
  if (data.aplicaciones) {
    await fillInputByPlaceholder("Aplicaciones (Escriba 4)", data.aplicaciones);
    await delay(200);
  }

  // Frameworks
  if (data.frameworks) {
    await fillInputByPlaceholder("Frameworks  (Escriba 4)", data.frameworks);
    await delay(200);
  }

  // Plataformas
  if (data.plataformas) {
    await fillInputByPlaceholder("Plataformas (Escriba 4)", data.plataformas);
    await delay(200);
  }

  // Herramientas
  if (data.herramientas) {
    await fillInputByPlaceholder("Herramientas (Escriba 4)", data.herramientas);
    await delay(200);
  }

  // Otros
  if (data.otros) {
    await fillInputByPlaceholder("Otros  (Escriba 4)", data.otros);
    await delay(200);
  }

  console.log("✅ Paso 3 completado");
}

/**
 * PASO 4: Llenar formación académica
 */
async function fillStep4Formacion(data) {
  console.log("📝 Llenando Paso 4: Formación Académica");

  // Nivel académico (profesión categorizada)
  if (data.profesion) {
    console.log("  Llenando Nivel Académico:", data.profesion);
    await fillLevelAcademyDropdown(data.profesion);
    await delay(300);
  }

  // Cursos y certificaciones
  if (
    data.cursos_certificaciones &&
    Array.isArray(data.cursos_certificaciones)
  ) {
    const cursos = data.cursos_certificaciones;

    // Primera entrada (Institución principal + Título)
    if (cursos[0]) {
      if (cursos[0].institucion) {
        await fillInputByPlaceholderNth(
          "Institución",
          0,
          cursos[0].institucion,
        );
        await delay(200);
      }

      // Título (usar curso_certificacion como título para la primera entrada)
      if (cursos[0].curso_certificacion) {
        await fillInputByPlaceholder("Título", cursos[0].curso_certificacion);
        await delay(200);
      }

      // Fecha de obtención
      if (cursos[0].fecha_obtencion) {
        await fillInputById("mat-input-9", cursos[0].fecha_obtencion);
        await delay(200);
      }
    }

    // Certificaciones adicionales (2-4)
    for (let i = 1; i < Math.min(cursos.length, 4); i++) {
      const curso = cursos[i];

      // Institución
      if (curso.institucion) {
        await fillInputByPlaceholderNth("Institución", i, curso.institucion);
        await delay(200);
      }

      // Curso/Certificación
      if (curso.curso_certificacion) {
        await fillInputByPlaceholderNth(
          "Curso / Certificación",
          i - 1,
          curso.curso_certificacion,
        );
        await delay(200);
      }

      // Fecha de obtención
      if (curso.fecha_obtencion) {
        const fechaId = `mat-input-${9 + i}`;
        await fillInputById(fechaId, curso.fecha_obtencion);
        await delay(200);
      }
    }
  }

  console.log("✅ Paso 4 completado");
}

// ============================================================================
// FUNCIONES AUXILIARES - HELPERS
// ============================================================================

/**
 * Llenar input por placeholder
 */
async function fillInputByPlaceholder(placeholder, value) {
  try {
    console.log(`  Buscando input con placeholder="${placeholder}"...`);
    const input = await waitForElement(
      `input[placeholder="${placeholder}"]`,
      3000,
    );

    if (!input) {
      throw new Error(`No se encontró el elemento`);
    }

    console.log(
      `  Elemento encontrado, type="${input.type}", visible=${input.offsetParent !== null}`,
    );

    // Hacer scroll si es necesario para que el elemento sea visible
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    await delay(100);

    // Hacer click para enfocar el campo (requerido por Angular Material)
    input.click();
    input.focus();
    await delay(150);

    // Limpiar el valor actual
    input.value = "";

    // Establecer el nuevo valor
    input.value = value;

    // Disparar eventos para que Angular detecte el cambio
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));

    console.log(`    ✓ Llenado exitoso: [${placeholder}] = "${value}"`);
  } catch (error) {
    console.error(`    ❌ Error al llenar [${placeholder}]:`, error.message);
  }
}

/**
 * Llenar input por placeholder con índice (nth)
 */
async function fillInputByPlaceholderNth(placeholder, index, value) {
  try {
    const inputs = document.querySelectorAll(
      `input[placeholder="${placeholder}"]`,
    );
    if (inputs && inputs[index]) {
      // Hacer click para enfocar
      inputs[index].click();
      await delay(100);

      // Limpiar y establecer valor
      inputs[index].value = "";
      inputs[index].value = value;

      // Disparar eventos
      inputs[index].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[index].dispatchEvent(new Event("change", { bubbles: true }));
      inputs[index].dispatchEvent(new Event("blur", { bubbles: true }));

      console.log(`✓ Llenado: [${placeholder}][${index}] = "${value}"`);
    }
  } catch (error) {
    console.warn(
      `⚠️  No se pudo llenar: [${placeholder}][${index}]`,
      error.message,
    );
  }
}

/**
 * Llenar input por ID
 */
async function fillInputById(id, value) {
  try {
    const input = await waitForElement(`#${id}`);
    if (input) {
      // Hacer click para enfocar
      input.click();
      await delay(100);

      // Limpiar y establecer valor
      input.value = "";
      input.value = value;

      // Disparar eventos
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("blur", { bubbles: true }));

      console.log(`✓ Llenado: [#${id}] = "${value}"`);
    }
  } catch (error) {
    console.warn(`⚠️  No se pudo llenar: [#${id}]`, error.message);
  }
}

/**
 * Llenar input por aria-label
 */
async function fillInputByAriaLabel(label, value) {
  try {
    // Buscar todos los inputs numéricos con el aria-label y seleccionar el segundo (índice 1)
    const inputs = document.querySelectorAll(
      `input[type="number"][aria-label="${label}"]`,
    );
    const input = inputs[0]; // equivalente a .nth(1) en Playwright

    if (!input) {
      throw new Error(
        `No se encontró input con aria-label="${label}" en la posición 1`,
      );
    }

    // Hacer click para enfocar
    input.click();
    await delay(100);

    // Limpiar y establecer valor
    input.value = "";
    input.value = value;

    // Disparar eventos
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));

    console.log(`✓ Llenado: [aria-label="${label}"] = "${value}"`);
  } catch (error) {
    console.warn(
      `⚠️  No se pudo llenar: [aria-label="${label}"]`,
      error.message,
    );
  }
}

/**
 * Llenar mat-select (dropdown de Angular Material)
 */
async function fillMatSelectByLabel(label, value) {
  try {
    let trigger = null;

    // Estrategia 0: Buscar por ID cuando sea posible (más confiable)
    // Mapeo de labels comunes a sus IDs conocidos
    const labelToIdMap = {
      País: "countrySelect-input",
      Ciudad: "citySelect-input",
    };

    if (labelToIdMap[label]) {
      const inputById = document.querySelector(`#${labelToIdMap[label]}`);
      if (inputById) {
        // Si es un input directo, buscar el mat-select padre
        const matSelectParent = inputById.closest("mat-select");
        trigger = matSelectParent || inputById;
      }
    }

    if (!trigger) {
      throw new Error(`No se encontró mat-select con label "${label}"`);
    }

    await clickMatSelect(trigger, value);
    console.log(`✓ Seleccionado: [${label}] = "${value}"`);
  } catch (error) {
    console.warn(`⚠️  No se pudo seleccionar: [${label}]`, error.message);
  }
}

/**
 * Hacer click en mat-select y seleccionar opción
 */
async function clickMatSelect(trigger, value) {
  // Click para abrir el dropdown
  trigger.click();
  await delay(500); // Esperar más tiempo para que se abra el overlay

  // Buscar la opción en el overlay (mat-option puede estar en cdk-overlay)
  await delay(200); // Delay adicional para asegurar que el overlay esté renderizado

  const options = document.querySelectorAll("mat-option, .mat-option");
  let found = false;

  for (const option of options) {
    // Verificar si la opción está visible
    const isVisible = option.offsetParent !== null;
    if (!isVisible) continue;

    const text = option.textContent.trim();
    if (text === value || text.includes(value) || value.includes(text)) {
      console.log(`  Encontrada opción: "${text}"`);
      option.click();
      await delay(300);
      found = true;
      return;
    }
  }

  if (!found) {
    console.warn(`  No se encontró la opción "${value}" en el dropdown`);
    // Presionar Escape para cerrar el dropdown
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  }
}

/**
 * Llenar un dropdown bc-input-select genérico por ID del contenedor
 */
async function fillBcInputSelect(containerId, value) {
  try {
    console.log(`  Buscando dropdown ${containerId} con valor: "${value}"`);
    
    // Buscar el contenedor del dropdown por ID
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
      throw new Error(`No se encontró el contenedor con ID "${containerId}"`);
    }
    
    // Buscar el input dentro del contenedor
    const inputElement = container.querySelector('input[type="text"]');
    if (!inputElement) {
      throw new Error(`No se encontró el input en el contenedor "${containerId}"`);
    }
    
    // Buscar el dropdown content
    const dropdownContainer = container.querySelector(`#${containerId}-container`);
    if (!dropdownContainer) {
      throw new Error(`No se encontró el dropdown content con ID "${containerId}-container"`);
    }
    
    console.log(`  Estableciendo valor directamente en el input: "${value}"`);
    
    // Hacer scroll para que el elemento sea visible
    inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
    await delay(200);
    
    // Hacer click en el input para enfocarlo
    inputElement.click();
    inputElement.focus();
    await delay(100);
    
    // Establecer el valor directamente en el input
    inputElement.value = "";
    inputElement.value = value;
    
    // Disparar eventos para que Angular detecte el cambio
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    inputElement.dispatchEvent(new Event("blur", { bubbles: true }));
    
    await delay(200);
    console.log(`  ✓ Valor establecido: "${value}"`);
    
    // Verificar si hay opciones disponibles y si coincide alguna, hacer click en ella
    const items = dropdownContainer.querySelectorAll(".bc-input-select-item");
    if (items.length > 0) {
      console.log(`  Encontradas ${items.length} opciones disponibles, buscando coincidencia...`);
      
      for (const item of items) {
        const span = item.querySelector(".bc-span-single");
        if (!span) continue;
        
        const itemText = span.textContent.trim();
        
        // Comparación exacta o parcial (case-insensitive)
        if (itemText.toUpperCase() === value.toUpperCase() || 
            itemText.toUpperCase().includes(value.toUpperCase()) ||
            value.toUpperCase().includes(itemText.toUpperCase())) {
          console.log(`  Encontrada opción coincidente: "${itemText}", seleccionando...`);
          
          // Hacer click en el item
          item.click();
          await delay(300);
          console.log(`  ✓ Opción seleccionada de la lista`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error(`  ❌ Error al llenar dropdown ${containerId}:`, error.message);
    throw error;
  }
}

/**
 * Llenar el dropdown de nivel académico (componente personalizado bc-input-select)
 */
async function fillLevelAcademyDropdown(value) {
  try {
    console.log(`  Buscando dropdown de nivel académico con valor: "${value}"`);
    
    // Buscar el contenedor del dropdown por ID o por el input relacionado
    let dropdownContainer = null;
    let inputElement = null;
    
    // Estrategia 1: Buscar por ID específico
    const containerById = document.querySelector("#levelAcademy-container");
    if (containerById) {
      dropdownContainer = containerById;
      // Buscar el input asociado dentro del mismo contenedor padre
      const parentSelect = containerById.closest(".bc-input-select");
      if (parentSelect) {
        inputElement = parentSelect.querySelector('input[type="text"]');
      }
    }
    
    // Estrategia 2: Buscar por el input con label "Nivel Academico"
    if (!inputElement) {
      const textbox = document.querySelector('input[aria-label*="Nivel Academico"], input[aria-label*="Nivel academico"]');
      if (textbox) {
        inputElement = textbox;
        const parentSelect = textbox.closest(".bc-input-select");
        if (parentSelect) {
          dropdownContainer = parentSelect.querySelector(".bc-input-select-content");
        }
      }
    }
    
    // Estrategia 3: Buscar por role="textbox" con name "Nivel Academico"
    if (!inputElement) {
      const textbox = document.querySelector('input[role="textbox"][name*="Nivel"], textbox[role="textbox"][aria-label*="Nivel"]');
      if (textbox) {
        inputElement = textbox;
        const parentSelect = textbox.closest(".bc-input-select");
        if (parentSelect) {
          dropdownContainer = parentSelect.querySelector(".bc-input-select-content");
        }
      }
    }
    
    if (!dropdownContainer || !inputElement) {
      throw new Error("No se encontró el dropdown de nivel académico");
    }
    
    console.log("  Dropdown encontrado, abriendo...");
    
    // Hacer scroll para que el elemento sea visible
    inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
    await delay(200);
    
    // Hacer click en el input para abrir el dropdown
    inputElement.click();
    await delay(500); // Esperar a que se abra el dropdown
    
    // Buscar la opción que coincida con el valor
    const items = dropdownContainer.querySelectorAll(".bc-input-select-item");
    let found = false;
    
    for (const item of items) {
      const span = item.querySelector(".bc-span-single");
      if (!span) continue;
      
      const itemText = span.textContent.trim();
      
      // Comparación exacta o parcial (case-insensitive)
      if (itemText.toUpperCase() === value.toUpperCase() || 
          itemText.toUpperCase().includes(value.toUpperCase()) ||
          value.toUpperCase().includes(itemText.toUpperCase())) {
        console.log(`  Encontrada opción: "${itemText}"`);
        
        // Hacer click en el item
        item.click();
        await delay(300);
        
        // Verificar que el valor se haya establecido en el input
        if (inputElement.value === itemText || inputElement.value.includes(itemText)) {
          console.log(`  ✓ Valor seleccionado correctamente: "${itemText}"`);
        }
        
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.warn(`  ⚠️  No se encontró la opción "${value}" en el dropdown`);
      // Cerrar el dropdown haciendo click fuera o en el input nuevamente
      inputElement.click();
      await delay(200);
    }
    
  } catch (error) {
    console.error(`  ❌ Error al llenar nivel académico:`, error.message);
    throw error;
  }
}

/**
 * Hacer click en el botón person_add para abrir el formulario
 */
async function clickOpenFormButton() {
  try {
    // Buscar botón con el texto/icono person_add
    const buttons = document.querySelectorAll("button");

    for (const button of buttons) {
      const text = button.textContent.trim();
      const innerHTML = button.innerHTML;

      // Buscar por texto o por contenido HTML que incluya person_add
      if (text.includes("person_add") || innerHTML.includes("person_add")) {
        console.log("✅ Encontrado botón person_add, haciendo click...");
        button.click();
        return;
      }
    }

    // Alternativa: buscar por material icon
    const materialIcons = document.querySelectorAll(
      "mat-icon, i.material-icons, span.material-icons",
    );
    for (const icon of materialIcons) {
      if (icon.textContent.trim() === "person_add") {
        console.log(
          "✅ Encontrado icono person_add, haciendo click en el botón padre...",
        );
        const button = icon.closest("button");
        if (button) {
          button.click();
          return;
        }
      }
    }

    // Si no se encuentra, advertir pero continuar (puede que el diálogo ya esté abierto)
    console.warn(
      "⚠️  No se encontró el botón person_add. El formulario podría estar ya abierto.",
    );
  } catch (error) {
    console.error("Error al buscar botón person_add:", error);
    throw error;
  }
}

/**
 * Hacer click en el botón "Siguiente"
 */
async function clickNextButton() {
  try {
    // Buscar botón con texto "Siguiente"
    const buttons = document.querySelectorAll("button");
    for (const button of buttons) {
      if (button.textContent.trim().toLowerCase().includes("siguiente")) {
        console.log('🔘 Click en botón "Siguiente"');
        button.click();
        return;
      }
    }

    // Alternativa: buscar por aria-label
    const nextBtn = document.querySelector(
      'button[aria-label*="Siguiente"], button[aria-label*="siguiente"]',
    );
    if (nextBtn) {
      console.log('🔘 Click en botón "Siguiente" (por aria-label)');
      nextBtn.click();
    }
  } catch (error) {
    console.error('Error al hacer click en "Siguiente":', error);
  }
}

/**
 * Hacer click en el botón "Atrás"
 */
async function clickBackButton() {
  try {
    // Buscar botón con texto "Atrás"
    const buttons = document.querySelectorAll("button");
    for (const button of buttons) {
      if (button.textContent.trim().toLowerCase().includes("atrás") || 
          button.textContent.trim().toLowerCase().includes("atras")) {
        console.log('🔘 Click en botón "Atrás"');
        button.click();
        return;
      }
    }

    // Alternativa: buscar por aria-label
    const backBtn = document.querySelector(
      'button[aria-label*="Atrás"], button[aria-label*="atras"], button[aria-label*="Back"]',
    );
    if (backBtn) {
      console.log('🔘 Click en botón "Atrás" (por aria-label)');
      backBtn.click();
    }
  } catch (error) {
    console.error('Error al hacer click en "Atrás":', error);
  }
}

/**
 * Esperar a que un elemento esté disponible en el DOM
 */
async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
    await delay(100);
  }

  throw new Error(`Timeout esperando elemento: ${selector}`);
}

/**
 * Delay/pausa
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calcular edad desde fecha de nacimiento en formato dd/mm/yyyy
 */
function calculateAgeFromDate(dateString) {
  if (!dateString) return null;

  try {
    // Parsear fecha en formato dd/mm/yyyy
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-11
    const year = parseInt(parts[2], 10);

    const birthDate = new Date(year, month, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  } catch (error) {
    console.error("Error al calcular edad:", error);
    return null;
  }
}

console.log("✅ Content script cargado - Listo para auto-llenar formularios");
