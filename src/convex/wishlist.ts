import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addToWishlist = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("wishlist", {
      userId: args.userId,
      productId: args.productId,
    });
  },
});

export const removeFromWishlist = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getWishlist = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (args.userId === null) return [];
    
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .collect();

    const result = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      result.push({
        _id: item._id,
        productId: item.productId,
        product,
      });
    }
    return result;
  },
});

export const isInWishlist = query({
  args: {
    userId: v.union(v.id("users"), v.null()),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    if (args.userId === null) return false;
    
    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId!).eq("productId", args.productId),
      )
      .unique();

    return !!existing;
  },
});
