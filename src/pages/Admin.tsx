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
  category: "goggles" | "watches" | "belts" | "gift box";
  images: string; // comma separated
  videos: string; // comma separated
  colors: string[];
  featured: boolean;
  inStock: boolean;
};

export default function Admin() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();
  const createProduct = useMutation(api.products.createProduct);
  const products = useQuery(api.products.getAllProducts);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const productStats = useQuery(api.products.getProductCountByCategory);

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
    videos: "",
    colors: [],
    featured: false,
    inStock: true,
  });

  const [newColor, setNewColor] = useState("");

  // Add: uploaded image URLs from device (public Convex URLs)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  // NEW: uploaded image URLs used while editing
  const [editUploadedUrls, setEditUploadedUrls] = useState<string[]>([]);

  // Add: uploaded video URLs from device (public Convex URLs)
  const [uploadedVideoUrls, setUploadedVideoUrls] = useState<string[]>([]);
  // NEW: uploaded video URLs used while editing
  const [editUploadedVideoUrls, setEditUploadedVideoUrls] = useState<string[]>([]);

  // NEW: category filter for existing products
  const [selectedCategory, setSelectedCategory] = useState<"all" | "goggles" | "watches" | "belts" | "gift box">("all");

  // Add: Convex storage upload action
  const generateUploadUrl = useAction((api as any).storage.generateUploadUrl);
  // Add: Convex storage URL resolver action (returns a canonical public URL)
  const resolvePublicUrl = useAction((api as any).storage.resolvePublicUrl);

  // Add: wait until the uploaded file is publicly readable (handles brief propagation delay)
  const ensureFileAvailable = async (url: string) => {
    // Extended delay schedule to handle slower propagation and avoid negative caching
    const delays = [0, 200, 400, 800, 1500, 2500, 4000, 6000]; // ms
    for (let i = 0; i < delays.length; i++) {
      if (delays[i]) await new Promise((r) => setTimeout(r, delays[i]));
      try {
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (res.ok) return;
      } catch {
        // try next
      }
    }
    // Final attempt using GET as a fallback; ignore body
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      if (res.ok) return;
    } catch {
      // swallow
    }
  };

  // Update: helper to upload an array of image files/blobs — resolve via Convex and wait for availability
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
      // Ask backend for the canonical public URL for this storageId
      const publicUrl: string = await resolvePublicUrl({ storageId: json.storageId as any });
      await ensureFileAvailable(publicUrl);
      // Build preview URL with proper cache-busting whether or not publicUrl already has query params
      const previewUrl =
        publicUrl + (publicUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
      newUrls.push(previewUrl);
    }
    setUploadedUrls((prev) => [...prev, ...newUrls]);
  };

  // Update: helper for edit dialog uploads — resolve via Convex and wait for availability
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
      const publicUrl: string = await resolvePublicUrl({ storageId: json.storageId as any });
      await ensureFileAvailable(publicUrl);
      // Build preview URL with proper cache-busting whether or not publicUrl already has query params
      const previewUrl =
        publicUrl + (publicUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
      newUrls.push(previewUrl);
    }
    setEditUploadedUrls((prev) => [...prev, ...newUrls]);
  };

  // Add: helper to upload video files — resolve via Convex and wait for availability
  const uploadVideoFiles = async (files: Array<File>) => {
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
      const publicUrl: string = await resolvePublicUrl({ storageId: json.storageId as any });
      await ensureFileAvailable(publicUrl);
      const previewUrl =
        publicUrl + (publicUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
      newUrls.push(previewUrl);
    }
    setUploadedVideoUrls((prev) => [...prev, ...newUrls]);
  };

  // Add: helper for edit dialog video uploads
  const uploadVideoFilesForEdit = async (files: Array<File>) => {
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
      const publicUrl: string = await resolvePublicUrl({ storageId: json.storageId as any });
      await ensureFileAvailable(publicUrl);
      const previewUrl =
        publicUrl + (publicUrl.includes("?") ? "&" : "?") + "v=" + Date.now();
      newUrls.push(previewUrl);
    }
    setEditUploadedVideoUrls((prev) => [...prev, ...newUrls]);
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

  // Add: video file upload handler
  const handleVideoFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setIsSubmitting(true);
      await uploadVideoFiles(Array.from(files));
      toast("Videos uploaded");
    } catch (err) {
      console.error(err);
      toast("Failed to upload video(s). Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add: video file upload handler for edit dialog
  const handleEditVideoFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setIsSubmitting(true);
      await uploadVideoFilesForEdit(Array.from(files));
      toast("Videos uploaded");
    } catch (err) {
      console.error(err);
      toast("Failed to upload video(s). Please try again.");
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

  // Add: paste handler for videos in create form
  const handleVideoPasteUpload = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;
      const files: Array<File> = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && file.type.startsWith("video/")) {
            files.push(file);
          }
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      setIsSubmitting(true);
      await uploadVideoFiles(files);
      toast(`Pasted ${files.length} video${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast("Failed to upload pasted video(s). Please try again.");
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

  // Add: paste handler for videos in edit dialog
  const handleEditVideoPasteUpload = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    try {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;
      const files: Array<File> = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && file.type.startsWith("video/")) files.push(file);
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      setIsSubmitting(true);
      await uploadVideoFilesForEdit(files);
      toast(`Pasted ${files.length} video${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast("Failed to upload pasted video(s). Please try again.");
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

  const submitting = useMemo(() => false, []);
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

    const videosArray = form.videos
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      const cleanedUploaded = uploadedUrls.map((u) => u.split("?")[0]);
      const cleanedVideoUploaded = uploadedVideoUrls.map((u) => u.split("?")[0]);
      
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: priceNum,
        originalPrice: originalPriceNum,
        category: form.category,
        images: [...cleanedUploaded, ...(imagesArray.length ? imagesArray : [])].length
          ? [...cleanedUploaded, ...(imagesArray.length ? imagesArray : [])]
          : ["/api/placeholder/400/400"],
        videos: [...cleanedVideoUploaded, ...videosArray].length > 0 
          ? [...cleanedVideoUploaded, ...videosArray] 
          : undefined,
        colors: form.colors.length > 0 ? form.colors : undefined,
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
        videos: "",
        colors: [],
        featured: false,
        inStock: true,
      }));
      setUploadedUrls([]);
      setUploadedVideoUrls([]);
      setNewColor("");
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
    category: "goggles" | "watches" | "belts" | "gift box";
    images: string;
    videos: string;
    colors: string[];
    featured: boolean;
    inStock: boolean;
  }>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "goggles",
    images: "",
    videos: "",
    colors: [],
    featured: false,
    inStock: true,
  });

  const [editNewColor, setEditNewColor] = useState("");

  const openEdit = (p: any) => {
    setEditId(p._id as string);
    setEditForm({
      name: p.name ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      category: (p.category as "goggles" | "watches" | "belts" | "gift box") ?? "goggles",
      images: Array.isArray(p.images) ? p.images.join(", ") : "",
      videos: Array.isArray(p.videos) ? p.videos.join(", ") : "",
      colors: Array.isArray(p.colors) ? p.colors : [],
      featured: !!p.featured,
      inStock: !!p.inStock,
    });
    // NEW: reset any previously uploaded edit URLs
    setEditUploadedUrls([]);
    setEditUploadedVideoUrls([]);
    setEditNewColor("");
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

    const videosArray = editForm.videos
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanedEditUploaded = editUploadedUrls.map((u) => u.split("?")[0]);
    const cleanedEditVideoUploaded = editUploadedVideoUrls.map((u) => u.split("?")[0]);
    const combinedImages: Array<string> = [...cleanedEditUploaded, ...imagesArray];
    const combinedVideos: Array<string> = [...cleanedEditVideoUploaded, ...videosArray];

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
      if (combinedImages.length > 0) {
        payload.images = combinedImages;
      }
      if (combinedVideos.length > 0) {
        payload.videos = combinedVideos;
      }
      if (editForm.colors.length > 0) {
        payload.colors = editForm.colors;
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

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await deleteProduct({ id: productId as any });
      toast("Product deleted successfully");
    } catch (err) {
      console.error(err);
      toast("Failed to delete product. Please try again.");
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

  // Filter products based on selected category
  const filteredProducts = products
    ? selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage products and view analytics</p>
          </div>
          <Button
            onClick={() => navigate("/admin/customers")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Customer Analytics
          </Button>
        </div>

        {/* Product Statistics Card */}
        {productStats && (
          <Card className="border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle>Product Statistics</CardTitle>
              <CardDescription>Overview of your product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-blue-900">{productStats.total}</p>
                </div>
                {Object.entries(productStats.byCategory).map(([category, count]) => (
                  <div 
                    key={category}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-sm text-gray-600 font-medium mb-1 capitalize">{category}</p>
                    <p className="text-3xl font-bold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                      <SelectItem value="gift box">Gift Box</SelectItem>
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

                {/* Add: Video upload section */}
                <div className="space-y-2">
                  <Label htmlFor="video-upload">Upload Videos (multiple)</Label>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleVideoFilesUpload(e.target.files)}
                  />
                  {uploadedVideoUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {uploadedVideoUrls.map((url, idx) => (
                        <div key={url + idx} className="relative">
                          <video
                            src={url}
                            className="h-20 w-full object-cover rounded-md border"
                            muted
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/70 text-white"
                            onClick={() =>
                              setUploadedVideoUrls((prev) => prev.filter((u) => u !== url))
                            }
                            aria-label="Remove video"
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

                {/* Add: Paste videos area */}
                <div className="space-y-2">
                  <Label htmlFor="video-paste-area">Or paste videos (Ctrl/⌘+V)</Label>
                  <textarea
                    id="video-paste-area"
                    onPaste={handleVideoPasteUpload}
                    placeholder="Click here and paste videos from clipboard"
                    className="w-full h-16 rounded-md border border-gray-200 p-3 text-sm bg-white/90"
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Copy a video and press Ctrl/⌘+V here. We'll upload it automatically.
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

                {/* Add: Video URL input */}
                <div className="space-y-2">
                  <Label htmlFor="videos">Or paste video URLs (comma separated)</Label>
                  <Input
                    id="videos"
                    value={form.videos}
                    onChange={(e) => handleChange("videos", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..., https://vimeo.com/..."
                  />
                  <p className="text-xs text-gray-500">
                    Supports YouTube, Vimeo, or direct video URLs
                  </p>
                </div>

                {/* Color Options */}
                <div className="space-y-2">
                  <Label>Color Options (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="e.g., Black, White, Blue"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newColor.trim()) {
                            setForm((prev) => ({
                              ...prev,
                              colors: [...prev.colors, newColor.trim()],
                            }));
                            setNewColor("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newColor.trim()) {
                          setForm((prev) => ({
                            ...prev,
                            colors: [...prev.colors, newColor.trim()],
                          }));
                          setNewColor("");
                        }
                      }}
                    >
                      Add Color
                    </Button>
                  </div>
                  {form.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{color}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                colors: prev.colors.filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Leave empty if product has no color variants
                  </p>
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
              {/* NEW: Category filter dropdown */}
              <div className="mb-4">
                <Label htmlFor="category-filter">Filter by Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="goggles">Goggles</SelectItem>
                    <SelectItem value="watches">Watches</SelectItem>
                    <SelectItem value="belts">Belts</SelectItem>
                    <SelectItem value="gift box">Gift Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!products ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {selectedCategory === "all" ? "No products yet." : `No ${selectedCategory} found.`}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredProducts
                    .slice()
                    .reverse()
                    .slice(0, 12)
                    .map((p) => (
                      <div
                        key={p._id}
                        className="border border-gray-200 rounded-md p-3 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {p.category} • ₹{p.price.toLocaleString()}
                              {p.originalPrice ? ` (₹${p.originalPrice.toLocaleString()})` : ""}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              {p.inStock ? "In Stock" : "Out of Stock"}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              disabled={isSubmitting}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        {/* Product Images Display */}
                        {p.images && p.images.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">Product Images:</p>
                            <div className="grid grid-cols-4 gap-2">
                              {p.images.map((img, idx) => (
                                <div key={img + idx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`${p.name} - ${idx + 1}`}
                                    className="h-16 w-full object-cover rounded border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                                    onClick={async () => {
                                      if (confirm(`Remove this image from ${p.name}?`)) {
                                        const updatedImages = p.images.filter((_, i) => i !== idx);
                                        try {
                                          await updateProduct({
                                            id: p._id as any,
                                            images: updatedImages.length > 0 ? updatedImages : ["/api/placeholder/400/400"],
                                          });
                                          toast("Image removed");
                                        } catch (e) {
                                          console.error(e);
                                          toast("Failed to remove image");
                                        }
                                      }
                                    }}
                                    aria-label="Remove image"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
              <Label>Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, category: v as typeof editForm.category }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goggles">Goggles</SelectItem>
                  <SelectItem value="watches">Watches</SelectItem>
                  <SelectItem value="belts">Belts</SelectItem>
                  <SelectItem value="gift box">Gift Box</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Add: Video upload in edit */}
            <div className="space-y-2">
              <Label htmlFor="e_video_upload">Upload Videos (multiple)</Label>
              <Input
                id="e_video_upload"
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleEditVideoFilesUpload(e.target.files)}
              />
              {editUploadedVideoUrls.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {editUploadedVideoUrls.map((url, idx) => (
                    <div key={url + idx} className="relative">
                      <video
                        src={url}
                        className="h-20 w-full object-cover rounded-md border"
                        muted
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/70 text-white"
                        onClick={() =>
                          setEditUploadedVideoUrls((prev) => prev.filter((u) => u !== url))
                        }
                        aria-label="Remove video"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add: Paste videos in edit */}
            <div className="space-y-2">
              <Label htmlFor="e_video_paste">Or paste videos (Ctrl/⌘+V)</Label>
              <textarea
                id="e_video_paste"
                onPaste={handleEditVideoPasteUpload}
                placeholder="Click here and paste videos from clipboard"
                className="w-full h-16 rounded-md border border-gray-200 p-3 text-sm bg-white/90"
              />
              <p className="text-xs text-gray-500">
                Tip: Copy a video and press Ctrl/⌘+V here. We'll upload it automatically.
              </p>
            </div>

            {/* Add: Video URL input in edit */}
            <div className="space-y-2">
              <Label htmlFor="e_videos">Video URLs (comma separated)</Label>
              <Input
                id="e_videos"
                value={editForm.videos}
                onChange={(e) => setEditForm((f) => ({ ...f, videos: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..., https://vimeo.com/..."
              />
            </div>

            {/* Color Options for Edit */}
            <div className="space-y-2">
              <Label>Color Options (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={editNewColor}
                  onChange={(e) => setEditNewColor(e.target.value)}
                  placeholder="e.g., Black, White, Blue"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (editNewColor.trim()) {
                        setEditForm((prev) => ({
                          ...prev,
                          colors: [...prev.colors, editNewColor.trim()],
                        }));
                        setEditNewColor("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (editNewColor.trim()) {
                      setEditForm((prev) => ({
                        ...prev,
                        colors: [...prev.colors, editNewColor.trim()],
                      }));
                      setEditNewColor("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {editForm.colors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editForm.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{color}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            colors: prev.colors.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Leave empty if product has no color variants
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
    </div>
  );
}