import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

const categories = [
  {
    name: "Premium Goggles",
    description: "Luxury eyewear for the modern trendsetter",
    image: "https://harmless-tapir-303.convex.cloud/api/storage/1a7551ea-0394-4354-b7ed-fc2497132148",
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
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
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