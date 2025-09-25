export default function HeroSection() {
  const bg =
    "https://harmless-tapir-303.convex.cloud/api/storage/6915b338-b492-4de8-84e3-0f78fb0674fd";

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

      {/* Removed centered overlay content for a clean, full-bleed hero */}
    </section>
  );
}