import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Search } from "lucide-react";
import { useSearchParams } from "react-router";

const prettyName: Record<string, string> = {
  goggles: "Goggles",
  watches: "Watches",
  belts: "Belts",
  "gift box": "Gift Box",
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  const products = useQuery(api.products.searchProducts, { searchTerm });
  const { isAuthenticated, user, signIn } = useAuth();
  const addToCart = useMutation(api.cart.addToCart);
  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);
  const wishlistItems = useQuery(api.wishlist.getWishlist, { userId: user?._id ?? null });

  const wishlistProductIds = new Set(
    (wishlistItems ?? []).map((item) => item.productId)
  );

  const handleAddToCart = async (productId: string) => {
    try {
      let currentUserId = user?._id;

      if (!isAuthenticated || !currentUserId) {
        await signIn("anonymous");
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
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-6 w-6 text-white/60" />
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
                  Search Results
                </h1>
              </div>
              <p className="text-gray-300">
                {products === undefined ? (
                  "Searching..."
                ) : products.length === 0 ? (
                  `No results found for "${searchTerm}"`
                ) : (
                  `Found ${products.length} ${products.length === 1 ? "product" : "products"} for "${searchTerm}"`
                )}
              </p>
            </div>

            {products === undefined ? (
              <div className="text-center py-20">
                <p className="text-gray-300">Searching products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-300 mb-4">Try searching for:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="text-white border-white/20">Goggles</Badge>
                  <Badge variant="outline" className="text-white border-white/20">Watches</Badge>
                  <Badge variant="outline" className="text-white border-white/20">Belts</Badge>
                  <Badge variant="outline" className="text-white border-white/20">TomFord</Badge>
                  <Badge variant="outline" className="text-white border-white/20">Guess</Badge>
                  <Badge variant="outline" className="text-white border-white/20">Coach</Badge>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {products.map((product, index) => {
                  const isInWishlist = wishlistProductIds.has(product._id);
                  const images = product.images ?? [];
                  const currentImage = images[0];

                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Card
                        className="group bg-transparent border-transparent shadow-none cursor-pointer"
                        onClick={() => window.open(`/product/${product._id}`, '_blank')}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10">
                          {currentImage ? (
                            <img
                              src={currentImage}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
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
                              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm rounded-full bg-white text-black hover:bg-white/90"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (typeof window !== "undefined") {
                                  (window as any).__luxeUserId = user?._id;
                                }
                                await handleAddToCart(product._id as any);
                              }}
                            >
                              Add to Cart
                            </Button>

                            <Button
                              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b]"
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = `${window.location.origin}/product/${product._id}`;
                                const message = `Hi! I'm interested in "${product.name}". Price: ₹${product.price.toLocaleString()}${product.originalPrice ? ` (MRP ₹${product.originalPrice.toLocaleString()})` : ""}. Link: ${link}`;
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
