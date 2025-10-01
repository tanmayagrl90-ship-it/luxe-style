import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductZoomProps {
  images: string[];
  productName: string;
  initialIndex?: number;
}

export default function ProductZoom({ images, productName, initialIndex = 0 }: ProductZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  if (!images || images.length === 0) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full h-10 w-10"
        onClick={() => setIsOpen(true)}
        aria-label="Zoom image"
      >
        <ZoomIn className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 rounded-full h-12 w-12"
              onClick={() => setIsOpen(false)}
              aria-label="Close zoom"
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={activeIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={images[activeIndex]}
                alt={`${productName} - Image ${activeIndex + 1}`}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />

              {images.length > 1 && (
                <div className="flex gap-3 mt-4 justify-center overflow-x-auto pb-2">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all duration-200 ${
                        activeIndex === idx
                          ? "ring-white"
                          : "ring-white/20 hover:ring-white/40"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={src}
                        alt={`${productName} thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
