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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                {prettyName[category] ?? "Collection"}
              </h1>
              <p className="text-gray-600 mt-2">Explore our premium {prettyName[category] ?? "products"}.</p>
            </div>

            {!products ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="group overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300 bg-white cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div
                        className="relative aspect-square overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {prettyName[product.category] ?? product.category}
                            </span>
                          </div>
                        )}
                        {product.featured && (
                          <Badge className="absolute top-3 left-3 z-10 bg-gray-900 text-white">Featured</Badge>
                        )}
                      </div>

                      <div className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">4.8</span>
                            <span className="text-sm text-gray-400">(100+)</span>
                          </div>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {product.name}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => {
                              const message = `Hi! I'm interested in "${product.name}" (${prettyName[product.category] ?? product.category}). Price: ₹${product.price.toLocaleString()}${product.originalPrice ? ` (MRP ₹${product.originalPrice.toLocaleString()})` : ""}. Please share more details.`;
                              const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleAddToCart(product._id as any)}
                          >
                            Add to Cart
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
    </motion.div>
  );
}