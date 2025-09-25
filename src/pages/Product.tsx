import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [qty, setQty] = useState(1);

  const handleAddToCart = async () => {
    try {
      let currentUserId = user?._id;
      if (!isAuthenticated || !currentUserId) {
        await signIn("anonymous");
        toast("Signed in as guest. Tap Add to Cart again.");
        return;
      }
      await addToCart({
        userId: currentUserId,
        productId: id as any,
        quantity: qty,
      });
      toast("Added to cart");
    } catch (e) {
      console.error(e);
      toast("Failed to add to cart");
    }
  };

  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }
  if (product === null) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <p className="text-gray-600">Product not found.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const image = product.images?.[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10">
          {/* Left: Big Image */}
          <Card className="bg-black border-white/10 overflow-hidden rounded-2xl">
            <div className="relative aspect-square">
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-white/5 rounded-2xl flex items-center justify-center">
                  <span className="text-white/70">
                    {prettyName[product.category] ?? product.category}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Right: Details */}
          <div>
            <p className="uppercase tracking-wide text-sm text-white/60 mb-2">
              {prettyName[product.category] ?? product.category}
            </p>
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

            <p className="text-white/70 mt-4">{product.description}</p>

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-sm text-white/70 mb-2">Quantity</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 rounded-full bg-white text-black hover:bg-white/90"
              >
                Add to cart
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-full border-green-500 text-white hover:bg-green-600/20"
                onClick={() => {
                  const message = `Hi! I'm interested in "${product.name}" (${prettyName[product.category] ?? product.category}). Price: ₹${product.price.toLocaleString()}${product.originalPrice ? ` (MRP ₹${product.originalPrice.toLocaleString()})` : ""}.`;
                  const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                  window.open(url, "_blank");
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                ORDER ON WHATSAPP
              </Button>
            </div>

            {/* Stock */}
            <p className="mt-4 text-sm">
              {product.inStock ? (
                <span className="text-green-400">In stock</span>
              ) : (
                <span className="text-red-400">Out of stock</span>
              )}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
