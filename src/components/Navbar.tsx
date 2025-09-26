import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, User, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Add: mounted flag to avoid portal DOM errors during route transitions
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => {
      // Ensure drawer is closed on unmount to avoid portal reconciliation issues
      setIsCartOpen(false);
      setIsMenuOpen(false);
    };
  }, []);

  // Add live cart count
  const cartCount = useQuery(api.cart.getCartCount, {
    userId: user?._id ?? null,
  });

  // Cart items for drawer
  const cartItems = useQuery(api.cart.getCartItems, { userId: user?._id ?? null });

  const categories = [
    { name: "Home page", href: "/" },
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
                  onClick={() => navigate("/profile")}
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

      {/* Cart Popup (Dialog) */}
      {mounted && (
        <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden bg-gray-100 text-gray-900">
            <DialogHeader className="px-6 pt-5">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-extrabold">Your cart</DialogTitle>
                <button
                  aria-label="Close cart"
                  className="p-2 rounded-md hover:bg-black/5"
                  onClick={() => setIsCartOpen(false)}
                >
                  ✕
                </button>
              </div>
            </DialogHeader>
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
              ) : (
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
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                          {(item as any).color ? (
                            <p className="text-xs text-gray-600">Color: {`${String((item as any).color)[0].toUpperCase()}${String((item as any).color).slice(1)}`}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t">
                    <Button
                      className="w-full rounded-full bg-black text-white hover:bg-black/90"
                      onClick={() => {
                        if (!cartItems || cartItems.length === 0) {
                          window.location.href = "https://wa.me/9871629699";
                          return;
                        }
                        const lines: Array<string> = [];
                        lines.push("I want to order:");
                        lines.push("");
                        let grandTotal = 0;
                        for (const item of cartItems) {
                          const name = item.product.name;
                          const mrpPart = item.product.originalPrice
                            ? ` | MRP ₹${item.product.originalPrice.toLocaleString()}`
                            : "";
                          const price = `₹${item.product.price.toLocaleString()}`;
                          const qty = item.quantity ?? 1;
                          const subtotalNum = (item.product.price ?? 0) * qty;
                          grandTotal += subtotalNum;
                          lines.push(`- ${name} | Qty: ${qty} | Price: ${price}${mrpPart}`);
                          if ((item as any).color) {
                            const c = String((item as any).color);
                            const cap = c.charAt(0).toUpperCase() + c.slice(1);
                            lines.push(`  Color: ${cap}`);
                          }
                          const productLink = `${window.location.origin}/product/${item.product._id}`;
                          lines.push(`  Link: ${productLink}`);
                        }
                        lines.push("");
                        lines.push(`Grand Total: ₹${grandTotal.toLocaleString()}`);
                        const message = lines.join("\n");
                        const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                        window.location.href = url;
                      }}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.nav>
  );
}