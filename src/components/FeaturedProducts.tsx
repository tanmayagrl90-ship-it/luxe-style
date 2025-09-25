import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    name: "Aviator Pro Goggles",
    price: 2999,
    originalPrice: 4999,
    rating: 4.8,
    reviews: 124,
    image: "/api/placeholder/300/300",
    category: "Goggles",
    badge: "Bestseller"
  },
  {
    id: 2,
    name: "Classic Chronograph",
    price: 5999,
    originalPrice: 8999,
    rating: 4.9,
    reviews: 89,
    image: "/api/placeholder/300/300",
    category: "Watches",
    badge: "Premium"
  },
  {
    id: 3,
    name: "Executive Leather Belt",
    price: 1999,
    originalPrice: 2999,
    rating: 4.7,
    reviews: 156,
    image: "/api/placeholder/300/300",
    category: "Belts",
    badge: "New"
  },
  {
    id: 4,
    name: "Sport Edition Goggles",
    price: 3499,
    originalPrice: 5499,
    rating: 4.6,
    reviews: 78,
    image: "/api/placeholder/300/300",
    category: "Goggles",
    badge: "Limited"
  }
];

export default function FeaturedProducts() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked premium accessories that our customers love most
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">{product.category}</span>
                  </div>
                  
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 z-10 bg-gray-900 text-white">
                      {product.badge}
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                      <span className="text-sm text-gray-400">({product.reviews})</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-gray-300 hover:border-gray-900"
          >
            View All Products
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
