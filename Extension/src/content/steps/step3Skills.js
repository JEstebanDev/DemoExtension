(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { normalizeText, normalizeRoleKey } = AutoFillExt.text;
  const { selectTechnologiesFromOverlay, tryFillField } = AutoFillExt.content.actions;

  const MAX_ITEMS_PER_CATEGORY = 4;
  const catalogIndexCache = new WeakMap();

  const ROLE_TECH_CATALOG = Object.freeze({
    frontend: Object.freeze({
      lenguaje: Object.freeze([
        "C# (.NET Framework)",
        "Fundamentos CSS",
        "JavaScript",
        "REACT",
        "TYPESCRIPT",
        "Fundamentos HTML",
      ]),
      framework: Object.freeze(["Angular", "Next.js (SSR)", "Redux", "Universal (SSR)"]),
      otros: Object.freeze([
        "Caching",
        "LocalStorage",
        "DDD",
        "DOM y Browser Engine",
        "Event-driven Architecture (EDA)",
        "Flex",
        "PWA",
        "Service Worker",
      ]),
      herramienta: Object.freeze(["Jscrambler", "NPM", "WebPack"]),
      plataforma: Object.freeze(["DOCKER", "Kubernetes"]),
      aplicacion: Object.freeze([]),
      baseDeDatos: Object.freeze([]),
    }),
    automatizador: Object.freeze({
      lenguaje: Object.freeze(["Conceptos generales Programacion reactiva", "Java", "Python", "SQL", "XPATH"]),
      framework: Object.freeze(["Playwright", "BDD Framework", "Data Driven Framework", "Karate Framework", "Winium"]),
      otros: Object.freeze([
        "Arquitectura de microservicios",
        "Murex AWS Essentials",
        "BDD (Gherkin / Serenity)",
        "DevOps CI",
        "DevOps CT",
        "Patron de diseno ScreenPlay",
        "Pruebas Unitarias",
        "REST",
        "SOLID",
        "WinAppDriver",
      ]),
      herramienta: Object.freeze([
        "Analisis Estatico (SonarQube)",
        "Appium",
        "Azure DevOps",
        "Git",
        "GraphQL",
        "Postman",
        "Selenium",
        "SoapUI",
      ]),
      plataforma: Object.freeze(["AWS RDS", "Kobiton"]),
      aplicacion: Object.freeze(["Micro Focus Extra! X-treme (MyExtra)"]),
      baseDeDatos: Object.freeze(["DynamoDB", "DB2", "MongoDB", "MYSQL", "ORACLE", "PostgreSQL", "SQL Server"]),
    }),
    backend: Object.freeze({
      lenguaje: Object.freeze(["C# (.NET Framework)", "CL", "COBOL", "Dart", "Elixir", "Java", "Python", "RPG/ILE"]),
      framework: Object.freeze([
        "ASP MVC",
        "Express",
        "Flask",
        "NPA/NHibernate",
        "Pandas",
        "Scikit-learn",
        "Spring Boot",
        "Spring Cloud",
        "Spring Web",
        "Django",
      ]),
      otros: Object.freeze([
        "AMQP",
        "Apache Camel",
        "Azure Active Directory",
        "BDD (Gherkin / Serenity)",
        "Event-driven Architecture (EDA)",
        "Jmeter",
        "JMS",
        "OAuth 2.0",
        "OpenAPI",
        "OpenID",
        "OWASP",
        "SOLID",
        "Sterling",
      ]),
      herramienta: Object.freeze([
        "Analisis Estatico (SonarQube)",
        "Appium",
        "Git",
        "Gradle",
        "GraphQL",
        "JUNIT",
        "NPM",
        "Postman",
        "RabbitMQ",
        "Selenium",
        "UrbanCode",
        "WebSocket",
        "GoAnywhere",
      ]),
      plataforma: Object.freeze([
        "Apache Kafka",
        "Apache Tomcat",
        "DOCKER",
        "IIS",
        "Kubernetes",
        "Mockito",
        "Node.js",
        "PowerMock",
        "SPARK",
        "WAS",
        "WMQ",
      ]),
      aplicacion: Object.freeze(["Artifactory", "SWIFT"]),
      baseDeDatos: Object.freeze(["DynamoDB", "DB2", "IBM Cloudant", "MongoDB", "MYSQL", "ORACLE", "PostgreSQL", "REDIS", "SQL Server"]),
    }),
    fullstack: Object.freeze({
      lenguaje: Object.freeze([]),
      framework: Object.freeze([
        "Angular",
        "ASP MVC",
        "Express",
        "Flask",
        "Next.js (SSR)",
        "NPA/NHibernate",
        "Pandas",
        "QUARKUS",
        "Redux",
        "Scikit-learn",
        "Spring Boot",
        "Spring Cloud",
        "Spring Web",
        "Spring Framework",
        "Universal (SSR)",
        "Django",
      ]),
      otros: Object.freeze([]),
      herramienta: Object.freeze([]),
      plataforma: Object.freeze([
        "Apache Kafka",
        "Apache Tomcat",
        "DOCKER",
        "IIS",
        "Kubernetes",
        "Mockito",
        "Node.js",
        "PowerMock",
        "SPARK",
        "WAS",
        "WMQ",
      ]),
      aplicacion: Object.freeze(["Artifactory"]),
      baseDeDatos: Object.freeze(["DynamoDB", "DB2", "IBM Cloudant", "MongoDB", "MYSQL", "ORACLE", "PostgreSQL", "REDIS", "SQL Server"]),
    }),
    mobile: Object.freeze({
      lenguaje: Object.freeze(["C# (.NET Framework)", "Dart", "Java", "JavaScript", "Kotlin", "Objective C"]),
      framework: Object.freeze(["No SQL", "Flutter"]),
      otros: Object.freeze([
        "BDD (Gherkin / Serenity)",
        "Despliegue en Tiendas",
        "Device Farm",
        "Jmeter",
        "Material Design",
        "Mobile First Design",
        "OpenAPI",
        "Push Notification",
        "PWA",
        "Responsive Design",
        "Service Worker",
        "Xamarin",
      ]),
      herramienta: Object.freeze([
        "Analisis Estatico (SonarQube)",
        "Android Studio",
        "Appium",
        "ESLint",
        "Git",
        "GraphQL",
        "JSHint",
        "JUNIT",
        "Postman",
        "Prettier",
        "Selenium",
        "UrbanCode",
        "WebSocket",
      ]),
      plataforma: Object.freeze(["Mockito", "PowerMock"]),
      aplicacion: Object.freeze(["Artifactory", "SWIFT"]),
      baseDeDatos: Object.freeze(["Couchbase Mobile", "LevelDB", "SQL Server", "SQLite"]),
    }),
    devops: Object.freeze({
      lenguaje: Object.freeze(["C# (.NET Framework)", "CL", "COBOL", "Dart", "Elixir", "Python", "RPG/ILE", "Swift (Lenguaje)", "Java"]),
      framework: Object.freeze([
        "ASP MVC",
        "Express",
        "Flask",
        "NPA/NHibernate",
        "Pandas",
        "Scikit-learn",
        "Spring Boot",
        "Spring Cloud",
        "Spring Web",
        "SLIs / SLOs / Blameless Postmortems / Error Budgets / SRE",
        "Chaos Engineering / Reducing Toil / SRE",
      ]),
      otros: Object.freeze([
        "AMQP",
        "Apache Camel",
        "Azure Active Directory",
        "BDD (Gherkin / Serenity)",
        "Event-driven Architecture (EDA)",
        "Jmeter",
        "JMS",
        "OAuth 2.0",
        "OpenAPI",
        "OpenID",
        "OWASP",
        "SOLID",
        "Sterling",
      ]),
      herramienta: Object.freeze([
        "Analisis Estatico (SonarQube)",
        "Appium",
        "Git",
        "Gradle",
        "GraphQL",
        "JUNIT",
        "NPM",
        "Postman",
        "RabbitMQ",
        "Selenium",
        "UrbanCode",
        "WebSocket",
        "Azure DevOps",
        "Grafana",
        "Thanos",
      ]),
      plataforma: Object.freeze([
        "Apache Kafka",
        "Apache Tomcat",
        "DOCKER",
        "IIS",
        "Kubernetes",
        "Mockito",
        "Node.js",
        "PowerMock",
        "SPARK",
        "WAS",
        "WMQ",
        "Prometheus",
      ]),
      aplicacion: Object.freeze(["Artifactory", "DYNATRACE"]),
      baseDeDatos: Object.freeze(["DB2", "IBM Cloudant", "MongoDB", "MYSQL", "ORACLE", "PostgreSQL", "REDIS", "SQL Server", "DynamoDB"]),
    }),
    arquitectura: Object.freeze({
      lenguaje: Object.freeze([
        "Java",
        "C# (.NET Framework)",
        "RPG/ILE",
        "CL",
        "COBOL",
        "Python",
        "JavaScript",
        "REACT",
        "TYPESCRIPT",
        "Fundamentos CSS",
      ]),
      framework: Object.freeze([
        "Angular",
        "Spring Boot",
        "Spring Cloud",
        "Spring Web",
        "NPA/NHibernate",
        "ASP MVC",
        "Express",
        "Flask",
        "Pandas",
        "Scikit-learn",
        "Redux",
        "Universal (SSR)",
      ]),
      otros: Object.freeze([
        "Certificacion en AWS Solutions Architect - Associate",
        "Especializacion o Maestria en: Tecnologias de Informacion, Desarrollo y Arquitectura de Software",
        "DESIGN THINKING",
        "Patrones de diseno",
        "DDD",
        "DevOps",
        "Analitica",
        "Blockchain",
        "OAuth 2.0",
        "Microservicios",
        "SOA",
        "Clean Architecture",
        "Arquitectura Reactiva - Tacticas Arquitectura",
        "DISENO ORIENTADO A OBJETOS",
        "Inteligencia de negocios (Business Intelligence - BI)",
        "INTEGRACION API",
        "ARQUITECTURA CLOUD",
        "ARQUITECTURA DE SOFTWARE",
      ]),
      herramienta: Object.freeze([]),
      plataforma: Object.freeze(["Node.js", "Apache Kafka"]),
      aplicacion: Object.freeze([]),
      baseDeDatos: Object.freeze(["SQL Server", "ORACLE", "MYSQL", "DB2", "PostgreSQL", "IBM Cloudant", "REDIS", "MongoDB", "DynamoDB"]),
    }),
    analista: Object.freeze({
      lenguaje: Object.freeze(["Fundamentos HTML", "Java", "JavaScript", "SQL", "Python"]),
      framework: Object.freeze([]),
      otros: Object.freeze([
        "API GATEWAY",
        "REST",
        "Acceso Remoto",
        "Analisis de datos",
        "API",
        "Certificados digitales",
        "Direccionamiento/subneting/vlan/mac",
        "EXCEL",
        "Fundamentos basicos financieros",
        "Lectura de logs",
        "Metodologias agiles",
        "Protocolos de comunicacion segura (SSL/TLS/FTP/HTTPS)",
        "Automatizacion",
      ]),
      herramienta: Object.freeze(["POWER AUTOMATE"]),
      plataforma: Object.freeze(["Bizagi Process Modeler", "AWS Essentials", "ISERIES", "RPA"]),
      aplicacion: Object.freeze(["DataPower", "Power Apps"]),
      baseDeDatos: Object.freeze(["SQL Server"]),
    }),
  });

  const FIELD_CONFIG = Object.freeze([
    {
      dataKey: "lenguajes_programacion",
      catalogKey: "lenguaje",
      comboboxName: "Lenguajes de programación (",
      comboboxNameContains: "lenguajes de program",
      placeholder: "Lenguajes de programación (",
      placeholderContains: "lenguajes de program",
    },
    {
      dataKey: "bases_datos",
      catalogKey: "baseDeDatos",
      comboboxName: "Bases de datos (Escriba 4)",
      comboboxNameContains: "bases de datos",
      placeholder: "Bases de datos (Escriba 4)",
      placeholderContains: "bases de datos",
    },
    {
      dataKey: "aplicaciones",
      catalogKey: "aplicacion",
      comboboxName: "Aplicaciones (Escriba 4)",
      comboboxNameContains: "aplicaciones",
      placeholder: "Aplicaciones (Escriba 4)",
      placeholderContains: "aplicaciones",
    },
    {
      dataKey: "frameworks",
      catalogKey: "framework",
      comboboxName: "Frameworks (Escriba 4)",
      comboboxNameContains: "framework",
      placeholder: "Frameworks (Escriba 4)",
      placeholderContains: "framework",
    },
    {
      dataKey: "plataformas",
      catalogKey: "plataforma",
      comboboxName: "Plataformas (Escriba 4)",
      comboboxNameContains: "plataformas",
      placeholder: "Plataformas (Escriba 4)",
      placeholderContains: "plataformas",
    },
    {
      dataKey: "herramientas",
      catalogKey: "herramienta",
      comboboxName: "Herramientas (Escriba 4)",
      comboboxNameContains: "herramientas",
      placeholder: "Herramientas (Escriba 4)",
      placeholderContains: "herramientas",
    },
    {
      dataKey: "otros",
      catalogKey: "otros",
      comboboxName: "Otros (Escriba 4)",
      comboboxNameContains: "otros",
      placeholder: "Otros (Escriba 4)",
      placeholderContains: "otros",
    },
  ]);

  function normalizeForMatch(value) {
    return String(normalizeText(value || "") || "")
      .replace(/[_-]/g, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactForMatch(value) {
    return normalizeForMatch(value).replace(/\s+/g, "");
  }

  function tokenizeForMatch(value) {
    return normalizeForMatch(value)
      .split(" ")
      .map((token) => token.trim())
      .filter(Boolean);
  }

  function prepareMatchValue(value) {
    const normalized = normalizeForMatch(value);
    return {
      normalized,
      compact: normalized.replace(/\s+/g, ""),
      tokens: normalized ? normalized.split(" ").filter(Boolean) : [],
    };
  }

  function buildCatalogIndex(catalogValues) {
    const entries = [];
    const exactMap = new Map();
    const compactMap = new Map();
    const tokenMap = new Map();

    for (const candidate of catalogValues) {
      const prepared = prepareMatchValue(candidate);
      if (!prepared.normalized) continue;

      const entry = {
        value: candidate,
        normalized: prepared.normalized,
        compact: prepared.compact,
        tokens: prepared.tokens,
      };

      entries.push(entry);
      if (!exactMap.has(entry.normalized)) exactMap.set(entry.normalized, entry);
      if (entry.compact && !compactMap.has(entry.compact)) compactMap.set(entry.compact, entry);

      for (const token of entry.tokens) {
        if (!tokenMap.has(token)) tokenMap.set(token, []);
        tokenMap.get(token).push(entry);
      }
    }

    return { entries, exactMap, compactMap, tokenMap };
  }

  function getCatalogIndex(catalogValues) {
    if (!Array.isArray(catalogValues) || !catalogValues.length) {
      return { entries: [], exactMap: new Map(), compactMap: new Map(), tokenMap: new Map() };
    }

    const cached = catalogIndexCache.get(catalogValues);
    if (cached) return cached;

    const created = buildCatalogIndex(catalogValues);
    catalogIndexCache.set(catalogValues, created);
    return created;
  }

  function parseTechnologies(value, maxItems = 0) {
    const source = Array.isArray(value) ? value : String(value || "").split(",");
    const out = [];
    const seen = new Set();
    for (const item of source) {
      const cleaned = String(item || "").trim();
      if (!cleaned) continue;
      const key = normalizeForMatch(cleaned);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(cleaned);
      if (maxItems && out.length >= maxItems) break;
    }
    return out;
  }

  function resolveRoleKey(rawRole) {
    const role = normalizeRoleKey(rawRole) || normalizeForMatch(rawRole);
    if (!role) return "";
    if (role.includes("automat")) return "automatizador";
    if (role.includes("full")) return "fullstack";
    if (role.includes("front")) return "frontend";
    if (role.includes("back")) return "backend";
    if (role.includes("mobile") || role.includes("movil")) return "mobile";
    if (role.includes("devops")) return "devops";
    if (role.includes("arquitect")) return "arquitectura";
    if (role.includes("analis")) return "analista";
    return Object.prototype.hasOwnProperty.call(ROLE_TECH_CATALOG, role) ? role : "";
  }

  function scoreCatalogCandidate(rawPrepared, catalogEntry) {
    const rawNorm = rawPrepared.normalized;
    const catNorm = catalogEntry.normalized;
    if (!rawNorm || !catNorm) return 0;

    if (rawNorm === catNorm) return 100;

    const rawCompact = rawPrepared.compact;
    const catCompact = catalogEntry.compact;
    if (rawCompact && catCompact && rawCompact === catCompact) return 96;

    let score = 0;
    if (catNorm.includes(rawNorm) || rawNorm.includes(catNorm)) {
      score += 82;
    } else if (rawCompact && catCompact && (catCompact.includes(rawCompact) || rawCompact.includes(catCompact))) {
      score += 76;
    }

    const rawTokens = rawPrepared.tokens;
    const catTokens = catalogEntry.tokens;
    if (rawTokens.length && catTokens.length) {
      const catTokenSet = new Set(catTokens);
      const matchedTokens = rawTokens.filter((token) => catTokenSet.has(token)).length;
      const coverage = matchedTokens / rawTokens.length;
      const density = matchedTokens / catTokens.length;
      score += Math.round(coverage * 14) + Math.round(density * 8);
    }

    return score;
  }

  function findDirectCatalogMatch(index, rawPrepared, selectedNorms) {
    const exact = index.exactMap.get(rawPrepared.normalized);
    if (exact && !selectedNorms.has(exact.normalized)) return { entry: exact, score: 100 };

    const compact = index.compactMap.get(rawPrepared.compact);
    if (compact && !selectedNorms.has(compact.normalized)) return { entry: compact, score: 96 };

    return null;
  }

  function collectCatalogCandidates(index, rawPrepared, selectedNorms) {
    const candidates = new Map();

    for (const entry of index.entries) {
      if (selectedNorms.has(entry.normalized)) continue;
      if (entry.normalized.includes(rawPrepared.normalized) || rawPrepared.normalized.includes(entry.normalized)) {
        candidates.set(entry.normalized, entry);
      }
    }

    if (!candidates.size && rawPrepared.compact) {
      for (const entry of index.entries) {
        if (selectedNorms.has(entry.normalized) || !entry.compact) continue;
        if (entry.compact.includes(rawPrepared.compact) || rawPrepared.compact.includes(entry.compact)) {
          candidates.set(entry.normalized, entry);
        }
      }
    }

    if (!candidates.size && rawPrepared.tokens.length) {
      for (const token of rawPrepared.tokens) {
        const tokenEntries = index.tokenMap.get(token);
        if (!tokenEntries) continue;
        for (const entry of tokenEntries) {
          if (selectedNorms.has(entry.normalized)) continue;
          candidates.set(entry.normalized, entry);
        }
      }
    }

    if (candidates.size) return Array.from(candidates.values());
    return index.entries.filter((entry) => !selectedNorms.has(entry.normalized));
  }

  function mapRawToCatalogValues(rawValues, catalogValues, warnings, fieldName) {
    const values = parseTechnologies(rawValues);
    if (!values.length || !Array.isArray(catalogValues) || !catalogValues.length) return [];

    const index = getCatalogIndex(catalogValues);
    const selected = [];
    const selectedNorms = new Set();

    for (const input of values) {
      const rawPrepared = prepareMatchValue(input);
      if (!rawPrepared.normalized) continue;

      const directMatch = findDirectCatalogMatch(index, rawPrepared, selectedNorms);
      let bestEntry = directMatch?.entry || null;
      let bestScore = directMatch?.score || 0;

      if (!bestEntry) {
        const candidates = collectCatalogCandidates(index, rawPrepared, selectedNorms);
        for (const candidate of candidates) {
          const score = scoreCatalogCandidate(rawPrepared, candidate);
          if (score > bestScore) {
            bestScore = score;
            bestEntry = candidate;
          }
        }
      }

      if (!bestEntry || bestScore < 70) {
        if (Array.isArray(warnings)) {
          warnings.push({
            step: "step3Skills",
            field: fieldName,
            message: `No hay match de catalogo para "${input}"`,
          });
        }
        continue;
      }

      if (selectedNorms.has(bestEntry.normalized)) continue;
      selectedNorms.add(bestEntry.normalized);
      selected.push(bestEntry.value);
      if (selected.length >= MAX_ITEMS_PER_CATEGORY) break;
    }

    return selected;
  }

  async function fillStep3Skills(data, warnings = []) {
    const roleKey = resolveRoleKey(data.rol);
    if (!roleKey) {
      if (Array.isArray(warnings)) {
        warnings.push({
          step: "step3Skills",
          field: "rol",
          message: `Rol no soportado para Step 3: ${String(data.rol || "")}`,
        });
      }
      return warnings;
    }

    const roleCatalog = ROLE_TECH_CATALOG[roleKey] || {};

    for (const field of FIELD_CONFIG) {
      const catalogValues = roleCatalog[field.catalogKey] || [];
      const canonicalValues = mapRawToCatalogValues(data[field.dataKey], catalogValues, warnings, field.dataKey);
      if (!canonicalValues.length) continue;

      await tryFillField({
        stepName: "step3Skills",
        fieldName: field.dataKey,
        warnings,
        action: () =>
          selectTechnologiesFromOverlay(field.placeholder, canonicalValues, {
            maxItems: MAX_ITEMS_PER_CATEGORY,
            comboboxName: field.comboboxName,
            comboboxNameContains: field.comboboxNameContains,
            placeholderContains: field.placeholderContains,
            warnings,
            stepName: "step3Skills",
            fieldName: field.dataKey,
          }),
      });
    }

    return warnings;
  }

  AutoFillExt.content.steps = AutoFillExt.content.steps || {};
  AutoFillExt.content.steps.fillStep3Skills = fillStep3Skills;
})();
