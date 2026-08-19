// ============================================
// MODISH JUNCTION - DATA MIGRATION SCRIPT
// File: js/migrate-data.js
// Purpose: Seed & import all existing hardcoded products into Firestore
// ============================================

const INITIAL_MIGRATION_PRODUCTS = [
  // 1. WESTERN WEAR - DRESSES
  {
    id: "product-dress-1",
    slug: "floral-summer-dress",
    name: "Floral Summer Dress - Lightweight & Breezy",
    mainCategory: "western",
    subCategory: "dresses",
    subFilter: "summer",
    description: "A lightweight floral summer dress designed for warm days, casual outings, and vacation wear.",
    price: 1299,
    originalPrice: 2199,
    discount: 40,
    images: ["../Images/Category/western-wear.jpg", "../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 25,
    isTrendingHome: true,
    isSale: false
  },
  {
    id: "product-dress-2",
    slug: "elegant-bodycon-dress",
    name: "Elegant Bodycon Dress - Evening Wear",
    mainCategory: "western",
    subCategory: "dresses",
    subFilter: "winter",
    description: "A figure-hugging bodycon dress crafted for parties, dinners, and elegant evening occasions.",
    price: 1499,
    originalPrice: 2999,
    discount: 50,
    images: ["../Images/Category/western-wear.jpg", "../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L"],
    inStock: true,
    stockCount: 18,
    isTrendingHome: true,
    isSale: true
  },
  {
    id: "product-dress-3",
    slug: "a-line-midi-dress",
    name: "A-Line Midi Dress - Classic Fit",
    mainCategory: "western",
    subCategory: "dresses",
    subFilter: "summer",
    description: "A timeless A-line midi dress with a flattering silhouette suitable for everyday elegance.",
    price: 1099,
    originalPrice: 1699,
    discount: 35,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 30,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-dress-4",
    slug: "wrap-style-midi-dress",
    name: "Wrap Style Midi Dress - Chic Look",
    mainCategory: "western",
    subCategory: "dresses",
    subFilter: "winter",
    description: "A stylish wrap dress offering comfort, elegance, and a flattering adjustable fit.",
    price: 1199,
    originalPrice: 1899,
    discount: 35,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L"],
    inStock: true,
    stockCount: 15,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-dress-5",
    slug: "pleated-skater-dress",
    name: "Pleated Skater Dress - Trendy Style",
    mainCategory: "western",
    subCategory: "dresses",
    subFilter: "summer",
    description: "A playful pleated skater dress that brings movement, comfort, and modern style together.",
    price: 999,
    originalPrice: 1599,
    discount: 35,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 22,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-dress-6",
    slug: "maxi-dress-flowy-fit",
    name: "Maxi Dress - Flowy Comfortable Fit",
    mainCategory: "western",
    subCategory: "dresses",
    subFilter: "winter",
    description: "A flowy maxi dress with a relaxed silhouette, perfect for all-day comfort and style.",
    price: 1399,
    originalPrice: 2299,
    discount: 35,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 14,
    isTrendingHome: false,
    isSale: false
  },

  // 2. WESTERN WEAR - TOPS & TEES
  {
    id: "product-toptees-1",
    slug: "cotton-round-neck-tee",
    name: "Cotton Casual Round Neck Tee - Comfort Fit",
    mainCategory: "western",
    subCategory: "tops-tees",
    description: "Soft cotton round neck tee designed for everyday comfort and casual styling.",
    price: 699,
    originalPrice: 999,
    discount: 30,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 40,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-toptees-2",
    slug: "ribbed-crop-top",
    name: "Ribbed Knit Crop Top - Chic Style",
    mainCategory: "western",
    subCategory: "tops-tees",
    description: "Trendy ribbed crop top with a snug fit, ideal for pairing with high-waist jeans or skirts.",
    price: 599,
    originalPrice: 899,
    discount: 33,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    stockCount: 28,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-toptees-3",
    slug: "oversized-graphic-tee",
    name: "Oversized Graphic Printed T-Shirt",
    mainCategory: "western",
    subCategory: "tops-tees",
    description: "Streetwear aesthetic oversized t-shirt with premium drop-shoulder fit.",
    price: 799,
    originalPrice: 1299,
    discount: 38,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    stockCount: 35,
    isTrendingHome: false,
    isSale: false
  },

  // 3. WESTERN WEAR - JEANS & PANTS
  {
    id: "product-jeans-1",
    slug: "high-waist-skinny-jeans",
    name: "High-Waist Skinny Fit Jeans - Dark Blue",
    mainCategory: "western",
    subCategory: "jeans-pants",
    description: "Stylish high-waist skinny fit jeans with a flattering silhouette and stretch comfort.",
    price: 1499,
    originalPrice: 2499,
    discount: 40,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["26", "28", "30", "32", "34"],
    inStock: true,
    stockCount: 20,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-jeans-2",
    slug: "wide-leg-cargo-pants",
    name: "Wide-Leg High-Rise Cargo Pants",
    mainCategory: "western",
    subCategory: "jeans-pants",
    description: "Trendy utility cargo pants with multi-pockets and a comfortable relaxed wide-leg fit.",
    price: 1699,
    originalPrice: 2799,
    discount: 39,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["28", "30", "32", "34"],
    inStock: true,
    stockCount: 18,
    isTrendingHome: false,
    isSale: false
  },

  // 4. WESTERN WEAR - LOUNGEWEAR
  {
    id: "product-loungewear-1",
    slug: "cotton-night-suit-floral",
    name: "Cotton Night Suit Set - Floral Print",
    mainCategory: "western",
    subCategory: "loungewear",
    description: "Soft and breathable cotton night suit set with a beautiful floral print for all-night comfort.",
    price: 899,
    originalPrice: 1649,
    discount: 45,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 25,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-loungewear-2",
    slug: "satin-silk-robe-set",
    name: "Luxury Satin Silk Robe & Pajama Set",
    mainCategory: "western",
    subCategory: "loungewear",
    description: "Ultra-soft satin silk nightwear robe set designed for pure luxury and relaxation.",
    price: 1299,
    originalPrice: 2499,
    discount: 48,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 12,
    isTrendingHome: false,
    isSale: false
  },

  // 5. WESTERN WEAR - WINTER WEAR
  {
    id: "product-winterwear-1",
    slug: "wool-blend-trench-coat",
    name: "Wool Blend Trench Coat - Classic Style",
    mainCategory: "western",
    subCategory: "winter-wear",
    description: "Premium wool blend trench coat with a timeless silhouette. Perfect for cold weather layering with elegance.",
    price: 3249,
    originalPrice: 4999,
    discount: 35,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 10,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-winterwear-2",
    slug: "soft-knitted-warm-shawl",
    name: "Soft Knitted Warm Women Shawl",
    mainCategory: "western",
    subCategory: "winter-wear",
    description: "Cozy and warm knitted shawl for winter evenings and festive gatherings.",
    price: 2152,
    originalPrice: 2690,
    discount: 20,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["Free Size"],
    inStock: true,
    stockCount: 15,
    isTrendingHome: true,
    isSale: false
  },

  // 6. WESTERN WEAR - THRIFT / SHIRTS
  {
    id: "product-thriftcollection-1",
    slug: "vintage-denim-jacket",
    name: "Vintage Oversized Denim Jacket – 90s Style",
    mainCategory: "western",
    subCategory: "thrift",
    description: "Authentic oversized denim jacket sourced from a 90s vintage collection. Timeless grunge vibes.",
    price: 1199,
    originalPrice: 2999,
    discount: 60,
    images: ["../Images/Category/co-ords-set.png"],
    sizes: ["M", "L", "XL"],
    inStock: true,
    stockCount: 6,
    isTrendingHome: false,
    isSale: true
  },
  {
    id: "product-thriftcollection-2",
    slug: "retro-corduroy-shirt",
    name: "Retro Corduroy Button-Down Shirt",
    mainCategory: "western",
    subCategory: "thrift",
    description: "Vintage corduroy button-down shirt with warm earthy tones and durable fabric.",
    price: 899,
    originalPrice: 1999,
    discount: 55,
    images: ["../Images/Category/co-ords-set.png"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 8,
    isTrendingHome: false,
    isSale: false
  },

  // 7. ETHNIC WEAR - 3 PIECE SUITS
  {
    id: "product-3piece-1",
    slug: "embroidered-3-piece-suit",
    name: "Premium Embroidered 3 Piece Suit – Festive Wear",
    mainCategory: "ethnic",
    subCategory: "3-piece-suit",
    description: "Elegant embroidered 3 piece suit featuring matching top, bottom, and shrug. Perfect for festive and special occasions.",
    price: 2499,
    originalPrice: 3899,
    discount: 35,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 15,
    isTrendingHome: false,
    isSale: false,
    isMustHave: true
  },
  {
    id: "product-3piece-2",
    slug: "georgette-3-piece-suit",
    name: "Soft Georgette 3 Piece Suit – Stylish & Comfortable",
    mainCategory: "ethnic",
    subCategory: "3-piece-suit",
    description: "Lightweight georgette 3 piece suit designed for all-day comfort with a stylish modern silhouette.",
    price: 2199,
    originalPrice: 3699,
    discount: 40,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L"],
    inStock: true,
    stockCount: 12,
    isTrendingHome: false,
    isSale: false,
    isMustHave: true
  },
  {
    id: "product-3piece-3",
    slug: "luxury-party-3-piece-suit",
    name: "Luxury Party Wear 3 Piece Suit – Premium Fabric",
    mainCategory: "ethnic",
    subCategory: "3-piece-suit",
    description: "Premium party wear 3 piece suit crafted with rich fabric and elegant finishing for a royal look.",
    price: 2799,
    originalPrice: 5499,
    discount: 50,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["M", "L", "XL"],
    inStock: true,
    stockCount: 9,
    isTrendingHome: false,
    isSale: true,
    isMustHave: true
  },

  // 8. ETHNIC WEAR - CO-ORDS
  {
    id: "product-coords-1",
    slug: "printed-co-ord-set",
    name: "Printed Ethnic Co-ord Set – Summer Edition",
    mainCategory: "ethnic",
    subCategory: "co-ords",
    description: "Lightweight printed co-ord set perfect for festive outings, casual meetups, and daily elegance.",
    price: 1499,
    originalPrice: 2199,
    discount: 32,
    images: ["../Images/Category/co-ords-set.png"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 20,
    isTrendingHome: false,
    isSale: false
  },
  {
    id: "product-coords-2",
    slug: "cotton-flair-coord-set",
    name: "Cotton Flair Ethnic Co-ord Set with Belt",
    mainCategory: "ethnic",
    subCategory: "co-ords",
    description: "Breathable cotton fabric with contemporary ethnic motifs and matching tie-up belt.",
    price: 1799,
    originalPrice: 2699,
    discount: 33,
    images: ["../Images/Category/co-ords-set.png"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 16,
    isTrendingHome: false,
    isSale: false
  },

  // 9. ETHNIC WEAR - SHORT KURTIS
  {
    id: "product-kurtis-1",
    slug: "printed-cotton-short-kurti",
    name: "Printed Cotton Short Kurti – Daily Wear",
    mainCategory: "ethnic",
    subCategory: "short-kurtis",
    description: "Comfortable cotton short kurti perfect for daily wear, office, and casual college outings.",
    price: 599,
    originalPrice: 899,
    discount: 33,
    images: ["../Images/Category/co-ords-set.png"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 30,
    isTrendingHome: false,
    isSale: false,
    isMustHave: true
  },
  {
    id: "product-kurtis-2",
    slug: "chikankari-short-kurti",
    name: "Lucknowi Chikankari Handcrafted Short Kurti",
    mainCategory: "ethnic",
    subCategory: "short-kurtis",
    description: "Exquisite Lucknowi chikankari embroidery on soft breathable georgette fabric.",
    price: 899,
    originalPrice: 1499,
    discount: 40,
    images: ["../Images/Category/co-ords-set.png"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    stockCount: 25,
    isTrendingHome: false,
    isSale: false,
    isMustHave: true
  },

  // 10. SALE & CLEARANCE SPECIALS
  {
    id: "product-sale-1",
    slug: "premium-silk-ethnic-set",
    name: "Premium Silk Ethnic Set – Clearance Special",
    mainCategory: "sale",
    subCategory: "sale",
    description: "Luxury silk ethnic set available at an unbeatable clearance price.",
    price: 1499,
    originalPrice: 4999,
    discount: 70,
    images: ["../Images/Category/Ethnic-wear-img.png"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 5,
    isTrendingHome: false,
    isSale: true
  },
  {
    id: "product-sale-2",
    slug: "designer-anarkali-suit-sale",
    name: "Designer Embroidered Anarkali Suit – 60% OFF",
    mainCategory: "sale",
    subCategory: "sale",
    description: "Heavy designer festive suit set with intricate mirror and thread work.",
    price: 1999,
    originalPrice: 4999,
    discount: 60,
    images: ["../Images/Category/Ethnic-wear-img.png"],
    sizes: ["M", "L", "XL"],
    inStock: true,
    stockCount: 7,
    isTrendingHome: false,
    isSale: true
  },

  // 11. HOME TRENDING SPECIALS
  {
    id: "product-kurta-1",
    slug: "liva-embroidered-kurta-set",
    name: "Women Liva Embroidered Kurta Set with Dupatta",
    mainCategory: "ethnic",
    subCategory: "3-piece-suit",
    description: "Elegant Liva fabric kurta set with intricate embroidery and matching dupatta. Perfect for festive occasions.",
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 15,
    isTrendingHome: true,
    isSale: false
  },
  {
    id: "product-ethnic-1",
    slug: "silk-blend-embroidered-ethnic-set",
    name: "Silk Blend Embroidered Ethnic Set",
    mainCategory: "ethnic",
    subCategory: "co-ords",
    description: "Luxurious silk blend ethnic set featuring golden embellishments and comfortable fit.",
    price: 2499,
    originalPrice: 4999,
    discount: 50,
    images: ["../Images/Category/western-wear.jpg"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockCount: 14,
    isTrendingHome: true,
    isSale: true
  }
];

// Migration Runner Function
async function migrateInitialProductsToFirebase(progressCallback) {
  const firestore = ProductService.getDb();
  if (!firestore) {
    throw new Error("Firebase Firestore is not initialized. Please check your configuration.");
  }

  let successCount = 0;
  let skippedCount = 0;
  const total = INITIAL_MIGRATION_PRODUCTS.length;

  for (let i = 0; i < total; i++) {
    const item = INITIAL_MIGRATION_PRODUCTS[i];
    try {
      if (progressCallback) {
        progressCallback(i + 1, total, item.name);
      }

      // Check if item with this slug or id already exists
      const existing = await firestore.collection('products')
        .where('slug', '==', item.slug)
        .limit(1)
        .get();

      if (existing.empty) {
        const docRef = await firestore.collection('products').add(item);
        await docRef.update({ id: docRef.id });
        successCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      console.error(`Error migrating item "${item.name}":`, err);
    }
  }

  // Clear local cache to force refresh
  localStorage.removeItem('mj_products_cache');

  return {
    total: total,
    migrated: successCount,
    alreadyExisted: skippedCount
  };
}

window.INITIAL_MIGRATION_PRODUCTS = INITIAL_MIGRATION_PRODUCTS;
window.migrateInitialProductsToFirebase = migrateInitialProductsToFirebase;
