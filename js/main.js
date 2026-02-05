// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutLink = document.getElementById("logoutLink");

  const cartLink = document.getElementById("cartLink");
  const cartCountEl = document.getElementById("cartCount");

  // ====== ✅ Hamburger wiring (works on all pages) ======
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  function openMenu() {
    if (!navMenu) return;
    navMenu.classList.add("active");
    if (hamburger) hamburger.classList.add("active");
  }

  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove("active");
    if (hamburger) hamburger.classList.remove("active");
  }

  function toggleMenu() {
    if (!navMenu) return;
    const isOpen = navMenu.classList.contains("active");
    isOpen ? closeMenu() : openMenu();
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // اقفل المينيو لما تدوسي على لينك
    navMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeMenu());
    });

    // اقفل لو ضغطتي بره
    document.addEventListener("click", (e) => {
      if (!navMenu.classList.contains("active")) return;
      const clickedInsideMenu = navMenu.contains(e.target);
      const clickedHamburger = hamburger.contains(e.target);
      if (!clickedInsideMenu && !clickedHamburger) closeMenu();
    });

    // اقفل على resize لو الشاشة كبرت
    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) closeMenu();
    });
  }
  // ====== end hamburger ======

  if (!window.Auth) {
    console.error("Auth is missing: تأكدي إن js/auth.js بيتحمل قبل main.js");
    return;
  }

  function getPageProductsLimit() {
    const v = document.body?.getAttribute("data-products-limit");
    if (!v || v === "all") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  function getCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    } catch {
      return 0;
    }
  }

  function updateCartUI() {
    const logged = window.Auth.isLoggedIn() === true;
    if (cartLink) cartLink.style.display = logged ? "" : "none";
    if (cartCountEl) cartCountEl.textContent = String(getCartCount());
  }

  function rerenderProductsIfAny() {
    const container = document.getElementById("productsContainer");
    if (!container) return;

    if (typeof window.loadProducts === "function") {
      const limit = getPageProductsLimit();
      window.loadProducts(limit);
    }
  }

  function updateAuthUI() {
    const logged = window.Auth.isLoggedIn() === true;

    if (loginLink) loginLink.style.display = logged ? "none" : "";
    if (registerLink) registerLink.style.display = logged ? "none" : "";
    if (logoutLink) logoutLink.style.display = logged ? "" : "none";

    rerenderProductsIfAny();
    updateCartUI();
  }

  updateAuthUI();

  document.querySelectorAll("[data-auth-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const action = btn.getAttribute("data-auth-action") || "login";
      window.Auth.goToLogin(action);
    });
  });

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.Auth.setLoggedIn(false);
      updateAuthUI();
      window.location.replace("index.html#home");
    });
  }

  window.addEventListener("cart:updated", updateCartUI);

  window.addEventListener("storage", (e) => {
    if (e.key === "cart") updateCartUI();
    if (e.key === "isLoggedIn") updateAuthUI();
  });
});
