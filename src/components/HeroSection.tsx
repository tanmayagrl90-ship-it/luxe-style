import { motion } from "framer-motion";

export default function HeroSection() {
  const bg =
    "https://harmless-tapir-303.convex.cloud/api/storage/9c7a0c50-e4a8-4cc2-b631-f5a35f277a9a";

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="relative h-[78vh] sm:h-[86vh] md:h-[88vh] lg:h-[88vh]">
        <motion.img
          src={bg}
          alt="LUXE flagship visual"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          initial={{ scale: 1.06 }}
          animate={{ scale: [1.06, 1.14, 1.06] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
          style={{ 
            transformOrigin: "50% 38%", 
            objectPosition: "50% 38%",
            willChange: "transform"
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-end justify-center pb-40 sm:pb-44 pointer-events-none">
          <div className="flex gap-3 sm:gap-4">
            <a
              href="/category/goggles"
              className="pointer-events-auto rounded-full bg-black/80 text-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-black transition-colors duration-200"
            >
              Goggles
            </a>
            <a
              href="/category/watches"
              className="pointer-events-auto rounded-full bg-black/80 text-white px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold ring-1 ring-white/20 hover:bg-black transition-colors duration-200"
            >
              Watches
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}