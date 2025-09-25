import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">Trusted by 10,000+ customers</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight"
            >
              Premium
              <br />
              <span className="text-gray-600">Accessories</span>
              <br />
              Redefined
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 max-w-lg leading-relaxed"
            >
              Discover our curated collection of luxury goggles, watches, and belts. 
              Premium quality, thoughtfully priced.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg group"
            >
              Shop Collection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg border-gray-300 hover:border-gray-900"
            >
              View Lookbook
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-8 text-sm text-gray-500"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Premium Quality</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Product Showcase */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Featured Goggles */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative group cursor-pointer"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 flex items-center justify-center">
                <div className="w-full h-full bg-gray-300 rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 font-medium">Premium Goggles</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Featured Watch */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative group cursor-pointer mt-8"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 flex items-center justify-center">
                <div className="w-full h-full bg-gray-300 rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 font-medium">Luxury Watches</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            {/* Featured Belt */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="relative group cursor-pointer col-span-2 -mt-4"
            >
              <div className="aspect-[2/1] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 flex items-center justify-center">
                <div className="w-full h-full bg-gray-300 rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 font-medium">Designer Belts</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}