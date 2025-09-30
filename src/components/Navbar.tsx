import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, User, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add: thin announcement bar content text
const ANNOUNCEMENT_TEXT = "Use LUXE150 to get discount";

// Helper: build repeating marquee-like row with centered white dot separators
function AnnouncementRow() {
  // Increase horizontal padding and gap between segments so there's more space after "discount"
  const segment =
    "flex items-center gap-4 px-4 sm:px-6 whitespace-nowrap"; // UPDATED: larger gap/px for more separation

  return (
    <div className="flex items-center justify-center text-[10px] sm:text-xs tracking-wide">
      <div className="flex items-center overflow-hidden">
        <div className={segment}>
          <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
          <span>Use LUXE150 to get discount</span>
        </div>
        <div className={segment}>
          <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
          <span>Use LUXE150 to get discount</span>
        </div>
        <div className={segment}>
          <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
          <span>Use LUXE150 to get discount</span>
        </div>
        <div className={segment}>
          <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
          <span>Use LUXE150 to get discount</span>
        </div>
        <div className={segment}>
          <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
          <span>Use LUXE150 to get discount</span>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  // Add: admin visibility check
  const allowedEmails = new Set<string>(["vidhigadgets@gmail.com"]);
  const isAuthorizedAdmin =
    !!isAuthenticated &&
    !!user &&
    (((user.role as string | undefined) === "admin") ||
      (user.email ? allowedEmails.has(user.email) : false));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Add: mounted flag to avoid portal DOM errors during route transitions
  const [mounted, setMounted] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"review" | "details">("review");
  const [details, setDetails] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    // Add optional address2 (Apartment / suite)
    address2: "", // NEW: optional second address line
    city: "",
    state: "",
    pin: "",
    phone: "",
  });

  // ADD: promo code state and derived helpers
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    return () => {
      setIsCartOpen(false);
      setIsMenuOpen(false);
      // Reset step on unmount
      setCheckoutStep("review");
    };
  }, []);

  // Add live cart count
  const cartCount = useQuery(api.cart.getCartCount, {
    userId: user?._id ?? null,
  });

  // Cart items for drawer
  const cartItems = useQuery(api.cart.getCartItems, { userId: user?._id ?? null });
  const cartItemCount = (cartItems ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0);

  // Add: auto-remove promo if cart becomes ineligible (< 2 items)
  useEffect(() => {
    if (cartItemCount < 2 && appliedDiscount > 0) {
      setAppliedDiscount(0);
      setPromoCode("");
    }
  }, [cartItemCount, appliedDiscount]);

  // Add mutation for updating cart quantities
  const setCartItemQuantity = useMutation(api.cart.setCartItemQuantity);

  // Estimated total for display in the cart panel
  const estimatedTotal =
    (cartItems ?? []).reduce((sum, item) => sum + (item.product.price ?? 0) * (item.quantity ?? 1), 0);

  const discountedTotal = Math.max(0, estimatedTotal - appliedDiscount);

  const categories = [
    { name: "Goggles", href: "/category/goggles" },
    { name: "Watches", href: "/category/watches" },
    { name: "Belts", href: "/category/belts" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 left-0 right-0 z-50 bg-black text-white border-b border-white/10"
    >
      {/* MOVE: Main nav container stays at the very top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 border border-white/50 hover:bg-white/10 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="luxe-nav-overlay"
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer select-none"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/");
              }
            }}
          >
            <span
              className="text-xl font-extrabold tracking-widest"
              onClick={() => navigate("/")}
              role="button"
              tabIndex={-1}
            >
              LUXE
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-white/10">
              <Search className="h-5 w-5 text-white" />
            </Button>

            <Button variant="ghost" size="icon" className="relative hover:bg-white/10" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <ShoppingBag className="h-5 w-5 text-white" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-transparent border border-white/60 text-white">
                {cartCount ?? 0}
              </Badge>
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isAuthorizedAdmin) {
                      navigate("/admin");
                    } else {
                      navigate("/auth");
                    }
                  }}
                  className="hover:bg-white/10"
                >
                  <User className="h-5 w-5 text-white" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="hidden sm:flex border-white/40 text-white bg-transparent hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="border border-white/40 text-white bg-transparent hover:bg-white/10"
                variant="outline"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            id="luxe-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Full-viewport overlay below the navbar on ALL screen sizes
            className="fixed left-0 right-0 top-16 bottom-0 bg-black/80 backdrop-blur-sm border-t border-white/10 z-50"
          >
            <div className="max-w-md w-full h-full bg-black/90 p-6">
              <div className="flex flex-col space-y-4">
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href={category.href}
                    className="text-white/90 hover:text-white font-medium py-3 px-2 rounded hover:bg-white/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Announcement bar moved BELOW the navbar */}
      <div className="w-full bg-black text-white">
        <div className="border-t border-white/10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="h-8 flex items-center justify-center"
            aria-live="polite"
            role="status"
          >
            <AnnouncementRow />
          </div>
        </div>
        <div className="border-t border-white/10" />
      </div>

      {/* Cart Slide-over (Sheet) */}
      {mounted && (
        <Sheet
          open={isCartOpen}
          onOpenChange={(open) => {
            setIsCartOpen(open);
            if (!open) setCheckoutStep("review"); // Reset step when closing
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-md p-0 h-full bg-gray-100 text-gray-900 border-l border-black/10"
          >
            <SheetHeader className="px-6 pt-5">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-extrabold">
                  {checkoutStep === "review" ? "Your cart" : "Checkout details"}
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="px-6">
              <div className="border-t border-gray-300/60" />
            </div>
            <div className="px-6 pb-6 pt-4">
              {!cartItems || cartItems.length === 0 ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
                  <h3 className="text-2xl font-extrabold mb-6 text-gray-900">Your cart is empty</h3>
                  <Button
                    className="rounded-full h-12 px-8 bg-black text-white hover:bg-black/90"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue shopping
                  </Button>
                  <p className="text-sm text-gray-600 mt-10">
                    Have an account?{" "}
                    <a href="/auth" className="underline font-medium text-gray-800">
                      Log in
                    </a>{" "}
                    to check out faster.
                  </p>
                </div>
              ) : checkoutStep === "review" ? (
                <div className="space-y-4">
                  <ul className="space-y-3">
                    {cartItems.map((item) => (
                      <li key={item._id} className="flex gap-3 border border-gray-200 rounded-md p-3">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{item.product.name}</p>
                          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-gray-300 px-2 py-1">
                            <button
                              className="h-6 w-6 grid place-items-center rounded-full hover:bg-gray-200"
                              aria-label="Decrease quantity"
                              onClick={async () => {
                                if (!user?._id) return;
                                await setCartItemQuantity({
                                  userId: user._id as any,
                                  productId: item.productId as any,
                                  quantity: Math.max(0, (item.quantity ?? 1) - 1),
                                });
                              }}
                            >
                              −
                            </button>
                            <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              className="h-6 w-6 grid place-items-center rounded-full hover:bg-gray-200"
                              aria-label="Increase quantity"
                              onClick={async () => {
                                if (!user?._id) return;
                                await setCartItemQuantity({
                                  userId: user._id as any,
                                  productId: item.productId as any,
                                  quantity: (item.quantity ?? 1) + 1,
                                });
                              }}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold mt-1">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                          {(item as any).color ? (
                            <p className="text-xs text-gray-600">Color: {`${String((item as any).color)[0].toUpperCase()}${String((item as any).color).slice(1)}`}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Promo code section: always visible; enforce eligibility inline */}
                  <div className="mt-2 rounded-md border border-gray-300 p-3 space-y-2">
                    <p className="text-sm font-semibold">Have a code?</p>
                    <div className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="bg-white"
                      />
                      {appliedDiscount > 0 ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAppliedDiscount(0);
                            setPromoCode("");
                          }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            // If fewer than 2 items, show inline not applicable message (no alert)
                            if (cartItemCount < 2) {
                              // Force a small UI tick to show helper text below
                              setAppliedDiscount(0);
                              return;
                            }
                            if (promoCode.trim() === "LUXE150") {
                              setAppliedDiscount(150);
                            } else {
                              // Trigger inline "Invalid code." helper below
                              setAppliedDiscount(0);
                            }
                          }}
                          className="bg-black text-white hover:bg-black/90"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                    {/* Inline helper messages */}
                    {cartItemCount < 2 && appliedDiscount === 0 ? (
                      <p className="text-xs text-gray-600">
                        Not applicable now — add at least 2 products to use LUXE150.
                      </p>
                    ) : null}
                    {cartItemCount >= 2 && appliedDiscount === 0 && promoCode && promoCode !== "LUXE150" ? (
                      <p className="text-xs text-red-600">
                        Invalid code.
                      </p>
                    ) : null}
                    {appliedDiscount > 0 && (
                      <p className="text-xs text-green-700">
                        Code applied: LUXE150 — ₹150 off
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-300/60" />

                  {/* Totals section */}
                  <div className="flex items-center justify-between text-gray-900">
                    <p className="font-extrabold">{appliedDiscount > 0 ? "Subtotal" : "Estimated total"}</p>
                    <p className="font-extrabold">₹{estimatedTotal.toLocaleString()}</p>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex items-center justify-between text-gray-900">
                      <p className="font-semibold text-green-700">Discount (LUXE150)</p>
                      <p className="font-semibold text-green-700">-₹{appliedDiscount.toLocaleString()}</p>
                    </div>
                  )}
                  {appliedDiscount > 0 && (
                    <div className="flex items-center justify-between text-gray-900">
                      <p className="font-extrabold">Estimated total</p>
                      <p className="font-extrabold">₹{discountedTotal.toLocaleString()}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-600">
                    Taxes, discounts and <span className="underline">shipping</span> calculated at checkout.
                  </p>

                  <div className="pt-2">
                    <Button
                      className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90"
                      onClick={() => setCheckoutStep("details")}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold mb-2">Contact</p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName">First name</Label>
                          <Input
                            id="firstName"
                            value={details.firstName}
                            onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input
                            id="lastName"
                            value={details.lastName}
                            onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Delivery</p>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="address1">Address</Label>
                        <Input
                          id="address1"
                          placeholder="Street address"
                          value={details.address1}
                          onChange={(e) => setDetails((d) => ({ ...d, address1: e.target.value }))}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                        <Input
                          id="address2"
                          placeholder=""
                          value={details.address2}
                          onChange={(e) => setDetails((d) => ({ ...d, address2: e.target.value }))}
                          className="bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={details.city}
                            onChange={(e) => setDetails((d) => ({ ...d, city: e.target.value }))}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state">State</Label>
                          <Select
                            value={details.state || ""}
                            onValueChange={(v) => setDetails((d) => ({ ...d, state: v }))}
                          >
                            <SelectTrigger id="state" className="bg-white">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                              <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                              <SelectItem value="Assam">Assam</SelectItem>
                              <SelectItem value="Bihar">Bihar</SelectItem>
                              <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                              <SelectItem value="Goa">Goa</SelectItem>
                              <SelectItem value="Gujarat">Gujarat</SelectItem>
                              <SelectItem value="Haryana">Haryana</SelectItem>
                              <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                              <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                              <SelectItem value="Karnataka">Karnataka</SelectItem>
                              <SelectItem value="Kerala">Kerala</SelectItem>
                              <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                              <SelectItem value="Manipur">Manipur</SelectItem>
                              <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                              <SelectItem value="Mizoram">Mizoram</SelectItem>
                              <SelectItem value="Nagaland">Nagaland</SelectItem>
                              <SelectItem value="Odisha">Odisha</SelectItem>
                              <SelectItem value="Punjab">Punjab</SelectItem>
                              <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                              <SelectItem value="Sikkim">Sikkim</SelectItem>
                              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                              <SelectItem value="Telangana">Telangana</SelectItem>
                              <SelectItem value="Tripura">Tripura</SelectItem>
                              <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                              <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                              <SelectItem value="West Bengal">West Bengal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="pin">PIN code</Label>
                          <Input
                            id="pin"
                            inputMode="numeric"
                            value={details.pin}
                            onChange={(e) => setDetails((d) => ({ ...d, pin: e.target.value }))}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          inputMode="tel"
                          placeholder="+91"
                          value={details.phone}
                          onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-300/60" />
                  {/* Show totals consistent with applied discount */}
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold">{appliedDiscount > 0 ? "Subtotal" : "Total"}</p>
                    <p className="font-extrabold">₹{estimatedTotal.toLocaleString()}</p>
                  </div>

                  {appliedDiscount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-green-700">Discount (LUXE150)</p>
                        <p className="font-semibold text-green-700">-₹{appliedDiscount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold">Total</p>
                        <p className="font-extrabold">₹{discountedTotal.toLocaleString()}</p>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-gray-600">
                    Taxes, discounts and <span className="underline">shipping</span> calculated at checkout.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="h-12 rounded-full"
                      onClick={() => setCheckoutStep("review")}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-full bg-black text-white hover:bg-black/90"
                      onClick={() => {
                        // Basic validation for key fields
                        const required = [
                          details.firstName,
                          details.lastName,
                          details.address1,
                          details.city,
                          details.state,
                          details.pin,
                          details.phone,
                        ].every((v) => String(v || "").trim().length > 0);
                        if (!required) {
                          alert("Please fill all delivery details.");
                          return;
                        }
                        if (!cartItems || cartItems.length === 0) {
                          window.location.href = "https://wa.me/9871629699";
                          return;
                        }

                        // Build WhatsApp message in the requested order/wording
                        const lines: Array<string> = [];
                        lines.push("I want to order:");
                        lines.push("");

                        let grandTotal = 0;
                        for (const item of cartItems) {
                          const name = item.product.name;
                          const qty = item.quantity ?? 1;
                          const priceNum = item.product.price ?? 0;
                          grandTotal += priceNum * qty;
                          const price = `₹${priceNum.toLocaleString()}`;

                          lines.push(`- ${name} | Qty: ${qty} | Price: ${price}`);
                          if ((item as any).color) {
                            const c = String((item as any).color);
                            const cap = c.charAt(0).toUpperCase() + c.slice(1);
                            lines.push(`  Color: ${cap}`);
                          }
                          const productLink = `${window.location.origin}/product/${item.product._id}`;
                          lines.push(`  Link: ${productLink}`);
                        }

                        // Apply discount if any
                        let finalTotal = grandTotal;
                        if (appliedDiscount > 0) {
                          lines.push("");
                          lines.push(`Discount code applied: LUXE150 (₹${appliedDiscount.toLocaleString()} off)`);
                          finalTotal = Math.max(0, grandTotal - appliedDiscount);
                        }

                        lines.push("");
                        lines.push("My address:");
                        lines.push(`${details.firstName} ${details.lastName}`);
                        lines.push(`Contact number: ${details.phone}`);
                        lines.push(`${details.address1}`);
                        // Include address2 only if provided
                        if (String(details.address2 || "").trim().length > 0) {
                          lines.push(`${details.address2}`);
                        }
                        lines.push(`${details.city}, ${details.state} - ${details.pin}`);

                        lines.push("");
                        lines.push(`Grand Total: ₹${finalTotal.toLocaleString()}`);

                        const message = lines.join("\n");
                        const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                        window.location.href = url;
                      }}
                    >
                      Save & WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </motion.nav>
  );
}