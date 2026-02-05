// js/toast.js
(function () {
  function ensureContainer() {
    let c = document.querySelector(".toast-container");
    if (!c) {
      c = document.createElement("div");
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    return c;
  }

  function toast(message, type = "info", title = "") {
    const container = ensureContainer();

    const t = document.createElement("div");
    t.className = `toast toast-${type}`;

    const icon = document.createElement("div");
    icon.className = "toast-icon";
    icon.innerHTML =
      type === "success" ? "✅" :
      type === "error" ? "⚠️" :
      "ℹ️";

    const body = document.createElement("div");
    body.className = "toast-body";

    const h = document.createElement("div");
    h.className = "toast-title";
    h.textContent =
      title ||
      (type === "success" ? "تمام ✅" : type === "error" ? "تنبيه" : "معلومة");

    const p = document.createElement("p");
    p.className = "toast-msg";
    p.textContent = message || "";

    const close = document.createElement("button");
    close.className = "toast-close";
    close.innerHTML = "&times;";
    close.addEventListener("click", () => t.remove());

    body.appendChild(h);
    body.appendChild(p);

    t.appendChild(icon);
    t.appendChild(body);
    t.appendChild(close);

    container.appendChild(t);

    requestAnimationFrame(() => t.classList.add("show"));

    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 220);
    }, 2800);
  }

  window.toast = toast;
})();
