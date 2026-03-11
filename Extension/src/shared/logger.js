(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});

  function buildLogger(scope) {
    const prefix = `[${scope}]`;
    return {
      info: (...args) => console.log(prefix, ...args),
      warn: (...args) => console.warn(prefix, ...args),
      error: (...args) => console.error(prefix, ...args),
      debug: (...args) => console.debug(prefix, ...args),
    };
  }

  AutoFillExt.logger = { buildLogger };
})();
