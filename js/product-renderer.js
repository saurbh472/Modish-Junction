// ============================================
// MODISH JUNCTION - PRODUCT RENDERER
// File: js/product-renderer.js
// Purpose: Renders cards matching existing styles with proper sizing & alignment
// ============================================

const ProductRenderer = {
  getRootPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/western-wear/') || p.includes('/Ethnic-wear/') || p.includes('/Sale/')) {
      return '../';
    }
    return './';
  },

  formatImageUrl(imgUrl) {
    if (!imgUrl) return this.getRootPrefix() + 'Images/Category/western-wear.jpg';
    // Validate URL for safety
    if (typeof Sanitize !== 'undefined') {
      const safe = Sanitize.url(imgUrl, this.getRootPrefix() + 'Images/Category/western-wear.jpg');
      if (!safe) return this.getRootPrefix() + 'Images/Category/western-wear.jpg';
      if (safe.startsWith('http://') || safe.startsWith('https://') || safe.startsWith('data:')) {
        return safe;
      }
      const prefix = this.getRootPrefix();
      const clean = safe.replace(/^(\.\/|\.\.\/)+/, '');
      return prefix + clean;
    }
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('data:')) {
      return imgUrl;
    }
    const prefix = this.getRootPrefix();
    const clean = imgUrl.replace(/^(\.\/|\.\.\/)+/, '');
    return prefix + clean;
  },

  createCardHTML(product) {
    const prefix = this.getRootPrefix();
    const safeId = typeof Sanitize !== 'undefined' ? Sanitize.attr(product.id) : product.id;
    const safeSlug = typeof Sanitize !== 'undefined' ? Sanitize.attr(product.slug) : product.slug;
    const safeName = typeof Sanitize !== 'undefined' ? Sanitize.text(product.name) : product.name;
    const safeNameAttr = typeof Sanitize !== 'undefined' ? Sanitize.attr(product.name) : product.name.replace(/"/g, '&quot;');
    const safeSubCat = typeof Sanitize !== 'undefined' ? Sanitize.attr(product.subCategory || 'all') : encodeURIComponent(product.subCategory || 'all');

    const productLink = `${prefix}product.html?id=${encodeURIComponent(product.id)}&slug=${encodeURIComponent(product.slug)}&category=${encodeURIComponent(product.subCategory || 'all')}`;
    const mainImg = product.images && product.images.length > 0 ? this.formatImageUrl(product.images[0]) : this.formatImageUrl('');
    const discountText = product.discount > 0 ? `${product.discount}% OFF` : (product.price < product.originalPrice ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF` : '');
    const outOfStock = product.inStock === false;

    return `
      <div class="product-card ${outOfStock ? 'out-of-stock' : ''}"
           data-id="${safeId}"
           data-slug="${safeSlug}"
           data-category="${typeof Sanitize !== 'undefined' ? Sanitize.attr(product.subFilter || product.subCategory || '') : (product.subFilter || product.subCategory || '')}"
           data-link="${productLink}">
        
        ${discountText ? `<span class="discount-badge">${discountText}</span>` : ''}
        ${outOfStock ? `<span class="discount-badge" style="background: #555; left: auto; right: 10px;">Sold Out</span>` : ''}

        <div class="product-image" onclick="window.location.href='${productLink}'" style="cursor: pointer;">
          <img src="${mainImg}" alt="${safeNameAttr}" loading="lazy" onerror="this.src='${prefix}Images/Category/western-wear.jpg'">
        </div>

        <div class="product-info">
          <h3 onclick="window.location.href='${productLink}'" style="cursor: pointer;">${safeName}</h3>
          <div class="price">
            <span class="sale-price">₹${Number(product.price).toLocaleString('en-IN')}</span>
            ${product.originalPrice && product.originalPrice > product.price ? `<span class="original-price">₹${Number(product.originalPrice).toLocaleString('en-IN')}</span>` : ''}
          </div>
          <button class="add-to-cart" 
                  data-product-id="${safeId}" 
                  data-product-name="${safeNameAttr}" 
                  data-product-price="${product.price}" 
                  data-product-img="${mainImg}"
                  data-product-link="${productLink}"
                  ${outOfStock ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>
            ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    `;
  },

  attachCardEvents(container) {
    if (!container) return;

    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) return;
        const link = card.getAttribute('data-link');
        if (link) window.location.href = link;
      });
    });

    container.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-product-id');
        const name = btn.getAttribute('data-product-name');
        const price = Number(btn.getAttribute('data-product-price'));
        const link = btn.getAttribute('data-product-link') || window.location.href;

        if (typeof addToCart === 'function') {
          addToCart(id, name, price, link);
          
          const originalText = btn.innerText;
          btn.innerText = "✓ Added";
          btn.style.background = "linear-gradient(135deg, #27ae60, #2ecc71)";
          setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "";
          }, 1500);

          if (typeof updateCartCount === 'function') {
            updateCartCount();
          }
        } else {
          alert(`Added "${name}" to cart!`);
        }
      });
    });
  },

  async renderInto(containerSelector, filterOptions = {}) {
    const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
    if (!container) return;

    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; color: #888;">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary, #d4593b); margin-bottom: 12px; display: block;"></i>
        <p>Loading fresh collection...</p>
      </div>
    `;

    try {
      let products = [];
      if (filterOptions.isTrendingHome) {
        products = await ProductService.getTrendingProducts(filterOptions.limit || 8);
      } else if (filterOptions.isSale) {
        products = await ProductService.getSaleProducts();
      } else if (filterOptions.isMustHave) {
        products = await ProductService.getMustHaveProducts();
      } else {
        products = await ProductService.getProducts(filterOptions);
      }

      if (!products || products.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <p style="font-size: 1.2rem; color: #666; margin-bottom: 10px;">✨ No items found in this section yet.</p>
            <p style="font-size: 0.9rem; color: #999;">New styles are arriving soon! Use the Admin Panel to add clothes here.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = products.map(p => this.createCardHTML(p)).join('');
      this.attachCardEvents(container);

    } catch (err) {
      console.error("Render error:", err);
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; color: #d4593b;">
          <p>Failed to load products. Please check connection and refresh.</p>
        </div>
      `;
    }
  }
};

window.ProductRenderer = ProductRenderer;
