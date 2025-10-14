import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      price: v.number(),
      color: v.optional(v.string()),
      packaging: v.optional(v.string()),
    })),
    total: v.number(),
    shippingAddress: v.object({
      firstName: v.string(),
      lastName: v.string(),
      address1: v.string(),
      address2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      pin: v.string(),
      phone: v.string(),
    }),
    paymentMethod: v.optional(v.string()),
    discountApplied: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      items: args.items,
      total: args.total,
      status: "pending",
      shippingAddress: args.shippingAddress,
      paymentMethod: args.paymentMethod || "UPI",
      discountApplied: args.discountApplied,
    });
    
    return orderId;
  },
});

export const getUserOrders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return orders;
  },
});