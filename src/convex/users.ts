import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

// New query to get all users with their activity data
export const getAllUsersWithActivity = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        // Get recently viewed products
        const recentlyViewed = await ctx.db
          .query("recentlyViewed")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .order("desc")
          .take(50);

        // Get orders
        const orders = await ctx.db
          .query("orders")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        // Calculate most interested category
        const categoryCount: Record<string, number> = {};
        for (const view of recentlyViewed) {
          const product = await ctx.db.get(view.productId);
          if (product) {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
          }
        }

        const mostInterestedCategory = Object.entries(categoryCount).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "None";

        // Get latest order for address
        const latestOrder = orders.sort((a, b) => b._creationTime - a._creationTime)[0];

        // Get cart items to show active shoppers
        const cartItems = await ctx.db
          .query("cart")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        return {
          _id: user._id,
          email: user.email || "Guest User",
          name: user.name || (latestOrder?.shippingAddress ? `${latestOrder.shippingAddress.firstName} ${latestOrder.shippingAddress.lastName}` : "N/A"),
          isAnonymous: user.isAnonymous || false,
          totalOrders: orders.length,
          cartItemCount: cartItems.length,
          mostInterestedCategory,
          lastActive: recentlyViewed[0]?.viewedAt || user._creationTime,
          shippingAddress: latestOrder?.shippingAddress || null,
          _creationTime: user._creationTime,
        };
      })
    );

    return usersWithActivity.sort((a, b) => b.lastActive - a.lastActive);
  },
});