(() => {
  const AutoFillExt = (globalThis.AutoFillExt = globalThis.AutoFillExt || {});
  const Popup = (AutoFillExt.popup = AutoFillExt.popup || {});

  const state = {
    status: "idle",
    excelData: null,
    error: null,
  };

  function setState(partial) {
    Object.assign(state, partial);
    return state;
  }

  Popup.state = { state, setState };
})();
