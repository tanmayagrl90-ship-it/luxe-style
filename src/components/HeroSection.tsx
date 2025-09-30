import { motion } from "framer-motion";

export default function HeroSection() {
  const bg =
    "https://harmless-tapir-303.convex.cloud/api/storage/9c7a0c50-e4a8-4cc2-b631-f5a35f277a9a"; // Updated hero image

  return (
    <>
      {/* Crop visually by constraining viewport height and focus area */}
      <section
        className="relative w-full overflow-hidden bg-black"
      >
        {/* Set explicit heights for crop window */}
        <div className="relative h-[78vh] sm:h-[86vh] md:h-[88vh] lg:h-[88vh]">
          <motion.img
            src={bg}
            alt="LUXE flagship visual"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            // Slight zoom to allow clean top/bottom crop
            initial={{ scale: 1.06 }}
            animate={{ scale: [1.06, 1.14, 1.06] }}
            transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
            // Focus around the logo area; tweak if you prefer slightly higher/lower
            style={{ transformOrigin: "50% 38%", objectPosition: "50% 38%" }}
          />
          {/* Overlay kept for contrast, no extra spacing */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Buttons container unchanged functionally; lifted a bit for mobile */}
          <div className="absolute inset-0 flex items-end justify-center pb-40 sm:pb-44 pointer-events-none">
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
        </div>
      </section>
    </>
  );
}