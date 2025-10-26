import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const getProductsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();
  },
});

export const getFilteredProducts = query({
  args: {
    category: v.string(),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    brands: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .collect();

    // Filter by price
    if (args.minPrice !== undefined || args.maxPrice !== undefined) {
      products = products.filter((p) => {
        const price = p.price;
        if (args.minPrice !== undefined && price < args.minPrice) return false;
        if (args.maxPrice !== undefined && price > args.maxPrice) return false;
        return true;
      });
    }

    // Filter by brands
    if (args.brands && args.brands.length > 0) {
      products = products.filter((p) => p.brand && args.brands!.includes(p.brand));
    }

    // Filter by colors
    if (args.colors && args.colors.length > 0) {
      products = products.filter((p) => {
        if (!p.colors) return false;
        return p.colors.some((c) => args.colors!.includes(c));
      });
    }

    return products;
  },
});

export const getFeaturedProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("featured"), true))
      .collect();
  },
});

export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    images: v.array(v.string()),
    videos: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    brand: v.optional(v.string()),
    featured: v.boolean(),
    inStock: v.boolean(),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      price: args.price,
      originalPrice: args.originalPrice,
      category: args.category,
      images: args.images,
      videos: args.videos,
      colors: args.colors,
      brand: args.brand,
      featured: args.featured,
      inStock: args.inStock,
    });
    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    brand: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const cleanupWatchesKeepGuess = mutation({
  args: {},
  handler: async (ctx) => {
    const watches = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", "watches"))
      .collect();

    let removed = 0;
    for (const p of watches) {
      if (p.name.toLowerCase() !== "guess watch") {
        await ctx.db.delete(p._id);
        removed++;
      }
    }
    return { removed };
  },
});

export const cleanupGoggles = mutation({
  args: {},
  handler: async (ctx) => {
    const goggles = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", "goggles"))
      .collect();

    let removed = 0;
    for (const p of goggles) {
      await ctx.db.delete(p._id);
      removed++;
    }
    return { removed };
  },
});

export const cleanupGogglesKeepTomford = mutation({
  args: {},
  handler: async (ctx) => {
    const goggles = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", "goggles"))
      .collect();

    let removed = 0;
    for (const p of goggles) {
      if (p.name.toLowerCase() !== "tomford premium") {
        await ctx.db.delete(p._id);
        removed++;
      }
    }
    return { removed };
  },
});

export const cleanupBeltsKeepCoach = mutation({
  args: {},
  handler: async (ctx) => {
    const belts = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", "belts"))
      .collect();

    let removed = 0;
    for (const p of belts) {
      if (p.name.toLowerCase() !== "coach belt") {
        await ctx.db.delete(p._id);
        removed++;
      }
    }
    return { removed };
  },
});

export const getProductsByBrand = query({
  args: { brand: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_brand", (q) => q.eq("brand", args.brand))
      .order("desc")
      .collect();
  },
});

export const getAllBrands = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  },
});

export const getProductCountByCategory = query({
  args: {},
  handler: async (ctx) => {
    const allProducts = await ctx.db.query("products").collect();
    
    const categoryCounts: Record<string, number> = {};
    
    allProducts.forEach(product => {
      const category = product.category || "uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
      total: allProducts.length,
      byCategory: categoryCounts,
      products: allProducts.map(p => ({
        name: p.name,
        category: p.category,
        brand: p.brand
      }))
    };
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const searchProducts = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm || args.searchTerm.trim().length === 0) {
      return [];
    }

    const allProducts = await ctx.db.query("products").collect();
    const searchLower = args.searchTerm.toLowerCase().trim();
    
    // Helper function to calculate relevance score
    const calculateScore = (product: any) => {
      let score = 0;
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const brand = (product.brand || "").toLowerCase();
      const description = product.description.toLowerCase();
      
      // Exact match in name (highest priority)
      if (name === searchLower) score += 100;
      
      // Name starts with search term
      if (name.startsWith(searchLower)) score += 50;
      
      // Name contains search term
      if (name.includes(searchLower)) score += 30;
      
      // Category exact match
      if (category === searchLower) score += 40;
      
      // Category contains search term
      if (category.includes(searchLower)) score += 20;
      
      // Brand exact match
      if (brand === searchLower) score += 35;
      
      // Brand contains search term
      if (brand.includes(searchLower)) score += 15;
      
      // Description contains search term
      if (description.includes(searchLower)) score += 10;
      
      // Fuzzy matching for common misspellings
      const fuzzyMatches: Record<string, string[]> = {
        "goggles": ["gogles", "gogle", "googles", "goggle", "sunglasses", "sunglass"],
        "watches": ["watch", "waches", "watche", "wach"],
        "belts": ["belt", "blet", "beltt"],
        "tomford": ["tom ford", "tomfrd", "tom", "ford"],
        "guess": ["gues", "gess", "guees"],
        "coach": ["couch", "coch", "koach"],
      };
      
      for (const [correct, variants] of Object.entries(fuzzyMatches)) {
        if (variants.some(v => searchLower.includes(v))) {
          if (name.includes(correct) || category.includes(correct) || brand.includes(correct)) {
            score += 25;
          }
        }
      }
      
      return score;
    };
    
    // Score and filter products
    const scoredProducts = allProducts
      .map(product => ({
        product,
        score: calculateScore(product)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
    
    return scoredProducts;
  },
});