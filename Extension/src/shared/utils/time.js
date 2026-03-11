(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function retry(fn, attempts = 2, delayMs = 100) {
    let lastError = null;
    for (let index = 0; index < attempts; index += 1) {
      try {
        return await fn(index + 1);
      } catch (error) {
        lastError = error;
        if (index < attempts - 1) {
          await sleep(delayMs * (index + 1));
        }
      }
    }
    throw lastError;
  }

  AutoFillExt.time = { sleep, retry };
})();
