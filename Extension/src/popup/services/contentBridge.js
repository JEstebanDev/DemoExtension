(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Popup = (AutoFillExt.popup = AutoFillExt.popup || {});
  const { ACTIONS } = AutoFillExt.messages;

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No se encontró pestaña activa");
    return tab;
  }

  async function pingContent(tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action: ACTIONS.PING_CONTENT });
      return !!response?.ok;
    } catch {
      return false;
    }
  }

  async function ensureContentScriptLoaded(tabId) {
    const ready = await pingContent(tabId);
    if (ready) return;
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [
        "src/shared/messages.js",
        "src/shared/logger.js",
        "src/shared/utils/text.js",
        "src/shared/utils/time.js",
        "src/content/dom/waiters.js",
        "src/content/dom/selectors.js",
        "src/content/dom/actions.js",
        "src/content/steps/step1BasicInfo.js",
        "src/content/steps/step2Experience.js",
        "src/content/steps/step3Skills.js",
        "src/content/steps/step4Education.js",
        "src/content/orchestrator/navigation.js",
        "src/content/orchestrator/fillFormFlow.js",
        "src/content/index.js",
      ],
    });
  }

  async function sendFillForm(payload) {
    const tab = await getActiveTab();
    await ensureContentScriptLoaded(tab.id);
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tab.id,
        { action: ACTIONS.FILL_FORM_REQUEST, payload },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response);
        },
      );
    });
  }

  Popup.contentBridge = { getActiveTab, pingContent, ensureContentScriptLoaded, sendFillForm };
})();
