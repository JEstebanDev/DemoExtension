(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const { ACTIONS, ok, fail } = AutoFillExt.messages;
  const logger = AutoFillExt.logger.buildLogger("content");
  const { fillFormSequentially } = AutoFillExt.content.flow;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.action === ACTIONS.PING_CONTENT) {
      sendResponse(ok({ ready: true }));
      return;
    }

    if (request?.action === ACTIONS.FILL_FORM_REQUEST) {
      fillFormSequentially(request.payload)
        .then((result) => {
          const warnings = Array.isArray(result?.warnings) ? result.warnings : [];
          sendResponse(
            ok({
              status: "completed",
              warningsCount: warnings.length,
              failedFields: warnings,
            })
          );
        })
        .catch((error) => {
          logger.error("Error llenando formulario", error);
          sendResponse(fail(error.message));
        });
      return true;
    }
  });

  logger.info("Content script modular cargado");
})();
