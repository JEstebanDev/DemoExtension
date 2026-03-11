(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { fillLevelAcademyDropdown, fillInputByPlaceholderNth, fillInputByPlaceholder, fillInputById, tryFillField } = AutoFillExt.content.actions;

  async function fillStep4Education(data, warnings = []) {
    if (data.profesion) {
      await tryFillField({
        stepName: "step4Education",
        fieldName: "profesion",
        warnings,
        action: () => fillLevelAcademyDropdown(data.profesion),
      });
    }
    if (!Array.isArray(data.cursos_certificaciones)) return warnings;
    const cursos = data.cursos_certificaciones;
    if (cursos[0]?.institucion) {
      await tryFillField({
        stepName: "step4Education",
        fieldName: "cursos_certificaciones[0].institucion",
        warnings,
        action: () => fillInputByPlaceholderNth("Institución", 0, cursos[0].institucion),
      });
    }
    if (cursos[0]?.curso_certificacion) {
      await tryFillField({
        stepName: "step4Education",
        fieldName: "cursos_certificaciones[0].curso_certificacion",
        warnings,
        action: () => fillInputByPlaceholder("Título", cursos[0].curso_certificacion),
      });
    }
    if (cursos[0]?.fecha_obtencion) {
      await tryFillField({
        stepName: "step4Education",
        fieldName: "cursos_certificaciones[0].fecha_obtencion",
        warnings,
        action: () => fillInputById("mat-input-9", cursos[0].fecha_obtencion),
      });
    }
    for (let i = 1; i < Math.min(cursos.length, 4); i += 1) {
      const curso = cursos[i];
      if (curso.institucion) {
        await tryFillField({
          stepName: "step4Education",
          fieldName: `cursos_certificaciones[${i}].institucion`,
          warnings,
          action: () => fillInputByPlaceholderNth("Institución", i, curso.institucion),
        });
      }
      if (curso.curso_certificacion) {
        await tryFillField({
          stepName: "step4Education",
          fieldName: `cursos_certificaciones[${i}].curso_certificacion`,
          warnings,
          action: () => fillInputByPlaceholderNth("Curso / Certificación", i - 1, curso.curso_certificacion),
        });
      }
      if (curso.fecha_obtencion) {
        await tryFillField({
          stepName: "step4Education",
          fieldName: `cursos_certificaciones[${i}].fecha_obtencion`,
          warnings,
          action: () => fillInputById(`mat-input-${9 + i}`, curso.fecha_obtencion),
        });
      }
    }
    return warnings;
  }

  AutoFillExt.content.steps = AutoFillExt.content.steps || {};
  AutoFillExt.content.steps.fillStep4Education = fillStep4Education;
})();
