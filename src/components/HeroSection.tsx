import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const bg =
    "https://harmless-tapir-303.convex.cloud/api/storage/4f76948d-58fd-42fa-954f-f273f9e04683";

  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden bg-black">
      {/* Background image */}
      <img
        src={bg}
        alt="LUXE flagship visual"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      {/* Subtle dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Centered content */}
      <div className="relative z-10 flex min-h-[88vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <div className="mb-6">
            <span className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs tracking-wider text-white/80">
              PREMIUM ACCESSORIES
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-[0.15em] text-white">
            LUXE
          </h1>

          <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl mx-auto">
            Curated goggles, watches, and belts. Minimal design. Maximum impact.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              onClick={() => (window.location.href = "/category/goggles")}
            >
              Shop Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
              onClick={() => (window.location.href = "/category/watches")}
            >
              Explore Watches
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}