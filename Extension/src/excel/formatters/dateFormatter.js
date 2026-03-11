(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Excel = (AutoFillExt.excel = AutoFillExt.excel || {});

  function parseMonthNameToNumber(monthName) {
    if (!monthName || typeof monthName !== "string") return null;
    const map = {
      enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
      julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
      january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
      july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
    };
    return map[monthName.trim().toLowerCase()] || null;
  }

  function getCurrentDateMMYYYY() {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  }

  function formatDateToDDMMYYYY(value) {
    if (!value) return null;
    let date = null;
    if (typeof value === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    } else if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      const trimmed = value.trim();
      const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) return `${String(Number(match[1])).padStart(2, "0")}/${String(Number(match[2])).padStart(2, "0")}/${match[3]}`;
      date = new Date(trimmed);
      if (Number.isNaN(date.getTime())) return null;
    } else {
      return null;
    }

    if (!date || Number.isNaN(date.getTime())) return null;
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  }

  function formatDateToMMYYYY(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && !value.trim()) return null;
    if (typeof value === "string") {
      const trimmed = value.trim();
      const my = trimmed.match(/^([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+(\d{4})$/i);
      if (my) {
        const month = parseMonthNameToNumber(my[1]);
        return month ? `${month}/${my[2]}` : null;
      }
      const mmY = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
      if (mmY && Number(mmY[1]) >= 1 && Number(mmY[1]) <= 12) return `${String(Number(mmY[1])).padStart(2, "0")}/${mmY[2]}`;
      const ddmmy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmy && Number(ddmmy[2]) >= 1 && Number(ddmmy[2]) <= 12) return `${String(Number(ddmmy[2])).padStart(2, "0")}/${ddmmy[3]}`;
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) return `${String(parsed.getMonth() + 1).padStart(2, "0")}/${parsed.getFullYear()}`;
      return null;
    }
    if (typeof value === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
      if (Number.isNaN(date.getTime())) return null;
      return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`;
    }
    return null;
  }

  function parsePeriodRange(periodValue) {
    if (!periodValue) return null;
    const parts = String(periodValue).trim().split(/\s*[–-]\s*/);
    if (parts.length < 2) {
      const single = formatDateToMMYYYY(String(periodValue));
      return single ? { periodo_inicio: single, periodo_fin: single } : null;
    }
    const inicio = formatDateToMMYYYY(parts[0]);
    if (!inicio) return null;
    const finLower = parts[1].toLowerCase();
    const currentKeywords = ["actualidad", "actual", "presente", "hoy", "now", "current", "present"];
    const fin = currentKeywords.some((key) => finLower.includes(key)) ? getCurrentDateMMYYYY() : formatDateToMMYYYY(parts[1]);
    if (!fin) return null;
    return { periodo_inicio: inicio, periodo_fin: fin };
  }

  Excel.dateFormatter = {
    parseMonthNameToNumber,
    getCurrentDateMMYYYY,
    formatDateToDDMMYYYY,
    formatDateToMMYYYY,
    parsePeriodRange,
  };
})();
