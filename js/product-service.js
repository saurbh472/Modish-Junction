// ============================================
// MODISH JUNCTION - PRODUCT SERVICE
// File: js/product-service.js
// Purpose: Unified Firestore CRUD with smart caching & normalization
// ============================================

const ProductService = {
  COLLECTION: 'products',

  getDb() {
    if (typeof db !== 'undefined' && db !== null) return db;
    if (typeof window.db !== 'undefined' && window.db !== null) return window.db;
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
      return firebase.firestore();
    }
    return null;
  },

  generateSlug(name) {
    if (!name) return 'cloth-' + Date.now();
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
  },

  calculateDiscount(price, originalPrice) {
    price = Number(price) || 0;
    originalPrice = Number(originalPrice) || 0;
    if (originalPrice > price && originalPrice > 0) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 0;
  },

  normalizeProduct(docData, docId = null) {
    const id = docId || docData.id || ('prod_' + Date.now());
    const price = Number(docData.price) || 0;
    const originalPrice = Number(docData.originalPrice) || price;
    const discount = docData.discount !== undefined ? Number(docData.discount) : this.calculateDiscount(price, originalPrice);
    
    let images = [];
    if (Array.isArray(docData.images)) {
      images = docData.images.filter(img => typeof img === 'string' && img.trim().length > 0);
    } else if (typeof docData.image === 'string' && docData.image.trim().length > 0) {
      images = [docData.image.trim()];
    }
    if (images.length === 0) {
      images = ['./Images/Category/western-wear.jpg'];
    }

    let sizes = ['S', 'M', 'L', 'XL'];
    if (Array.isArray(docData.sizes) && docData.sizes.length > 0) {
      sizes = docData.sizes;
    } else if (typeof docData.sizes === 'string') {
      sizes = docData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }

    const subCatRaw = (docData.subCategory || 'dresses').toLowerCase().trim().replace(/\s+/g, '-');
    const mainCatRaw = (docData.mainCategory || 'western').toLowerCase().trim();

    return {
      id: id,
      name: docData.name || 'Untitled Clothing Item',
      slug: docData.slug || this.generateSlug(docData.name),
      mainCategory: mainCatRaw,
      subCategory: subCatRaw,
      subFilter: (docData.subFilter || 'all').toLowerCase().trim(),
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      images: images,
      sizes: sizes,
      colors: Array.isArray(docData.colors) ? docData.colors : (docData.colors ? [docData.colors] : []),
      fabric: docData.fabric || '',
      description: docData.description || 'Premium quality fashion designed for comfort and elegance.',
      inStock: docData.inStock !== false,
      stockCount: docData.stockCount !== undefined ? Number(docData.stockCount) : 10,
      isTrendingHome: Boolean(docData.isTrendingHome),
      isSale: Boolean(docData.isSale || mainCatRaw === 'sale' || subCatRaw === 'sale' || discount >= 25),
      isMustHave: Boolean(docData.isMustHave || mainCatRaw === 'must-haves' || subCatRaw === 'affordable'),
      rating: Number(docData.rating) || 4.8,
      reviews: Number(docData.reviews) || 120,
      createdAt: docData.createdAt || new Date().toISOString()
    };
  },

  async getAllProducts() {
    const firestore = this.getDb();
    if (firestore) {
      try {
        const snapshot = await firestore.collection(this.COLLECTION).get();
        if (!snapshot.empty) {
          const products = [];
          snapshot.forEach(doc => {
            products.push(this.normalizeProduct(doc.data(), doc.id));
          });
          localStorage.setItem('mj_products_cache', JSON.stringify(products));
          return products;
        }
      } catch (err) {
        console.warn("Firestore read error, checking local fallback:", err);
      }
    }

    const cached = localStorage.getItem('mj_products_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }

    if (typeof INITIAL_MIGRATION_PRODUCTS !== 'undefined' && Array.isArray(INITIAL_MIGRATION_PRODUCTS)) {
      return INITIAL_MIGRATION_PRODUCTS.map(p => this.normalizeProduct(p));
    }
    return [];
  },

  async getProducts(filters = {}) {
    const all = await this.getAllProducts();
    return all.filter(item => {
      if (filters.mainCategory && filters.mainCategory !== 'all') {
        const reqMain = filters.mainCategory.toLowerCase();
        if (reqMain === 'must-haves' && !item.isMustHave) return false;
        if (reqMain === 'sale' && !item.isSale) return false;
        if (reqMain !== 'must-haves' && reqMain !== 'sale') {
          if (item.mainCategory !== reqMain) return false;
        }
      }

      if (filters.subCategory && filters.subCategory !== 'all') {
        const reqSub = filters.subCategory.toLowerCase().trim().replace(/\s+/g, '-');
        const itemSub = (item.subCategory || '').toLowerCase().trim().replace(/\s+/g, '-');
        
        // Match subcategory or aliases
        const matchTops = (reqSub.includes('top') || reqSub.includes('tee')) && (itemSub.includes('top') || itemSub.includes('tee'));
        const matchJeans = (reqSub.includes('jean') || reqSub.includes('pant')) && (itemSub.includes('jean') || itemSub.includes('pant'));
        const matchLounge = reqSub.includes('lounge') && itemSub.includes('lounge');
        const matchWinter = reqSub.includes('winter') && itemSub.includes('winter');
        const matchDress = reqSub.includes('dress') && itemSub.includes('dress');
        const matchThrift = (reqSub.includes('thrift') || reqSub.includes('shirt')) && (itemSub.includes('thrift') || itemSub.includes('shirt'));
        const match3Piece = (reqSub.includes('3') || reqSub.includes('three')) && (itemSub.includes('3') || itemSub.includes('three'));
        const matchCoords = reqSub.includes('coord') && itemSub.includes('coord');
        const matchKurtis = reqSub.includes('kurti') && itemSub.includes('kurti');
        const matchMustHave = (reqSub.includes('affordable') || reqSub.includes('must')) && (item.isMustHave || itemSub.includes('affordable'));

        const isMatch = (itemSub === reqSub) || matchTops || matchJeans || matchLounge || matchWinter || matchDress || matchThrift || match3Piece || matchCoords || matchKurtis || matchMustHave;
        if (!isMatch) return false;
      }

      if (filters.subFilter && filters.subFilter !== 'all') {
        if (item.subFilter !== filters.subFilter.toLowerCase()) return false;
      }

      if (filters.isTrendingHome === true && !item.isTrendingHome) return false;
      if (filters.isSale === true && !item.isSale) return false;
      if (filters.isMustHave === true && !item.isMustHave) return false;
      if (filters.inStockOnly === true && !item.inStock) return false;

      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesCat = (item.subCategory || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  },

  async getTrendingProducts(limit = 8) {
    const trending = await this.getProducts({ isTrendingHome: true });
    if (trending.length > 0) return trending.slice(0, limit);
    const all = await this.getAllProducts();
    return all.slice(0, limit);
  },

  async getSaleProducts() {
    return await this.getProducts({ isSale: true });
  },

  async getMustHaveProducts() {
    return await this.getProducts({ isMustHave: true });
  },

  async getProductByIdOrSlug(identifier) {
    if (!identifier) return null;
    const clean = String(identifier).trim().toLowerCase();
    const all = await this.getAllProducts();

    let found = all.find(p => String(p.id).toLowerCase() === clean);
    if (found) return found;

    found = all.find(p => String(p.slug).toLowerCase() === clean);
    if (found) return found;

    found = all.find(p => clean.includes(p.slug.toLowerCase()) || p.slug.toLowerCase().includes(clean));
    return found || null;
  },

  async addProduct(productData) {
    const firestore = this.getDb();
    const normalized = this.normalizeProduct(productData);
    normalized.createdAt = new Date().toISOString();

    if (firestore) {
      try {
        const docRef = await firestore.collection(this.COLLECTION).add(normalized);
        normalized.id = docRef.id;
        await docRef.update({ id: docRef.id });
        localStorage.removeItem('mj_products_cache');
        return normalized;
      } catch (err) {
        console.error("Firestore add error:", err);
        throw err;
      }
    } else {
      const all = await this.getAllProducts();
      all.unshift(normalized);
      localStorage.setItem('mj_products_cache', JSON.stringify(all));
      return normalized;
    }
  },

  async updateProduct(id, updateData) {
    if (!id) throw new Error("Product ID required");
    const firestore = this.getDb();
    const normalized = this.normalizeProduct(updateData, id);
    normalized.updatedAt = new Date().toISOString();

    if (firestore) {
      try {
        await firestore.collection(this.COLLECTION).doc(id).set(normalized, { merge: true });
        localStorage.removeItem('mj_products_cache');
        return normalized;
      } catch (err) {
        console.error("Firestore update error:", err);
        throw err;
      }
    } else {
      const all = await this.getAllProducts();
      const idx = all.findIndex(p => p.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...normalized };
        localStorage.setItem('mj_products_cache', JSON.stringify(all));
      }
      return normalized;
    }
  },

  async toggleStock(id, inStock) {
    const firestore = this.getDb();
    if (firestore) {
      try {
        await firestore.collection(this.COLLECTION).doc(id).update({ inStock: Boolean(inStock) });
        localStorage.removeItem('mj_products_cache');
        return true;
      } catch (err) {
        console.error("Stock toggle error:", err);
      }
    }
    const all = await this.getAllProducts();
    const item = all.find(p => p.id === id);
    if (item) {
      item.inStock = Boolean(inStock);
      localStorage.setItem('mj_products_cache', JSON.stringify(all));
    }
    return true;
  },

  async deleteProduct(id) {
    if (!id) throw new Error("Product ID required");
    const firestore = this.getDb();
    if (firestore) {
      try {
        await firestore.collection(this.COLLECTION).doc(id).delete();
        localStorage.removeItem('mj_products_cache');
        return true;
      } catch (err) {
        console.error("Delete error:", err);
        throw err;
      }
    } else {
      let all = await this.getAllProducts();
      all = all.filter(p => p.id !== id);
      localStorage.setItem('mj_products_cache', JSON.stringify(all));
      return true;
    }
  }
};

window.ProductService = ProductService;
