import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const trackView = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId),
      )
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { viewedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("recentlyViewed", {
      userId: args.userId,
      productId: args.productId,
      viewedAt: now,
    });
  },
});

export const getRecentlyViewed = query({
  args: { 
    userId: v.union(v.id("users"), v.null()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.userId === null) return [];
    
    const limit = args.limit ?? 8;
    const items = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .order("desc")
      .take(limit);

    const result = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      result.push({
        _id: item._id,
        productId: item.productId,
        product,
        viewedAt: item.viewedAt,
      });
    }
    return result;
  },
});
