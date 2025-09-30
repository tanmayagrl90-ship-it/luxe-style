import { motion } from "framer-motion";

export default function HeroSection() {
  const bg =
    "https://harmless-tapir-303.convex.cloud/api/storage/9c7a0c50-e4a8-4cc2-b631-f5a35f277a9a"; // Updated hero image

  return (
    <>
      {/* Pull hero further up so it kisses the announcement bar border with no gap */}
      <section className="relative min-h-[88vh] w-full overflow-hidden bg-black -mt-[4px]">
        {/* Background image with looping center zoom */}
        <motion.img
          src={bg}
          alt="LUXE flagship visual"
          className="absolute inset-0 h-full w-full object-cover -mt-[4px]"
          loading="eager"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: "50% 50%" }}
        />
        {/* Subtle dark overlay for contrast — ensure it reaches exactly up to the announcement bar */}
        <div className="absolute inset-0 bg-black/40 -mt-[4px]" />
        {/* Added: Center-bottom pill buttons to navigate to Goggles and Watches */}
        <div className="absolute inset-0 flex items-end justify-center pb-28 sm:pb-32 pointer-events-none">
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