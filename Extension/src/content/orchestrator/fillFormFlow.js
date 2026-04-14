(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { sleep } = AutoFillExt.time;
  const { clickOpenFormButton, clickNextButton, clickBackButton } = AutoFillExt.content.navigation;
  const { fillStep1BasicInfo, fillStep2Experience, fillStep3Skills, fillStep4Education } = AutoFillExt.content.steps;

  async function runStep(stepName, warnings, action) {
    try {
      await action();
    } catch (error) {
      const message = error?.message || String(error);
      warnings.push({ step: stepName, field: "__step__", message });
      console.warn(`[${stepName}] Error en step, continuando con el flujo: ${message}`);
    }
  }

  async function fillFormSequentially(data) {
    const warnings = [];
    await clickOpenFormButton();
    await sleep(800); // E-1: reducido de 1600ms — modal Angular abre en ~300-500ms

    await runStep("step1BasicInfo", warnings, () => fillStep1BasicInfo(data, warnings));
    await sleep(200); // E-2: reducido de 400ms — solo necesita que el botón Next esté habilitado
    await clickNextButton();
    await sleep(400); // E-3: reducido de 700ms — transición del stepper Angular ~200-300ms

    await runStep("step2Experience", warnings, () => fillStep2Experience(data, warnings));
    await sleep(200); // E-4: reducido de 400ms
    await clickNextButton();
    await sleep(400); // E-5: reducido de 700ms

    await runStep("step3Skills", warnings, () => fillStep3Skills(data, warnings));
    await sleep(200); // E-6: reducido de 400ms
    await clickNextButton();
    await sleep(400); // E-7: reducido de 700ms

    await runStep("step4Education", warnings, () => fillStep4Education(data, warnings));
    await sleep(200); // E-8: reducido de 320ms

    for (let i = 0; i < 3; i += 1) {
      await clickBackButton();
      await sleep(200); // E-9: reducido de 320ms — transición de vuelta entre pasos
    }

    return { warnings };
  }

  AutoFillExt.content.flow = { fillFormSequentially };
})();
