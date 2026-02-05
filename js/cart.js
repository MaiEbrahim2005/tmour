// js/cart.js
(function () {
  // ✅ حطي هنا لينك Google Apps Script Web App
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxusxgHCynMReL06VToVDAIG9Vlhi9SHH6K9Lhi1JNDYFjBFe5P_NLWsSVOqDpEVc2f1A/exec";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart:updated"));
  }

  function findProductById(id) {
    const list = window.PRODUCTS || [];
    return list.find((p) => Number(p.id) === Number(id));
  }

  function findVariant(product, vid) {
    const vars = product?.variants || [];
    return vars.find((v) => String(v.vid) === String(vid));
  }

  function money(n) {
    const num = Number(n) || 0;
    return String(num);
  }

  function calcTotal(cart) {
    let total = 0;
    cart.forEach((item) => {
      const p = findProductById(item.id);
      if (!p) return;
      const v = findVariant(p, item.vid) || (p.variants ? p.variants[0] : null);
      const price = Number(v?.price) || 0;
      const qty = Number(item.qty) || 0;
      total += price * qty;
    });
    return total;
  }

  function renderCart() {
    // ✅ لازم يكون Logged in علشان يشوف السلة
    if (!window.Auth?.isLoggedIn?.()) {
      window.Auth?.goToLogin("login", "cart.html");
      return;
    }

    const container = document.getElementById("cartContainer");
    const totalEl = document.getElementById("cartTotal");
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="product-card" style="grid-column:1/-1; text-align:center; padding:2rem;">
          <h3 class="product-name">السلة فاضية 🧺</h3>
          <p class="product-description">ارجع للمنتجات واضيف اللي تحبه</p>
          <a href="index.html#products" class="view-all-btn" style="margin-top:1rem;">
            <span>روح للمنتجات</span>
            <i class="fas fa-arrow-left"></i>
          </a>
        </div>
      `;
      if (totalEl) totalEl.textContent = "0";
      return;
    }

    let total = 0;

    container.innerHTML = cart
      .map((item, idx) => {
        const p = findProductById(item.id);
        if (!p) return "";

        const v = findVariant(p, item.vid) || (p.variants ? p.variants[0] : null);
        const price = Number(v?.price) || 0;

        const qty = Number(item.qty) || 0;
        const lineTotal = price * qty;
        total += lineTotal;

        const variantLabel = v?.label ? v.label : "";

        return `
          <div class="product-card fade-in">
            <div class="product-image">
              <img src="${p.image}" alt="${p.name}"
                   onerror="this.src='https://images.unsplash.com/photo-1605311361334-6e3b3c5bbef8?auto=format&fit=crop&w=800&q=80'">
            </div>

            <div class="product-info">
              <h3 class="product-name">${p.name}</h3>

              ${
                variantLabel
                  ? `<p class="product-description" style="font-weight:800;">${variantLabel}</p>`
                  : `<p class="product-description"></p>`
              }

              <div class="product-price" style="align-items:center;">
                <div>
                  <span class="price-amount">${money(price)} ج.م</span>
                  <div style="color:#666; font-weight:700; margin-top:6px;">
                    الكمية: ${qty} — الإجمالي: ${money(lineTotal)} ج.م
                  </div>

                  <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                    <button class="add-to-cart" type="button" data-dec="${idx}" style="background:#f2f2f2; color:#333;">
                      <span>-</span>
                    </button>
                    <button class="add-to-cart" type="button" data-inc="${idx}" style="background:#f2f2f2; color:#333;">
                      <span>+</span>
                    </button>
                  </div>
                </div>

                <button class="add-to-cart" data-remove-idx="${idx}" type="button" style="background:#dc3545;">
                  <i class="fas fa-trash"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    if (totalEl) totalEl.textContent = String(total);

    // حذف سطر
    container.querySelectorAll("[data-remove-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-remove-idx"));
        const newCart = getCart();
        newCart.splice(idx, 1);
        setCart(newCart);
        renderCart();
      });
    });

    // زيادة
    container.querySelectorAll("[data-inc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-inc"));
        const newCart = getCart();
        if (!newCart[idx]) return;
        newCart[idx].qty = (Number(newCart[idx].qty) || 0) + 1;
        setCart(newCart);
        renderCart();
      });
    });

    // تقليل
    container.querySelectorAll("[data-dec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-dec"));
        const newCart = getCart();
        if (!newCart[idx]) return;
        const q = (Number(newCart[idx].qty) || 1) - 1;
        newCart[idx].qty = Math.max(1, q);
        setCart(newCart);
        renderCart();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // تفريغ السلة
    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        setCart([]);
        renderCart();
      });
    }

    // ✅ تأكيد الطلب + إرسال للشيت
    const confirmBtn = document.getElementById("confirmOrderBtn");
    if (confirmBtn) {
     // البحث عن الزرار في ملف cart.js واستبدال سيكشن الـ click بالآتي:
confirmBtn.addEventListener("click", async () => {
  const cart = getCart();
  if (cart.length === 0) {
    alert("السلة فاضية 🙂");
    return;
  }

  const name = document.getElementById("shipName")?.value?.trim() || "";
  const phone = document.getElementById("shipPhone")?.value?.trim() || "";
  const address = document.getElementById("shipAddress")?.value?.trim() || "";
  const notes = document.getElementById("shipNotes")?.value?.trim() || "";

  if (!name || !phone || !address) {
    alert("من فضلك املي بيانات الشحن كاملة ✅");
    return;
  }

  const payload = {
    orderId: "ORD-" + Date.now(),
    name,
    phone,
    address,
    notes,
    items: cart,
    total: calcTotal(cart)
  };

  try {
    confirmBtn.disabled = true;
    confirmBtn.innerText = "جاري الإرسال...";

    // استخدام fetch مع تحويل الـ Content-Type لـ text/plain 
    // دي "خدعة" برمجية لتجنب مشاكل الـ CORS مع جوجل
    await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors", 
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });

    // في وضع no-cors مش بنستنى رد "ok" لأن المتصفح بيحجبه
    // لكن الطلب بيوصل طالما مفيش Error في الـ Console
    alert("تم إرسال الطلب بنجاح ✅");
    setCart([]);
    window.location.href = "index.html"; 

  } catch (err) {
    console.error(err);
    alert("عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.");
    confirmBtn.disabled = false;
    confirmBtn.innerText = "تأكيد الطلب";
  }
});
    }

    renderCart();
  });

  window.addEventListener("cart:updated", () => {
    const onCartPage = document.getElementById("cartContainer");
    if (onCartPage) renderCart();
  });
})();
