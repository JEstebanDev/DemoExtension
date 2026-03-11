(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Excel = (AutoFillExt.excel = AutoFillExt.excel || {});

  function formatExtractedData(data) {
    const out = { ...data };
    const { dateFormatter, profileFormatter, allowedValues } = Excel;

    if (out.nombre && out.primer_apellido && out.segundo_apellido && out.nombre === out.primer_apellido && out.nombre === out.segundo_apellido) {
      const split = profileFormatter.splitFullName(out.nombre);
      out.nombre = split.nombre;
      out.primer_apellido = split.primer_apellido;
      out.segundo_apellido = split.segundo_apellido;
    }

    if (out.profesion) out.profesion = profileFormatter.categorizeProfession(out.profesion) || out.profesion;
    if ("fecha_nacimiento" in out) out.fecha_nacimiento = dateFormatter.formatDateToDDMMYYYY(out.fecha_nacimiento);
    if ("nivel_seniority" in out) out.nivel_seniority = profileFormatter.formatSeniorityLevel(out.nivel_seniority);

    if (out.anos_experiencia) {
      const n = String(out.anos_experiencia).match(/\d+/);
      out.anos_experiencia = n ? n[0] : "";
    }

    if (Array.isArray(out.experiencia)) {
      out.experiencia = out.experiencia.map((exp) => {
        const clone = { ...exp };
        if (clone.periodo_inicio === clone.periodo_fin && typeof clone.periodo_inicio === "string" && /[–-]/.test(clone.periodo_inicio)) {
          const range = dateFormatter.parsePeriodRange(clone.periodo_inicio);
          if (range) return { ...clone, ...range };
        }
        clone.periodo_inicio = dateFormatter.formatDateToMMYYYY(clone.periodo_inicio);
        clone.periodo_fin = dateFormatter.parsePeriodRange(`x-${clone.periodo_fin}`)?.periodo_fin || dateFormatter.formatDateToMMYYYY(clone.periodo_fin);
        return clone;
      });
    }

    out.lenguajes_programacion = profileFormatter.formatArrayField(out.lenguajes_programacion, allowedValues.LANGUAGES, 4);
    out.bases_datos = profileFormatter.formatArrayField(out.bases_datos, allowedValues.DATABASES);
    out.aplicaciones = profileFormatter.formatArrayField(out.aplicaciones, allowedValues.APPLICATIONS);
    out.frameworks = profileFormatter.formatArrayField(out.frameworks, allowedValues.FRAMEWORKS);
    out.plataformas = profileFormatter.formatArrayField(out.plataformas, allowedValues.PLATFORMS);
    out.herramientas = profileFormatter.formatArrayField(out.herramientas, allowedValues.TOOLS);
    out.otros = profileFormatter.formatArrayField(out.otros, allowedValues.OTHERS);

    if (Array.isArray(out.cursos_certificaciones)) {
      out.cursos_certificaciones = out.cursos_certificaciones.map((curso) => ({
        ...curso,
        fecha_obtencion: dateFormatter.formatDateToMMYYYY(curso.fecha_obtencion),
      }));
    }

    return out;
  }

  async function readFromFile(file, mappingPath) {
    const { worksheet } = await Excel.loader.loadWorkbookFromFile(file);
    const mapping = await Excel.mapping.loadMapping(mappingPath);
    const extracted = Excel.mapping.processMapping(worksheet, mapping);
    const formatted = formatExtractedData(extracted);
    Excel.validators.validateRequiredFields(formatted);
    return formatted;
  }

  async function readFromPath(excelPath, mappingPath) {
    const { worksheet } = await Excel.loader.loadWorkbookFromPath(excelPath);
    const mapping = await Excel.mapping.loadMapping(mappingPath);
    const extracted = Excel.mapping.processMapping(worksheet, mapping);
    const formatted = formatExtractedData(extracted);
    Excel.validators.validateRequiredFields(formatted);
    return formatted;
  }

  Excel.api = { readFromFile, readFromPath, formatExtractedData };
})();
