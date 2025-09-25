import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.optional(v.number()),
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
      await ctx.db.patch(existing._id, { quantity: existing.quantity + qty });
      return existing._id;
    }

    return await ctx.db.insert("cart", {
      userId: args.userId,
      productId: args.productId,
      quantity: qty,
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
