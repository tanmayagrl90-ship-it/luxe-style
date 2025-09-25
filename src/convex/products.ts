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
    images: v.array(v.string()),
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