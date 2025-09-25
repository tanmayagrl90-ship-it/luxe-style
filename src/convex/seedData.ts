import { mutation } from "./_generated/server";

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return { message: "Products already seeded" };
    }

    const products = [
      // Goggles
      {
        name: "Aviator Pro Goggles",
        description: "Premium aviator-style goggles with UV protection and anti-glare coating. Perfect for outdoor activities and fashion statements.",
        price: 2999,
        originalPrice: 4999,
        category: "goggles",
        images: ["/api/placeholder/400/400"],
        featured: true,
        inStock: true,
      },
      {
        name: "Sport Edition Goggles",
        description: "High-performance sports goggles with impact-resistant lenses and comfortable fit for active lifestyles.",
        price: 3499,
        originalPrice: 5499,
        category: "goggles",
        images: ["/api/placeholder/400/400"],
        featured: true,
        inStock: true,
      },
      {
        name: "Classic Round Goggles",
        description: "Timeless round-frame goggles that blend vintage charm with modern technology and superior comfort.",
        price: 2499,
        originalPrice: 3999,
        category: "goggles",
        images: ["/api/placeholder/400/400"],
        featured: false,
        inStock: true,
      },

      // Watches
      {
        name: "Classic Chronograph",
        description: "Elegant chronograph watch with precision movement, stainless steel case, and leather strap for the sophisticated gentleman.",
        price: 5999,
        originalPrice: 8999,
        category: "watches",
        images: ["/api/placeholder/400/400"],
        featured: true,
        inStock: true,
      },
      {
        name: "Digital Smart Watch",
        description: "Modern smartwatch with fitness tracking, notifications, and sleek design for the tech-savvy individual.",
        price: 4499,
        originalPrice: 6999,
        category: "watches",
        images: ["/api/placeholder/400/400"],
        featured: false,
        inStock: true,
      },
      {
        name: "Luxury Dress Watch",
        description: "Sophisticated dress watch with minimalist design, premium materials, and Swiss-inspired movement.",
        price: 7999,
        originalPrice: 12999,
        category: "watches",
        images: ["/api/placeholder/400/400"],
        featured: true,
        inStock: true,
      },

      // Belts
      {
        name: "Executive Leather Belt",
        description: "Premium genuine leather belt with polished buckle, perfect for business attire and formal occasions.",
        price: 1999,
        originalPrice: 2999,
        category: "belts",
        images: ["/api/placeholder/400/400"],
        featured: true,
        inStock: true,
      },
      {
        name: "Casual Canvas Belt",
        description: "Durable canvas belt with metal buckle, ideal for casual wear and outdoor activities.",
        price: 1299,
        originalPrice: 1999,
        category: "belts",
        images: ["/api/placeholder/400/400"],
        featured: false,
        inStock: true,
      },
      {
        name: "Designer Chain Belt",
        description: "Stylish chain belt with unique design elements, perfect for adding edge to any outfit.",
        price: 2499,
        originalPrice: 3999,
        category: "belts",
        images: ["/api/placeholder/400/400"],
        featured: false,
        inStock: true,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return { message: `Successfully seeded ${products.length} products` };
  },
});
