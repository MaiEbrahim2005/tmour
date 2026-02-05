// js/products.js

const PRODUCTS = [
  {
    id: 1,
    name: "بلح الوادي",
    image: "assets/images/p2.jpeg",
    variants: [
      { vid: "kg1", label: "كيلو", price: 90 },
      { vid: "kg2", label: "اتنين كيلو", price: 175 },
      { vid: "kg3", label: "خمسة كيلو", price: 430 },
    ],
  },
  {
    id: 2,
    name: "تمر محشي",
    image: "assets/images/mahshi.jpeg",
    variants: [
      { vid: "k25", label: "تمر محشي كاجو 25 قطعة", price: 100 },
      { vid: "k36", label: "تمر محشي كاجو 36 قطعة", price: 135 },
      { vid: "a25", label: "تمر محشي لوز 25 قطعة", price: 100 },
      { vid: "a36", label: "تمر محشي لوز 36 قطعة", price: 135 },
    ],
  },
  {
    id: 3,
    name: "سموزي التمر واللوز",
    image: "assets/images/smothie.jpeg",
    variants: [
      // لو مش عايزة Variants للسموزي، سيبيها خيار واحد
      { vid: "cup", label: "كوب", price: 110 },
    ],
  },
  {
    id: 4,
    name: "دبس التمر",
    image: "assets/images/dps.jpeg",
    variants: [
      { vid: "200ml", label: "200 مل", price: 70 },
    ],
  },
];

// ✅ خلي المنتجات متاحة
window.PRODUCTS = PRODUCTS;

// ================== CART HELPERS ==================
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

// ✅ تخزين السلة بالـ variant
function addToCart(productId, variantId, qty = 1) {
  const cart = getCart();
  const found = cart.find((x) => x.id === productId && x.vid === variantId);

  if (found) found.qty += qty;
  else cart.push({ id: productId, vid: variantId, qty });

  setCart(cart);
}

// ✅ نخليها متاحة لصفحات تانية
window.Cart = { getCart, setCart, addToCart };

// ================== PRODUCTS LIST RENDER ==================
function renderProductCard(p) {
  return `
    <div class="product-card fade-in">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}"
             loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1605311361334-6e3b3c5bbef8?auto=format&fit=crop&w=800&q=80'">
      </div>

      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>

        <div class="product-price">
          <div>
            <span class="price-amount">
              يبدأ من ${Math.min(...p.variants.map(v => v.price))} ج.م
            </span>
          </div>

          <a href="product-details.html?id=${p.id}" class="add-to-cart">
            <i class="fas fa-circle-info"></i>
            <span>تفاصيل</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

function loadProducts(limit = PRODUCTS.length) {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  const n = Number(limit);
  const list = Number.isFinite(n) ? PRODUCTS.slice(0, n) : PRODUCTS;

  container.innerHTML = list.map((p) => renderProductCard(p)).join("");
}

window.loadProducts = loadProducts;
