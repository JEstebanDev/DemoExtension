(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Excel = (AutoFillExt.excel = AutoFillExt.excel || {});
  const allowed = () => Excel.allowedValues;

  function formatSeniorityLevel(value) {
    if (!value || typeof value !== "string") return null;
    const normalized = value.toUpperCase().trim();
    return allowed().SENIORITY_LEVELS.includes(normalized) ? normalized : null;
  }

  const ARRAY_FIELD_ALIASES = Object.freeze({
    rabbitmq: "rabbit mq",
    "rabbit-mq": "rabbit mq",
    "rabbit mq": "rabbit mq",
    "node.js": "node js",
    nodejs: "node js",
    "node js": "node js",
    junit: "junit",
    docker: "docker",
    webpack: "webpack",
    "web pack": "webpack",
    mockito: "mockito",
  });

  function normalizeCatalogValue(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[_\-./]/g, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactCatalogValue(value) {
    return normalizeCatalogValue(value).replace(/\s+/g, "");
  }

  function buildAllowedLookup(allowedList) {
    const lookup = new Map();
    for (const allowedValue of allowedList) {
      const normalized = normalizeCatalogValue(allowedValue);
      const compact = compactCatalogValue(allowedValue);
      if (normalized && !lookup.has(normalized)) lookup.set(normalized, allowedValue);
      if (compact && !lookup.has(compact)) lookup.set(compact, allowedValue);
    }
    return lookup;
  }

  function resolveAllowedItem(rawItem, lookup) {
    const normalized = normalizeCatalogValue(rawItem);
    if (!normalized) return "";
    const aliasNormalized = ARRAY_FIELD_ALIASES[normalized] || normalized;
    const compact = aliasNormalized.replace(/\s+/g, "");
    return lookup.get(aliasNormalized) || lookup.get(compact) || "";
  }

  function formatArrayField(value, allowedList, maxItems = null) {
    if (!value) return "";
    const lookup = buildAllowedLookup(Array.isArray(allowedList) ? allowedList : []);
    const source = Array.isArray(value) ? value : String(value).split(",");
    const items = [];
    const seen = new Set();

    for (const item of source) {
      const resolved = resolveAllowedItem(item, lookup);
      if (!resolved) continue;
      const key = normalizeCatalogValue(resolved);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(resolved);
      if (maxItems && maxItems > 0 && items.length >= maxItems) break;
    }

    return items.join(", ");
  }

  function splitFullName(fullName) {
    if (!fullName || typeof fullName !== "string") {
      return { nombre: null, primer_apellido: null, segundo_apellido: null };
    }
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { nombre: null, primer_apellido: null, segundo_apellido: null };
    if (parts.length === 1) return { nombre: parts[0], primer_apellido: null, segundo_apellido: null };
    if (parts.length === 2) return { nombre: parts[0], primer_apellido: parts[1], segundo_apellido: null };
    return {
      nombre: parts.slice(0, parts.length - 2).join(" "),
      primer_apellido: parts[parts.length - 2],
      segundo_apellido: parts[parts.length - 1],
    };
  }

  function categorizeProfession(profession) {
    if (!profession || typeof profession !== "string") return null;
    const value = profession.toLowerCase();
    if (value.includes("postdoc")) return "POSTDOCTORADO";
    if (value.includes("doctor") || /\bph\.?d\.?\b/i.test(value)) return "DOCTORADO";
    if (value.includes("magister") || value.includes("maestr") || /\bmsc\b/i.test(value)) return "MAESTRÍA";
    if (value.includes("especializ")) return "ESPECIALIZACIÓN";
    if (value.includes("ingenier") || value.includes("pregrado") || value.includes("licenci")) return "PREGRADO";
    if (value.includes("tecnolog")) return "TECNÓLOGO";
    if (value.includes("tecnico") || value.includes("técnico")) return "TÉCNICO";
    return null;
  }

  Excel.profileFormatter = {
    formatSeniorityLevel,
    formatArrayField,
    splitFullName,
    categorizeProfession,
  };
})();
