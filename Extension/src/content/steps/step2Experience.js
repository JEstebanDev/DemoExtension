(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { fillInputByPlaceholderNth, fillInputById, tryFillField } = AutoFillExt.content.actions;

  async function fillStep2Experience(data, warnings = []) {
    if (!Array.isArray(data.experiencia)) return warnings;
    const experiencias = data.experiencia.slice(0, 3);
    for (let i = 0; i < experiencias.length; i += 1) {
      const exp = experiencias[i];
      if (exp.compania) {
        await tryFillField({
          stepName: "step2Experience",
          fieldName: `experiencia[${i}].compania`,
          warnings,
          action: () => fillInputByPlaceholderNth("Compañía", i, exp.compania),
        });
      }
      if (exp.cargo) {
        await tryFillField({
          stepName: "step2Experience",
          fieldName: `experiencia[${i}].cargo`,
          warnings,
          action: () => fillInputByPlaceholderNth("Cargo", i, exp.cargo),
        });
      }
      if (exp.actividades) {
        await tryFillField({
          stepName: "step2Experience",
          fieldName: `experiencia[${i}].actividades`,
          warnings,
          action: () => fillInputById(`mat-input-${2 + i * 3}`, exp.actividades),
        });
      }
      if (exp.periodo_inicio) {
        await tryFillField({
          stepName: "step2Experience",
          fieldName: `experiencia[${i}].periodo_inicio`,
          warnings,
          action: () => fillInputById(`mat-input-${i * 3}`, exp.periodo_inicio),
        });
      }
      if (exp.periodo_fin) {
        await tryFillField({
          stepName: "step2Experience",
          fieldName: `experiencia[${i}].periodo_fin`,
          warnings,
          action: () => fillInputById(`mat-input-${1 + i * 3}`, exp.periodo_fin),
        });
      }
    }
    return warnings;
  }

  AutoFillExt.content.steps = AutoFillExt.content.steps || {};
  AutoFillExt.content.steps.fillStep2Experience = fillStep2Experience;
})();
