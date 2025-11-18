// boot.js
(function initializeContentScript() {
  const scroller = window.ChatGPTVirtualScroller;
  const state = scroller.state;
  const log = scroller.log;
  const virtualizer = scroller.virtualizer;

  // ---- Storage: enabled + debug flags -----------------------------------

  function initializeStorageListeners() {
    chrome.storage.sync.get({ enabled: true, debug: false }, (data) => {
      state.enabled = data.enabled;
      state.debug = data.debug;
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync") return;
      if (changes.enabled) state.enabled = changes.enabled.newValue;
      if (changes.debug) state.debug = changes.debug.newValue;
    });
  }

  // ---- Popup stats API ---------------------------------------------------

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== "getStats") return;

    const statsSnapshot = virtualizer.getStatsSnapshot();

    sendResponse({
      totalMessages: statsSnapshot.totalMessages,
      renderedMessages: statsSnapshot.renderedMessages,
      memorySavedPercent: statsSnapshot.memorySavedPercent,
      enabled: state.enabled
    });
    return true;
  });

  // ---- Entry point -------------------------------------------------------

  function initialize() {
    log("Initializing ChatGPT Virtual Scroller");

    initializeStorageListeners();
    window.addEventListener("resize", virtualizer.handleResize);

    virtualizer.bootVirtualizer();
    virtualizer.startUrlWatcher();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
