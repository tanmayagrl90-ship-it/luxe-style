import { motion } from "framer-motion";

export default function HeroSection() {
  const bg =
    "https://harmless-tapir-303.convex.cloud/api/storage/9c7a0c50-e4a8-4cc2-b631-f5a35f277a9a"; // Updated hero image

  return (
    <>
      {/* Pull hero further up so it kisses the announcement bar border with no gap */}
      <section className="relative min-h-[88vh] w-full overflow-hidden bg-black -mt-[3px]">
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
        {/* Subtle dark overlay for contrast — ensure it reaches exactly up to the announcement bar */}
        {/* Move overlay slightly further up so it visually kisses the announcement bar line */}
        <div className="absolute inset-0 bg-black/40 -mt-[3px]" />
        {/* Added: Center-bottom pill buttons to navigate to Goggles and Watches */}
        {/* Move the pill buttons a bit higher */}
        <div className="absolute inset-0 flex items-end justify-center pb-24 sm:pb-28 pointer-events-none">
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
    </>
  );
}