/* ============================================
   MODISH JUNCTION - WISHLIST FUNCTIONALITY
   File: js/wishlist.js
   ============================================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'mj_wishlist';

  /**
   * Get all items currently in wishlist
   * @returns {Array}
   */
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Save wishlist items to localStorage and update badges
   * @param {Array} list 
   */
  function setWishlist(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // localStorage error
    }
    updateWishlistCount();
    updateCardHeartButtons();
  }

  /**
   * Check if a product is saved in wishlist
   * @param {string} id 
   * @returns {boolean}
   */
  function isWishlisted(id) {
    if (!id) return false;
    const list = getWishlist();
    const cleanId = String(id).trim().toLowerCase();
    return list.some(item => String(item.id).trim().toLowerCase() === cleanId);
  }

  /**
   * Toggle a product in wishlist (Add if not present, remove if present)
   * @param {Object} product - { id, name, price, originalPrice, image, link, slug, subCategory }
   * @returns {boolean} - true if added, false if removed
   */
  function toggleWishlist(product) {
    if (!product || !product.id) return false;
    const list = getWishlist();
    const cleanId = String(product.id).trim().toLowerCase();
    const idx = list.findIndex(item => String(item.id).trim().toLowerCase() === cleanId);

    let added = false;
    if (idx !== -1) {
      // Remove
      list.splice(idx, 1);
      showWishlistToast(`Removed "${Sanitize.stripTags(product.name || 'Item')}" from Wishlist`);
    } else {
      // Add
      list.push({
        id: String(product.id).trim(),
        name: String(product.name || 'Clothing Item').trim(),
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
        image: product.image || product.images?.[0] || './Images/Category/western-wear.jpg',
        link: product.link || window.location.href,
        slug: product.slug || '',
        subCategory: product.subCategory || ''
      });
      added = true;
      showWishlistToast(`Saved "${Sanitize.stripTags(product.name || 'Item')}" to Wishlist! ❤️`);
    }

    setWishlist(list);
    return added;
  }

  /**
   * Update all wishlist badge counters in the header/nav
   */
  function updateWishlistCount() {
    const list = getWishlist();
    const total = list.length;
    document.querySelectorAll('#wishlist-count, .wishlist-count').forEach(el => {
      el.innerText = total;
    });
  }

  /**
   * Sync heart button UI across all product cards on current page
   */
  function updateCardHeartButtons() {
    document.querySelectorAll('.wishlist-btn-card').forEach(btn => {
      const id = btn.getAttribute('data-product-id');
      if (id && isWishlisted(id)) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    });

    // Update product page wishlist button if present
    const mainBtn = document.getElementById('btnProductWishlist');
    if (mainBtn) {
      const prodId = mainBtn.getAttribute('data-product-id');
      if (prodId && isWishlisted(prodId)) {
        mainBtn.classList.add('active');
        mainBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      } else {
        mainBtn.classList.remove('active');
        mainBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    }
  }

  /**
   * Ensure the Wishlist modal exists in the DOM
   */
  function ensureWishlistModal() {
    let modal = document.getElementById('wishlist-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wishlist-modal';
      modal.className = 'wishlist-modal';
      modal.innerHTML = `
        <div class="wishlist-box">
          <div class="wishlist-header">
            <h2><span>❤️</span> Saved Wishlist</h2>
            <button class="wishlist-close-btn" onclick="closeWishlist()">&times;</button>
          </div>
          <div id="wishlist-items-container" class="wishlist-items-container"></div>
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #eee; display: flex; justify-content: space-between;">
            <button onclick="closeWishlist()" style="padding: 10px 18px; border-radius: 8px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-weight: 600;">Close</button>
            <button onclick="closeWishlist(); if(typeof openCart === 'function') openCart();" style="padding: 10px 18px; border-radius: 8px; border: none; background: var(--primary, #d4593b); color: #fff; cursor: pointer; font-weight: 700;">View Cart 🛒</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeWishlist();
      });
    }
    return modal;
  }

  /**
   * Open the Wishlist Modal and render saved items
   */
  function openWishlist() {
    const modal = ensureWishlistModal();
    const container = document.getElementById('wishlist-items-container');
    const list = getWishlist();

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #888;">
          <p style="font-size: 2.2rem; margin-bottom: 10px;">🤍</p>
          <p style="font-size: 1.1rem; font-weight: 700; color: #333; margin-bottom: 6px;">Your Wishlist is Empty</p>
          <p style="font-size: 0.85rem; color: #999;">Tap the heart icon on any dress or suit to save it here!</p>
        </div>
      `;
    } else {
      container.innerHTML = list.map((item, idx) => {
        const safeName = typeof Sanitize !== 'undefined' ? Sanitize.text(item.name) : item.name;
        const safeId = typeof Sanitize !== 'undefined' ? Sanitize.attr(item.id) : item.id;
        const safeImg = typeof Sanitize !== 'undefined' ? Sanitize.url(item.image, './Images/Category/western-wear.jpg') : item.image;

        return `
          <div class="wishlist-item-card" data-id="${safeId}">
            <img src="${safeImg}" alt="${safeName}" class="wishlist-item-img" onerror="this.src='./Images/Category/western-wear.jpg'">
            <div class="wishlist-item-info">
              <div class="wishlist-item-title">${safeName}</div>
              <div class="wishlist-item-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
              <div class="wishlist-item-actions">
                <button class="btn-move-cart" onclick="moveWishlistToCart('${safeId}')">
                  <i class="fa-solid fa-cart-plus"></i> Move to Cart
                </button>
                <button class="btn-remove-wishlist" onclick="removeWishlistItem('${safeId}')" title="Remove">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    modal.style.display = 'flex';
  }

  function closeWishlist() {
    const modal = document.getElementById('wishlist-modal');
    if (modal) modal.style.display = 'none';
  }

  function removeWishlistItem(id) {
    const list = getWishlist().filter(item => String(item.id) !== String(id));
    setWishlist(list);
    openWishlist();
  }

  function moveWishlistToCart(id) {
    const list = getWishlist();
    const item = list.find(p => String(p.id) === String(id));
    if (!item) return;

    if (typeof addToCart === 'function') {
      addToCart(item.id, item.name, item.price, item.link, item.image);
      removeWishlistItem(id);
      closeWishlist();
      if (typeof openCart === 'function') openCart();
    }
  }

  /**
   * Mini Toast message for wishlist
   */
  function showWishlistToast(msg) {
    const existing = document.querySelector('.wishlist-mini-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'wishlist-mini-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 25px;
      left: 25px;
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
      border-left: 4px solid #e74c3c;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Global exports
  window.getWishlist = getWishlist;
  window.toggleWishlist = toggleWishlist;
  window.isWishlisted = isWishlisted;
  window.openWishlist = openWishlist;
  window.closeWishlist = closeWishlist;
  window.updateWishlistCount = updateWishlistCount;
  window.removeWishlistItem = removeWishlistItem;
  window.moveWishlistToCart = moveWishlistToCart;

  document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCount();
    updateCardHeartButtons();
  });
})();
