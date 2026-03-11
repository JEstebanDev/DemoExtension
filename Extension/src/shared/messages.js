(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});

  const ACTIONS = Object.freeze({
    PING_CONTENT: "PING_CONTENT",
    FILL_FORM_REQUEST: "FILL_FORM_REQUEST",
    FILL_FORM_RESULT: "FILL_FORM_RESULT",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    HEALTH_CHECK: "HEALTH_CHECK",
  });

  function ok(data) {
    return { ok: true, data: data ?? null, error: null };
  }

  function fail(message, details = null) {
    return {
      ok: false,
      data: null,
      error: { message: message || "Unknown error", details },
    };
  }

  AutoFillExt.messages = { ACTIONS, ok, fail };
})();
