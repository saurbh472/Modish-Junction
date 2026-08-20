/* ============================================
   MODISH JUNCTION - ENHANCED CART FUNCTIONALITY
   File: js/cart.js
   ============================================ */

(function() {
  'use strict';

  const DEALER_WHATSAPP = "918949120920"; // WhatsApp ordering number
  const SHIPPING_CHARGE = 45; // Flat ₹45 shipping per order

  /* =========================
     SANITIZATION HELPER
  ========================= */
  function esc(str) {
    if (typeof Sanitize !== 'undefined') return Sanitize.text(str);
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* =========================
     CART STORAGE
  ========================= */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("mj_cart")) || [];
    } catch (e) {
      return [];
    }
  }

  function setCart(cart) {
    try {
      localStorage.setItem("mj_cart", JSON.stringify(cart));
    } catch (e) {
      // Cart storage error — localStorage may be full or unavailable
    }
    updateCartCount();
  }

  /* =========================
     CART COUNT (HEADER BADGES)
  ========================= */
  function updateCartCount() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);

    // Update all cart count elements in header or nav
    document.querySelectorAll("#cart-count, .cart-count").forEach(el => {
      el.innerText = totalQty;
    });
  }

  /* =========================
     ENSURE CART MODAL IN DOM
  ========================= */
  function ensureCartModal() {
    let modal = document.getElementById("cart-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "cart-modal";
      modal.className = "cart-modal";
      modal.innerHTML = `
        <div class="cart-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
            <h2 style="margin:0; font-size:1.4rem; color:var(--primary, #d4593b);">🛒 Your Cart</h2>
            <button onclick="closeCart()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#888;">&times;</button>
          </div>
          <div id="cart-items"></div>
          <div class="cart-footer">
            <div id="cart-total"></div>
            <div class="cart-actions">
              <button onclick="closeCart()" class="btn-cart-close" style="padding:10px 18px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer;">Close</button>
              <button class="whatsapp-btn" onclick="openWhatsAppOrder()" style="padding:10px 18px; border-radius:8px; background:#25D366; color:#fff; border:none; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                <span>Order on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close on click outside box
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeCart();
      });
    }
    return modal;
  }

  /* =========================
     ADD TO CART
  ========================= */
  function addToCart(id, name, price, link, img) {
    const cart = getCart();
    const cleanId = String(id || ('item_' + Date.now())).trim();
    const cleanPrice = Number(String(price).replace(/[^\d]/g, "")) || 0;
    const cleanName = String(name || 'Clothing Item').trim();
    const cleanLink = link || window.location.href;

    const existing = cart.find(item => item.id === cleanId);

    if (existing) {
      existing.qty = (Number(existing.qty) || 1) + 1;
    } else {
      cart.push({
        id: cleanId,
        name: cleanName,
        price: cleanPrice,
        qty: 1,
        link: cleanLink,
        image: img || ''
      });
    }

    setCart(cart);
    showCartToast(`Added "${cleanName}" to cart!`);
  }

  /* =========================
     SHOW MINI TOAST NOTIFICATION
  ========================= */
  function showCartToast(msg) {
    const existing = document.querySelector('.cart-mini-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cart-mini-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: #1a0e08;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.25);
      z-index: 99999;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: fadeInSlide 0.3s ease;
      border-left: 4px solid #27ae60;
    `;

    const checkmark = document.createElement('span');
    checkmark.textContent = '✓';
    const message = document.createElement('span');
    message.textContent = msg; // Use textContent, not innerHTML
    toast.appendChild(checkmark);
    toast.appendChild(message);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  /* =========================
     BIND ADD TO CART BUTTONS (LEGACY / STATIC)
  ========================= */
  function bindAddToCartButtons() {
    document.querySelectorAll(".product-card").forEach(card => {
      const btn = card.querySelector(".add-to-cart");
      if (!btn) return;

      btn.onclick = (e) => {
        e.stopPropagation();

        const id = card.dataset.id || card.getAttribute('data-id');
        const name = card.querySelector("h3")?.innerText.trim();
        const priceText = card.querySelector(".sale-price")?.innerText || card.querySelector(".price")?.innerText || "₹0";
        const price = parseInt(priceText.replace(/[^\d]/g, ""));
        const link = card.dataset.link || card.getAttribute('data-link') || window.location.href;

        if (!id || !name || isNaN(price)) return;

        addToCart(id, name, price, link);

        const origText = btn.textContent;
        btn.textContent = "✓ Added!";
        btn.style.background = "linear-gradient(135deg, #27ae60, #2ecc71)";
        setTimeout(() => {
          btn.textContent = origText;
          btn.style.background = "";
        }, 1200);
      };
    });
  }

  /* =========================
     CART MODAL UI (Sanitized)
  ========================= */
  function openCart() {
    const modal = ensureCartModal();
    const itemsEl = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    const cart = getCart();
    itemsEl.innerHTML = "";

    if (cart.length === 0) {
      itemsEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #888;">
          <p style="font-size: 2.2rem; margin-bottom: 10px;">🛍️</p>
          <p style="font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 6px;">Your cart is empty</p>
          <p style="font-size: 0.85rem; color: #999;">Explore our latest collections to add clothes.</p>
        </div>
      `;
      totalEl.innerHTML = "";
    } else {
      let subtotal = 0;

      cart.forEach((item, index) => {
        const itemPrice = Math.max(0, Number(item.price) || 0);
        const itemQty = Math.max(1, Number(item.qty) || 1);
        const itemTotal = itemPrice * itemQty;
        subtotal += itemTotal;
        const safeName = esc(item.name);

        itemsEl.innerHTML += `
          <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f0f0f0;">
            <div style="flex:1; padding-right:10px;">
              <strong style="font-size:14px; color:#1a0e08;">${safeName}</strong><br>
              <span style="color:var(--primary, #d4593b); font-weight:600; font-size:13px;">₹${itemPrice.toLocaleString('en-IN')}</span>
            </div>

            <div class="qty-controls" style="display:flex; align-items:center; gap:8px;">
              <button onclick="changeQty(${index}, -1)" style="width:28px; height:28px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer; font-weight:bold;">−</button>
              <span style="font-weight:600; font-size:14px; min-width:18px; text-align:center;">${itemQty}</span>
              <button onclick="changeQty(${index}, 1)" style="width:28px; height:28px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer; font-weight:bold;">+</button>
              <button class="remove-btn" onclick="removeItem(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:16px; margin-left:6px;" title="Remove item">✕</button>
            </div>
          </div>
        `;
      });

      // Shipping & Free Shipping calculation (>= 999 is Free)
      const isFreeShipping = subtotal >= 999;
      const shipping = isFreeShipping ? 0 : SHIPPING_CHARGE;
      const grandTotal = subtotal + shipping;

      // Retrieve saved buyer details if any
      let savedBuyer = {};
      try {
        savedBuyer = JSON.parse(localStorage.getItem('mj_buyer_details')) || {};
      } catch (e) {}

      const safeBuyerName = esc(savedBuyer.name || '');
      const safeBuyerAddress = esc(savedBuyer.address || '');
      const safeBuyerPhone = esc(savedBuyer.phone || '');

      totalEl.innerHTML = `
        <!-- Optional Customer Delivery Details -->
        <div class="cart-customer-section" style="margin-top: 14px; padding: 12px; background: #fdfaf7; border-radius: 12px; border: 1px solid #f2e9e4;">
          <div style="font-size: 12px; font-weight: 700; color: #1a0e08; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>📍 Delivery Details (Optional)</span>
            <small style="color: #888; font-weight: normal;">Pre-fills WhatsApp</small>
          </div>
          <input type="text" id="cartCustomerName" placeholder="Your Name (e.g. Priya Sharma)" maxlength="60" value="${safeBuyerName}" style="width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; margin-bottom: 6px; box-sizing: border-box;">
          <input type="text" id="cartCustomerAddress" placeholder="Address, City & Pincode" maxlength="150" value="${safeBuyerAddress}" style="width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; margin-bottom: 6px; box-sizing: border-box;">
          <input type="tel" id="cartCustomerPhone" placeholder="Alternate Phone / WhatsApp (Optional)" maxlength="20" value="${safeBuyerPhone}" style="width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; box-sizing: border-box;">
        </div>

        <div style="margin-top: 14px; border-top: 2px dashed #eee; padding-top: 12px;">
          <div class="price-row" style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px; color:#666;">
            <span>Subtotal</span>
            <span>₹${Number(subtotal).toLocaleString('en-IN')}</span>
          </div>

          <div class="price-row" style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; color:#666;">
            <span>Shipping</span>
            <span>${isFreeShipping ? '<span style="color: #27ae60; font-weight:700;">🎉 FREE (Above ₹999)</span>' : `₹${shipping}`}</span>
          </div>

          <div class="price-row total-row" style="display:flex; justify-content:space-between; font-weight:bold; font-size:16px; color:#1a0e08; border-top:1px solid #eee; padding-top:8px;">
            <span>Total Payable</span>
            <span style="color:var(--primary, #d4593b);">₹${Number(grandTotal).toLocaleString('en-IN')}</span>
          </div>
        </div>
      `;
    }

    modal.style.display = "flex";
  }

  function closeCart() {
    const modal = document.getElementById("cart-modal");
    if (modal) modal.style.display = "none";
  }

  function changeQty(index, delta) {
    const cart = getCart();
    if (cart[index]) {
      cart[index].qty = (Number(cart[index].qty) || 1) + delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
    }

    setCart(cart);
    openCart();
  }

  function removeItem(index) {
    const cart = getCart();
    if (cart[index]) {
      cart.splice(index, 1);
    }
    setCart(cart);
    openCart();
  }

  /* =========================
     WHATSAPP DIRECT ORDER
  ========================= */
  function openWhatsAppOrder() {
    const cart = getCart();

    if (cart.length === 0) {
      alert("Your cart is empty! Please add some clothes before placing an order.");
      return;
    }

    // Capture & sanitize customer details
    const nameInput = document.getElementById("cartCustomerName");
    const addressInput = document.getElementById("cartCustomerAddress");
    const phoneInput = document.getElementById("cartCustomerPhone");

    const custName = (nameInput?.value || "").trim().slice(0, 60);
    const custAddress = (addressInput?.value || "").trim().slice(0, 150);
    const custPhone = (phoneInput?.value || "").trim().slice(0, 20);

    // Save for convenient future re-orders
    try {
      localStorage.setItem("mj_buyer_details", JSON.stringify({
        name: custName,
        address: custAddress,
        phone: custPhone
      }));
    } catch (e) {}

    // Unique Order Reference ID & Formatted Date
    const orderRef = `#MJ-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) + ", " + now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    let message = `🛍️ *NEW ORDER - MODISH JUNCTION* 🌸\n`;
    message += `🔖 *Order Ref:* ${orderRef}\n`;
    message += `📅 *Date:* ${dateStr}\n\n`;

    if (custName || custAddress || custPhone) {
      message += `👤 *Customer Details:*\n`;
      if (custName) message += `• Name: ${custName}\n`;
      if (custAddress) message += `• Delivery Address: ${custAddress}\n`;
      if (custPhone) message += `• Contact: ${custPhone}\n`;
      message += `\n`;
    }

    message += `👗 *Items Ordered:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    let subtotal = 0;

    cart.forEach((item, i) => {
      const unitPrice = Math.max(0, Number(item.price) || 0);
      const qty = Math.max(1, Number(item.qty) || 1);
      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      message += `${i + 1}️⃣ *${item.name}*\n`;
      message += `   • Qty: ${qty} × ₹${unitPrice.toLocaleString('en-IN')} = ₹${itemTotal.toLocaleString('en-IN')}\n`;
      if (item.link) {
        message += `   • Link: ${item.link}\n`;
      }
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const isFreeShipping = subtotal >= 999;
    const shipping = isFreeShipping ? 0 : SHIPPING_CHARGE;
    const grandTotal = subtotal + shipping;

    message += `💰 *Price Summary:*\n`;
    message += `• Items Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n`;
    message += `• Delivery / Shipping: ${isFreeShipping ? '₹0 (🎉 FREE Shipping above ₹999)' : `₹${shipping}`}\n`;
    message += `• *Grand Total: ₹${grandTotal.toLocaleString('en-IN')}*\n\n`;

    message += `💳 *Payment Mode:* Please share UPI QR / Bank Transfer details to confirm payment.\n`;
    message += `✨ Looking forward to confirming my order!`;

    window.open(
      `https://wa.me/${DEALER_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  /* =========================
     GLOBAL EXPORTS (Minimal — only what's needed by HTML onclick handlers)
  ========================= */
  window.addToCart = addToCart;
  window.openCart = openCart;
  window.closeCart = closeCart;
  window.changeQty = changeQty;
  window.removeItem = removeItem;
  window.openWhatsAppOrder = openWhatsAppOrder;
  window.updateCartCount = updateCartCount;

  document.addEventListener("DOMContentLoaded", () => {
    bindAddToCartButtons();
    updateCartCount();
  });
})();
