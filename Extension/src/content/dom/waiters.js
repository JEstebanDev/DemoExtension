(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { sleep } = AutoFillExt.time;

  function isElementVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }

  function isElementInteractable(element) {
    return !!element && !element.disabled && !element.readOnly;
  }

  async function waitForElement(selector, timeout = 4200, options = {}) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element && (!options.visible || isElementVisible(element)) && (!options.interactive || isElementInteractable(element))) {
        return element;
      }
      await sleep(50); // reducido de 80ms — SPAs modernas renderizan en <50ms
    }
    throw new Error(`Timeout esperando elemento: ${selector}`);
  }

  AutoFillExt.content = AutoFillExt.content || {};
  AutoFillExt.content.waiters = { isElementVisible, isElementInteractable, waitForElement };
})();
