/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as products from "../products.js";
import type * as recentlyViewed from "../recentlyViewed.js";
import type * as seedData from "../seedData.js";
import type * as storage from "../storage.js";
import type * as subscribers from "../subscribers.js";
import type * as users from "../users.js";
import type * as wishlist from "../wishlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  cart: typeof cart;
  emails: typeof emails;
  http: typeof http;
  products: typeof products;
  recentlyViewed: typeof recentlyViewed;
  seedData: typeof seedData;
  storage: typeof storage;
  subscribers: typeof subscribers;
  users: typeof users;
  wishlist: typeof wishlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
