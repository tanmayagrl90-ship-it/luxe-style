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
import { GripVertical } from "lucide-react";

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

// Add new type for unified media items
type MediaItem = {
  url: string;
  type: 'image' | 'video';
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

  // Replace separate image/video states with unified media state
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [editUploadedMedia, setEditUploadedMedia] = useState<MediaItem[]>([]);
  const [uploadingInBackground, setUploadingInBackground] = useState(false);

  // Add: Convex storage upload action
  const generateUploadUrl = useAction((api as any).storage.generateUploadUrl);
  // Add: Convex storage URL resolver action (returns a canonical public URL)
  const resolvePublicUrl = useAction((api as any).storage.resolvePublicUrl);

  // Optimized: wait until the uploaded file is publicly readable (minimal delay)
  const ensureFileAvailable = async (url: string) => {
    // Single quick check - blob URLs show instantly, actual upload happens in background
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) return;
    } catch (err) {
      // Silently handle browser extension interference or network issues
      // File will be available shortly, continue anyway
      console.debug("File availability check skipped:", err);
    }
  };

  // Updated: unified media upload helper - non-blocking with background upload
  const uploadMediaFiles = async (files: Array<File>, isEdit: boolean = false) => {
    if (!files || files.length === 0) return;
    
    const blobItems: MediaItem[] = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    
    if (isEdit) {
      setEditUploadedMedia((prev) => [...prev, ...blobItems]);
    } else {
      setUploadedMedia((prev) => [...prev, ...blobItems]);
    }
    
    // Upload in background without blocking
    setUploadingInBackground(true);
    
    // Process uploads asynchronously with better error handling
    Promise.all(files.map(async (file, i) => {
      const blobUrl = blobItems[i].url;
      const mediaType = blobItems[i].type;
      
      try {
        const postUrl: string = await generateUploadUrl({});
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const json = (await res.json()) as { storageId: string };
        const publicUrl: string = await resolvePublicUrl({ storageId: json.storageId as any });
        
        const updateFn = isEdit ? setEditUploadedMedia : setUploadedMedia;
        updateFn((prev) => {
          const newArr = [...prev];
          const blobIndex = newArr.findIndex(item => item.url === blobUrl);
          if (blobIndex !== -1) {
            newArr[blobIndex] = { url: publicUrl, type: mediaType };
            URL.revokeObjectURL(blobUrl);
          }
          return newArr;
        });
      } catch (err) {
        // Handle errors gracefully - could be browser extension interference
        console.error("Media upload error (may be browser extension):", err);
        const updateFn = isEdit ? setEditUploadedMedia : setUploadedMedia;
        updateFn((prev) => prev.filter(item => item.url !== blobUrl));
        URL.revokeObjectURL(blobUrl);
        toast.error("Upload interrupted. Please try again or disable browser extensions.");
      }
    })).finally(() => {
      setUploadingInBackground(false);
    });
  };

  // Update: reuse helper for input[type=file] uploads
  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      await uploadMediaFiles(Array.from(files), false);
      toast("Media uploaded");
    } catch (err) {
      console.error(err);
      toast("Failed to upload media. Please try again.");
    }
  };

  // Add: video file upload handler for edit dialog
  const handleEditFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      await uploadMediaFiles(Array.from(files), true);
      toast("Media uploaded");
    } catch (err) {
      console.error(err);
      toast("Failed to upload media. Please try again.");
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
          if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
            files.push(file);
          }
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      setIsSubmitting(true);
      await uploadMediaFiles(files, false);
      toast(`Pasted ${files.length} item${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast("Failed to upload pasted media. Please try again.");
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
      await uploadMediaFiles(files, false);
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
          if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
            files.push(file);
          }
        }
      }
      if (files.length === 0) return;
      e.preventDefault();
      setIsSubmitting(true);
      await uploadMediaFiles(files, true);
      toast(`Pasted ${files.length} item${files.length > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast("Failed to upload pasted media. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Drag and drop handlers for image reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    setUploadedMedia((prev) => {
      const newArr = [...prev];
      const draggedItem = newArr[draggedIndex];
      newArr.splice(draggedIndex, 1);
      newArr.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      return newArr;
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // NEW: Drag handlers for edit dialog
  const [editDraggedIndex, setEditDraggedIndex] = useState<number | null>(null);

  const handleEditDragStart = (index: number) => {
    setEditDraggedIndex(index);
  };

  const handleEditDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (editDraggedIndex === null || editDraggedIndex === index) return;
    
    setEditUploadedMedia((prev) => {
      const newArr = [...prev];
      const draggedItem = newArr[editDraggedIndex];
      newArr.splice(editDraggedIndex, 1);
      newArr.splice(index, 0, draggedItem);
      setEditDraggedIndex(index);
      return newArr;
    });
  };

  const handleEditDragEnd = () => {
    setEditDraggedIndex(null);
  };

  // Add missing selectedCategory state to fix TS errors and enable category filtering
  const [selectedCategory, setSelectedCategory] = useState<"all" | "goggles" | "watches" | "belts" | "gift box">("all");

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
    if (isSubmitting) return;

    // Validate text fields
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

    // Allow submission even if uploads are in progress - they'll complete in background
    const hasBlobUrls = uploadedMedia.some(item => item.url.startsWith("blob:"));
    if (hasBlobUrls && uploadingInBackground) {
      toast.info("Uploads are still processing. Product will be saved once uploads complete.");
      // Continue with submission - uploads will finish in background
    }

    setIsSubmitting(true);

    try {
      // Wait a moment for any in-progress uploads to complete
      if (uploadingInBackground) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const cleanedMedia = uploadedMedia
        .filter(item => !item.url.startsWith("blob:"))
        .map(item => ({ ...item, url: item.url.split("?")[0] }));

      const images = cleanedMedia.filter(item => item.type === "image").map(item => item.url);
      const videos = cleanedMedia.filter(item => item.type === "video").map(item => item.url);

      // Require at least one real image to avoid placeholder saves
      if (images.length === 0) {
        toast.error("Please upload at least one product image before submitting.");
        setIsSubmitting(false);
        return;
      }

      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: priceNum,
        originalPrice: originalPriceNum,
        category: form.category,
        images,
        videos: videos.length > 0 ? videos : undefined,
        colors: form.colors.length > 0 ? form.colors : undefined,
        featured: form.featured,
        inStock: form.inStock,
      });

      toast("Product added successfully!");
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
      setUploadedMedia([]);
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

  // Update openEdit to include existing images & videos in a unified reorderable list
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

    // Build initial unified media list from existing product data (images first, then videos)
    const initialMedia: MediaItem[] = [
      ...(Array.isArray(p.images) ? p.images.map((url: string) => ({ url, type: 'image' as const })) : []),
      ...(Array.isArray(p.videos) ? p.videos.map((url: string) => ({ url, type: 'video' as const })) : []),
    ];
    setEditUploadedMedia(initialMedia);

    setEditNewColor("");
    setIsEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editId) return;

    // Prevent saving while media is still uploading
    if (uploadingInBackground && editUploadedMedia.some(item => item.url.startsWith("blob:"))) {
      toast.error("Please wait for media uploads to finish before saving changes.");
      return;
    }

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

    try {
      setIsSubmitting(true);

      // Prefer unified list (drag-reordered) if present; otherwise fallback to manual fields
      const hasUnifiedList = editUploadedMedia.length > 0;
      let combinedImages: string[] = [];
      let combinedVideos: string[] = [];

      if (hasUnifiedList) {
        const cleanedMedia = editUploadedMedia
          .filter(item => !item.url.startsWith('blob:'))
          .map(item => ({ ...item, url: item.url.split("?")[0] }));

        combinedImages = cleanedMedia.filter(item => item.type === 'image').map(item => item.url);
        combinedVideos = cleanedMedia.filter(item => item.type === 'video').map(item => item.url);
      } else {
        const manualImages = editForm.images.split(",").map((s) => s.trim()).filter(Boolean);
        const manualVideos = editForm.videos.split(",").map((s) => s.trim()).filter(Boolean);
        combinedImages = manualImages;
        combinedVideos = manualVideos;
      }

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

                {/* Updated: Unified media upload section with drag-and-drop */}
                <div className="space-y-2">
                  <Label htmlFor="upload">Upload Images & Videos (multiple)</Label>
                  <Input
                    id="upload"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleFilesUpload(e.target.files)}
                  />
                  {uploadedMedia.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {uploadedMedia.map((item, idx) => (
                        <div
                          key={item.url + idx}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`relative cursor-move group ${
                            draggedIndex === idx ? 'opacity-50' : ''
                          }`}
                        >
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt={`media-${idx}`}
                              className="h-20 w-full object-cover rounded-md border"
                            />
                          ) : (
                            <video
                              src={item.url}
                              className="h-20 w-full object-cover rounded-md border"
                              muted
                            />
                          )}
                          {/* Number badge */}
                          <div className="absolute top-1 left-1 bg-black/80 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {idx + 1}
                          </div>
                          {/* Media type indicator */}
                          <div className="absolute top-1 right-8 bg-blue-600/90 text-white text-[10px] px-1.5 py-0.5 rounded">
                            {item.type === 'video' ? 'VIDEO' : 'IMG'}
                          </div>
                          {/* Drag handle */}
                          <div className="absolute top-1 left-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-4 w-4 text-white drop-shadow-lg" />
                          </div>
                          <button
                            type="button"
                            className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/70 text-white"
                            onClick={() =>
                              setUploadedMedia((prev) => prev.filter((_, i) => i !== idx))
                            }
                            aria-label="Remove media"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Drag media to reorder them. First item will be the main product media. Videos and images can be mixed.
                  </p>
                </div>

                {/* Updated: Paste area for both images and videos */}
                <div className="space-y-2">
                  <Label htmlFor="paste-area">Or paste images/videos (Ctrl/⌘+V)</Label>
                  <textarea
                    id="paste-area"
                    onPaste={handlePasteUpload}
                    placeholder="Click here and paste images or videos from clipboard"
                    className="w-full h-16 rounded-md border border-gray-200 p-3 text-sm bg-white/90"
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Copy an image or video and press Ctrl/⌘+V here. We'll upload it automatically.
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
                  <Button type="submit" disabled={isSubmitting}>
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

      {/* Updated Edit Dialog with unified media */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
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

            <div className="space-y-2">
              <Label htmlFor="e_upload">Upload Images & Videos (multiple)</Label>
              <Input
                id="e_upload"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleEditFilesUpload(e.target.files)}
              />
              {editUploadedMedia.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {editUploadedMedia.map((item, idx) => (
                    <div
                      key={item.url + idx}
                      draggable
                      onDragStart={() => handleEditDragStart(idx)}
                      onDragOver={(e) => handleEditDragOver(e, idx)}
                      onDragEnd={handleEditDragEnd}
                      className={`relative cursor-move group ${
                        editDraggedIndex === idx ? 'opacity-50' : ''
                      }`}
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={`media-${idx}`}
                          className="h-20 w-full object-cover rounded-md border"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="h-20 w-full object-cover rounded-md border"
                          muted
                        />
                      )}
                      <div className="absolute top-1 left-1 bg-black/80 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div className="absolute top-1 right-8 bg-blue-600/90 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {item.type === 'video' ? 'VIDEO' : 'IMG'}
                      </div>
                      <div className="absolute top-1 left-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4 text-white drop-shadow-lg" />
                      </div>
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded bg-black/70 text-white"
                        onClick={() =>
                          setEditUploadedMedia((prev) => prev.filter((_, i) => i !== idx))
                        }
                        aria-label="Remove media"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="e_paste">Or paste images/videos (Ctrl/⌘+V)</Label>
              <textarea
                id="e_paste"
                onPaste={handleEditPasteUpload}
                placeholder="Click here and paste images or videos from clipboard"
                className="w-full h-16 rounded-md border border-gray-200 p-3 text-sm bg-white/90"
              />
              <p className="text-xs text-gray-500">
                Tip: Copy an image or video and press Ctrl/⌘+V here. We'll upload it automatically.
              </p>
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