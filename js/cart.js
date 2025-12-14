

/* =========================
   CART CORE LOGIC
========================= */

const DEALER_WHATSAPP = "918949120920"; // 👈 YOUR NUMBER

function getCart() {
  return JSON.parse(localStorage.getItem("mj_cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("mj_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const el = document.getElementById("cart-count");
  if (el) el.innerText = cart.reduce((total, item) => total + item.qty, 0);

}
function openWhatsAppOrder() {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  let message = `Hello Modish Junction,

I want to place an order:

`;

  let total = 0;

  cart.forEach((item, i) => {
    message += `${i + 1}. ${item.name} - ₹${item.price} x ${item.qty}\n`;
    if (item.link) message += `${item.link}\n\n`;
    total += item.price * item.qty;
  });

  message += `Total: ₹${total}`;

  window.open(
    `https://wa.me/${DEALER_WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
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


function addToCart(id, name, price, link) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1, link });
  }

  setCart(cart);
}


document.querySelectorAll(".product-card").forEach(card => {
  const btn = card.querySelector(".add-to-cart");
  if (!btn) return;

  btn.addEventListener("click", function () {
    const id = card.dataset.id;
    const name = card.querySelector("h3").innerText.trim();
    const price = parseInt(
      card.querySelector(".sale-price").innerText.replace(/[^\d]/g, "")
    );
    const link = card.dataset.link;

    addToCart(id, name, price, link);

    this.textContent = "✓ Added!";
    setTimeout(() => (this.textContent = "Add to Cart"), 1500);
  });
});


/* =========================
   CART → WHATSAPP
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
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.qty;

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

    totalEl.innerText = `Total: ₹${total}`;
  }

  modal.style.display = "flex";
}

updateCartCount();
