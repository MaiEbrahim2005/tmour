// js/product-details.js

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return Number.isFinite(id) ? id : null;
}

function formatPrice(n) {
  return `${n} ج.م`;
}

function renderDetails(product) {
  const container = document.getElementById("detailsContainer");
  if (!container) return;

  const variantsHtml = product.variants.map((v, idx) => `
    <label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid #eee; border-radius:12px; cursor:pointer; margin-bottom:10px;">
      <input type="radio" name="variant" value="${v.vid}" ${idx === 0 ? "checked" : ""} />
      <span style="font-weight:700;">${v.label}</span>
      <span style="margin-right:auto; font-weight:800;">${formatPrice(v.price)}</span>
    </label>
  `).join("");

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; align-items:start;">
      <div style="border-radius:18px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,.06);">
        <img src="${product.image}" alt="${product.name}" style="width:100%; height:auto; display:block;"
             onerror="this.src='https://images.unsplash.com/photo-1605311361334-6e3b3c5bbef8?auto=format&fit=crop&w=1000&q=80'">
      </div>

      <div>
        <h3 style="margin:0 0 10px; font-size:28px;">${product.name}</h3>
        <p style="margin:0 0 18px; opacity:.8;">اختار النوع/الكمية المناسبة واضيفها للسلة.</p>

        <div id="variantsBox">
          ${variantsHtml}
        </div>

        <button id="addBtn" class="submit-btn" style="width:100%; margin-top:14px;">
          <i class="fas fa-cart-plus"></i>
          <span>إضافة للسلة</span>
        </button>

        <p id="msg" style="margin-top:12px; font-weight:700;"></p>
      </div>
    </div>
  `;

  const addBtn = document.getElementById("addBtn");
  const msg = document.getElementById("msg");

  addBtn.addEventListener("click", () => {
    
    if (window.Auth?.isLoggedIn && window.Auth.isLoggedIn() !== true) {
      window.Auth.goToLogin?.("login");
      return;
    }

    const selected = document.querySelector('input[name="variant"]:checked');
    const vid = selected ? selected.value : product.variants[0].vid;

    window.Cart?.addToCart(product.id, vid, 1);

    msg.textContent = "✅ اتضاف للسلة!";
    setTimeout(() => (msg.textContent = ""), 1500);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getQueryId();
  const product = (window.PRODUCTS || []).find((p) => p.id === id);

  if (!product) {
    const c = document.getElementById("detailsContainer");
    if (c) c.innerHTML = `<p style="font-weight:800;">المنتج غير موجود 😅</p>`;
    return;
  }

  renderDetails(product);
});
