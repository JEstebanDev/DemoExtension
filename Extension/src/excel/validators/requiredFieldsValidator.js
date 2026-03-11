(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Excel = (AutoFillExt.excel = AutoFillExt.excel || {});

  function validateRequiredFields(data) {
    const required = [
      { field: "nombre", label: "Nombre" },
      { field: "departamento", label: "Departamento" },
      { field: "ciudad", label: "Ciudad" },
      { field: "cedula", label: "Cédula" },
      { field: "email", label: "Email" },
      { field: "seniority_nivel", label: "Nivel de Seniority (seniority_nivel)" },
      { field: "nivel_seniority", label: "Nivel Seniority (Junior / Semi-Senior / Senior)" },
      { field: "anos_experiencia", label: "Años de Experiencia" },
    ];

    const missing = required
      .filter(({ field }) => {
        const value = data[field];
        return value === null || value === undefined || String(value).trim() === "";
      })
      .map(({ label }) => label);

    if (missing.length) {
      throw new Error(`Por favor rellene los campos obligatorios en el Excel:\n${missing.map((x) => `• ${x}`).join("\n")}`);
    }
  }

  Excel.validators = { validateRequiredFields };
})();
