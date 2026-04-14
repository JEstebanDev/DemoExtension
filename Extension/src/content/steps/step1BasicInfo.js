(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { fillInputByPlaceholder, fillInputWithFallbacks, fillBcInputSelect, tryFillField } = AutoFillExt.content.actions;

  async function fillStep1BasicInfo(data, warnings = []) {
    if (data.nombre) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "nombre",
        warnings,
        action: () => fillInputByPlaceholder("Nombre", data.nombre),
      });
    }
    if (data.primer_apellido) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "primer_apellido",
        warnings,
        action: () => fillInputByPlaceholder("Primer apellido", data.primer_apellido),
      });
    }
    if (data.segundo_apellido) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "segundo_apellido",
        warnings,
        action: () => fillInputByPlaceholder("Segundo apellido", data.segundo_apellido),
      });
    }
    if (data.cedula) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "cedula",
        warnings,
        action: () =>
          fillInputWithFallbacks("Documento identidad", String(data.cedula), [
            { type: "placeholderExact", value: "Documento identidad" },
            { type: "placeholderContains", value: "documento" },
            { type: "labelContains", value: "documento identidad" },
          ]),
      });
    }
    if (data.email) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "email",
        warnings,
        action: () =>
          fillInputWithFallbacks("E-mail", data.email, [
            { type: "placeholderExact", value: "E-mail" },
            { type: "placeholderContains", value: "email" },
            { type: "type", value: "email" },
          ]),
      });
    }
    if (data.anos_experiencia !== undefined && data.anos_experiencia !== null && data.anos_experiencia !== "") {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "anos_experiencia",
        warnings,
        action: () =>
          fillInputWithFallbacks("Años de experiencia", String(data.anos_experiencia), [
            { type: "uniqueSpinbutton" },
            { type: "ariaLabelExact", value: "custom-aria-label", inputType: "number" },
            { type: "labelContains", value: "años de experiencia", inputType: "number" },
            { type: "labelContains", value: "anos de experiencia", inputType: "number" },
            { type: "placeholderContains", value: "experiencia", inputType: "number" },
            { type: "placeholderExact", value: "Años de experiencia" },
          ]),
      });
    }
    await tryFillField({
      stepName: "step1BasicInfo",
      fieldName: "country",
      warnings,
      action: () => fillBcInputSelect("countrySelect", "Colombia"),
    });
    if (data.departamento) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "departamento",
        warnings,
        action: () => fillBcInputSelect("stateSelect", data.departamento),
      });
    }
    if (data.ciudad) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "ciudad",
        warnings,
        action: () => fillBcInputSelect("citySelect", data.ciudad),
      });
    }
    if (data.rol) {
      await tryFillField({
        stepName: "step1BasicInfo",
        fieldName: "rol",
        warnings,
        action: () => fillBcInputSelect("profileCandidate", data.rol, { mode: "firstMatch", nivelL: data.nivel_L }),
      });
    }
    return warnings;
  }

  AutoFillExt.content.steps = AutoFillExt.content.steps || {};
  AutoFillExt.content.steps.fillStep1BasicInfo = fillStep1BasicInfo;
})();
