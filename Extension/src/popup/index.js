(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { buildLogger } = AutoFillExt.logger;
  const logger = buildLogger("popup");
  const { state, setState } = AutoFillExt.popup.state;
  const { readExcelFromFile } = AutoFillExt.popup.excelService;
  const { sendFillForm } = AutoFillExt.popup.contentBridge;

  function setupUi() {
    const fileInput = document.getElementById("excelFile");
    const selectFileBtn = document.getElementById("selectFileBtn");
    const fillFormBtn = document.getElementById("fillFormBtn");
    const errorMessage = document.getElementById("errorMessage");
    const errorDetails = document.getElementById("errorDetails");
    const successMessage = document.getElementById("successMessage");

    selectFileBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      fillFormBtn.classList.add("hidden");
      errorMessage.classList.add("hidden");
      try {
        setState({ status: "loading", error: null });
        const data = await readExcelFromFile(file);
        setState({ status: "ready", excelData: data });
        fillFormBtn.classList.remove("hidden");
      } catch (error) {
        setState({ status: "error", error });
        errorDetails.textContent = error.message;
        errorMessage.classList.remove("hidden");
      }
    });

    fillFormBtn.addEventListener("click", async () => {
      if (!state.excelData) return;
      try {
        const response = await sendFillForm(state.excelData);
        if (!response?.ok) throw new Error(response?.error?.message || "Error en content script");
        successMessage.classList.remove("hidden");
        setTimeout(() => successMessage.classList.add("hidden"), 5000);
      } catch (error) {
        logger.error(error.message);
        errorDetails.textContent = error.message;
        errorMessage.classList.remove("hidden");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupUi);
  } else {
    setupUi();
  }
})();
