import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "framer-motion";

type NewProduct = {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: "goggles" | "watches" | "belts";
  images: string; // comma separated
  featured: boolean;
  inStock: boolean;
};

export default function Admin() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth();
  const createProduct = useMutation(api.products.createProduct);
  const products = useQuery(api.products.getAllProducts);

  const [form, setForm] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "goggles",
    images: "",
    featured: false,
    inStock: true,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const submitting = useMemo(() => false, []); // keep UI simple; Button will be disabled during async op via local state below
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof NewProduct, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!form.name.trim()) {
      toast("Please enter a product name.");
      return;
    }
    if (!form.description.trim()) {
      toast("Please enter a product description.");
      return;
    }
    const priceNum = Number(form.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast("Please enter a valid price.");
      return;
    }
    const originalPriceNum = form.originalPrice ? Number(form.originalPrice) : undefined;
    if (form.originalPrice && (Number.isNaN(originalPriceNum) || (originalPriceNum as number) <= 0)) {
      toast("Original price must be a valid number greater than 0.");
      return;
    }
    const imagesArray = form.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: priceNum,
        originalPrice: originalPriceNum,
        category: form.category,
        images: imagesArray.length ? imagesArray : ["/api/placeholder/400/400"],
        featured: form.featured,
        inStock: form.inStock,
      });
      toast("Product added successfully!");
      // Reset minimal fields; keep category for speed
      setForm((prev) => ({
        ...prev,
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        images: "",
        featured: false,
        inStock: true,
      }));
    } catch (err) {
      console.error(err);
      toast("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Site
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>Fill details and upload your product.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Classic Chronograph"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Short premium description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="5999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      min={0}
                      value={form.originalPrice}
                      onChange={(e) => handleChange("originalPrice", e.target.value)}
                      placeholder="8999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      handleChange("category", v as NewProduct["category"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goggles">Goggles</SelectItem>
                      <SelectItem value="watches">Watches</SelectItem>
                      <SelectItem value="belts">Belts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Images (comma separated URLs)</Label>
                  <Input
                    id="images"
                    value={form.images}
                    onChange={(e) => handleChange("images", e.target.value)}
                    placeholder="/api/placeholder/400/400, https://example.com/img2.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                    <div>
                      <Label className="cursor-pointer">Featured</Label>
                      <p className="text-xs text-gray-500">Show on homepage highlights</p>
                    </div>
                    <Switch
                      checked={form.featured}
                      onCheckedChange={(v) => handleChange("featured", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                    <div>
                      <Label className="cursor-pointer">In Stock</Label>
                      <p className="text-xs text-gray-500">Enable purchase availability</p>
                    </div>
                    <Switch
                      checked={form.inStock}
                      onCheckedChange={(v) => handleChange("inStock", v)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || submitting}>
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Existing Products</CardTitle>
              <CardDescription>Recently added items</CardDescription>
            </CardHeader>
            <CardContent>
              {!products ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-gray-500">No products yet.</p>
              ) : (
                <div className="space-y-3">
                  {products
                    .slice()
                    .reverse()
                    .slice(0, 12)
                    .map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between border border-gray-200 rounded-md p-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {p.category} • ₹{p.price.toLocaleString()}
                            {p.originalPrice ? ` (₹${p.originalPrice.toLocaleString()})` : ""}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">{p.inStock ? "In Stock" : "Out of Stock"}</div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
