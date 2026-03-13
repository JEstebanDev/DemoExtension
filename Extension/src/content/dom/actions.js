(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { normalizeText } = AutoFillExt.text;
  const { sleep, retry } = AutoFillExt.time;
  const { waitForElement } = AutoFillExt.content.waiters;
  const { resolveInputByStrategy } = AutoFillExt.content.selectors;

  function setNativeValue(element, value) {
    const normalizedValue = value == null ? "" : String(value);
    const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && typeof descriptor.set === "function") {
      descriptor.set.call(element, normalizedValue);
      return;
    }
    element.value = normalizedValue;
  }

  function dispatchValueEvents(element) {
    element.dispatchEvent(new Event("beforeinput", { bubbles: true }));
    element.dispatchEvent(new InputEvent("input", { bubbles: true, data: null, inputType: "insertText" }));
    element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "a" }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function getLengthCounterElement(element) {
    const field = element.closest(".bc-form-field");
    if (!field) return null;
    const info = field.querySelector(".bc-input-span-info");
    if (!info) return null;
    return info.textContent && info.textContent.includes("/") ? info : null;
  }

  function isLengthCounterSynced(element, expectedValue) {
    const counter = getLengthCounterElement(element);
    if (!counter) return true;
    const match = String(counter.textContent || "").match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return true;
    const currentLength = Number(match[1]);
    return currentLength === String(expectedValue || "").length;
  }

  async function typeByChunks(element, text, chunkSize = 40) {
    const value = text == null ? "" : String(text);
    setNativeValue(element, "");
    element.dispatchEvent(new InputEvent("input", { bubbles: true, data: null, inputType: "deleteContentBackward" }));
    for (let i = 0; i < value.length; i += chunkSize) {
      const chunk = value.slice(i, i + chunkSize);
      setNativeValue(element, `${element.value || ""}${chunk}`);
      element.dispatchEvent(new InputEvent("input", { bubbles: true, data: chunk, inputType: "insertText" }));
      await sleep(20);
    }
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function setInputValueRobust(input, value, maxAttempts = 2) {
    const normalizedValue = value == null ? "" : String(value);
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(80);
      input.click();
      input.focus();
      await sleep(80);
      setNativeValue(input, "");
      dispatchValueEvents(input);
      setNativeValue(input, normalizedValue);
      dispatchValueEvents(input);
      input.dispatchEvent(new Event("blur", { bubbles: true }));
      await sleep(80);
      const hasExpectedValue = String(input.value || "") === normalizedValue;
      const counterSynced = isLengthCounterSynced(input, normalizedValue);
      if (hasExpectedValue && counterSynced) return true;
      if (hasExpectedValue && !counterSynced) {
        input.focus();
        await typeByChunks(input, normalizedValue);
        input.dispatchEvent(new Event("blur", { bubbles: true }));
        await sleep(80);
        if (String(input.value || "") === normalizedValue && isLengthCounterSynced(input, normalizedValue)) return true;
      }
    }
    return false;
  }

  async function fillInputWithFallbacks(fieldName, value, strategies, options = {}) {
    const retriesPerStrategy = options.retriesPerStrategy || 2;
    const timeoutPerStrategy = options.timeoutPerStrategy || 3500;
    for (const strategy of strategies) {
      try {
        await retry(async () => {
          const input = await resolveInputByStrategy(strategy, timeoutPerStrategy);
          const ok = await setInputValueRobust(input, value, 2);
          if (!ok) throw new Error(`No se aplicó valor en ${fieldName}`);
        }, retriesPerStrategy, 100);
        return;
      } catch (error) {
        console.warn(`Estrategia ${strategy.type} falló para ${fieldName}:`, error.message);
      }
    }
    throw new Error(`No se pudo llenar el campo "${fieldName}"`);
  }

  async function fillInputByPlaceholder(placeholder, value) {
    const input = await waitForElement(`input[placeholder="${placeholder}"]`, 3000);
    await setInputValueRobust(input, value, 2);
  }

  async function fillInputByPlaceholderNth(placeholder, index, value) {
    const inputs = document.querySelectorAll(`input[placeholder="${placeholder}"]`);
    if (!inputs[index]) return;
    await setInputValueRobust(inputs[index], value, 2);
  }

  async function fillInputById(id, value) {
    const input = await waitForElement(`#${id}`, 5000);
    await setInputValueRobust(input, value, 2);
  }

  const SPANISH_MONTHS = {
    enero: "01", ene: "01",
    febrero: "02", feb: "02",
    marzo: "03", mar: "03",
    abril: "04", abr: "04",
    mayo: "05", may: "05",
    junio: "06", jun: "06",
    julio: "07", jul: "07",
    agosto: "08", ago: "08",
    septiembre: "09", sep: "09", sept: "09",
    octubre: "10", oct: "10",
    noviembre: "11", nov: "11",
    diciembre: "12", dic: "12",
  };

  function normalizeMonthDate(raw) {
    const str = String(raw || "").trim();
    // Already MM/YYYY or MM-YYYY
    if (/^\d{2}[\/\-]\d{4}$/.test(str)) return str.replace("-", "/");
    // Try "mes YYYY" or "mes. YYYY" (Spanish)
    const match = str.toLowerCase().match(/^([a-záéíóúüñ]+)\.?\s+(\d{4})$/);
    if (match) {
      const monthNum = SPANISH_MONTHS[match[1]];
      if (monthNum) return `${monthNum}/${match[2]}`;
    }
    // Return as-is if unrecognized
    return str;
  }

  async function fillDateInputById(id, value) {
    const input = await waitForElement(`#${id}`, 5000);
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(80);
    input.click();
    input.focus();
    await sleep(80);
    // Select all existing content before clearing so we don't append
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a", ctrlKey: true }));
    await sleep(30);
    setNativeValue(input, "");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, data: null, inputType: "deleteContentBackward" }));
    await sleep(40);
    const text = normalizeMonthDate(value);
    for (const char of text) {
      setNativeValue(input, `${input.value || ""}${char}`);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: char, inputType: "insertText" }));
      await sleep(30);
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
    // dateChange is the Angular Material datepicker-specific event
    input.dispatchEvent(new CustomEvent("dateChange", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    await sleep(120);
  }

  async function fillTextareaById(id, value) {
    const textarea = await waitForElement(`textarea#${id}`, 5000);
    textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(80);
    textarea.click();
    textarea.focus();
    await sleep(80);
    await typeByChunks(textarea, value);
    textarea.dispatchEvent(new Event("blur", { bubbles: true }));
    await sleep(80);
  }

  const PROFILE_ROLE_TO_OPTION = Object.freeze({
    frontend: "DESARROLLOS FRONT-END SENIOR - $17,461,500",
    fullstack: "DESARROLLOS FULL-STACK JUNIOR - $17,001,200",
    backend: "DESARROLLOS BACK-END NIVEL 3 - $",
    automatizador: "AUTOMATIZACIÓN DE PRUEBAS NIVEL 4 - $",
    mobile: "DESARROLLOS MOBILE JUNIOR - $18,580,000",
    devops: "INGENIERÍA DEVOPS_OFFSHORE SEMI-SENIOR - $0",
    analista: "ANÁLISIS DE SOLUCIONES TI JUNIOR - $11,075,200",
    arquitectura: "ARQUITECTAR SOLUCIONES JUNIOR - $22,057,500",
  });

  function normalizeSelectText(value) {
    return normalizeText(value).replace(/[_-]/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function compactSelectText(value) {
    return normalizeSelectText(value).replace(/\s+/g, "");
  }

  function tokenizeSelectText(value) {
    return normalizeSelectText(value)
      .split(" ")
      .map((token) => token.trim())
      .filter(Boolean);
  }

  function resolveProfileRoleKey(value) {
    const text = normalizeSelectText(value);
    if (!text) return "";
    if (text.includes("front")) return "frontend";
    if (text.includes("full")) return "fullstack";
    if (text.includes("back")) return "backend";
    if (text.includes("automat")) return "automatizador";
    if (text.includes("mobil") || text.includes("movil")) return "mobile";
    if (text.includes("devops")) return "devops";
    if (text.includes("analis")) return "analista";
    if (text.includes("arquitect")) return "arquitectura";
    return "";
  }

  function findFirstRobustSelectItem(items, value, preferredValue = "") {
    const targetRaw = String(value || "").trim();
    const preferredRaw = String(preferredValue || "").trim();
    const targetNorm = normalizeSelectText(targetRaw);
    const targetCompact = compactSelectText(targetRaw);
    const targetTokens = tokenizeSelectText(targetRaw);
    const preferredNorm = normalizeSelectText(preferredRaw);

    const candidates = Array.from(items)
      .map((item) => {
        const text = (item.querySelector(".bc-span-single")?.textContent || "").trim();
        return {
          item,
          text,
          normalized: normalizeSelectText(text),
          compact: compactSelectText(text),
        };
      })
      .filter((entry) => entry.text);

    if (!candidates.length) return null;

    if (preferredNorm) {
      const preferredExactMatch = candidates.find((entry) => entry.normalized === preferredNorm);
      if (preferredExactMatch) return preferredExactMatch.item;

      const preferredCompactNorm = compactSelectText(preferredRaw);
      const preferredCompactMatch = candidates.find((entry) => preferredCompactNorm && entry.compact === preferredCompactNorm);
      if (preferredCompactMatch) return preferredCompactMatch.item;

      const preferredContainsMatch = candidates.find(
        (entry) => entry.normalized.includes(preferredNorm) || preferredNorm.includes(entry.normalized)
      );
      if (preferredContainsMatch) return preferredContainsMatch.item;
    }

    const directMatch = candidates.find((entry) => targetNorm && (entry.normalized === targetNorm || entry.normalized.includes(targetNorm)));
    if (directMatch) return directMatch.item;

    const compactMatch = candidates.find((entry) => targetCompact && (entry.compact.includes(targetCompact) || targetCompact.includes(entry.compact)));
    if (compactMatch) return compactMatch.item;

    if (targetTokens.length) {
      const tokenMatch = candidates.find((entry) => targetTokens.every((token) => entry.normalized.includes(token)));
      if (tokenMatch) return tokenMatch.item;
    }

    return null;
  }

  async function fillBcInputSelect(containerId, value, options = {}) {
    const container = document.querySelector(`#${containerId}`);
    if (!container) throw new Error(`No se encontró contenedor ${containerId}`);
    const input = container.querySelector('input[type="text"]');
    if (!input) throw new Error(`No se encontró input en ${containerId}`);
    
    const mode = options.mode || "default";

    if (mode === "firstMatch") {
      // Resolver el mapeo ANTES de escribir en el input para evitar filtrado incorrecto
      const roleKey = resolveProfileRoleKey(value);
      const preferredOption = containerId === "profileCandidate" && roleKey ? PROFILE_ROLE_TO_OPTION[roleKey] : "";
      // Usar preferredOption para el input si existe, sino usar el valor original
      const inputValue = preferredOption || value;
      
      await setInputValueRobust(input, inputValue, 2);
      await sleep(200);
      const items = container.querySelectorAll(".bc-input-select-item");
      
      const selectedItem = findFirstRobustSelectItem(items, inputValue, preferredOption);
      if (!selectedItem) {
        throw new Error(`No se encontró opción compatible en ${containerId} para "${inputValue}"`);
      }
      selectedItem.click();
      await sleep(250);
      return;
    }

    // Modo default: comportamiento original
    await setInputValueRobust(input, value, 2);
    await sleep(200);
    const items = container.querySelectorAll(".bc-input-select-item");

    for (const item of items) {
      const text = (item.querySelector(".bc-span-single")?.textContent || "").trim();
      if (!text) continue;
      if (text.toUpperCase() === String(value).toUpperCase() || text.toUpperCase().includes(String(value).toUpperCase())) {
        item.click();
        await sleep(250);
        break;
      }
    }
  }

  async function fillLevelAcademyDropdown(value) {
    let input = document.querySelector('input[aria-label*="Nivel Academico"], input[aria-label*="Nivel academico"]');
    if (!input) input = document.querySelector("#levelAcademy-input, #levelAcademy input[type='text']");
    if (!input) throw new Error("No se encontró dropdown nivel académico");
    
    // Escribir el valor en el input para filtrar las opciones
    await setInputValueRobust(input, value, 2);
    await sleep(300);
    
    const parent = input.closest(".bc-input-select");
    const items = parent ? parent.querySelectorAll(".bc-input-select-item") : [];
    for (const item of items) {
      const text = (item.querySelector(".bc-span-single")?.textContent || "").trim();
      if (!text) continue;
      if (text.toUpperCase() === String(value).toUpperCase() || text.toUpperCase().includes(String(value).toUpperCase())) {
        item.click();
        await sleep(200);
        return;
      }
    }
    throw new Error(`No se encontró opción de nivel académico: "${value}"`);
  }

  function toUniqueTechnologyList(rawValues, maxItems = 4) {
    const source = Array.isArray(rawValues) ? rawValues : String(rawValues || "").split(",");
    const unique = [];
    const seen = new Set();
    for (const item of source) {
      const cleaned = String(item || "").trim();
      if (!cleaned) continue;
      const key = normalizeText(cleaned);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(cleaned);
      if (maxItems && unique.length >= maxItems) break;
    }
    return unique;
  }

  function extractOptionText(option) {
    const preferred = option.querySelector?.(".mdc-list-item__primary-text");
    return String(preferred?.textContent || option.textContent || "").trim();
  }

  function getByRoleComboboxByName(targetName, exact = true) {
    const target = normalizeText(targetName);
    if (!target) return null;

    const selectors = [
      'input[role="combobox"]',
      '[role="combobox"] input',
      'input[aria-autocomplete="list"]',
      "input[matautocomplete]",
      "input[aria-expanded]",
    ].join(", ");

    const inputs = Array.from(document.querySelectorAll(selectors)).filter((node) => node instanceof HTMLInputElement && isVisibleElement(node));

    for (const input of inputs) {
      const names = getInputAccessibleNames(input);
      for (const name of names) {
        const nameNorm = normalizeText(name);
        if (!nameNorm) continue;
        if (exact && nameNorm === target) return input;
        if (!exact && (nameNorm.includes(target) || target.includes(nameNorm))) return input;
      }
    }

    return null;
  }

  function getByRoleOptionByName(targetValue, exact = true) {
    const panelSelector = '.mat-mdc-autocomplete-panel[role="listbox"], .mat-autocomplete-panel[role="listbox"]';
    const optionSelector = [
      'mat-option[role="option"]',
      '.mat-mdc-option[role="option"]',
      '.mat-option[role="option"]',
      "mat-option",
      ".mat-mdc-option",
    ].join(", ");
    const panels = Array.from(document.querySelectorAll(panelSelector));
    const candidateNodes = panels.length ? panels.flatMap((panel) => Array.from(panel.querySelectorAll(optionSelector))) : Array.from(document.querySelectorAll(optionSelector));
    const candidates = candidateNodes.filter((node) => node && isVisibleElement(node));
    if (!candidates.length) return null;

    const targetNorm = normalizeText(targetValue);
    if (!targetNorm) return null;

    let partial = null;
    for (const option of candidates) {
      const optionText = extractOptionText(option);
      if (!optionText) continue;
      const optionNorm = normalizeText(optionText);
      if (exact && optionNorm === targetNorm) return option;
      if (!exact && !partial && (optionNorm.includes(targetNorm) || targetNorm.includes(optionNorm))) {
        partial = option;
      }
    }

    return partial;
  }

  function findBestOverlayOption(targetValue) {
    return getByRoleOptionByName(targetValue, true) || getByRoleOptionByName(targetValue, false);
  }

  async function waitOverlayOption(targetValue, timeout = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const option = findBestOverlayOption(targetValue);
      if (option) return option;
      await sleep(120);
    }
    return null;
  }

  function isVisibleElement(node) {
    return !!(node && (node.offsetParent !== null || node.getClientRects?.().length));
  }

  function getInputAccessibleNames(input) {
    if (!input) return [];

    const names = [];
    const ariaLabel = String(input.getAttribute("aria-label") || "").trim();
    const placeholder = String(input.getAttribute("placeholder") || "").trim();
    const labels = input.labels ? Array.from(input.labels).map((label) => String(label.textContent || "").trim()) : [];

    if (ariaLabel) names.push(ariaLabel);
    if (placeholder) names.push(placeholder);
    for (const text of labels) {
      if (text) names.push(text);
    }

    return names;
  }

  async function resolveKnowledgeInput(placeholder, placeholderContains, comboboxName, comboboxNameContains) {
    const roleTargetExact = comboboxName || placeholder;
    const roleTargetPartial = comboboxNameContains || placeholderContains || roleTargetExact;

    const comboboxByName = getByRoleComboboxByName(roleTargetExact, true);
    if (comboboxByName) {
      return { input: comboboxByName, strategy: "combobox-name-exact" };
    }

    const comboboxByContains = getByRoleComboboxByName(roleTargetPartial, false);
    if (comboboxByContains) {
      return { input: comboboxByContains, strategy: "combobox-name-partial" };
    }

    try {
      const input = await waitForElement(`input[placeholder="${placeholder}"]`, 1800, { visible: true, interactive: true });
      return { input, strategy: "placeholder-exact" };
    } catch (error) {
      const contains = normalizeText(placeholderContains || placeholder);
      const inputs = Array.from(document.querySelectorAll("input[placeholder]"));
      const candidate = inputs.find((input) => normalizeText(input.getAttribute("placeholder")).includes(contains));
      if (candidate) return { input: candidate, strategy: "placeholder-partial" };
      throw error;
    }
  }

  async function selectTechnologiesFromOverlay(placeholder, rawValues, options = {}) {
    const maxItems = options.maxItems || 4;
    const warnings = Array.isArray(options.warnings) ? options.warnings : null;
    const stepName = options.stepName || "step3Skills";
    const fieldName = options.fieldName || "skills";
    const technologies = toUniqueTechnologyList(rawValues, maxItems);
    if (!technologies.length) return { selected: 0, missing: [] };

    const resolved = await resolveKnowledgeInput(
      placeholder,
      options.placeholderContains,
      options.comboboxName,
      options.comboboxNameContains
    );
    const input = resolved.input;
    if (warnings && (resolved.strategy === "placeholder-exact" || resolved.strategy === "placeholder-partial")) {
      warnings.push({
        step: stepName,
        field: fieldName,
        message: `Se uso fallback por placeholder (${resolved.strategy})`,
      });
    }
    const missing = [];
    let selected = 0;

    for (const tech of technologies) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.click();
      input.focus();
      await sleep(120);
      setNativeValue(input, tech);
      dispatchValueEvents(input);
      await sleep(120);

      const option = await waitOverlayOption(tech, 2500);
      if (!option) {
        missing.push(tech);
        if (warnings) warnings.push({ step: stepName, field: fieldName, message: `No aparece en overlay: ${tech}` });
        continue;
      }

      option.scrollIntoView({ behavior: "smooth", block: "nearest" });
      option.click();
      selected += 1;
      await sleep(220);
      if (selected >= maxItems) break;
    }

    if (!selected && missing.length === technologies.length) {
      throw new Error(`No se pudo seleccionar ninguna tecnologia en ${fieldName}`);
    }

    return { selected, missing };
  }

  async function tryFillField({ stepName, fieldName, warnings, action }) {
    try {
      await action();
      return true;
    } catch (error) {
      const message = error?.message || String(error);
      const warning = { step: stepName, field: fieldName, message };
      if (Array.isArray(warnings)) warnings.push(warning);
      console.warn(`[${stepName}] No se pudo llenar "${fieldName}": ${message}`);
      return false;
    }
  }

  AutoFillExt.content.actions = {
    setInputValueRobust,
    fillInputWithFallbacks,
    fillInputByPlaceholder,
    fillInputByPlaceholderNth,
    fillInputById,
    fillTextareaById,
    fillDateInputById,
    fillBcInputSelect,
    fillLevelAcademyDropdown,
    selectTechnologiesFromOverlay,
    tryFillField,
  };
})();
