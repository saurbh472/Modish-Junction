// ============================================
// MODISH JUNCTION - ADMIN DASHBOARD LOGIC
// File: js/admin.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  let currentProducts = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let uploadedImages = [];

  const SUBCATEGORIES = {
    western: [
      { id: 'tops-tees', name: 'Tops & Tees' },
      { id: 'jeans-pants', name: 'Jeans & Pants' },
      { id: 'loungewear', name: 'Loungewear' },
      { id: 'winter-wear', name: 'Winter Wear' },
      { id: 'dresses', name: 'Dresses' },
      { id: 'thrift', name: 'Thrift Collection / Shirts' }
    ],
    ethnic: [
      { id: '3-piece-suit', name: '3 Piece Suit' },
      { id: 'co-ords', name: 'Co-ords' },
      { id: 'short-kurtis', name: 'Short Kurtis' }
    ],
    'must-haves': [
      { id: 'affordable', name: 'Must-Haves & Affordable' }
    ],
    sale: [
      { id: 'sale', name: 'Sale & Clearance' }
    ]
  };

  // Input validation limits
  const VALIDATION = {
    NAME_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000,
    FABRIC_MAX_LENGTH: 100,
    PRICE_MIN: 0,
    PRICE_MAX: 999999
  };

  const authOverlay = document.getElementById('authOverlay');
  const adminEmail = document.getElementById('adminEmail');
  const adminPassword = document.getElementById('adminPassword');
  const loginBtn = document.getElementById('loginBtn');
  const authError = document.getElementById('authError');
  const btnLogout = document.getElementById('btnLogout');

  const productsTableBody = document.getElementById('productsTableBody');
  const searchInput = document.getElementById('searchInput');
  const filterTabs = document.querySelectorAll('.filter-tab');

  const statTotal = document.getElementById('statTotal');
  const statInStock = document.getElementById('statInStock');
  const statOutStock = document.getElementById('statOutStock');
  const statTrending = document.getElementById('statTrending');

  const productModal = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const productForm = document.getElementById('productForm');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const btnMigrateData = document.getElementById('btnMigrateData');

  const pMainCategory = document.getElementById('pMainCategory');
  const pSubCategory = document.getElementById('pSubCategory');
  const subFilterGroup = document.getElementById('subFilterGroup');
  const pPrice = document.getElementById('pPrice');
  const pOriginalPrice = document.getElementById('pOriginalPrice');
  const discountPreview = document.getElementById('discountPreview');

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const imgUrlInput = document.getElementById('imgUrlInput');
  const btnAddImgUrl = document.getElementById('btnAddImgUrl');
  const imagePreviews = document.getElementById('imagePreviews');

  // ========== AUTHENTICATION (Firebase Auth) ==========

  function initAuth() {
    AuthGuard.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in — show dashboard
        authOverlay.style.display = 'none';
        loadProducts();
      } else {
        // User is not signed in — show login
        authOverlay.style.display = 'flex';
        if (adminEmail) adminEmail.focus();
      }
    });
  }

  async function login() {
    const email = adminEmail.value.trim();
    const password = adminPassword.value;

    if (!email || !password) {
      showAuthError('Please enter both email and password.');
      return;
    }

    // Disable button during login attempt
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

    const result = await AuthGuard.signIn(email, password);

    if (result.success) {
      hideAuthError();
      adminEmail.value = '';
      adminPassword.value = '';
      showToast(result.message, 'success');
      // onAuthStateChanged will handle showing dashboard
    } else {
      showAuthError(result.message);
      adminPassword.value = '';
      adminPassword.focus();
    }

    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Unlock Dashboard';
  }

  function showAuthError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
  }

  function hideAuthError() {
    authError.textContent = '';
    authError.style.display = 'none';
  }

  loginBtn.addEventListener('click', login);
  adminPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });
  adminEmail.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      adminPassword.focus();
    }
  });

  btnLogout.addEventListener('click', async () => {
    await AuthGuard.signOut();
    showToast('Signed out successfully.', 'success');
    // onAuthStateChanged will handle showing login overlay
  });

  // ========== PRODUCT LOADING ==========

  async function loadProducts() {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
          <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary); margin-bottom: 10px; display:block;"></i>
          Fetching store catalog...
        </td>
      </tr>
    `;

    try {
      currentProducts = await ProductService.getAllProducts();
      updateStats();
      renderProductsTable();
    } catch (err) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 30px; color: var(--danger);">
            Failed to load products. Check Firebase rules or reload.
          </td>
        </tr>
      `;
    }
  }

  function updateStats() {
    const total = currentProducts.length;
    const inStock = currentProducts.filter(p => p.inStock !== false).length;
    const outStock = total - inStock;
    const trending = currentProducts.filter(p => p.isTrendingHome).length;

    statTotal.innerText = total;
    statInStock.innerText = inStock;
    statOutStock.innerText = outStock;
    statTrending.innerText = trending;
  }

  // ========== PRODUCT TABLE RENDERING (Sanitized) ==========

  function renderProductsTable() {
    let filtered = [...currentProducts];

    if (currentFilter && currentFilter !== 'all') {
      const f = currentFilter.toLowerCase().trim();
      if (f === 'western') {
        filtered = filtered.filter(p => String(p.mainCategory || '').toLowerCase().includes('western'));
      } else if (f === 'ethnic') {
        filtered = filtered.filter(p => String(p.mainCategory || '').toLowerCase().includes('ethnic'));
      } else if (f === 'must-haves') {
        filtered = filtered.filter(p => Boolean(p.isMustHave) || String(p.mainCategory || '').toLowerCase().includes('must') || String(p.subCategory || '').toLowerCase().includes('affordable'));
      } else if (f === 'sale') {
        filtered = filtered.filter(p => Boolean(p.isSale) || Number(p.discount) >= 20 || String(p.mainCategory || '').toLowerCase().includes('sale'));
      } else if (f === 'trending') {
        filtered = filtered.filter(p => Boolean(p.isTrendingHome));
      } else if (f === 'outofstock') {
        filtered = filtered.filter(p => p.inStock === false);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const name = String(p.name || '').toLowerCase();
        const slug = String(p.slug || '').toLowerCase();
        const mainCat = String(p.mainCategory || '').toLowerCase();
        const subCat = String(p.subCategory || '').toLowerCase();
        const subFilt = String(p.subFilter || '').toLowerCase();
        const fabric = String(p.fabric || '').toLowerCase();
        const desc = String(p.description || '').toLowerCase();
        const colors = Array.isArray(p.colors) ? p.colors.join(' ').toLowerCase() : String(p.colors || '').toLowerCase();

        return name.includes(q) || slug.includes(q) || mainCat.includes(q) || subCat.includes(q) || subFilt.includes(q) || fabric.includes(q) || desc.includes(q) || colors.includes(q);
      });
    }

    if (filtered.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
            No products found matching criteria. Click "+ Add New Cloth" or "Sync Initial Products" above.
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = filtered.map(p => {
      const mainImg = p.images && p.images.length > 0 ? Sanitize.url(p.images[0], './Images/Category/western-wear.jpg') : './Images/Category/western-wear.jpg';
      const categoryBadgeClass = p.mainCategory === 'ethnic' ? 'badge-ethnic' : (p.mainCategory === 'sale' ? 'badge-sale' : (p.mainCategory === 'must-haves' ? 'badge-musthave' : 'badge-western'));
      const inStockChecked = p.inStock !== false ? 'checked' : '';

      const safeName = Sanitize.text(p.name);
      const safeSlug = Sanitize.text(p.slug);
      const safeSubCat = Sanitize.text((p.subCategory || 'General').replace('-', ' '));
      const safeSubFilter = Sanitize.text(p.subFilter || '');
      const safeMainCat = Sanitize.text((p.mainCategory || 'western').toUpperCase());
      const safeId = Sanitize.attr(p.id);
      const safeNameAttr = Sanitize.attr(p.name);
      const colorsCount = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors.length : 0;

      return `
        <tr data-id="${safeId}">
          <td>
            <div class="product-cell">
              <img src="${mainImg}" alt="${safeNameAttr}" class="product-thumb" onerror="this.src='./Images/Category/western-wear.jpg'">
              <div>
                <div class="product-title">${safeName}</div>
                <div class="product-slug">/${safeSlug}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge-tag ${categoryBadgeClass}">${safeMainCat}</span>
          </td>
          <td style="text-transform: capitalize; color: #555;">
            ${safeSubCat}
            ${p.subFilter && p.subFilter !== 'all' ? `<br><small style="color:#888;">(${safeSubFilter})</small>` : ''}
            ${colorsCount > 0 ? `<br><small style="color:var(--primary); font-weight:600;">🎨 ${colorsCount} color(s)</small>` : ''}
          </td>
          <td>
            <strong>₹${Number(p.price).toLocaleString('en-IN')}</strong>
            ${p.originalPrice && p.originalPrice > p.price ? `<br><small style="text-decoration:line-through; color:#999;">₹${Number(p.originalPrice).toLocaleString('en-IN')}</small>` : ''}
          </td>
          <td>
            <div style="display:flex; flex-direction:column; gap:3px;">
              ${p.isTrendingHome ? '<span style="font-size:11px; background:#fff3cd; color:#856404; padding:2px 6px; border-radius:4px; font-weight:600;">⭐ Trending</span>' : ''}
              ${p.isSale ? '<span style="font-size:11px; background:#f8d7da; color:#721c24; padding:2px 6px; border-radius:4px; font-weight:600;">🔥 Sale</span>' : ''}
              ${p.isMustHave ? '<span style="font-size:11px; background:#d4edda; color:#155724; padding:2px 6px; border-radius:4px; font-weight:600;">✨ Must-Have</span>' : ''}
              ${p.discount > 0 ? `<span style="font-size:11px; color:var(--primary); font-weight:700;">${Number(p.discount)}% OFF</span>` : ''}
            </div>
          </td>
          <td>
            <label class="switch">
              <input type="checkbox" class="stock-toggle" data-id="${safeId}" ${inStockChecked}>
              <span class="slider"></span>
            </label>
          </td>
          <td>
            <div style="display: flex; gap: 8px;">
              <a href="./product.html?id=${safeId}" target="_blank" class="btn btn-outline btn-sm" title="View live on store" style="display:flex; align-items:center; justify-content:center; text-decoration:none;">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
              <button class="btn btn-outline btn-sm btn-edit" data-id="${safeId}" title="Edit details">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-sm btn-delete" data-id="${safeId}" data-name="${safeNameAttr}" style="color: var(--danger);" title="Delete product">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachTableEvents();
  }

  // ========== TABLE EVENTS ==========

  function attachTableEvents() {
    document.querySelectorAll('.stock-toggle').forEach(toggle => {
      toggle.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const inStock = e.target.checked;
        await ProductService.toggleStock(id, inStock);
        const item = currentProducts.find(p => p.id === id);
        if (item) item.inStock = inStock;
        updateStats();
        showToast(inStock ? 'Marked as In Stock' : 'Marked as Out of Stock', 'success');
      });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (confirm(`Are you sure you want to delete "${name}" from the store?`)) {
          try {
            await ProductService.deleteProduct(id);
            currentProducts = currentProducts.filter(p => p.id !== id);
            updateStats();
            renderProductsTable();
            showToast(`Deleted "${Sanitize.text(name)}"`, 'success');
          } catch (err) {
            alert('Failed to delete product. Please try again.');
          }
        }
      });
    });
  }

  // ========== SEARCH & FILTERS ==========

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProductsTable();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderProductsTable();
    });
  });

  // ========== SUBCATEGORY & FORM HELPERS ==========

  function populateSubcategories(mainCat, selectedSub = null) {
    const list = SUBCATEGORIES[mainCat] || SUBCATEGORIES.western;
    pSubCategory.innerHTML = list.map(item => 
      `<option value="${Sanitize.attr(item.id)}" ${selectedSub === item.id ? 'selected' : ''}>${Sanitize.text(item.name)}</option>`
    ).join('');

    checkDressSubFilter();
  }

  function checkDressSubFilter() {
    if (pSubCategory.value === 'dresses') {
      subFilterGroup.style.display = 'block';
    } else {
      subFilterGroup.style.display = 'none';
    }
  }

  pMainCategory.addEventListener('change', () => {
    populateSubcategories(pMainCategory.value);
  });

  pSubCategory.addEventListener('change', checkDressSubFilter);

  function calculateDiscountDisplay() {
    const price = Number(pPrice.value) || 0;
    const originalPrice = Number(pOriginalPrice.value) || 0;
    if (originalPrice > price && price > 0) {
      const disc = Math.round(((originalPrice - price) / originalPrice) * 100);
      discountPreview.innerText = `💡 ${disc}% Discount will be displayed on card`;
    } else {
      discountPreview.innerText = '';
    }
  }

  pPrice.addEventListener('input', calculateDiscountDisplay);
  pOriginalPrice.addEventListener('input', calculateDiscountDisplay);

  // ========== IMAGE MANAGEMENT ==========

  function renderImagePreviews() {
    imagePreviews.innerHTML = uploadedImages.map((imgUrl, idx) => {
      const safeUrl = Sanitize.url(imgUrl, './Images/Category/western-wear.jpg');
      return `
        <div class="img-preview-card">
          <img src="${safeUrl}" alt="Product Photo ${idx+1}">
          <button type="button" class="remove-img" data-index="${idx}">&times;</button>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.remove-img').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = Number(btn.getAttribute('data-index'));
        uploadedImages.splice(index, 1);
        renderImagePreviews();
      });
    });
  }

  btnAddImgUrl.addEventListener('click', () => {
    const url = imgUrlInput.value.trim();
    if (url) {
      // Validate the URL before adding
      const safeUrl = Sanitize.url(url);
      if (!safeUrl) {
        alert('Invalid image URL. Please use http://, https://, or a relative path.');
        return;
      }
      uploadedImages.push(safeUrl);
      imgUrlInput.value = '';
      renderImagePreviews();
    }
  });

  imgUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnAddImgUrl.click();
    }
  });

  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        compressImage(event.target.result, (compressedDataUrl) => {
          uploadedImages.push(compressedDataUrl);
          renderImagePreviews();
        });
      };
      reader.readAsDataURL(file);
    });
    fileInput.value = '';
  });

  function compressImage(base64Str, callback) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 800;

      if (width > height && width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.80));
    };
  }

  // ========== MODAL OPEN / CLOSE ==========

  btnOpenAddModal.addEventListener('click', () => {
    modalTitle.innerText = "Add New Clothing Item";
    document.getElementById('formProductId').value = '';
    const pColorsInput = document.getElementById('pColors');
    if (pColorsInput) pColorsInput.value = '';
    productForm.reset();
    uploadedImages = [];
    renderImagePreviews();
    discountPreview.innerText = '';
    populateSubcategories('western');
    document.getElementById('flagInStock').checked = true;
    productModal.classList.add('active');
  });

  function openEditModal(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;

    modalTitle.innerText = "Edit Clothing Item";
    document.getElementById('formProductId').value = product.id;
    document.getElementById('pName').value = product.name;
    document.getElementById('pMainCategory').value = product.mainCategory || 'western';
    populateSubcategories(product.mainCategory || 'western', product.subCategory);
    
    if (product.subFilter) {
      document.getElementById('pSubFilter').value = product.subFilter;
    }
    
    document.getElementById('pFabric').value = product.fabric || '';
    
    // Populate Colors
    const pColorsInput = document.getElementById('pColors');
    if (pColorsInput) {
      pColorsInput.value = Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || '');
    }

    document.getElementById('pPrice').value = product.price;
    document.getElementById('pOriginalPrice').value = product.originalPrice || '';
    document.getElementById('pDescription').value = product.description || '';

    const sizes = Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL'];
    document.querySelectorAll('input[name="sizes"]').forEach(cb => {
      cb.checked = sizes.includes(cb.value);
    });

    document.getElementById('flagTrending').checked = Boolean(product.isTrendingHome);
    document.getElementById('flagSale').checked = Boolean(product.isSale);
    document.getElementById('flagMustHave').checked = Boolean(product.isMustHave);
    document.getElementById('flagInStock').checked = product.inStock !== false;

    uploadedImages = product.images ? [...product.images] : [];
    renderImagePreviews();
    calculateDiscountDisplay();

    productModal.classList.add('active');
  }

  function closeModal() {
    productModal.classList.remove('active');
  }

  modalCloseBtn.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  // ========== INPUT VALIDATION ==========

  function validateProductInput(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Product name is required.');
    } else if (data.name.length > VALIDATION.NAME_MAX_LENGTH) {
      errors.push(`Product name must be under ${VALIDATION.NAME_MAX_LENGTH} characters.`);
    }

    if (data.description && data.description.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
      errors.push(`Description must be under ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`);
    }

    if (data.fabric && data.fabric.length > VALIDATION.FABRIC_MAX_LENGTH) {
      errors.push(`Fabric field must be under ${VALIDATION.FABRIC_MAX_LENGTH} characters.`);
    }

    if (data.price < VALIDATION.PRICE_MIN || data.price > VALIDATION.PRICE_MAX) {
      errors.push(`Price must be between ₹${VALIDATION.PRICE_MIN} and ₹${VALIDATION.PRICE_MAX}.`);
    }

    if (data.originalPrice && (data.originalPrice < VALIDATION.PRICE_MIN || data.originalPrice > VALIDATION.PRICE_MAX)) {
      errors.push(`Original price must be between ₹${VALIDATION.PRICE_MIN} and ₹${VALIDATION.PRICE_MAX}.`);
    }

    // Validate image URLs
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const validUrl = Sanitize.url(data.images[i]);
        if (!validUrl) {
          errors.push(`Image ${i + 1} has an invalid URL.`);
        }
      }
    }

    return errors;
  }

  /**
   * Strip HTML tags from form text inputs to prevent stored XSS
   */
  function cleanTextInput(str) {
    return Sanitize.stripTags(str || '').trim();
  }

  // ========== FORM SUBMIT (with validation) ==========

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btnSaveProduct');
    btnSave.disabled = true;
    btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
      const id = document.getElementById('formProductId').value;
      const selectedSizes = Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value);
      if (selectedSizes.length === 0) selectedSizes.push('Free Size');

      if (uploadedImages.length === 0) {
        uploadedImages.push('./Images/Category/western-wear.jpg');
      }

      // Sanitize all image URLs
      const sanitizedImages = uploadedImages
        .map(img => Sanitize.url(img, ''))
        .filter(img => img.length > 0);

      if (sanitizedImages.length === 0) {
        sanitizedImages.push('./Images/Category/western-wear.jpg');
      }

      const colorsRaw = document.getElementById('pColors')?.value || '';
      const colorsList = colorsRaw
        .split(',')
        .map(c => cleanTextInput(c))
        .filter(c => c.length > 0);

      const productPayload = {
        name: cleanTextInput(document.getElementById('pName').value).substring(0, VALIDATION.NAME_MAX_LENGTH),
        mainCategory: document.getElementById('pMainCategory').value,
        subCategory: document.getElementById('pSubCategory').value,
        subFilter: document.getElementById('pSubFilter').value,
        fabric: cleanTextInput(document.getElementById('pFabric').value).substring(0, VALIDATION.FABRIC_MAX_LENGTH),
        price: Math.min(Math.max(Number(document.getElementById('pPrice').value) || 0, VALIDATION.PRICE_MIN), VALIDATION.PRICE_MAX),
        originalPrice: Math.min(Math.max(Number(document.getElementById('pOriginalPrice').value) || Number(document.getElementById('pPrice').value), VALIDATION.PRICE_MIN), VALIDATION.PRICE_MAX),
        sizes: selectedSizes,
        colors: colorsList,
        description: cleanTextInput(document.getElementById('pDescription').value).substring(0, VALIDATION.DESCRIPTION_MAX_LENGTH),
        images: sanitizedImages,
        isTrendingHome: document.getElementById('flagTrending').checked,
        isSale: document.getElementById('flagSale').checked,
        isMustHave: document.getElementById('flagMustHave').checked,
        inStock: document.getElementById('flagInStock').checked
      };

      // Validate
      const errors = validateProductInput(productPayload);
      if (errors.length > 0) {
        alert('Validation errors:\n\n' + errors.join('\n'));
        return;
      }

      if (id) {
        await ProductService.updateProduct(id, productPayload);
        showToast(`Updated "${Sanitize.text(productPayload.name)}"!`, 'success');
      } else {
        await ProductService.addProduct(productPayload);
        showToast(`Added "${Sanitize.text(productPayload.name)}" to catalog!`, 'success');
      }

      closeModal();
      await loadProducts();

    } catch (err) {
      alert("Error saving product. Please try again.");
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Product';
    }
  });

  // ========== DATA MIGRATION ==========

  btnMigrateData.addEventListener('click', async () => {
    if (confirm("Import all existing hardcoded clothes into Firestore? (Duplicates will be skipped)")) {
      btnMigrateData.disabled = true;
      btnMigrateData.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';

      try {
        const res = await migrateInitialProductsToFirebase((current, total, name) => {
          btnMigrateData.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${current}/${total}...`;
        });
        showToast(`Migration Complete! Added ${res.migrated} items (${res.alreadyExisted} already in DB).`, 'success');
        await loadProducts();
      } catch (err) {
        alert("Migration error. Please try again.");
      } finally {
        btnMigrateData.disabled = false;
        btnMigrateData.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Sync Initial Products';
      }
    }
  });

  // ========== TOAST NOTIFICATION (Sanitized) ==========

  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    const icon = document.createElement('i');
    icon.className = `fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`;
    
    const span = document.createElement('span');
    span.textContent = Sanitize.stripTags(message);
    
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(' '));
    toast.appendChild(span);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========== REVIEWS TAB & MANAGEMENT ==========
  let currentReviews = [];
  let reviewsSearchQuery = '';

  const btnTabProducts = document.getElementById('btnTabProducts');
  const btnTabReviews = document.getElementById('btnTabReviews');
  const viewProductsSection = document.getElementById('viewProductsSection');
  const viewReviewsSection = document.getElementById('viewReviewsSection');
  const searchReviewsInput = document.getElementById('searchReviewsInput');
  const reviewsTableBody = document.getElementById('reviewsTableBody');
  const badgeReviewCount = document.getElementById('badgeReviewCount');

  function switchAdminTab(tab) {
    if (tab === 'products') {
      btnTabProducts.className = 'btn btn-primary';
      btnTabReviews.className = 'btn btn-outline';
      viewProductsSection.style.display = 'block';
      viewReviewsSection.style.display = 'none';
    } else {
      btnTabReviews.className = 'btn btn-primary';
      btnTabProducts.className = 'btn btn-outline';
      viewProductsSection.style.display = 'none';
      viewReviewsSection.style.display = 'block';
      loadReviews();
    }
  }

  if (btnTabProducts) btnTabProducts.addEventListener('click', () => switchAdminTab('products'));
  if (btnTabReviews) btnTabReviews.addEventListener('click', () => switchAdminTab('reviews'));

  async function loadReviews() {
    if (!reviewsTableBody) return;
    reviewsTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #888;">
          <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary); margin-bottom: 10px; display:block;"></i>
          Fetching reviews from Firestore...
        </td>
      </tr>
    `;

    try {
      currentReviews = await ProductService.getAllReviews();
      if (badgeReviewCount) badgeReviewCount.innerText = currentReviews.length;
      renderReviewsTable();
    } catch (err) {
      reviewsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 30px; color: var(--danger);">
            Failed to load reviews. Please check Firestore security rules.
          </td>
        </tr>
      `;
    }
  }

  function renderReviewsTable() {
    if (!reviewsTableBody) return;
    let filtered = [...currentReviews];

    if (reviewsSearchQuery) {
      const q = reviewsSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const name = String(r.name || '').toLowerCase();
        const text = String(r.text || '').toLowerCase();
        const pid = String(r.productId || '').toLowerCase();
        return name.includes(q) || text.includes(q) || pid.includes(q);
      });
    }

    if (filtered.length === 0) {
      reviewsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: #888;">
            No customer reviews found yet in database.
          </td>
        </tr>
      `;
      return;
    }

    reviewsTableBody.innerHTML = filtered.map(r => {
      const safeName = Sanitize.text(r.name || 'Anonymous');
      const safeText = Sanitize.text(r.text || '');
      const safePid = Sanitize.text(r.productId || 'N/A');
      const safeId = Sanitize.attr(r.id);
      const rating = Number(r.rating) || 5;
      const isApproved = r.status !== 'hidden';

      return `
        <tr data-id="${safeId}">
          <td>
            <strong>${safeName}</strong>
            <br><small style="color: #27ae60;">✓ Verified Buyer</small>
          </td>
          <td>
            <a href="./product.html?id=${encodeURIComponent(r.productId)}" target="_blank" style="color: var(--primary); font-weight:600; text-decoration:none;">
              ${safePid} ↗
            </a>
          </td>
          <td>
            <span style="color: #f39c12; font-size: 14px;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>
            <br><small style="color:#888;">(${rating} / 5)</small>
          </td>
          <td style="max-width: 280px; font-size: 13px; color: #444;">
            ${safeText}
            ${r.tag ? `<br><small style="color: #888;">Tag: ${Sanitize.text(r.tag)}</small>` : ''}
          </td>
          <td>
            <span style="font-size: 11px; padding: 3px 8px; border-radius: 12px; font-weight: 700; background: ${isApproved ? '#e8f8f0; color: #27ae60;' : '#fdedec; color: #e74c3c;'}">
              ${isApproved ? 'Approved' : 'Hidden'}
            </span>
          </td>
          <td>
            <div style="display:flex; gap: 8px;">
              <button class="btn btn-outline btn-sm btn-toggle-review" data-id="${safeId}" data-status="${isApproved ? 'hidden' : 'approved'}" title="${isApproved ? 'Hide review from store' : 'Approve review'}">
                <i class="fa-solid ${isApproved ? 'fa-eye-slash' : 'fa-eye'}"></i>
              </button>
              <button class="btn btn-outline btn-sm btn-delete-review" data-id="${safeId}" style="color: var(--danger);" title="Delete review">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachReviewTableEvents();
  }

  function attachReviewTableEvents() {
    document.querySelectorAll('.btn-toggle-review').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const newStatus = btn.getAttribute('data-status');
        await ProductService.toggleReviewStatus(id, newStatus);
        const r = currentReviews.find(item => item.id === id);
        if (r) r.status = newStatus;
        renderReviewsTable();
        showToast(`Review is now ${newStatus}!`, 'success');
      });
    });

    document.querySelectorAll('.btn-delete-review').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Are you sure you want to permanently delete this customer review?")) {
          await ProductService.deleteReview(id);
          currentReviews = currentReviews.filter(r => r.id !== id);
          if (badgeReviewCount) badgeReviewCount.innerText = currentReviews.length;
          renderReviewsTable();
          showToast("Review deleted successfully.", 'success');
        }
      });
    });
  }

  if (searchReviewsInput) {
    searchReviewsInput.addEventListener('input', (e) => {
      reviewsSearchQuery = e.target.value;
      renderReviewsTable();
    });
  }

  // ========== INIT ==========
  initAuth();
});
