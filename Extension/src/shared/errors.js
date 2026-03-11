(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});

  class ValidationError extends Error {
    constructor(message, details = null) {
      super(message);
      this.name = "ValidationError";
      this.details = details;
    }
  }

  class DomActionError extends Error {
    constructor(message, details = null) {
      super(message);
      this.name = "DomActionError";
      this.details = details;
    }
  }

  AutoFillExt.errors = { ValidationError, DomActionError };
})();
