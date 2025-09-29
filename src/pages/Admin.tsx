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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery, useAction } from "convex/react";
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
  const { isLoading, isAuthenticated, user } = useAuth();
  const createProduct = useMutation(api.products.createProduct);
  const products = useQuery(api.products.getAllProducts);
  const updateProduct = useMutation(api.products.updateProduct);

  // Add: strict admin access (by email and/or role)
  const allowedEmails = new Set<string>(["vidhigadgets@gmail.com"]);
  const isAuthorized =
    !!isAuthenticated &&
    !!user &&
    ((user.role as string | undefined) === "admin" ||
      (user.email ? allowedEmails.has(user.email) : false));

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

  // Add: uploaded image URLs from device (public Convex URLs)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  // NEW: uploaded image URLs used while editing
  const [editUploadedUrls, setEditUploadedUrls] = useState<string[]>([]);

  // Add: Convex storage upload action
  const generateUploadUrl = useAction((api as any).storage.generateUploadUrl);

  // Update: helper to upload an array of image files/blobs — ensure correct Convex base URL
  const uploadImageFiles = async (files: Array<File>) => {
    if (!files || files.length === 0) return;
    const newUrls: Array<string> = [];
    for (const file of files) {
      const postUrl: string = await generateUploadUrl({});
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = (await res.json()) as { storageId: string };
      // Prefer configured Convex URL; fallback to the postUrl origin
      const convexBase =
        (import.meta.env.VITE_CONVEX_URL as string | undefined) && String(import.meta.env.VITE_CONVEX_URL).trim().length > 0
          ? String(import.meta.env.VITE_CONVEX_URL).replace(/\/+$/, "")
          : new URL(postUrl).origin;
      const publicUrl = `${convexBase}/api/storage/${json.storageId}`;
      newUrls.push(publicUrl);
    }
    setUploadedUrls((prev) => [...prev, ...newUrls]);
  };

  // NEW: helper for edit dialog uploads — ensure correct Convex base URL
  const uploadImageFilesForEdit = async (files: Array<File>) => {
    if (!files || files.length === 0) return;
    const newUrls: Array<string> = [];
    for (const file of files) {
      const postUrl: string = await generateUploadUrl({});
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = (await res.json()) as { storageId: string };
      const convexBase =
        (import.meta.env.VITE_CONVEX_URL as string | undefined) && String(import.meta.env.VITE_CONVEX_URL).trim().length > 0
          ? String(import.meta.env.VITE_CONVEX_URL).replace(/\/+$/, "")
          : new URL(postUrl).origin;
      const publicUrl = `${convexBase}/api/storage/${json.storageId}`;
      newUrls.push(publicUrl);
    }
    setEditUploadedUrls((prev) => [...prev, ...newUrls]);
  };

  // Update: reuse helper for input[type=file] uploads
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setIsSubmitting(true);
      await uploadImageFiles(Array.from(files));
      toast("Images uploaded");
    } catch (err) {
      console.error(err);
      toast("Failed to upload image(s). Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: file upload handler for edit dialog
  const handleEditFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setIsSubmitting(true);
      await uploadImageFilesForEdit(Array.from(files));
      toast("Images uploaded");
    } catch (err) {
      console.error(err);
      toast("Failed to upload image(s). Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: paste handler to accept images from clipboard for create form
  const handlePasteUpload = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;
      const files: Array<File> = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && file.type.startsWith("image/")) {
            files.push(file);
          }
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      setIsSubmitting(true);
      await uploadImageFiles(files);
      toast(`Pasted ${files.length} image${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast("Failed to upload pasted image(s). Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: paste handler for edit dialog
  const handleEditPasteUpload = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;
      const files: Array<File> = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && file.type.startsWith("image/")) files.push(file);
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      setIsSubmitting(true);
      await uploadImageFilesForEdit(files);
      toast(`Pasted ${files.length} image${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast("Failed to upload pasted image(s). Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Add: redirect non-admins away from /admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user !== undefined && !isAuthorized) {
      toast("You are not authorized to access Admin.");
      navigate("/");
    }
  }, [isLoading, isAuthenticated, user, isAuthorized, navigate]);

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
        // Combine device-uploaded URLs + typed URLs
        images: [...uploadedUrls, ...(imagesArray.length ? imagesArray : [])].length
          ? [...uploadedUrls, ...(imagesArray.length ? imagesArray : [])]
          : ["/api/placeholder/400/400"],
        featured: form.featured,
        inStock: form.inStock,
      });
      toast("Product added successfully!");
      // Reset minimal fields; keep category for speed. Clear uploads as well.
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
      setUploadedUrls([]);
    } catch (err) {
      console.error(err);
      toast("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    price: string;
    originalPrice: string;
    category: "goggles" | "watches" | "belts";
    images: string; // comma separated
    featured: boolean;
    inStock: boolean;
  }>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "goggles",
    images: "",
    featured: false,
    inStock: true,
  });

  const openEdit = (p: any) => {
    setEditId(p._id as string);
    setEditForm({
      name: p.name ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      category: (p.category as "goggles" | "watches" | "belts") ?? "goggles",
      images: Array.isArray(p.images) ? p.images.join(", ") : "",
      featured: !!p.featured,
      inStock: !!p.inStock,
    });
    // NEW: reset any previously uploaded edit URLs
    setEditUploadedUrls([]);
    setIsEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editId) return;
    const priceNum = Number(editForm.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast("Please enter a valid price.");
      return;
    }
    const originalPriceNum = editForm.originalPrice ? Number(editForm.originalPrice) : undefined;
    if (editForm.originalPrice && (Number.isNaN(originalPriceNum) || (originalPriceNum as number) <= 0)) {
      toast("Original price must be a valid number greater than 0.");
      return;
    }
    const imagesArray = editForm.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // NEW: combine newly uploaded edit images + typed URLs
    const combinedImages: Array<string> = [...editUploadedUrls, ...imagesArray];

    try {
      setIsSubmitting(true);
      const payload: any = {
        id: editId as any,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: priceNum,
        originalPrice: originalPriceNum,
        category: editForm.category,
        featured: editForm.featured,
        inStock: editForm.inStock,
      };
      // Only patch images if user provided new uploads or typed URLs
      if (combinedImages.length > 0) {
        payload.images = combinedImages;
      }
      await updateProduct(payload);
      toast("Product updated.");
      setIsEditOpen(false);
      setEditId(null);
    } catch (e) {
      console.error(e);
      toast("Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update: guard render against unauthorized users
  if (isLoading || !isAuthenticated || !isAuthorized) {
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

                {/* Add: Device upload section */}
                <div className="space-y-2">
                  <Label htmlFor="upload">Upload Images (multiple)</Label>
                  <Input
                    id="upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesUpload(e.target.files)}
                  />
                  {uploadedUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {uploadedUrls.map((url, idx) => (
                        <div key={url + idx} className="relative">
                          <img
                            src={url}
                            alt={`uploaded-${idx}`}
                            className="h-20 w-full object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/70 text-white"
                            onClick={() =>
                              setUploadedUrls((prev) => prev.filter((u) => u !== url))
                            }
                            aria-label="Remove image"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* NEW: Paste images area */}
                <div className="space-y-2">
                  <Label htmlFor="paste-area">Or paste images (Ctrl/⌘+V)</Label>
                  <textarea
                    id="paste-area"
                    onPaste={handlePasteUpload}
                    placeholder="Click here and paste images from clipboard"
                    className="w-full h-16 rounded-md border border-gray-200 p-3 text-sm bg-white/90"
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Copy an image (or screenshot) and press Ctrl/⌘+V here. We'll upload it automatically.
                  </p>
                </div>

                {/* Existing: URL input remains, now optional */}
                <div className="space-y-2">
                  <Label htmlFor="images">Or paste image URLs (comma separated)</Label>
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
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-500">{p.inStock ? "In Stock" : "Out of Stock"}</div>
                          <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e_name">Name</Label>
              <Input
                id="e_name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e_desc">Description</Label>
              <Input
                id="e_desc"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="e_price">Price (₹)</Label>
                <Input
                  id="e_price"
                  type="number"
                  min={0}
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e_oprice">Original Price (₹)</Label>
                <Input
                  id="e_oprice"
                  type="number"
                  min={0}
                  value={editForm.originalPrice}
                  onChange={(e) => setEditForm((f) => ({ ...f, originalPrice: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="e_images">Image URLs (comma separated)</Label>
              <Input
                id="e_images"
                value={editForm.images}
                onChange={(e) => setEditForm((f) => ({ ...f, images: e.target.value }))}
                placeholder="https://..., https://..."
              />
            </div>

            {/* NEW: Upload Images in Edit */}
            <div className="space-y-2">
              <Label htmlFor="e_upload">Upload Images (multiple)</Label>
              <Input
                id="e_upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleEditFilesUpload(e.target.files)}
              />
              {editUploadedUrls.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {editUploadedUrls.map((url, idx) => (
                    <div key={url + idx} className="relative">
                      <img
                        src={url}
                        alt={`uploaded-edit-${idx}`}
                        className="h-20 w-full object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/70 text-white"
                        onClick={() =>
                          setEditUploadedUrls((prev) => prev.filter((u) => u !== url))
                        }
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NEW: Paste Images in Edit */}
            <div className="space-y-2">
              <Label htmlFor="e_paste">Or paste images (Ctrl/⌘+V)</Label>
              <textarea
                id="e_paste"
                onPaste={handleEditPasteUpload}
                placeholder="Click here and paste images from clipboard"
                className="w-full h-16 rounded-md border border-gray-200 p-3 text-sm bg-white/90"
              />
              <p className="text-xs text-gray-500">
                Tip: Copy an image (or screenshot) and press Ctrl/⌘+V here. We'll upload it automatically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div>
                  <Label className="cursor-pointer">Featured</Label>
                </div>
                <Switch
                  checked={editForm.featured}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, featured: v }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div>
                  <Label className="cursor-pointer">In Stock</Label>
                </div>
                <Switch
                  checked={editForm.inStock}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, inStock: v }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitEdit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}