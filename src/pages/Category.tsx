import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { MessageCircle, Star } from "lucide-react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";

const prettyName: Record<string, string> = {
  goggles: "Goggles",
  watches: "Watches",
  belts: "Belts",
};

export default function CategoryPage() {
  const { category = "" } = useParams();
  const products = useQuery(api.products.getProductsByCategory, { category });
  const { isAuthenticated, user, signIn } = useAuth();
  const addToCart = useMutation(api.cart.addToCart);
  const navigate = useNavigate();

  const handleAddToCart = async (productId: string) => {
    try {
      let currentUserId = user?._id;
      if (!isAuthenticated || !currentUserId) {
        await signIn("anonymous");
        toast("Signed in as guest");
        // After anonymous sign in completes, the hook will refresh user doc automatically.
        return; // User will click again; keeps logic simple and avoids race with auth refresh
      }
      await addToCart({ userId: currentUserId, productId: productId as any, quantity: 1 });
      toast("Added to cart");
    } catch (e) {
      console.error(e);
      toast("Failed to add to cart");
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
              <p className="text-sm text-gray-400">Loading...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-300">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="group bg-transparent border-transparent shadow-none cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div
                        className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10"
                      >
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to next available image or placeholder if the current one fails
                              const imgs: Array<string> = Array.isArray(product.images) ? product.images : [];
                              const current = e.currentTarget.getAttribute("src") || "";
                              const idx = Math.max(0, imgs.findIndex((u) => u === current));
                              const next = imgs[idx + 1] || "/api/placeholder/400/400";
                              if (current !== next) {
                                e.currentTarget.src = next;
                              }
                            }}
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
                      </div>

                      <div className="px-1 sm:px-0 pt-3">
                        {/* Name */}
                        <h3 className="font-extrabold tracking-tight text-white text-base md:text-lg mb-1 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Prices */}
                        <div className="flex items-center gap-3">
                          {product.originalPrice && (
                            <span className="text-sm text-white/50 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-white font-semibold">
                            ₹{product.price.toLocaleString()}
                          </span>
                        </div>

                        {/* Order on WhatsApp + Add to Cart */}
                        <div className="mt-3 flex gap-2">
                          {/* Make Add to Cart first and prominent */}
                          <Button
                            size="sm"
                            className="rounded-full bg-white text-black hover:bg-white/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product._id as any);
                            }}
                          >
                            Add to Cart
                          </Button>

                          {/* WhatsApp button second */}
                          <Button
                            size="sm"
                            className="rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b]"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = `${window.location.origin}/product/${product._id}`;
                              const message = `Hi! I'm interested in "${product.name}" (${prettyName[product.category] ?? product.category}). Price: ₹${product.price.toLocaleString()}${product.originalPrice ? ` (MRP ₹${product.originalPrice.toLocaleString()})` : ""}. Link: ${link}`;
                              const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                              window.location.href = url;
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Order on WhatsApp
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}