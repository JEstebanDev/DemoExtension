(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { normalizeText } = AutoFillExt.text;
  const { sleep } = AutoFillExt.time;
  const { isElementVisible, isElementInteractable, waitForElement } = AutoFillExt.content.waiters;

  function findInputByLabelContains(text, inputType) {
    const searchText = normalizeText(text);
    const matchesType = (input) => input && input.tagName === "INPUT" && (!inputType || input.type === inputType);

    const labels = document.querySelectorAll("label");
    for (const label of labels) {
      if (!normalizeText(label.textContent).includes(searchText)) continue;
      const forId = label.getAttribute("for");
      if (forId) {
        const input = document.getElementById(forId);
        if (matchesType(input)) return input;
      }
      const nested = label.querySelector("input");
      if (matchesType(nested)) return nested;
    }

    const helperTexts = document.querySelectorAll(".bc-input-span-info, bc-form-field .bc-input-span-info");
    for (const helper of helperTexts) {
      if (!normalizeText(helper.textContent).includes(searchText)) continue;
      const fieldContainer = helper.closest(".bc-form-field, bc-form-field");
      if (fieldContainer) {
        const insideField = fieldContainer.querySelector(inputType ? `input[type="${inputType}"]` : "input");
        if (matchesType(insideField)) return insideField;
      }
      const parentInput = helper.parentElement?.querySelector(inputType ? `input[type="${inputType}"]` : "input");
      if (matchesType(parentInput)) return parentInput;
    }

    return null;
  }

  async function resolveInputByStrategy(strategy, timeoutPerStrategy = 3000) {
    const type = strategy?.type;
    const value = strategy?.value;
    const inputType = strategy?.inputType;
    if (type === "placeholderExact") return waitForElement(`input[placeholder="${value}"]`, timeoutPerStrategy, { visible: true, interactive: true });
    if (type === "uniqueSpinbutton") {
      const start = Date.now();
      while (Date.now() - start < timeoutPerStrategy) {
        const candidates = Array.from(document.querySelectorAll('input[role="spinbutton"], input[type="number"]')).filter(
          (input) => isElementVisible(input) && isElementInteractable(input)
        );

        if (candidates.length === 1) return candidates[0];
        if (candidates.length > 1) {
          throw new Error(`Se encontraron ${candidates.length} spinbutton(s); se esperaba solo uno`);
        }

        await sleep(100);
      }
      throw new Error("No se encontró spinbutton único");
    }
    if (type === "ariaLabelExact") {
      const selector = inputType ? `input[type="${inputType}"][aria-label="${value}"]` : `input[aria-label="${value}"]`;
      return waitForElement(selector, timeoutPerStrategy, { visible: true, interactive: true });
    }
    if (type === "type") return waitForElement(`input[type="${value}"]`, timeoutPerStrategy, { visible: true, interactive: true });
    if (type === "placeholderContains") {
      const start = Date.now();
      const searchText = normalizeText(value);
      while (Date.now() - start < timeoutPerStrategy) {
        const inputs = document.querySelectorAll("input[placeholder]");
        for (const input of inputs) {
          const okType = !inputType || input.type === inputType;
          if (okType && normalizeText(input.getAttribute("placeholder")).includes(searchText) && isElementVisible(input) && isElementInteractable(input)) return input;
        }
        await sleep(100);
      }
      throw new Error(`No se encontró input por placeholder parcial "${value}"`);
    }
    if (type === "labelContains") {
      const start = Date.now();
      while (Date.now() - start < timeoutPerStrategy) {
        const candidate = findInputByLabelContains(value, inputType);
        if (candidate && isElementVisible(candidate) && isElementInteractable(candidate)) return candidate;
        await sleep(100);
      }
      throw new Error(`No se encontró input por label "${value}"`);
    }
    throw new Error(`Estrategia no soportada: ${type}`);
  }

  AutoFillExt.content.selectors = { findInputByLabelContains, resolveInputByStrategy };
})();
