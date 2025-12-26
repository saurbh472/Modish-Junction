/* ================= TRENDING PRODUCTS ================= */

const trendingProducts = [
  {
    id: "product-kurta-1",
    slug: "liva-embroidered-kurta-set",
    name: "Women Liva Embroidered Kurta Set with Dupatta",
    price: 3499,
    originalPrice: 4999,
    category: "trending",
    description:
      "Elegant Liva fabric kurta set with intricate embroidery and matching dupatta. Perfect for festive and casual occasions.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "./Images/Category/western-wear.jpg",
     "./Images/Category/western-wear.jpg",
      "./Images/Category/western-wear.jpg"
    ]
  },

  {
    id: "product-dress-1",
    slug: "cotton-floral-aline-dress",
    name: "Cotton Floral Print A-Line Dress",
    price: 1199,
    originalPrice: 1999,
    category: "trending",
    description:
      "Breathable cotton A-line dress with vibrant floral prints. Lightweight, stylish, and ideal for daily wear.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "./Images/Category/western-wear.jpg",
      "./Images/Category/western-wear.jpg",
      "./Images/Category/western-wear.jpg"
    ]
  },

  {
    id: "product-ethnic-1",
    slug: "silk-blend-embroidered-ethnic-set",
    name: "Silk Blend Embroidered Ethnic Set",
    price: 2499,
    originalPrice: 4999,
    category: "trending",
    description:
      "Premium silk blend ethnic set featuring rich embroidery. Designed for festive celebrations and special occasions.",
    sizes: ["M", "L", "XL"],
    images: [
      "./Images/Category/western-wear.jpg",
      "./Images/Category/western-wear.jpg",
      "./Images/Category/western-wear.jpg"
    ]
  },

  {
    id: "product-shawl-1",
    slug: "soft-knitted-warm-shawl",
    name: "Soft Knitted Warm Women Shawl",
    price: 2152,
    originalPrice: 2690,
    category: "trending",
    description:
      "Soft knitted shawl designed to keep you warm and stylish. Lightweight yet cozy for winter layering.",
    sizes: ["Free Size"],
    images: [
      "./Images/Category/western-wear.jpg",
      "./Images/Category/western-wear.jpg",
      "./Images/Category/western-wear.jpg"
    ]
  }
];

/* ================= EXPORT (GLOBAL) ================= */
// This makes it usable inside product.html
window.trendingProducts = trendingProducts;
