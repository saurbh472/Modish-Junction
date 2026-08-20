// ============================================
// MODISH JUNCTION - PRODUCT SERVICE
// File: js/product-service.js
// Purpose: Unified Firestore CRUD with smart caching & normalization
// ============================================

const ProductService = {
  COLLECTION: 'products',

  getDb() {
    if (typeof db !== 'undefined' && db !== null) return db;
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
    if (!docData) return null;
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
        console.warn("Firestore read unavailable, using local fallback.");
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
    const clean = String(identifier).trim();
    const cleanLower = clean.toLowerCase();
    const firestore = this.getDb();

    // 1. Direct doc lookup by ID in Firestore first
    if (firestore && clean.length >= 10) {
      try {
        const docSnap = await firestore.collection(this.COLLECTION).doc(clean).get();
        if (docSnap.exists) {
          return this.normalizeProduct(docSnap.data(), docSnap.id);
        }
      } catch (e) {
        // Direct doc lookup failed, try slug query
      }
    }

    // 2. Query by slug in Firestore
    if (firestore) {
      try {
        const slugQuery = await firestore.collection(this.COLLECTION).where('slug', '==', cleanLower).limit(1).get();
        if (!slugQuery.empty) {
          const doc = slugQuery.docs[0];
          return this.normalizeProduct(doc.data(), doc.id);
        }
      } catch (e) {
        // Slug query failed, fall back to local data
      }
    }

    // 3. Fallback to full list / local cache / initial migration array
    const all = await this.getAllProducts();
    let found = all.find(p => String(p.id).toLowerCase() === cleanLower);
    if (found) return found;

    found = all.find(p => String(p.slug).toLowerCase() === cleanLower);
    if (found) return found;

    found = all.find(p => cleanLower.includes(p.slug.toLowerCase()) || p.slug.toLowerCase().includes(cleanLower));
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
        // Stock toggle error, fall through to local update
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
        throw err;
      }
    } else {
      let all = await this.getAllProducts();
      all = all.filter(p => p.id !== id);
      localStorage.setItem('mj_products_cache', JSON.stringify(all));
      return true;
    }
  },

  REVIEWS_COLLECTION: 'reviews',

  async getReviews(productId) {
    if (!productId) return [];
    const firestore = this.getDb();
    if (firestore) {
      try {
        const snap = await firestore.collection(this.REVIEWS_COLLECTION)
          .where('productId', '==', String(productId).trim())
          .get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => {
            const d = doc.data();
            if (d.status !== 'hidden') {
              list.push({
                id: doc.id,
                productId: d.productId,
                name: d.name || 'Anonymous',
                rating: Number(d.rating) || 5,
                date: d.date || 'Recent',
                verified: d.verified !== false,
                text: d.text || '',
                tag: d.tag || 'Fit: True to size',
                status: d.status || 'approved',
                createdAt: d.createdAt
              });
            }
          });
          if (list.length > 0) return list;
        }
      } catch (err) {
        // Fallback to local on connection issues
      }
    }

    // Local fallback
    try {
      const local = JSON.parse(localStorage.getItem(`mj_reviews_${productId}`));
      if (Array.isArray(local) && local.length > 0) return local;
    } catch (e) {}

    return [
      {
        name: 'Ananya Sharma',
        rating: 5,
        date: '2 days ago',
        verified: true,
        text: 'Absolutely in love with the fabric! Fits like a glove and the color looks even better in person.',
        tag: 'Fit: True to size'
      },
      {
        name: 'Pooja Verma',
        rating: 5,
        date: '1 week ago',
        verified: true,
        text: 'Super comfy and breathable. Got so many compliments at a family dinner!',
        tag: 'Quality: Premium'
      },
      {
        name: 'Sneha Patel',
        rating: 4,
        date: '2 weeks ago',
        verified: true,
        text: 'Great finishing and stitching. Fast delivery too! Highly recommend Modish Junction.',
        tag: 'Style: Elegant'
      }
    ];
  },

  async addReview(productId, reviewData) {
    if (!productId || !reviewData) return null;
    const firestore = this.getDb();
    const payload = {
      productId: String(productId).trim(),
      name: String(reviewData.name || 'Verified Buyer').trim().substring(0, 50),
      rating: Math.min(Math.max(Number(reviewData.rating) || 5, 1), 5),
      date: reviewData.date || 'Just now',
      verified: true,
      text: String(reviewData.text || '').trim().substring(0, 500),
      tag: String(reviewData.tag || 'Fit: True to size').trim().substring(0, 50),
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    if (firestore) {
      try {
        const docRef = await firestore.collection(this.REVIEWS_COLLECTION).add(payload);
        payload.id = docRef.id;
      } catch (err) {
        // Fallback to local
      }
    }

    try {
      const key = `mj_reviews_${productId}`;
      const existing = JSON.parse(localStorage.getItem(key)) || [];
      existing.unshift(payload);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
    } catch (e) {}

    return payload;
  },

  async getAllReviews() {
    const firestore = this.getDb();
    const reviews = [];
    if (firestore) {
      try {
        const snap = await firestore.collection(this.REVIEWS_COLLECTION).get();
        snap.forEach(doc => {
          reviews.push({ id: doc.id, ...doc.data() });
        });
        return reviews;
      } catch (err) {}
    }
    return reviews;
  },

  async deleteReview(reviewId) {
    if (!reviewId) return false;
    const firestore = this.getDb();
    if (firestore) {
      await firestore.collection(this.REVIEWS_COLLECTION).doc(reviewId).delete();
      return true;
    }
    return false;
  },

  async toggleReviewStatus(reviewId, status) {
    if (!reviewId) return false;
    const firestore = this.getDb();
    if (firestore) {
      await firestore.collection(this.REVIEWS_COLLECTION).doc(reviewId).update({ status: status });
      return true;
    }
    return false;
  }
};

window.ProductService = ProductService;
