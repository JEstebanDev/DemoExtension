(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Popup = (AutoFillExt.popup = AutoFillExt.popup || {});

  async function readExcelFromFile(file, mappingPath = "config/mapping/example_data.json") {
    if (!file) throw new Error("No se seleccionó archivo");
    if (!file.name.match(/\.(xlsx|xls|xlsm)$/i)) throw new Error("Archivo inválido. Usa .xlsx, .xls o .xlsm");
    return AutoFillExt.excel.api.readFromFile(file, mappingPath);
  }

  Popup.excelService = { readExcelFromFile };
})();
