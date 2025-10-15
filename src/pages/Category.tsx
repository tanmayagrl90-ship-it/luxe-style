import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { MessageCircle, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

const prettyName: Record<string, string> = {
  goggles: "Goggles",
  watches: "Watches",
  belts: "Belts",
  "gift box": "Gift Box",
};

export default function CategoryPage() {
  const { category = "" } = useParams();
  const products = useQuery(api.products.getProductsByCategory, { category });
  const { isAuthenticated, user, signIn } = useAuth();
  const addToCart = useMutation(api.cart.addToCart);
  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);
  const wishlistItems = useQuery(api.wishlist.getWishlist, { userId: user?._id ?? null });
  const navigate = useNavigate();

  // Track active image index for each product
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

  // Preload all product images for smooth transitions
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    const imageUrls = products.flatMap(p => p.images ?? []);
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [products]);

  const wishlistProductIds = new Set(
    (wishlistItems ?? []).map((item) => item.productId)
  );

  const handleImageNavigation = (e: React.MouseEvent, productId: string, direction: 'prev' | 'next', totalImages: number) => {
    e.stopPropagation();
    setActiveImageIndices(prev => {
      const currentIndex = prev[productId] ?? 0;
      const newIndex = direction === 'next' 
        ? (currentIndex + 1) % totalImages
        : (currentIndex - 1 + totalImages) % totalImages;
      return { ...prev, [productId]: newIndex };
    });
  };

  const handleAddToCart = async (productId: string) => {
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

      await addToCart({ userId: currentUserId as any, productId: productId as any, quantity: 1 });
      toast("Added to cart");
    } catch (e) {
      console.error(e);
      toast("Failed to add to cart");
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent, productId: any) => {
    e.stopPropagation();
    try {
      let currentUserId = user?._id;
      if (!isAuthenticated || !currentUserId) {
        await signIn("anonymous");
        toast("Signed in as guest. Tap the heart again.");
        return;
      }

      const isInWishlist = wishlistProductIds.has(productId as any);
      if (isInWishlist) {
        await removeFromWishlist({ userId: currentUserId, productId: productId });
        toast("Removed from wishlist");
      } else {
        await addToWishlist({ userId: currentUserId, productId: productId });
        toast("Added to wishlist");
      }
    } catch (e) {
      console.error(e);
      toast("Failed to update wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-20">
        <section className="bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {prettyName[category] ?? "Collection"}
              </h1>
              <p className="text-gray-300 mt-2">Explore our premium {prettyName[category] ?? "products"}.</p>
            </div>

            {!products ? (
              // Loading skeleton
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-2xl bg-white/10" />
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-5 w-1/2 bg-white/10" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1 rounded-full bg-white/10" />
                      <Skeleton className="h-9 flex-1 rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-300">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {products.map((product, index) => {
                  const isInWishlist = wishlistProductIds.has(product._id);
                  const images = product.images ?? [];
                  const activeIndex = activeImageIndices[product._id] ?? 0;
                  const currentImage = images[activeIndex] ?? images[0];
                  const hasMultipleImages = images.length > 1;

                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                    >
                      <Card
                        className="group bg-transparent border-transparent shadow-none cursor-pointer"
                        onClick={() => window.open(`/product/${product._id}`, '_blank')}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10">
                          {currentImage ? (
                            <>
                              <img
                                key={`${product._id}-${activeIndex}`}
                                src={currentImage}
                                alt={product.name}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${!product.inStock ? 'brightness-50' : ''}`}
                                loading="eager"
                                fetchPriority={index < 6 ? "high" : "auto"}
                                decoding="async"
                                onError={(e) => {
                                  const imgs: Array<string> = Array.isArray(product.images) ? product.images : [];
                                  const current = e.currentTarget.getAttribute("src") || "";
                                  const idx = Math.max(0, imgs.findIndex((u) => u === current));
                                  const next = imgs[idx + 1] || "/api/placeholder/400/400";
                                  if (current !== next) {
                                    e.currentTarget.src = next;
                                  }
                                }}
                              />

                              {!product.inStock && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                  <span className="text-red-500 text-xs sm:text-sm font-semibold tracking-wider" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                                    OUT OF STOCK
                                  </span>
                                </div>
                              )}

                              {/* Image navigation arrows - only show if multiple images */}
                              {hasMultipleImages && (
                                <>
                                  <button
                                    onClick={(e) => handleImageNavigation(e, product._id, 'prev', images.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    aria-label="Previous image"
                                  >
                                    <ChevronLeft className="h-4 w-4 text-white" />
                                  </button>
                                  <button
                                    onClick={(e) => handleImageNavigation(e, product._id, 'next', images.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    aria-label="Next image"
                                  >
                                    <ChevronRight className="h-4 w-4 text-white" />
                                  </button>

                                  {/* Image indicator dots */}
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                                    {images.map((_, idx) => (
                                      <button
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveImageIndices(prev => ({ ...prev, [product._id]: idx }));
                                        }}
                                        className={`h-1.5 rounded-full transition-all duration-200 ${
                                          idx === activeIndex 
                                            ? 'w-6 bg-white' 
                                            : 'w-1.5 bg-white/50 hover:bg-white/70'
                                        }`}
                                        aria-label={`View image ${idx + 1}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-700 font-medium">
                                {prettyName[product.category] ?? product.category}
                              </span>
                            </div>
                          )}
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <Badge className="absolute top-3 left-3 z-10 bg-white text-black">Sale</Badge>
                          ) : product.featured ? (
                            <Badge className="absolute top-3 left-3 z-10 bg-white text-black">Featured</Badge>
                          ) : null}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute top-3 right-3 z-10 rounded-full bg-black/60 hover:bg-black/80 transition-colors duration-200 ${
                              isInWishlist ? "text-red-500" : "text-white"
                            }`}
                            onClick={(e) => handleWishlistToggle(e, product._id)}
                            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                          </Button>
                        </div>

                        <div className="px-0 pt-2 sm:pt-3">
                          <h3 className="font-extrabold tracking-tight text-white text-xs sm:text-base md:text-lg mb-1 line-clamp-1">
                            {product.name}
                          </h3>

                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-lg text-white font-bold tracking-tight">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <>
                                <span className="text-xs sm:text-sm text-white/40 line-through font-normal">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] sm:text-xs font-semibold text-emerald-400">
                                  ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                                </span>
                              </>
                            )}
                          </div>

                          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row gap-2">
                            <Button
                              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (typeof window !== "undefined") {
                                  (window as any).__luxeUserId = user?._id;
                                }
                                await handleAddToCart(product._id as any);
                              }}
                              disabled={!product.inStock}
                            >
                              {product.inStock ? "Add to Cart" : "Out of Stock"}
                            </Button>

                            <Button
                              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b]"
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = `${window.location.origin}/product/${product._id}`;
                                const message = `Hi! I'm interested in "${product.name}" (${prettyName[product.category] ?? product.category}). Price: ₹${product.price.toLocaleString()}${product.originalPrice ? ` (MRP ₹${product.originalPrice.toLocaleString()})` : ""}. Link: ${link}`;
                                const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                                window.location.href = url;
                              }}
                            >
                              <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                              <span className="hidden sm:inline">Order on WhatsApp</span>
                              <span className="sm:hidden">WhatsApp</span>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}