import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

const categories = [
  {
    name: "Premium Goggles",
    description: "Luxury eyewear for the modern trendsetter",
    images: [
      "https://harmless-tapir-303.convex.cloud/api/storage/1a7551ea-0394-4354-b7ed-fc2497132148",
      "https://harmless-tapir-303.convex.cloud/api/storage/adc0df0b-62a0-4fdb-87fd-507cb9c5ab6a"
    ],
    href: "/category/goggles",
    color: "from-blue-500 to-purple-600"
  },
  {
    name: "Designer Watches",
    description: "Timepieces that define sophistication",
    image: "/api/placeholder/400/300",
    href: "/category/watches",
    color: "from-amber-500 to-orange-600"
  },
  {
    name: "Luxury Belts",
    description: "Crafted accessories for the discerning individual",
    image: "/api/placeholder/400/300",
    href: "/category/belts",
    color: "from-emerald-500 to-teal-600"
  }
];

export default function CategorySection() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all images for smooth transitions
  useEffect(() => {
    const gogglesCategory = categories.find(c => c.name === "Premium Goggles");
    if (gogglesCategory?.images) {
      const imagePromises = gogglesCategory.images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(() => setImagesLoaded(true))
        .catch((err) => {
          console.error("Error preloading images:", err);
          setImagesLoaded(true); // Still show carousel even if preload fails
        });
    }
  }, []);

  // Auto-slide effect for Premium Goggles - only start after images are loaded
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 2);
    }, 2000);

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Explore Our Collections
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover premium accessories that elevate your style and make a statement
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <Card
                className="group cursor-pointer overflow-hidden ring-1 ring-white/10 hover:ring-white/20 bg-transparent transition-all duration-300"
                onClick={() => navigate(category.href)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(category.href);
                  }
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {category.name === "Premium Goggles" && category.images ? (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={category.images[currentImageIndex]}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ 
                          duration: 0.4, 
                          ease: "easeInOut"
                        }}
                        style={{ willChange: "transform, opacity" }}
                      />
                    </AnimatePresence>
                  ) : (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {category.description}
                  </p>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-white hover:text-white/80 group-hover:translate-x-1 transition-transform duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(category.href);
                    }}
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}