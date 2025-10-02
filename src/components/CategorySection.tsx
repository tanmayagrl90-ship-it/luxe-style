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
      "https://harmless-tapir-303.convex.cloud/api/storage/adc0df0b-62a0-4fdb-87fd-507cb9c5ab6a",
      "https://harmless-tapir-303.convex.cloud/api/storage/2c1304f0-375a-441b-952b-70ebc9753d88"
    ],
    href: "/category/goggles",
    color: "from-blue-500 to-purple-600"
  },
  {
    name: "Designer Watches",
    description: "Timepieces that define sophistication",
    images: [
      "https://harmless-tapir-303.convex.cloud/api/storage/0df7a66e-c4cd-4165-8eb8-eb91d8b079b1",
      "https://harmless-tapir-303.convex.cloud/api/storage/882e40ac-661b-4f0a-87f2-48744b7ddf77"
    ],
    href: "/category/watches",
    color: "from-amber-500 to-orange-600"
  },
  {
    name: "Luxury Belts",
    description: "Crafted accessories for the discerning individual",
    images: [
      "https://harmless-tapir-303.convex.cloud/api/storage/5d06c704-4d0d-4c4b-bd9c-b4a42c7e2d96",
      "https://harmless-tapir-303.convex.cloud/api/storage/8b8a5a4e-e0dd-45b8-885f-dae0013cf643",
      "https://harmless-tapir-303.convex.cloud/api/storage/d598cf55-8bc8-43ac-9151-f4187d918545"
    ],
    href: "/category/belts",
    color: "from-emerald-500 to-teal-600"
  }
];

// Define different transition variants for each image
const transitionVariants = [
  // Image 0: Zoom in with rotation
  {
    initial: { opacity: 0, scale: 1.2, rotate: -5 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.85, rotate: 5 },
    transition: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }
  },
  // Image 1: Slide from right with fade
  {
    initial: { opacity: 0, x: 100, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -100, scale: 0.9 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
  },
  // Image 2: Zoom out with vertical slide
  {
    initial: { opacity: 0, scale: 0.7, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.2, y: -50 },
    transition: { duration: 0.2, ease: [0.65, 0, 0.35, 1] }
  }
];

// Unique transition variants for watches
const watchTransitionVariants = [
  // Watch Image 0: Slide from left with scale
  {
    initial: { opacity: 0, x: -100, scale: 0.85 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 100, scale: 0.85 },
    transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
  },
  // Watch Image 1: Fade with rotation
  {
    initial: { opacity: 0, rotate: 10, scale: 1.1 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: -10, scale: 0.9 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  }
];

// Unique transition variants for belts
const beltTransitionVariants = [
  // Belt Image 0: Diagonal slide with scale
  {
    initial: { opacity: 0, x: -80, y: -80, scale: 0.8 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 0, x: 80, y: 80, scale: 0.8 },
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  // Belt Image 1: Flip effect with scale
  {
    initial: { opacity: 0, rotateY: 90, scale: 0.85 },
    animate: { opacity: 1, rotateY: 0, scale: 1 },
    exit: { opacity: 0, rotateY: -90, scale: 0.85 },
    transition: { duration: 0.2, ease: [0.68, -0.55, 0.265, 1.55] }
  },
  // Belt Image 2: Spiral zoom
  {
    initial: { opacity: 0, scale: 0.5, rotate: -180 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 1.5, rotate: 180 },
    transition: { duration: 0.2, ease: [0.87, 0, 0.13, 1] }
  }
];

export default function CategorySection() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentWatchIndex, setCurrentWatchIndex] = useState(0);
  const [currentBeltIndex, setCurrentBeltIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [watchesLoaded, setWatchesLoaded] = useState(false);
  const [beltsLoaded, setBeltsLoaded] = useState(false);

  // Preload all images for smooth transitions - Goggles
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
          setImagesLoaded(true);
        });
    }
  }, []);

  // Preload watch images
  useEffect(() => {
    const watchesCategory = categories.find(c => c.name === "Designer Watches");
    if (watchesCategory?.images) {
      const imagePromises = watchesCategory.images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(() => setWatchesLoaded(true))
        .catch((err) => {
          console.error("Error preloading watch images:", err);
          setWatchesLoaded(true);
        });
    }
  }, []);

  // Preload belt images
  useEffect(() => {
    const beltsCategory = categories.find(c => c.name === "Luxury Belts");
    if (beltsCategory?.images) {
      const imagePromises = beltsCategory.images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(() => setBeltsLoaded(true))
        .catch((err) => {
          console.error("Error preloading belt images:", err);
          setBeltsLoaded(true);
        });
    }
  }, []);

  // Auto-slide effect for Premium Goggles - only start after images are loaded
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // Auto-slide effect for Designer Watches - only start after images are loaded
  useEffect(() => {
    if (!watchesLoaded) return;
    
    // Start with a 700ms delay to offset from goggles
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentWatchIndex((prev) => (prev + 1) % 2);
      }, 2000);
      
      return () => clearInterval(interval);
    }, 700);

    return () => clearTimeout(timeout);
  }, [watchesLoaded]);

  // Auto-slide effect for Luxury Belts - only start after images are loaded
  useEffect(() => {
    if (!beltsLoaded) return;
    
    // Start with a 1400ms delay to offset from watches
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentBeltIndex((prev) => (prev + 1) % 3);
      }, 2000);
      
      return () => clearInterval(interval);
    }, 1400);

    return () => clearTimeout(timeout);
  }, [beltsLoaded]);

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
                        initial={transitionVariants[currentImageIndex].initial}
                        animate={transitionVariants[currentImageIndex].animate}
                        exit={transitionVariants[currentImageIndex].exit}
                        transition={transitionVariants[currentImageIndex].transition}
                        style={{ willChange: "transform, opacity" }}
                      />
                    </AnimatePresence>
                  ) : category.name === "Designer Watches" && category.images ? (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentWatchIndex}
                        src={category.images[currentWatchIndex]}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        initial={watchTransitionVariants[currentWatchIndex].initial}
                        animate={watchTransitionVariants[currentWatchIndex].animate}
                        exit={watchTransitionVariants[currentWatchIndex].exit}
                        transition={watchTransitionVariants[currentWatchIndex].transition}
                        style={{ willChange: "transform, opacity" }}
                      />
                    </AnimatePresence>
                  ) : category.name === "Luxury Belts" && category.images ? (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentBeltIndex}
                        src={category.images[currentBeltIndex]}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        initial={beltTransitionVariants[currentBeltIndex].initial}
                        animate={beltTransitionVariants[currentBeltIndex].animate}
                        exit={beltTransitionVariants[currentBeltIndex].exit}
                        transition={beltTransitionVariants[currentBeltIndex].transition}
                        style={{ willChange: "transform, opacity" }}
                      />
                    </AnimatePresence>
                  ) : category.images && category.images.length > 0 ? (
                    <img
                      src={category.images[0]}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
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