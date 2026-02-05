// js/auth.js
(function () {
  const KEY = "isLoggedIn";
  const USER_KEY = "userEmail";
  const USERS_KEY = "users"; // array of {name,email,password}

  function isLoggedIn() {
    return localStorage.getItem(KEY) === "true";
  }

  function setLoggedIn(val, email = "") {
    localStorage.setItem(KEY, val ? "true" : "false");
    if (val && email) localStorage.setItem(USER_KEY, email);
    if (!val) localStorage.removeItem(USER_KEY);
  }

  function getUserEmail() {
    return localStorage.getItem(USER_KEY) || "";
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function normalizeEmail(email) {
    return (email || "").trim().toLowerCase();
  }

  function findUser(email) {
    const users = getUsers();
    const e = normalizeEmail(email);
    return users.find((u) => normalizeEmail(u.email) === e) || null;
  }

  function userExists(email) {
    return !!findUser(email);
  }

  function buildReturnUrl() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const hash = window.location.hash || "";
    return `${path}${hash}`;
  }

  function goToLogin(action = "login", returnUrl = null) {
    const ret = returnUrl || buildReturnUrl();
    const url = `login.html?action=${encodeURIComponent(action)}&return=${encodeURIComponent(ret)}`;
    window.location.href = url;
  }

  function requireAuth(e, action = "login") {
    if (isLoggedIn()) return true;
    if (e) e.preventDefault();
    goToLogin(action);
    return false;
  }

  function logout(returnUrl = "index.html#home") {
    setLoggedIn(false);
    window.location.replace(returnUrl);
  }

  // ✅ helper بدل alert
  function notify(msg, type = "info") {
    if (typeof window.toast === "function") {
      window.toast(msg, type);
    } else {
      // fallback لو toast.js مش متحمل
      alert(msg);
    }
  }

  // ✅ Register: لازم يكون مش موجود
  function registerUser({ name, email, password }) {
    const e = normalizeEmail(email);
    const p = password || "";

    if (!e || !p) return { ok: false, code: "MISSING", message: "املى البيانات كاملة" };

    if (userExists(e)) {
      return { ok: false, code: "EXISTS", message: "الحساب موجود بالفعل.. سجلى دخول" };
    }

    const users = getUsers();
    users.push({ name: (name || "").trim(), email: e, password: p });
    saveUsers(users);

    setLoggedIn(true, e);
    return { ok: true };
  }

  // ✅ Login: لازم يكون موجود
  function loginUser({ email, password }) {
    const e = normalizeEmail(email);
    const p = password || "";

    if (!e || !p) return { ok: false, code: "MISSING", message: "املى البيانات كاملة" };

    const u = findUser(e);
    if (!u) {
      return { ok: false, code: "NOT_FOUND", message: "الحساب مش موجود.. لازم تعمل إنشاء حساب" };
    }

    if (u.password !== p) {
      return { ok: false, code: "WRONG_PASSWORD", message: "كلمة السر غلط" };
    }

    setLoggedIn(true, e);
    return { ok: true };
  }

  // expose
  window.Auth = {
    isLoggedIn,
    setLoggedIn,
    getUserEmail,
    getUsers,
    userExists,
    registerUser,
    loginUser,
    goToLogin,
    requireAuth,
    logout,
  };

  // ====== Login/Register page wiring (works only if elements exist) ======
  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action") || "login";
    const ret = params.get("return") || "index.html";

    const loginTabBtn = document.getElementById("loginTabBtn");
    const registerTabBtn = document.getElementById("registerTabBtn");
    const loginPanel = document.getElementById("loginPanel");
    const registerPanel = document.getElementById("registerPanel");

    function showPanel(which) {
      if (!loginPanel || !registerPanel) return;
      const isLogin = which === "login";
      loginPanel.style.display = isLogin ? "block" : "none";
      registerPanel.style.display = isLogin ? "none" : "block";
    }

    // Tabs
    if (loginTabBtn && registerTabBtn) {
      loginTabBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showPanel("login");
      });
      registerTabBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showPanel("register");
      });
    }

    // open correct panel
    if (loginPanel && registerPanel) {
      showPanel(action === "register" ? "register" : "login");
    }

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    function redirectBack() {
      window.location.href = ret;
    }

    // ✅ Login logic: لو مش موجود -> لازم Register
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = loginForm.querySelector('input[name="email"]')?.value || "";
        const password = loginForm.querySelector('input[name="password"]')?.value || "";

        const res = loginUser({ email, password });

        if (!res.ok) {
          if (res.code === "NOT_FOUND") {
            notify("الحساب مش موجود.. لازم تعمل إنشاء حساب الأول ✅", "info");
            showPanel("register");
            const regEmail = registerForm?.querySelector('input[name="email"]');
            if (regEmail) regEmail.value = normalizeEmail(email);
            return;
          }
          notify(res.message || "فيه مشكلة", "error");
          return;
        }

        notify("تم تسجيل الدخول ✅", "success");
        setTimeout(redirectBack, 600);
      });
    }

    // ✅ Register logic: لو موجود -> لازم Login
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = registerForm.querySelector('input[name="name"]')?.value || "";
        const email = registerForm.querySelector('input[name="email"]')?.value || "";
        const password = registerForm.querySelector('input[name="password"]')?.value || "";

        const res = registerUser({ name, email, password });

        if (!res.ok) {
          if (res.code === "EXISTS") {
            notify("الحساب ده موجود بالفعل.. سجل دخول ✅", "info");
            showPanel("login");
            const logEmail = loginForm?.querySelector('input[name="email"]');
            if (logEmail) logEmail.value = normalizeEmail(email);
            return;
          }
          notify(res.message || "فيه مشكلة", "error");
          return;
        }

        notify("تم إنشاء الحساب ✅", "success");
        setTimeout(redirectBack, 600);
      });
    }

    // Logout (لو فيه زرار logoutBtn في صفحة تانية)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        logout(ret || "index.html");
      });
    }
  });
})();
