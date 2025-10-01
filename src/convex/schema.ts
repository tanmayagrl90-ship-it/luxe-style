import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is the brought in by authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    products: defineTable({
      name: v.string(),
      description: v.string(),
      price: v.number(),
      originalPrice: v.optional(v.number()),
      category: v.string(),
      images: v.array(v.string()),
      featured: v.boolean(),
      inStock: v.boolean(),
    }).index("by_category", ["category"]),

    cart: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      quantity: v.number(),
      color: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_product", ["userId", "productId"]),

    wishlist: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_product", ["userId", "productId"]),

    recentlyViewed: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      viewedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_product", ["userId", "productId"]),

    orders: defineTable({
      userId: v.id("users"),
      items: v.array(v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })),
      total: v.number(),
      status: v.string(),
      shippingAddress: v.object({
        name: v.string(),
        address: v.string(),
        city: v.string(),
        postalCode: v.string(),
        country: v.string(),
      }),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;