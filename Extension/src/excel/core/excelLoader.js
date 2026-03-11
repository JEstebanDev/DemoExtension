(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Excel = (AutoFillExt.excel = AutoFillExt.excel || {});

  async function loadWorkbookFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (typeof XLSX === "undefined") throw new Error("XLSX no disponible");
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          if (!workbook.SheetNames.length) throw new Error("Excel sin hojas");
          resolve({ workbook, worksheet: workbook.Sheets[workbook.SheetNames[0]] });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Error leyendo archivo Excel"));
      reader.readAsArrayBuffer(file);
    });
  }

  async function loadWorkbookFromPath(excelPath) {
    const url = chrome.runtime?.getURL ? chrome.runtime.getURL(excelPath) : excelPath;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error cargando Excel: ${response.status}`);
    const buffer = await response.arrayBuffer();
    if (typeof XLSX === "undefined") throw new Error("XLSX no disponible");
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    if (!workbook.SheetNames.length) throw new Error("Excel sin hojas");
    return { workbook, worksheet: workbook.Sheets[workbook.SheetNames[0]] };
  }

  Excel.loader = { loadWorkbookFromFile, loadWorkbookFromPath };
})();
