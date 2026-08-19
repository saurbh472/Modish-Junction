// ============================================
// MODISH JUNCTION - ADMIN DASHBOARD LOGIC
// File: js/admin.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  let currentProducts = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let uploadedImages = [];
  const DEFAULT_PASSCODE = 'admin123';

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

  const authOverlay = document.getElementById('authOverlay');
  const adminPasscode = document.getElementById('adminPasscode');
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

  function checkAuth() {
    const isAuth = sessionStorage.getItem('mj_admin_authenticated');
    if (isAuth === 'true') {
      authOverlay.style.display = 'none';
      loadProducts();
    } else {
      authOverlay.style.display = 'flex';
      adminPasscode.focus();
    }
  }

  function login() {
    const entered = adminPasscode.value.trim();
    if (entered === DEFAULT_PASSCODE || entered === 'modish2026' || entered === 'admin') {
      sessionStorage.setItem('mj_admin_authenticated', 'true');
      authOverlay.style.display = 'none';
      authError.style.display = 'none';
      adminPasscode.value = '';
      showToast('Welcome to Modish Junction Admin!', 'success');
      loadProducts();
    } else {
      authError.style.display = 'block';
      adminPasscode.value = '';
      adminPasscode.focus();
    }
  }

  loginBtn.addEventListener('click', login);
  adminPasscode.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });

  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('mj_admin_authenticated');
    checkAuth();
  });

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
      console.error("Error loading products:", err);
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

  function renderProductsTable() {
    let filtered = currentProducts;

    if (currentFilter === 'western') {
      filtered = filtered.filter(p => p.mainCategory === 'western');
    } else if (currentFilter === 'ethnic') {
      filtered = filtered.filter(p => p.mainCategory === 'ethnic');
    } else if (currentFilter === 'must-haves') {
      filtered = filtered.filter(p => p.isMustHave || p.mainCategory === 'must-haves' || p.subCategory === 'affordable');
    } else if (currentFilter === 'sale') {
      filtered = filtered.filter(p => p.isSale || p.discount >= 20 || p.mainCategory === 'sale');
    } else if (currentFilter === 'trending') {
      filtered = filtered.filter(p => p.isTrendingHome);
    } else if (currentFilter === 'outofstock') {
      filtered = filtered.filter(p => p.inStock === false);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
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
      const mainImg = p.images && p.images.length > 0 ? p.images[0] : './Images/Category/western-wear.jpg';
      const categoryBadgeClass = p.mainCategory === 'ethnic' ? 'badge-ethnic' : (p.mainCategory === 'sale' ? 'badge-sale' : (p.mainCategory === 'must-haves' ? 'badge-musthave' : 'badge-western'));
      const inStockChecked = p.inStock !== false ? 'checked' : '';

      return `
        <tr data-id="${p.id}">
          <td>
            <div class="product-cell">
              <img src="${mainImg}" alt="${p.name}" class="product-thumb" onerror="this.src='./Images/Category/western-wear.jpg'">
              <div>
                <div class="product-title">${p.name}</div>
                <div class="product-slug">/${p.slug}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge-tag ${categoryBadgeClass}">${(p.mainCategory || 'western').toUpperCase()}</span>
          </td>
          <td style="text-transform: capitalize; color: #555;">
            ${(p.subCategory || 'General').replace('-', ' ')}
            ${p.subFilter && p.subFilter !== 'all' ? `<br><small style="color:#888;">(${p.subFilter})</small>` : ''}
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
              ${p.discount > 0 ? `<span style="font-size:11px; color:var(--primary); font-weight:700;">${p.discount}% OFF</span>` : ''}
            </div>
          </td>
          <td>
            <label class="switch">
              <input type="checkbox" class="stock-toggle" data-id="${p.id}" ${inStockChecked}>
              <span class="slider"></span>
            </label>
          </td>
          <td>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm btn-edit" data-id="${p.id}" title="Edit details">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-sm btn-delete" data-id="${p.id}" data-name="${p.name.replace(/"/g, '&quot;')}" style="color: var(--danger);" title="Delete product">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachTableEvents();
  }

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
            showToast(`Deleted "${name}"`, 'success');
          } catch (err) {
            alert('Failed to delete: ' + err.message);
          }
        }
      });
    });
  }

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

  function populateSubcategories(mainCat, selectedSub = null) {
    const list = SUBCATEGORIES[mainCat] || SUBCATEGORIES.western;
    pSubCategory.innerHTML = list.map(item => 
      `<option value="${item.id}" ${selectedSub === item.id ? 'selected' : ''}>${item.name}</option>`
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

  function renderImagePreviews() {
    imagePreviews.innerHTML = uploadedImages.map((imgUrl, idx) => `
      <div class="img-preview-card">
        <img src="${imgUrl}" alt="Product Photo ${idx+1}">
        <button type="button" class="remove-img" data-index="${idx}">&times;</button>
      </div>
    `).join('');

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
      uploadedImages.push(url);
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

  btnOpenAddModal.addEventListener('click', () => {
    modalTitle.innerText = "Add New Clothing Item";
    document.getElementById('formProductId').value = '';
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

      const productPayload = {
        name: document.getElementById('pName').value.trim(),
        mainCategory: document.getElementById('pMainCategory').value,
        subCategory: document.getElementById('pSubCategory').value,
        subFilter: document.getElementById('pSubFilter').value,
        fabric: document.getElementById('pFabric').value.trim(),
        price: Number(document.getElementById('pPrice').value),
        originalPrice: Number(document.getElementById('pOriginalPrice').value) || Number(document.getElementById('pPrice').value),
        sizes: selectedSizes,
        description: document.getElementById('pDescription').value.trim(),
        images: uploadedImages,
        isTrendingHome: document.getElementById('flagTrending').checked,
        isSale: document.getElementById('flagSale').checked,
        isMustHave: document.getElementById('flagMustHave').checked,
        inStock: document.getElementById('flagInStock').checked
      };

      if (id) {
        await ProductService.updateProduct(id, productPayload);
        showToast(`Updated "${productPayload.name}"!`, 'success');
      } else {
        await ProductService.addProduct(productPayload);
        showToast(`Added "${productPayload.name}" to catalog!`, 'success');
      }

      closeModal();
      await loadProducts();

    } catch (err) {
      alert("Error saving product: " + err.message);
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Product';
    }
  });

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
        alert("Migration error: " + err.message);
      } finally {
        btnMigrateData.disabled = false;
        btnMigrateData.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Sync Initial Products';
      }
    }
  });

  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  checkAuth();
});
