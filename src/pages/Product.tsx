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
import { Minus, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const supportsColors =
    (product?.name ?? "").toLowerCase() === "coach belt" ||
    (product?.name ?? "").toLowerCase() === "coach premium belt";
  const [color, setColor] = useState<"black" | "white">("black");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!product?.images?.length) return;
    if (supportsColors) {
      setActiveIndex(color === "black" ? 0 : Math.min(1, product.images.length - 1));
    } else {
      setActiveIndex(0);
    }
  }, [product?._id, product?.images?.length, supportsColors, color]);

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
        color: supportsColors ? color : undefined,
      } as any);
      toast("Added to cart");
    } catch (e) {
      console.error(e);
      toast("Failed to add to cart");
    }
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
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10">
          <Card className="bg-black border-white/10 overflow-hidden rounded-2xl">
            <div className="relative aspect-square">
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-300"
                  loading="eager"
                  fetchPriority="high"
                />
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
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden flex-shrink-0 ring-1 transition-all duration-200 ${
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

            <div className="mt-6">
              <p className="text-sm text-white/70 mb-2">Quantity</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10 transition-colors duration-200"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
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
                onClick={() => {
                  const link = `${window.location.origin}/product/${product._id}`;
                  const message = `Hi! I'm interested in "${product.name}" (${prettyName[product.category] ?? product.category}). Price: ₹${product.price.toLocaleString()}${product.originalPrice ? ` (MRP ₹${product.originalPrice.toLocaleString()})` : ""}.${supportsColors ? ` Color: ${color[0].toUpperCase() + color.slice(1)}.` : ""} Link: ${link}`;
                  const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
                  window.location.href = url;
                }}
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
      </main>
      <Footer />
    </div>
  );
}