(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("go-theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) root.setAttribute("data-theme", "dark");
  function label() {
    var dark = root.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".toggle").forEach(function (b) { b.textContent = dark ? "☀️ نهاري" : "🌙 ليلي"; });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".toggle");
    if (!b) return;
    var dark = root.getAttribute("data-theme") === "dark";
    root.setAttribute("data-theme", dark ? "light" : "dark");
    try { localStorage.setItem("go-theme", dark ? "light" : "dark"); } catch (err) {}
    label();
  });
  label();
})();
