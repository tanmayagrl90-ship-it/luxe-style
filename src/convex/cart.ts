import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.optional(v.number()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const qty = args.quantity ?? 1;

    const existing = await ctx.db
      .query("cart")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: (existing.quantity ?? 0) + qty,
        ...(args.color ? { color: args.color } : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("cart", {
      userId: args.userId,
      productId: args.productId,
      quantity: qty,
      color: args.color,
    });
  },
});

export const getCartCount = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (args.userId === null) return 0;
    const items = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .collect();
    return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  },
});

export const getCartItems = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (args.userId === null) return [];
    const items = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .collect();

    const result = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      result.push({
        _id: item._id,
        quantity: item.quantity ?? 1,
        productId: item.productId,
        color: item.color,
        product,
      });
    }
    return result;
  },
});

export const setCartItemQuantity = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cart")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId),
      )
      .unique();

    // If quantity <= 0, delete existing row (if any)
    if (args.quantity <= 0) {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
      return null;
    }

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: args.quantity });
      return existing._id;
    }

    // If not existing and quantity > 0, insert a new row (no color by default)
    return await ctx.db.insert("cart", {
      userId: args.userId,
      productId: args.productId,
      quantity: args.quantity,
    });
  },
});