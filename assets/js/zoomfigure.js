;(function () {
  function init() {
    if (typeof mediumZoom !== "function") return;
    mediumZoom("img.zoomable", {
      margin: 24,
      background: "rgba(0, 0, 0, 0.9)",
      scrollOffset: 40,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
