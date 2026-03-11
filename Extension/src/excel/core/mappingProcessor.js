(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Excel = (AutoFillExt.excel = AutoFillExt.excel || {});

  function getCellValue(worksheet, cellRef) {
    if (!worksheet || !cellRef) return null;
    const cell = worksheet[cellRef];
    return cell && cell.v !== undefined ? cell.v : null;
  }

  function processMapping(worksheet, value) {
    if (typeof value === "string") return getCellValue(worksheet, value);
    if (Array.isArray(value)) return value.map((item) => processMapping(worksheet, item));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, processMapping(worksheet, item)]));
    }
    return value;
  }

  async function loadMapping(mappingPath) {
    const url = chrome.runtime?.getURL ? chrome.runtime.getURL(mappingPath) : mappingPath;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error cargando mapeo: ${response.status}`);
    return response.json();
  }

  Excel.mapping = { getCellValue, processMapping, loadMapping };
})();
