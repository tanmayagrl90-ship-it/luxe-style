import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Minus, Plus, MessageCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductZoom from "@/components/ProductZoom";
import RecentlyViewed from "@/components/RecentlyViewed";

const prettyName: Record<string, string> = {
  goggles: "Goggles",
  watches: "Watches",
  belts: "Belts",
};

export default function ProductPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const product = useQuery(api.products.getProductById, { id: id as any });
  const { isAuthenticated, user, signIn } = useAuth();
  const addToCart = useMutation(api.cart.addToCart);
  const trackView = useMutation(api.recentlyViewed.trackView);
  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);
  const isInWishlist = useQuery(api.wishlist.isInWishlist, {
    userId: user?._id ?? null,
    productId: id as any,
  });
  
  const [qty, setQty] = useState(0);
  const supportsColors =
    (product?.name ?? "").toLowerCase() === "coach belt" ||
    (product?.name ?? "").toLowerCase() === "coach premium belt";
  const [color, setColor] = useState<"black" | "white">("black");
  
  const supportsPackaging = (product?.category ?? "").toLowerCase() === "goggles";
  const [packaging, setPackaging] = useState<"indian" | "imported" | "without">("indian");
  const [activeIndex, setActiveIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    if (!product?.images?.length) return;
    if (supportsColors) {
      setActiveIndex(color === "black" ? 0 : Math.min(1, product.images.length - 1));
    } else {
      setActiveIndex(0);
    }
  }, [product?._id, product?.images?.length, supportsColors, color]);
  
  // Reset packaging when product changes
  useEffect(() => {
    if (supportsPackaging) {
      setPackaging("indian");
    }
  }, [product?._id, supportsPackaging]);

  useEffect(() => {
    if (product && user?._id) {
      trackView({ userId: user._id, productId: id as any });
    }
  }, [product?._id, user?._id]);

  // Sticky bar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWishlistToggle = async () => {
    try {
      let currentUserId = user?._id;
      if (!isAuthenticated || !currentUserId) {
        await signIn("anonymous");
        toast("Signed in as guest. Tap the heart again.");
        return;
      }

      if (isInWishlist) {
        await removeFromWishlist({ userId: currentUserId, productId: id as any });
        toast("Removed from wishlist");
      } else {
        await addToWishlist({ userId: currentUserId, productId: id as any });
        toast("Added to wishlist");
      }
    } catch (e) {
      console.error(e);
      toast("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    try {
      let currentUserId = user?._id;

      if (!isAuthenticated || !currentUserId) {
        await signIn("anonymous");
        // Wait for user id to become available after anonymous sign-in (single-tap UX)
        const deadline = Date.now() + 4000;
        while (!currentUserId && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 100));
          currentUserId =
            (typeof window !== "undefined" ? (window as any).__luxeUserId : undefined) ||
            user?._id;
        }
      }

      if (!currentUserId) {
        toast("Please try again");
        return;
      }

      await addToCart({
        userId: currentUserId as any,
        productId: id as any,
        quantity: qty,
        color: supportsColors ? color : undefined,
        packaging: supportsPackaging ? packaging : undefined,
      } as any);
      toast("Added to cart");
    } catch (e) {
      console.error(e);
      toast("Failed to add to cart");
    }
  };

  const handleWhatsAppOrder = () => {
    const link = `${window.location.origin}/product/${product?._id}`;
    const packagingText = supportsPackaging 
      ? ` Packaging: ${packaging === "indian" ? "Indian Box" : packaging === "imported" ? "Imported Box (Premium)" : "Without Box"}.`
      : "";
    const message = `Hi! I'm interested in "${product?.name}" (${prettyName[product?.category ?? ""] ?? product?.category}). Price: ₹${product?.price.toLocaleString()}${product?.originalPrice ? ` (MRP ₹${product.originalPrice.toLocaleString()})` : ""}.${supportsColors ? ` Color: ${color[0].toUpperCase() + color.slice(1)}.` : ""}${packagingText} Link: ${link}`;
    const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }
  if (product === null) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <p className="text-gray-400">Product not found.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images ?? [];
  const image = images[activeIndex] ?? images[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-20 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10">
          <Card className="bg-black border-white/10 overflow-hidden rounded-2xl">
            <div className="relative aspect-square group">
              {image ? (
                <>
                  <img
                    src={image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-300"
                    loading="eager"
                    fetchPriority="high"
                  />
                  <ProductZoom images={images} productName={product.name} initialIndex={activeIndex} />
                  
                  {/* Navigation overlays - only show if multiple images */}
                  {images.length > 1 && (
                    <>
                      {/* Left side - Previous image */}
                      <button
                        onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        aria-label="Previous image"
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {/* Right side - Next image */}
                      <button
                        onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        aria-label="Next image"
                      >
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 bg-white/5 rounded-2xl flex items-center justify-center">
                  <span className="text-white/70">
                    {prettyName[product.category] ?? product.category}
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="p-4">
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden flex-shrink-0 ring-1 transition-all duration-200 snap-center ${
                        activeIndex === idx
                          ? "ring-white"
                          : "ring-white/20 hover:ring-white/40"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={src}
                        alt={`${product.name} ${idx + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div>
            <div className="flex items-start justify-between">
              <p className="uppercase tracking-wide text-sm text-white/60 mb-2">
                {prettyName[product.category] ?? product.category}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full transition-colors duration-200 ${
                  isInWishlist
                    ? "text-red-500 hover:text-red-600"
                    : "text-white/60 hover:text-white"
                }`}
                onClick={handleWishlistToggle}
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-6 w-6 ${isInWishlist ? "fill-current" : ""}`} />
              </Button>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{product.name}</h1>

            <div className="mt-4 flex items-center gap-3">
              {product.originalPrice && (
                <span className="text-white/50 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-2xl font-bold">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <Badge className="bg-white text-black border border-white/20">Sale</Badge>
              )}
            </div>

            <p className="mt-2 text-sm text-white/70">
              <span className="underline">Shipping</span> calculated at checkout.
            </p>

            {supportsColors && (
              <div className="mt-6">
                <p className="text-sm text-white/70 mb-2">Color</p>
                <Select
                  value={color}
                  onValueChange={(v) => setColor((v as "black" | "white"))}
                >
                  <SelectTrigger className="h-12 rounded-full border-white/20 bg-transparent text-white transition-colors duration-200">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {supportsPackaging && (
              <div className="mt-6">
                <p className="text-sm text-white/70 mb-2">Packaging</p>
                <Select
                  value={packaging}
                  onValueChange={(v) => setPackaging((v as "indian" | "imported" | "without"))}
                >
                  <SelectTrigger className="h-12 rounded-full border-white/20 bg-transparent text-white transition-colors duration-200">
                    <SelectValue placeholder="Select packaging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="without">Without Box <span className="text-xs text-gray-500">(₹0)</span></SelectItem>
                    <SelectItem value="indian">Indian Box <span className="text-xs text-gray-500">(+₹70)</span></SelectItem>
                    <SelectItem value="imported">Imported Box (Premium) <span className="text-xs text-gray-500">(+₹250)</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm text-white/70 mb-2">Quantity</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setQty((q) => Math.max(0, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 rounded-full bg-white text-black hover:bg-white/90 transition-colors duration-200"
              >
                Add to cart
              </Button>
              <Button
                className="w-full h-12 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b] transition-colors duration-200"
                onClick={handleWhatsAppOrder}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                ORDER ON WHATSAPP
              </Button>
            </div>

            <p className="mt-4 text-sm">
              {product.inStock ? (
                <span className="text-green-400">In stock</span>
              ) : (
                <span className="text-red-400">Out of stock</span>
              )}
            </p>
          </div>
        </div>
        
        <RecentlyViewed />
      </main>

      {/* Sticky Mobile CTA Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-white/10 p-4 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-white/60 mb-1">
                {prettyName[product.category] ?? product.category}
              </p>
              <p className="font-bold text-lg">₹{product.price.toLocaleString()}</p>
            </div>
            <Button
              onClick={handleAddToCart}
              className="h-12 px-6 rounded-full bg-white text-black hover:bg-white/90 transition-colors duration-200"
            >
              Add to cart
            </Button>
            <Button
              onClick={handleWhatsAppOrder}
              size="icon"
              className="h-12 w-12 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b] transition-colors duration-200"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}