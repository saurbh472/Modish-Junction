/* =========================
   CONFIG
========================= */
const DEALER_WHATSAPP = "918949120920"; // your WhatsApp number
const SHIPPING_CHARGE = 45; // ₹45 flat per order

/* =========================
   CART STORAGE
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem("mj_cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("mj_cart", JSON.stringify(cart));
  updateCartCount();
}

/* =========================
   CART COUNT (HEADER)
========================= */
function updateCartCount() {
  const cart = getCart();
  const el = document.getElementById("cart-count");
  if (!el) return;

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  el.innerText = totalQty;
}

/* =========================
   ADD TO CART (NO DUPLICATES)
========================= */
function addToCart(id, name, price, link) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id,
      name,
      price,
      qty: 1,
      link
    });
  }

  setCart(cart);
}

/* =========================
   BIND ADD TO CART BUTTONS
========================= */
function bindAddToCartButtons() {
  document.querySelectorAll(".product-card").forEach(card => {
    const btn = card.querySelector(".add-to-cart");
    if (!btn) return;

    btn.onclick = (e) => {
      e.stopPropagation();

      const id = card.dataset.id;
      const name = card.querySelector("h3")?.innerText.trim();
      const priceText = card.querySelector(".sale-price")?.innerText || "₹0";
      const price = parseInt(priceText.replace(/[^\d]/g, ""));
      const link = card.dataset.link || window.location.href;

      if (!id || !name || isNaN(price)) return;

      addToCart(id, name, price, link);

      btn.textContent = "✓ Added!";
      setTimeout(() => {
        btn.textContent = "Add to Cart";
      }, 1200);
    };
  });
}

/* =========================
   CART MODAL UI
========================= */
function openCart() {
  const modal = document.getElementById("cart-modal");
  const itemsEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  const cart = getCart();
  itemsEl.innerHTML = "";

  if (cart.length === 0) {
    itemsEl.innerHTML = "<p>Your cart is empty</p>";
    totalEl.innerText = "";
  } else {
    let subtotal = 0;

    cart.forEach((item, index) => {
      subtotal += item.price * item.qty;

      itemsEl.innerHTML += `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong><br>
            ₹${item.price}
          </div>

          <div class="qty-controls">
            <button onclick="changeQty(${index}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${index}, 1)">+</button>
            <button class="remove-btn" onclick="removeItem(${index})">✕</button>
          </div>
        </div>
      `;
    });

    const shipping = SHIPPING_CHARGE;
    const grandTotal = subtotal + shipping;

  totalEl.innerHTML = `
  <div class="price-row">
    <span>Subtotal</span>
    <span>₹${subtotal}</span>
  </div>

  <div class="price-row">
    <span>Shipping</span>
    <span>₹${shipping}</span>
  </div>

  <div class="price-row total-row">
    <span>Total Payable</span>
    <span>₹${grandTotal}</span>
  </div>
`;
  }

  modal.style.display = "flex";
}

function closeCart() {
  document.getElementById("cart-modal").style.display = "none";
}

function changeQty(index, delta) {
  const cart = getCart();
  cart[index].qty += delta;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  setCart(cart);
  openCart();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  openCart();
}

/* =========================
   WHATSAPP ORDER
========================= */
function openWhatsAppOrder() {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  let message = `Hello Modish Junction,

I want to place an order:

`;

  let subtotal = 0;

  cart.forEach((item, i) => {
    message += `${i + 1}. ${item.name} - ₹${item.price} x ${item.qty}\n`;
    if (item.link) message += `${item.link}\n\n`;
    subtotal += item.price * item.qty;
  });

  const shipping = SHIPPING_CHARGE;
  const grandTotal = subtotal + shipping;

  message += `Subtotal: ₹${subtotal}\n`;
  message += `Shipping: ₹${shipping}\n`;
  message += `Total Payable: ₹${grandTotal}`;

  window.open(
    `https://wa.me/${DEALER_WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  bindAddToCartButtons();
  updateCartCount();
});
