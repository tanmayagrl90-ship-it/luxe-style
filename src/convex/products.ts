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

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
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