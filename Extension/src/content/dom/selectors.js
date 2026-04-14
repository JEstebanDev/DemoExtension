(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { normalizeText } = AutoFillExt.text;
  const { sleep } = AutoFillExt.time;
  const { isElementVisible, isElementInteractable, waitForElement } = AutoFillExt.content.waiters;

  function sortByDomOrder(elements) {
    return elements.sort((left, right) => {
      if (left === right) return 0;
      const relation = left.compareDocumentPosition(right);
      if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  function toUniqueElements(elements) {
    return Array.from(new Set(elements.filter(Boolean)));
  }

  function matchesControl(element, options = {}) {
    if (!element) return false;

    const tagName = options.tagName ? String(options.tagName).toUpperCase() : "";
    if (tagName && element.tagName !== tagName) return false;

    if (options.selector && !element.matches(options.selector)) return false;

    const inputType = options.inputType;
    if (inputType && element.tagName === "INPUT" && element.type !== inputType) return false;

    return true;
  }

  function resolveLabelAssociatedControl(label, options = {}) {
    const selector = options.selector || (options.tagName ? String(options.tagName).toLowerCase() : "input, textarea");
    const forId = label.getAttribute?.("for");

    if (forId) {
      const target = document.getElementById(forId);
      if (matchesControl(target, options)) return target;
    }

    const nested = label.querySelector?.(selector);
    if (matchesControl(nested, options)) return nested;

    const fieldContainer = label.closest?.(".mat-mdc-form-field, mat-form-field, .bc-form-field, bc-form-field");
    const insideField = fieldContainer?.querySelector?.(selector);
    if (matchesControl(insideField, options)) return insideField;

    const parentControl = label.parentElement?.querySelector?.(selector);
    if (matchesControl(parentControl, options)) return parentControl;

    return null;
  }

  function findControlsByLabelContains(text, options = {}) {
    const searchText = normalizeText(text);
    const labels = document.querySelectorAll("label, mat-label");
    const matches = [];

    for (const label of labels) {
      if (!normalizeText(label.textContent).includes(searchText)) continue;
      const control = resolveLabelAssociatedControl(label, options);
      if (!matchesControl(control, options)) continue;
      if (!isElementVisible(control) || !isElementInteractable(control)) continue;
      matches.push(control);
    }

    return sortByDomOrder(toUniqueElements(matches));
  }

  function getControlAccessibleNames(control) {
    if (!control) return [];

    const names = [];
    const ariaLabel = String(control.getAttribute?.("aria-label") || "").trim();
    const placeholder = String(control.getAttribute?.("placeholder") || "").trim();
    const labels = control.labels ? Array.from(control.labels).map((label) => String(label.textContent || "").trim()) : [];

    if (ariaLabel) names.push(ariaLabel);
    if (placeholder) names.push(placeholder);
    for (const textValue of labels) {
      if (textValue) names.push(textValue);
    }

    return toUniqueElements(names);
  }

  function findControlsByAccessibleNameContains(text, options = {}) {
    const searchText = normalizeText(text);
    const selector = options.selector || (options.tagName ? String(options.tagName).toLowerCase() : "input, textarea");
    const controls = Array.from(document.querySelectorAll(selector));
    const matches = controls.filter((control) => {
      if (!matchesControl(control, options)) return false;
      if (!isElementVisible(control) || !isElementInteractable(control)) return false;
      return getControlAccessibleNames(control).some((name) => normalizeText(name).includes(searchText));
    });

    return sortByDomOrder(toUniqueElements(matches));
  }

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

        await sleep(70); // D-1: reducido de 100ms
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
        await sleep(70); // D-2: reducido de 100ms
      }
      throw new Error(`No se encontró input por placeholder parcial "${value}"`);
    }
    if (type === "labelContains") {
      const start = Date.now();
      while (Date.now() - start < timeoutPerStrategy) {
        const candidate = findInputByLabelContains(value, inputType);
        if (candidate && isElementVisible(candidate) && isElementInteractable(candidate)) return candidate;
        await sleep(70); // D-3: reducido de 100ms
      }
      throw new Error(`No se encontró input por label "${value}"`);
    }
    if (type === "labelContainsNth") {
      const start = Date.now();
      const index = Number.isInteger(strategy?.index) ? strategy.index : 0;
      const selector = strategy?.selector;
      const tagName = strategy?.tagName;
      while (Date.now() - start < timeoutPerStrategy) {
        const matches = findControlsByLabelContains(value, { selector, tagName, inputType });
        if (matches[index]) return matches[index];
        await sleep(70); // D-4: reducido de 100ms
      }
      throw new Error(`No se encontró control #${index} por label "${value}"`);
    }
    if (type === "accessibleNameContainsNth") {
      const start = Date.now();
      const index = Number.isInteger(strategy?.index) ? strategy.index : 0;
      const selector = strategy?.selector;
      const tagName = strategy?.tagName;
      while (Date.now() - start < timeoutPerStrategy) {
        const matches = findControlsByAccessibleNameContains(value, { selector, tagName, inputType });
        if (matches[index]) return matches[index];
        await sleep(70); // D-5: reducido de 100ms
      }
      throw new Error(`No se encontró control #${index} por nombre accesible "${value}"`);
    }
    throw new Error(`Estrategia no soportada: ${type}`);
  }

  AutoFillExt.content.selectors = {
    findInputByLabelContains,
    findControlsByLabelContains,
    findControlsByAccessibleNameContains,
    resolveInputByStrategy,
  };
})();
