// ============================================
// MODISH JUNCTION - PRODUCT DATABASE
// File: data/products.js
// Purpose: Complete product catalog with all details
// ============================================

const PRODUCTS_DATA = [
    // ========== ETHNIC SETS ==========
    {
        id: 1,
        name: "Embroidered Silk Ethnic Set with Dupatta",
        category: "ethnic-sets",
        occasion: ["wedding", "festive"],
        price: 3499,
        originalPrice: 4999,
        discount: 30,
        image: "🌟",
        description: "Luxurious silk ethnic set with intricate embroidery work. Includes matching dupatta with golden border.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Royal Blue", "Maroon", "Emerald Green", "Wine Red"],
        fabric: "Pure Silk",
        inStock: true,
        stockCount: 15,
        rating: 4.8,
        reviews: 342
    },
    {
        id: 2,
        name: "Cotton Printed Kurta Set with Palazzo",
        category: "ethnic-sets",
        occasion: ["casual", "office", "festive"],
        price: 1499,
        originalPrice: 2999,
        discount: 50,
        image: "🎨",
        description: "Comfortable cotton kurta with beautiful floral prints. Paired with matching palazzo pants.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Pink", "Yellow", "Sky Blue", "Mint Green"],
        fabric: "100% Cotton",
        inStock: true,
        stockCount: 28,
        rating: 4.6,
        reviews: 567
    },
    {
        id: 3,
        name: "Festive Anarkali Suit Set",
        category: "ethnic-sets",
        occasion: ["wedding", "festive", "party"],
        price: 2249,
        originalPrice: 4999,
        discount: 55,
        image: "✨",
        description: "Elegant Anarkali suit with beautiful embellishments. Perfect for festive occasions.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Red", "Pink", "Navy Blue", "Purple"],
        fabric: "Georgette",
        inStock: true,
        stockCount: 12,
        rating: 4.7,
        reviews: 289
    },

    // ========== DRESSES ==========
    {
        id: 4,
        name: "Cotton Floral Print A-Line Dress",
        category: "dresses",
        occasion: ["casual", "date-night"],
        price: 1199,
        originalPrice: 1999,
        discount: 40,
        image: "🌺",
        description: "Beautiful A-line dress with vibrant floral prints. Perfect for summer outings.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Floral Pink", "Floral Blue", "Floral Yellow"],
        fabric: "Cotton",
        inStock: true,
        stockCount: 35,
        rating: 4.5,
        reviews: 423
    },
    {
        id: 5,
        name: "Embellished Party Wear Gown",
        category: "dresses",
        occasion: ["party", "wedding"],
        price: 2999,
        originalPrice: 4999,
        discount: 40,
        image: "🌹",
        description: "Stunning party gown with intricate embellishments. Be the star of every party.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Wine", "Royal Blue", "Gold"],
        fabric: "Georgette with Sequin Work",
        inStock: true,
        stockCount: 8,
        rating: 4.9,
        reviews: 156
    },
    {
        id: 6,
        name: "Cotton Maxi Dress",
        category: "dresses",
        occasion: ["casual", "date-night"],
        price: 999,
        originalPrice: 2499,
        discount: 60,
        image: "🌸",
        description: "Comfortable maxi dress perfect for casual outings. Lightweight and breathable.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Peach", "Lavender", "Mint"],
        fabric: "Soft Cotton",
        inStock: true,
        stockCount: 42,
        rating: 4.4,
        reviews: 678
    },

    // ========== CO-ORD SETS ==========
    {
        id: 7,
        name: "Floral Co-ord Set - Summer Collection",
        category: "coords",
        occasion: ["casual", "office"],
        price: 1099,
        originalPrice: 1999,
        discount: 45,
        image: "🦋",
        description: "Trendy co-ord set with matching top and bottom. Perfect for summer styling.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Floral Pink", "Floral Blue", "Tropical Print"],
        fabric: "Cotton Linen Blend",
        inStock: true,
        stockCount: 25,
        rating: 4.6,
        reviews: 234
    },
    {
        id: 8,
        name: "Printed Co-ord Set with Pants",
        category: "coords",
        occasion: ["casual", "party"],
        price: 1299,
        originalPrice: 2499,
        discount: 48,
        image: "🌼",
        description: "Stylish printed co-ord with comfortable wide-leg pants. Modern and chic.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black Print", "Beige Print", "Navy Print"],
        fabric: "Rayon",
        inStock: true,
        stockCount: 18,
        rating: 4.7,
        reviews: 189
    },

    // ========== WESTERN WEAR ==========
    {
        id: 9,
        name: "Designer Embroidered Kurti",
        category: "western-wear",
        occasion: ["casual", "office", "festive"],
        price: 1749,
        originalPrice: 4999,
        discount: 65,
        image: "💎",
        description: "Beautiful designer kurti with elegant embroidery work. Versatile styling option.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Pink", "Blue", "Yellow"],
        fabric: "Cotton",
        inStock: true,
        stockCount: 32,
        rating: 4.8,
        reviews: 445
    },
    {
        id: 10,
        name: "Rayon Straight Kurti - Pack of 2",
        category: "western-wear",
        occasion: ["casual", "office"],
        price: 1649,
        originalPrice: 2999,
        discount: 45,
        image: "🎀",
        description: "Combo pack of 2 comfortable straight kurtis. Perfect for everyday wear.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Multi Color Pack"],
        fabric: "Rayon",
        inStock: true,
        stockCount: 20,
        rating: 4.5,
        reviews: 567
    },

    // ========== ACCESSORIES ==========
    {
        id: 11,
        name: "Soft Knitted Warm Women Shawl",
        category: "accessories",
        occasion: ["casual", "office", "festive"],
        price: 2152,
        originalPrice: 2690,
        discount: 20,
        image: "🧶",
        description: "Premium quality warm shawl with beautiful knit pattern. Perfect for winter.",
        sizes: ["One Size"],
        colors: ["Beige", "Grey", "Navy", "Burgundy"],
        fabric: "Wool Blend",
        inStock: true,
        stockCount: 15,
        rating: 4.9,
        reviews: 234
    },
    {
        id: 12,
        name: "Ethnic Dupatta Collection",
        category: "accessories",
        occasion: ["wedding", "festive"],
        price: 449,
        originalPrice: 999,
        discount: 55,
        image: "🎭",
        description: "Beautiful ethnic dupatta with intricate border work. Completes your ethnic look.",
        sizes: ["One Size"],
        colors: ["Red", "Pink", "Blue", "Green", "Orange"],
        fabric: "Chiffon",
        inStock: true,
        stockCount: 48,
        rating: 4.3,
        reviews: 189
    },

    // ========== SAREES ==========
    {
        id: 13,
        name: "Georgette Saree with Blouse",
        category: "sarees",
        occasion: ["wedding", "festive", "party"],
        price: 1999,
        originalPrice: 3999,
        discount: 50,
        image: "💫",
        description: "Elegant georgette saree with matching blouse piece. Perfect for special occasions.",
        sizes: ["One Size"],
        colors: ["Red", "Teal", "Purple", "Peach"],
        fabric: "Georgette",
        inStock: true,
        stockCount: 10,
        rating: 4.7,
        reviews: 312
    },

    // ========== CLEARANCE ITEMS ==========
    {
        id: 14,
        name: "Winter Shawl Collection",
        category: "accessories",
        occasion: ["casual", "office"],
        price: 599,
        originalPrice: 1999,
        discount: 70,
        image: "🧣",
        description: "Clearance sale! Warm and cozy winter shawls in various colors.",
        sizes: ["One Size"],
        colors: ["Multicolor"],
        fabric: "Acrylic Wool Blend",
        inStock: true,
        stockCount: 5,
        rating: 4.2,
        reviews: 89
    },
    {
        id: 15,
        name: "Casual Tunic Tops - Set of 3",
        category: "western-wear",
        occasion: ["casual"],
        price: 899,
        originalPrice: 2599,
        discount: 65,
        image: "👚",
        description: "Pack of 3 casual tunic tops. Comfortable and stylish for everyday wear.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Assorted Colors"],
        fabric: "Cotton Blend",
        inStock: true,
        stockCount: 12,
        rating: 4.1,
        reviews: 156
    },
    {
        id: 16,
        name: "Night Suit Combo Pack",
        category: "loungewear",
        occasion: ["casual"],
        price: 799,
        originalPrice: 1999,
        discount: 60,
        image: "🌙",
        description: "Comfortable night suit set. Soft fabric for a good night's sleep.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Pink", "Blue", "Grey"],
        fabric: "Cotton",
        inStock: true,
        stockCount: 18,
        rating: 4.4,
        reviews: 234
    },
    {
        id: 17,
        name: "Cotton Blend Churidar Set",
        category: "ethnic-sets",
        occasion: ["casual", "festive"],
        price: 1249,
        originalPrice: 2499,
        discount: 50,
        image: "🌿",
        description: "Classic churidar set in soft cotton blend. Traditional and comfortable.",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Black", "Pink", "Blue"],
        fabric: "Cotton Blend",
        inStock: true,
        stockCount: 22,
        rating: 4.5,
        reviews: 298
    }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get product by ID
function getProductById(productId) {
    return PRODUCTS_DATA.find(product => product.id === productId);
}

// Get products by category
function getProductsByCategory(category) {
    return PRODUCTS_DATA.filter(product => product.category === category);
}

// Get products by occasion
function getProductsByOccasion(occasion) {
    return PRODUCTS_DATA.filter(product => 
        product.occasion.includes(occasion)
    );
}

// Get products on sale (discount > 40%)
function getSaleProducts() {
    return PRODUCTS_DATA.filter(product => product.discount >= 40);
}

// Get trending products (rating > 4.5)
function getTrendingProducts() {
    return PRODUCTS_DATA.filter(product => product.rating >= 4.5);
}

// Search products by name
function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return PRODUCTS_DATA.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
}

// ============================================
// EXPORT FOR USE IN OTHER FILES
// ============================================

// Make data available globally
window.PRODUCTS_DATA = PRODUCTS_DATA;
window.ProductUtils = {
    getProductById,
    getProductsByCategory,
    getProductsByOccasion,
    getSaleProducts,
    getTrendingProducts,
    searchProducts
};

console.log('✅ Products Database Loaded:', PRODUCTS_DATA.length, 'products');