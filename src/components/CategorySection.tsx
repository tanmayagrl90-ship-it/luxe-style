import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Premium Goggles",
    description: "Luxury eyewear for the modern trendsetter",
    image: "/api/placeholder/400/300",
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
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Explore Our Collections
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group cursor-pointer overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">{category.name}</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-gray-900 hover:text-gray-700 group-hover:translate-x-1 transition-transform"
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