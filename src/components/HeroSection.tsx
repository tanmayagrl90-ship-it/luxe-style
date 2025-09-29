import { motion } from "framer-motion";

export default function HeroSection() {
  const bg =
    "https://harmless-tapir-303.convex.cloud/api/storage/9c7a0c50-e4a8-4cc2-b631-f5a35f277a9a"; // Updated hero image

  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden bg-black">
      {/* Background image with looping center zoom */}
      <motion.img
        src={bg}
        alt="LUXE flagship visual"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        initial={{ scale: 1 }}
        // Increase zoom amount and speed to focus tighter on the center "LUXE" area
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
        style={{ transformOrigin: "50% 50%" }} // centered focus
      />
      {/* Subtle dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Added: Center-bottom pill buttons to navigate to Goggles and Watches */}
      <div className="absolute inset-0 flex items-end justify-center pb-20 sm:pb-24 pointer-events-none">
        <div className="flex gap-3 sm:gap-4">
          <a
            href="/category/goggles"
            className="pointer-events-auto rounded-full bg-black/80 text-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-black"
          >
            Goggles
          </a>
          <a
            href="/category/watches"
            className="pointer-events-auto rounded-full bg-black/80 text-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-black"
          >
            Watches
          </a>
        </div>
      </div>
    </section>
  );
}