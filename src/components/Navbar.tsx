import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, User, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Add: thin announcement bar content text
const ANNOUNCEMENT_TEXT = "Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!";

// Helper: build repeating marquee-like row with centered white dot separators
function AnnouncementRow() {
  // Increase horizontal padding and gap between segments so there's more space after "discount"
  const segment =
    "flex items-center gap-4 px-4 sm:px-6 whitespace-nowrap"; // UPDATED: larger gap/px for more separation

  return (
    <div className="relative w-full overflow-hidden">
      {/* Scrolling track: moves right -> left continuously */}
      <div
        className="flex items-center"
        style={{
          // Smooth, continuous marquee effect
          // Increase speed slightly by reducing duration from 18s -> 14s
          animation: "luxe-marquee 14s linear infinite",
          willChange: "transform",
        }}
      >
        {/* Duplicate enough segments so the loop looks continuous */}
        <div className="flex items-center">
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
        </div>

        {/* Mirror the same row so there is no gap when looping */}
        <div className="flex items-center" aria-hidden="true">
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
          <div className={segment}>
            <span className="inline-block h-1 w-1 rounded-full bg-white/80" aria-hidden="true" />
            <span>Welcome to LUXE: Elevate Your Style with Today's Exclusive Deals!</span>
          </div>
        </div>
      </div>

      {/* Inject keyframes once per mount using a style tag */}
      <style>{`
        @keyframes luxe-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [checkoutStep, setCheckoutStep] = useState<"review" | "details" | "payment">("review");
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
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

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

  // Cart items for drawer - only fetch when cart is open
  const cartItems = useQuery(
    api.cart.getCartItems,
    isCartOpen && user?._id ? { userId: user._id } : "skip",
  );
  const cartItemCount = (cartItems ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0,
  );

  // Add: auto-remove promo if cart becomes ineligible (< 2 items)
  useEffect(() => {
    if (!isCartOpen || !cartItems) return;
    if (cartItemCount < 2 && appliedDiscount > 0) {
      setAppliedDiscount(0);
      setPromoCode("");
      setDiscountPercentage(0);
    }
  }, [isCartOpen, cartItems, cartItemCount, appliedDiscount]);

  // Add mutation for updating cart quantities
  const setCartItemQuantity = useMutation(api.cart.setCartItemQuantity);

  // Calculate packaging charges (multiply by quantity for each item)
  const packagingCharges = (cartItems ?? []).reduce((sum, item) => {
    const packaging = (item as any).packaging;
    const quantity = item.quantity ?? 1;
    if (!packaging || packaging === "without") return sum;
    if (packaging === "indian") return sum + (70 * quantity);
    if (packaging === "imported") return sum + (250 * quantity);
    return sum;
  }, 0);

  // Estimated total for display in the cart panel
  const estimatedTotal =
    (cartItems ?? []).reduce((sum, item) => sum + (item.product.price ?? 0) * (item.quantity ?? 1), 0);

  const subtotalWithPackaging = estimatedTotal + packagingCharges;
  // Calculate discount: if percentage is set, use that; otherwise use fixed amount
  const finalDiscount = discountPercentage > 0 
    ? Math.round(subtotalWithPackaging * (discountPercentage / 100))
    : appliedDiscount;
  const discountedTotal = Math.max(0, subtotalWithPackaging - finalDiscount);

  // Generate UPI QR code URL with locked amount
  const generateQRCode = () => {
    const upiId = "9302559917@jio"; // Your Jio UPI ID
    const payeeName = "Tanmay Agrawal";
    const amount = discountedTotal.toFixed(2);
    const transactionNote = `LUXE Order - ${details.firstName} ${details.lastName}`;
    
    // UPI Intent URL with locked amount (am parameter)
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Generate QR code using a QR code API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
    
    setQrCodeUrl(qrApiUrl);
  };

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
      {/* Main nav container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-24">
          <Button
            variant="ghost"
            size="icon"
            // Ensure highest stacking so clicks aren't blocked
            className="relative z-[70] h-12 w-12 border border-white/50 hover:bg-white/10 rounded-md pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen((v) => !v);
            }}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="luxe-mobile-menu"
          >
            <Menu className="h-6 w-6 text-white pointer-events-none" />
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
              className="text-2xl font-extrabold tracking-widest font-['Abril_Fatface',serif]"
              onClick={() => navigate("/")}
              role="button"
              tabIndex={-1}
            >
              LUXE
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-white/10">
              <Search className="h-6 w-6 text-white" />
            </Button>

            <Button variant="ghost" size="icon" className="relative hover:bg-white/10" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <ShoppingBag className="h-6 w-6 text-white" />
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
                  <User className="h-6 w-6 text-white" />
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
        <div className="h-0" />
      </div>

      {/* Announcement bar BELOW navbar - only show on homepage */}
      {location.pathname === "/" && (
        <div className="w-full bg-black text-white relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-6 flex items-center justify-center" aria-live="polite" role="status">
              <AnnouncementRow />
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu overlay + panel (categories only) */}
      {isMenuOpen && (
        <div
          id="luxe-mobile-menu"
          className="fixed inset-0 z-[80]"
          aria-modal="true"
          role="dialog"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 pointer-events-auto" />

          {/* Panel */}
          <div
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-gray-50 border-r border-gray-200 p-6 flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-normal tracking-wide text-gray-500">MENU</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100 text-gray-900"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>

            {/* Category links only */}
            <div className="flex flex-col gap-1">
              <a
                href="/category/goggles"
                className="block px-0 py-3 text-gray-900 text-lg font-normal hover:text-gray-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Goggles
              </a>
              <a
                href="/category/watches"
                className="block px-0 py-3 text-gray-900 text-lg font-normal hover:text-gray-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Watches
              </a>
              <a
                href="/category/belts"
                className="block px-0 py-3 text-gray-900 text-lg font-normal hover:text-gray-600 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Belts
              </a>
            </div>

            {/* Instagram link at bottom */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <a
                href="https://www.instagram.com/luxe.premium.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-900"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="text-sm">@luxe.premium.in</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slide-over (Sheet) */}
      {mounted && (
        <Sheet
          open={isCartOpen}
          onOpenChange={(open) => {
            setIsCartOpen(open);
            if (!open) {
              setCheckoutStep("review");
              setQrCodeUrl("");
            }
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-md p-0 h-full bg-gray-100 text-gray-900 border-l border-black/10 flex flex-col overflow-hidden"
          >
            <SheetHeader className="px-6 pt-5">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-extrabold">
                  {checkoutStep === "review" ? "Your cart" : checkoutStep === "details" ? "Checkout details" : "Payment"}
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="px-6">
              <div className="border-t border-gray-300/60" />
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
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
                                  cartItemId: item._id as any,
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
                                  cartItemId: item._id as any,
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
                          {(item as any).packaging ? (
                            <p className="text-xs text-gray-600">
                              Packaging: {
                                (item as any).packaging === "indian" ? "Indian Box" :
                                (item as any).packaging === "imported" ? "Imported Box (Premium)" :
                                "Without Box"
                              }
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Promo code section - PharmEasy style */}
                  <div className="mt-4">
                    {appliedDiscount > 0 ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-green-800">COMBO15 Applied</p>
                              <p className="text-xs text-green-600">15% off - ₹{finalDiscount.toLocaleString()} saved</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAppliedDiscount(0);
                              setPromoCode("");
                              setDiscountPercentage(0);
                            }}
                            className="text-green-700 hover:text-green-800 hover:bg-green-100 h-8 px-2"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Divider with text */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-300" />
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Coupons & Offers</span>
                          <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        {/* Apply coupon button */}
                        <button
                          onClick={() => {
                            // Toggle showing available coupons
                            const section = document.getElementById('available-coupons');
                            if (section) {
                              section.style.display = section.style.display === 'none' ? 'block' : 'none';
                            }
                          }}
                          className="w-full p-3 bg-gradient-to-r from-gray-900 to-gray-800 border border-white/20 rounded-lg flex items-center justify-between hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-white">Apply coupon</span>
                          </div>
                          <svg className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Available coupons - hidden by default */}
                        <div id="available-coupons" style={{ display: 'none' }} className="space-y-2">
                          {/* COMBO15 coupon card */}
                          {cartItemCount >= 2 ? (
                            <div className="p-3 bg-gradient-to-r from-black to-gray-800 rounded-lg shadow-md">
                              <button
                                onClick={() => {
                                  setPromoCode("COMBO15");
                                  setDiscountPercentage(15);
                                  const discount = Math.round(subtotalWithPackaging * 0.15);
                                  setAppliedDiscount(discount);
                                  toast("Coupon applied successfully!");
                                }}
                                className="w-full flex items-center justify-between text-white"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                  <div className="text-left">
                                    <p className="font-bold text-sm">COMBO15</p>
                                    <p className="text-xs text-white/80">15% off on 2+ items</p>
                                  </div>
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-white/20 rounded-full">APPLY</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-3 opacity-50">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                </div>
                                <div className="text-left">
                                  <p className="font-bold text-sm text-gray-700">COMBO15</p>
                                  <p className="text-xs text-gray-600">Add 2+ items to unlock</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Manual code entry */}
                          <div className="p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Input
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="Enter coupon code"
                                className="flex-1 h-10 border-gray-300 focus-visible:ring-teal-600"
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (cartItemCount < 2) {
                                    toast("Add at least 2 products to use COMBO15");
                                    return;
                                  }
                                  if (promoCode.trim() === "COMBO15") {
                                    setDiscountPercentage(15);
                                    const discount = Math.round(subtotalWithPackaging * 0.15);
                                    setAppliedDiscount(discount);
                                    toast("Coupon applied successfully!");
                                  } else {
                                    toast("Invalid coupon code");
                                  }
                                }}
                                className="bg-teal-600 text-white hover:bg-teal-700 h-10 px-6"
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-300/60" />

                  {/* Totals section */}
                  <div className="flex items-center justify-between text-gray-900">
                    <p className="font-semibold">Subtotal</p>
                    <p className="font-semibold">₹{estimatedTotal.toLocaleString()}</p>
                  </div>
                  {packagingCharges > 0 && (
                    <div className="flex items-center justify-between text-gray-900">
                      <p className="font-semibold">Packaging charges</p>
                      <p className="font-semibold">₹{packagingCharges.toLocaleString()}</p>
                    </div>
                  )}
                  {finalDiscount > 0 && (
                    <div className="flex items-center justify-between text-gray-900">
                      <p className="font-semibold text-green-700">Discount (COMBO15)</p>
                      <p className="font-semibold text-green-700">-₹{finalDiscount.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-900">
                    <p className="font-extrabold">Estimated total</p>
                    <p className="font-extrabold">₹{discountedTotal.toLocaleString()}</p>
                  </div>

                  <p className="text-xs text-gray-600">
                    Taxes, discounts and <span className="underline">shipping</span> calculated at checkout.
                  </p>
                  
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">📦 Delivery:</span> 5-7 business days after order confirmation
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-semibold">✓ Availability:</span> Confirmed upon order placement
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90"
                      onClick={() => setCheckoutStep("details")}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              ) : checkoutStep === "details" ? (
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
                        <Label htmlFor="pin">PIN code</Label>
                        <Input
                          id="pin"
                          inputMode="numeric"
                          value={details.pin}
                          onChange={(e) => setDetails((d) => ({ ...d, pin: e.target.value }))}
                          className="bg-white"
                        />
                      </div>
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
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City/Town</Label>
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
                          value={details.state}
                          onValueChange={(v) => setDetails((d) => ({ ...d, state: v }))}
                        >
                          <SelectTrigger className="bg-white">
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
                            <SelectItem value="Delhi">Delhi</SelectItem>
                          </SelectContent>
                        </Select>
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
                        generateQRCode();
                        setCheckoutStep("payment");
                      }}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Scan to Pay</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Amount: ₹{discountedTotal.toLocaleString()}
                    </p>
                    
                    {qrCodeUrl && (
                      <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                        <img 
                          src={qrCodeUrl} 
                          alt="UPI Payment QR Code" 
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-3">
                      Scan this QR code with any UPI app to pay ₹{discountedTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      The amount is locked and cannot be changed
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-300/60" />
                  
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Subtotal</p>
                    <p className="font-semibold">₹{estimatedTotal.toLocaleString()}</p>
                  </div>

                  {packagingCharges > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Packaging charges</p>
                      <p className="font-semibold">₹{packagingCharges.toLocaleString()}</p>
                    </div>
                  )}

                  {finalDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-green-700">Discount (COMBO15)</p>
                      <p className="font-semibold text-green-700">-₹{finalDiscount.toLocaleString()}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold">Total</p>
                    <p className="font-extrabold">₹{discountedTotal.toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="h-12 rounded-full"
                      onClick={() => setCheckoutStep("details")}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b]"
                      onClick={() => {
                        if (!cartItems || cartItems.length === 0) {
                          window.location.href = "https://wa.me/9871629699";
                          return;
                        }

                        const lines: Array<string> = [];
                        lines.push("✅ PAYMENT COMPLETED");
                        lines.push("");
                        lines.push("Order Details:");
                        lines.push("");

                        let grandTotal = 0;
                        let totalPackagingCharges = 0;
                        
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
                          if ((item as any).packaging) {
                            const p = String((item as any).packaging);
                            const packText = p === "indian" ? "Indian Box (+₹70)" : p === "imported" ? "Imported Box (Premium) (+₹250)" : "Without Box";
                            lines.push(`  Packaging: ${packText}`);
                            
                            if (p === "indian") totalPackagingCharges += 70 * qty;
                            else if (p === "imported") totalPackagingCharges += 250 * qty;
                          }
                          const productLink = `${window.location.origin}/product/${item.product._id}`;
                          lines.push(`  Link: ${productLink}`);
                        }

                        if (totalPackagingCharges > 0) {
                          lines.push("");
                          lines.push(`Packaging charges: ₹${totalPackagingCharges.toLocaleString()}`);
                        }

                        let finalTotal = grandTotal + totalPackagingCharges;
                        if (finalDiscount > 0) {
                          lines.push("");
                          lines.push(`Discount code applied: COMBO15 - 15% off (₹${finalDiscount.toLocaleString()} saved)`);
                          finalTotal = Math.max(0, finalTotal - finalDiscount);
                        }

                        lines.push("");
                        lines.push("Delivery Address:");
                        lines.push(`${details.firstName} ${details.lastName}`);
                        lines.push(`Contact number: ${details.phone}`);
                        lines.push(`${details.address1}`);
                        if (String(details.address2 || "").trim().length > 0) {
                          lines.push(`${details.address2}`);
                        }
                        lines.push(`${details.city}, ${details.state} - ${details.pin}`);

                        lines.push("");
                        lines.push(`💰 Amount Paid: ₹${finalTotal.toLocaleString()}`);

                        const message = lines.join("\n");
                        const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                        window.location.href = url;
                      }}
                    >
                      Payment Done - Send Confirmation
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