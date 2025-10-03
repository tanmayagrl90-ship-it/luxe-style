import { mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Public mutation: subscribe (dedupes by email)
export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();

    if (existing) {
      return { ok: true, already: true, id: existing._id };
    }

    const id = await ctx.db.insert("subscribers", {
      email: email.toLowerCase(),
      subscribedAt: Date.now(),
    });
    return { ok: true, id, already: false };
  },
});

// Internal query: list all subscribers
export const all = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("subscribers").collect();
    // Return minimal fields required for emailing
    return rows.map((r) => ({ email: r.email }));
  },
});
