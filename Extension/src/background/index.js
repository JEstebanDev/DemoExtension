(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { ACTIONS, ok } = AutoFillExt.messages || {
    ACTIONS: { HEALTH_CHECK: "HEALTH_CHECK" },
    ok: (data) => ({ ok: true, data, error: null }),
  };

  chrome.runtime.onInstalled.addListener(() => {
    console.log("[background] Extensión instalada");
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.action === ACTIONS.HEALTH_CHECK) {
      sendResponse(ok({ serviceWorker: "alive", ts: Date.now() }));
    }
  });
})();
