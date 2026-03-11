(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});

  function clickButtonByMatcher(matcher) {
    const buttons = document.querySelectorAll("button");
    for (const button of buttons) {
      if (matcher(button)) {
        button.click();
        return true;
      }
    }
    return false;
  }

  async function clickOpenFormButton() {
    const ok = clickButtonByMatcher((button) => {
      const text = (button.textContent || "").trim();
      const html = button.innerHTML || "";
      return text.includes("person_add") || html.includes("person_add");
    });
    if (!ok) console.warn("No se encontró botón person_add, continuando...");
  }

  async function clickNextButton() {
    clickButtonByMatcher((button) => (button.textContent || "").toLowerCase().includes("siguiente"));
  }

  async function clickBackButton() {
    clickButtonByMatcher((button) => {
      const text = (button.textContent || "").toLowerCase();
      return text.includes("atrás") || text.includes("atras");
    });
  }

  AutoFillExt.content = AutoFillExt.content || {};
  AutoFillExt.content.navigation = { clickOpenFormButton, clickNextButton, clickBackButton };
})();
