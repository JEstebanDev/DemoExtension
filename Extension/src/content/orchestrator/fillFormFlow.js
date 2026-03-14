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
    await sleep(1600);

    await runStep("step1BasicInfo", warnings, () => fillStep1BasicInfo(data, warnings));
    await sleep(400);
    await clickNextButton();
    await sleep(700);

    await runStep("step2Experience", warnings, () => fillStep2Experience(data, warnings));
    await sleep(400);
    await clickNextButton();
    await sleep(700);

    await runStep("step3Skills", warnings, () => fillStep3Skills(data, warnings));
    await sleep(400);
    await clickNextButton();
    await sleep(700);

    await runStep("step4Education", warnings, () => fillStep4Education(data, warnings));
    await sleep(320);

    for (let i = 0; i < 3; i += 1) {
      await clickBackButton();
      await sleep(320);
    }

    return { warnings };
  }

  AutoFillExt.content.flow = { fillFormSequentially };
})();
