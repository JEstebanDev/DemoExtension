(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { normalizeText, normalizeRoleKey } = AutoFillExt.text;
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
      await sleep(10); // C-1: reducido de 20ms — el framework procesa cada evento rápido
    }
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function setInputValueRobust(input, value, maxAttempts = 2) {
    const normalizedValue = value == null ? "" : String(value);
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(30); // C-2: reducido de 80ms — scrollIntoView es casi síncrono
      input.click();
      input.focus();
      await sleep(50); // C-3: reducido de 80ms — Angular registra el foco rápido
      setNativeValue(input, "");
      dispatchValueEvents(input);
      setNativeValue(input, normalizedValue);
      dispatchValueEvents(input);
      input.dispatchEvent(new Event("blur", { bubbles: true }));
      await sleep(50); // C-4: reducido de 80ms — validación Angular post-blur
      const hasExpectedValue = String(input.value || "") === normalizedValue;
      const counterSynced = isLengthCounterSynced(input, normalizedValue);
      if (hasExpectedValue && counterSynced) return true;
      if (hasExpectedValue && !counterSynced) {
        input.focus();
        await typeByChunks(input, normalizedValue);
        input.dispatchEvent(new Event("blur", { bubbles: true }));
        await sleep(50); // C-5: reducido de 80ms
        if (String(input.value || "") === normalizedValue && isLengthCounterSynced(input, normalizedValue)) return true;
      }
    }
    return false;
  }

  async function resolveFieldByStrategies(fieldName, strategies, options = {}) {
    const retriesPerStrategy = options.retriesPerStrategy || 2;
    const timeoutPerStrategy = options.timeoutPerStrategy || 3000;

    for (const strategy of strategies) {
      try {
        const element = await retry(() => resolveInputByStrategy(strategy, timeoutPerStrategy), retriesPerStrategy, 100);
        return element;
      } catch (error) {
        console.warn(`Estrategia ${strategy.type} falló para ${fieldName}:`, error.message);
      }
    }

    throw new Error(`No se pudo resolver el campo "${fieldName}"`);
  }

  async function fillInputWithFallbacks(fieldName, value, strategies, options = {}) {
    const retriesPerStrategy = options.retriesPerStrategy || 2;
    const timeoutPerStrategy = options.timeoutPerStrategy || 3000;
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
    await sleep(30); // C-6: reducido de 80ms — scroll es casi síncrono
    input.click();
    input.focus();
    await sleep(50); // C-7: reducido de 80ms
    // Select all existing content before clearing so we don't append
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a", ctrlKey: true }));
    // C-8: ELIMINADO (30ms post-Ctrl+A) — dispatchEvent de KeyboardEvent es síncrono en el DOM
    setNativeValue(input, "");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, data: null, inputType: "deleteContentBackward" }));
    await sleep(20); // C-9: reducido de 40ms — limpiar el valor es instantáneo
    const text = normalizeMonthDate(value);
    for (const char of text) {
      setNativeValue(input, `${input.value || ""}${char}`);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: char, inputType: "insertText" }));
      await sleep(20); // C-10: reducido de 30ms — datepicker procesa rápido
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
    // dateChange is the Angular Material datepicker-specific event
    input.dispatchEvent(new CustomEvent("dateChange", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    await sleep(60); // C-11: reducido de 120ms — post-blur fecha
  }

  async function fillDateInputElement(input, value) {
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(30); // C-12: reducido de 80ms
    input.click();
    input.focus();
    await sleep(50); // C-13: reducido de 80ms
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a", ctrlKey: true }));
    // C-14: ELIMINADO (30ms post-Ctrl+A) — dispatchEvent de KeyboardEvent es síncrono en el DOM
    setNativeValue(input, "");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, data: null, inputType: "deleteContentBackward" }));
    await sleep(20); // C-15: reducido de 40ms
    const text = normalizeMonthDate(value);
    for (const char of text) {
      setNativeValue(input, `${input.value || ""}${char}`);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: char, inputType: "insertText" }));
      await sleep(20); // C-16: reducido de 30ms
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new CustomEvent("dateChange", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    await sleep(60); // C-17: reducido de 120ms
  }

  async function fillDateInputWithFallbacks(fieldName, value, strategies, options = {}) {
    const input = await resolveFieldByStrategies(fieldName, strategies, options);
    await fillDateInputElement(input, value);
  }

  async function fillTextareaById(id, value) {
    const textarea = await waitForElement(`textarea#${id}`, 5000);
    textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(30); // C-18: reducido de 80ms
    textarea.click();
    textarea.focus();
    await sleep(50); // C-19: reducido de 80ms
    await typeByChunks(textarea, value);
    textarea.dispatchEvent(new Event("blur", { bubbles: true }));
    await sleep(50); // C-20: reducido de 80ms
  }

  async function fillTextareaElement(textarea, value) {
    textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    await sleep(30); // C-21: reducido de 80ms
    textarea.click();
    textarea.focus();
    await sleep(50); // C-22: reducido de 80ms
    await typeByChunks(textarea, value);
    textarea.dispatchEvent(new Event("blur", { bubbles: true }));
    await sleep(50); // C-23: reducido de 80ms
  }

  async function fillTextareaWithFallbacks(fieldName, value, strategies, options = {}) {
    const textarea = await resolveFieldByStrategies(fieldName, strategies, options);
    await fillTextareaElement(textarea, value);
  }

  // Genera el texto de opción para profileCandidate según rol y número de nivel L (1-4)
  function buildProfileRoleOption(roleKey, nivel) {
    const n = nivel || "1";
    const ROLE_TEMPLATES = {
      frontend:          `DESARROLLOS FRONT-END NIVEL ${n} - $`,
      fullstack:         `DESARROLLOS FULL-STACK NIVEL ${n} - $`,
      backend:           `DESARROLLOS BACK-END NIVEL ${n} - $`,
      automatizador:     `AUTOMATIZACIÓN DE PRUEBAS NIVEL ${n} - $`,
      mobile:            `DESARROLLOS MOBILE NIVEL ${n} - $`,
      analista:          `ANÁLISIS DE SOLUCIONES TI NIVEL ${n} - $`,
      arquitectura:      `ARQUITECTAR SOLUCIONES NIVEL ${n} - $`,
      analista_performance: `ANÁLISIS DE PERFORMANCE NIVEL ${n} - $`,
      datastage:         `DESARROLLOS DATASTAGE NIVEL ${n} - $`,
      soa:               `DESARROLLOS SOA-API NIVEL ${n} - $`,
      bizagi:            `CONFIGURACIÓN ESPECIALIZADA - BIZAGI NIVEL ${n} - $`,
      controller_view:   `CONFIGURACION ESPECIALIZADA CONTROLLER VIEW NIVEL ${n} - $`,
      murex_tecnico:     `MUREX TECNICO NIVEL ${n} - $`,
      murex_config:      `CONFIGURACIÓN ESPECIALIZADA - MUREX NIVEL ${n} - $`,
      finacle:           `CONSULTOR FINACLE NIVEL ${n} - $`,
      finacle_infra:     `CONSULTOR INFRA FINACLE/DBA ORACLE NIVEL ${n} - $`,
      ingeniero_datos:   `INGENIERO DE DATOS NIVEL ${n} - $`,
      ciberseguridad:    `DISEÑO_CIBERSEGURIDAD NIVEL ${n} - $`,
      devops:            `INGENIERÍA DEVOPS_OFFSHORE SEMI-SENIOR - $0`,
    };
    return ROLE_TEMPLATES[roleKey] || "";
  }

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
    const text = normalizeSelectText(normalizeRoleKey(value) || value);
    if (!text) return "";
    if (text.includes("front")) return "frontend";
    if (text.includes("full")) return "fullstack";
    if (text.includes("back")) return "backend";
    if (text.includes("automat")) return "automatizador";
    if (text.includes("mobil") || text.includes("movil")) return "mobile";
    if (text.includes("devops")) return "devops";
    if (text.includes("performance")) return "analista_performance";
    if (text.includes("datastage")) return "datastage";
    if (text.includes("soa") || text.includes("api")) return "soa";
    if (text.includes("bizagi")) return "bizagi";
    if (text.includes("controller") && text.includes("view")) return "controller_view";
    if (text.includes("murex") && (text.includes("tecnico") || text.includes("técnico"))) return "murex_tecnico";
    if (text.includes("murex")) return "murex_config";
    if (text.includes("finacle") && (text.includes("infra") || text.includes("dba") || text.includes("oracle"))) return "finacle_infra";
    if (text.includes("finacle")) return "finacle";
    if (text.includes("ingeniero") && text.includes("dato")) return "ingeniero_datos";
    if (text.includes("ciber") || text.includes("cibersegur")) return "ciberseguridad";
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

  function getVisibleLevelAcademyItems(parent) {
    if (!parent) return [];
    return Array.from(parent.querySelectorAll(".bc-input-select-item")).filter((item) => isVisibleElement(item));
  }

  function buildLevelAcademySearchQueries(value) {
    const raw = String(value || "").trim();
    if (!raw) return [];

    const firstWord = raw.split(/\s+/).find(Boolean) || raw;
    const queries = [raw];

    for (const source of [firstWord, raw]) {
      const compact = String(source || "").replace(/\s+/g, "").trim();
      if (compact.length >= 5) queries.push(compact.slice(0, 5));
      if (compact.length >= 4) queries.push(compact.slice(0, 4));
      if (compact.length >= 3) queries.push(compact.slice(0, 3));
    }

    return Array.from(new Set(queries.filter(Boolean)));
  }

  function getLevelAcademyPrefixLength(left, right) {
    const leftText = String(left || "");
    const rightText = String(right || "");
    const limit = Math.min(leftText.length, rightText.length);
    let index = 0;

    while (index < limit && leftText[index] === rightText[index]) {
      index += 1;
    }

    return index;
  }

  function scoreLevelAcademyCandidate(optionText, targetValue, searchQuery = "") {
    const optionNormalized = normalizeSelectText(optionText);
    const targetNormalized = normalizeSelectText(targetValue);
    const searchNormalized = normalizeSelectText(searchQuery);
    const optionCompact = compactSelectText(optionText);
    const targetCompact = compactSelectText(targetValue);
    const searchCompact = compactSelectText(searchQuery);
    const targetTokens = tokenizeSelectText(targetValue);

    if (!optionNormalized) return 0;

    let score = 0;

    if (targetNormalized && optionNormalized === targetNormalized) score += 120;
    if (targetNormalized && (optionNormalized.includes(targetNormalized) || targetNormalized.includes(optionNormalized))) score += 80;
    if (targetCompact && (optionCompact === targetCompact || optionCompact.includes(targetCompact) || targetCompact.includes(optionCompact))) score += 60;
    if (searchNormalized && optionNormalized.startsWith(searchNormalized)) score += 35;
    if (searchNormalized && optionNormalized.includes(searchNormalized)) score += 20;
    if (searchCompact && optionCompact.startsWith(searchCompact)) score += 20;

    const matchedTokens = targetTokens.filter((token) => optionNormalized.includes(token));
    score += matchedTokens.length * 12;
    score += getLevelAcademyPrefixLength(optionCompact, targetCompact) * 3;

    return score;
  }

  function findLevelAcademyItem(items, targetValue, searchQuery = "") {
    const exactItem = findFirstRobustSelectItem(items, targetValue);
    if (exactItem) return exactItem;

    const candidates = Array.from(items)
      .map((item) => ({
        item,
        text: (item.querySelector(".bc-span-single")?.textContent || item.textContent || "").trim(),
      }))
      .filter((entry) => entry.text)
      .map((entry) => ({
        ...entry,
        score: scoreLevelAcademyCandidate(entry.text, targetValue, searchQuery),
      }))
      .sort((left, right) => right.score - left.score);

    if (!candidates.length) return null;
    if (candidates[0].score >= 30) return candidates[0].item;
    if (searchQuery && candidates.length === 1) return candidates[0].item;

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
      const preferredOption = containerId === "profileCandidate" && roleKey
        ? buildProfileRoleOption(roleKey, options.nivelL)
        : "";
      // Usar preferredOption para el input si existe, sino usar el valor original
      const inputValue = preferredOption || value;
      
      await setInputValueRobust(input, inputValue, 2);
      await sleep(100); // C-24: reducido de 160ms — dropdown filtra en ~80ms
      const items = container.querySelectorAll(".bc-input-select-item");
      
      const selectedItem = findFirstRobustSelectItem(items, inputValue, preferredOption);
      if (!selectedItem) {
        throw new Error(`No se encontró opción compatible en ${containerId} para "${inputValue}"`);
      }
      selectedItem.click();
      await sleep(120); // C-25: reducido de 200ms — colapso del dropdown
      return;
    }

    // Modo default: comportamiento original
    await setInputValueRobust(input, value, 2);
    await sleep(100); // C-27: reducido de 160ms
    const items = container.querySelectorAll(".bc-input-select-item");

    for (const item of items) {
      const text = (item.querySelector(".bc-span-single")?.textContent || "").trim();
      if (!text) continue;
      if (text.toUpperCase() === String(value).toUpperCase() || text.toUpperCase().includes(String(value).toUpperCase())) {
        item.click();
        await sleep(120); // C-28: reducido de 200ms
        break;
      }
    }
  }

  async function fillLevelAcademyDropdown(value) {
    let input = document.querySelector('input[aria-label*="Nivel Academico"], input[aria-label*="Nivel academico"]');
    if (!input) input = document.querySelector("#levelAcademy-input, #levelAcademy input[type='text']");
    if (!input) throw new Error("No se encontró dropdown nivel académico");

    const parent = input.closest(".bc-input-select");
    const queries = buildLevelAcademySearchQueries(value);

    for (const query of queries) {
      await setInputValueRobust(input, query, 2);
      await sleep(150); // C-29: reducido de 240ms — espera filtrado del dropdown academia

      const items = getVisibleLevelAcademyItems(parent);
      const selectedItem = findLevelAcademyItem(items, value, query);
      if (selectedItem) {
        selectedItem.click();
        await sleep(100); // C-30: reducido de 160ms — post-click opción
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

  async function waitOverlayOption(targetValue, timeout = 2600) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const option = findBestOverlayOption(targetValue);
      if (option) return option;
      await sleep(70); // C-31: reducido de 100ms — animación del panel mat-autocomplete
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
      await sleep(60); // C-32: reducido de 100ms — el input se activa rápido
      setNativeValue(input, tech);
      dispatchValueEvents(input);
      await sleep(80); // C-33: reducido de 100ms — espera overlay (crítico: no bajar más sin probar)

      const option = await waitOverlayOption(tech, 2200);
      if (!option) {
        missing.push(tech);
        if (warnings) warnings.push({ step: stepName, field: fieldName, message: `No aparece en overlay: ${tech}` });
        continue;
      }

      option.scrollIntoView({ behavior: "smooth", block: "nearest" });
      option.click();
      selected += 1;
      await sleep(120); // C-34: reducido de 180ms — cleanup del autocomplete post-selección
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
    fillTextareaWithFallbacks,
    fillDateInputById,
    fillDateInputWithFallbacks,
    fillBcInputSelect,
    fillLevelAcademyDropdown,
    selectTechnologiesFromOverlay,
    tryFillField,
  };
})();
