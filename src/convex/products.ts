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
      .order("desc") // Show newest products first so the last added item is visible at the top
      .collect();
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
    brand: v.optional(v.string()),
    images: v.array(v.string()),
    colors: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      featured: args.featured ?? false,
      inStock: args.inStock ?? true,
    });
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
    brand: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    colors: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Remove undefined keys so we only patch provided fields
    const toPatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) toPatch[k] = v;
    }
    if (Object.keys(toPatch).length === 0) return id;
    await ctx.db.patch(id, toPatch);
    return id;
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