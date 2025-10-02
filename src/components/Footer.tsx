import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Instagram, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-16 sm:py-20 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-xl mx-auto"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-10 tracking-tight">
              Subscribe to our emails
            </h3>
            <div className="relative max-w-md mx-auto">
              <Input
                placeholder="Email"
                className="h-12 sm:h-14 bg-transparent border border-white/30 rounded-full text-white placeholder-gray-400 pr-12 px-6 focus:border-white/50 transition-colors duration-200"
              />
              <Button 
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white hover:bg-gray-200 text-black transition-colors duration-200"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Navigation Links */}
        <div className="py-8 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm sm:text-base font-medium"
          >
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Track Order
            </a>
          </motion.div>
        </div>

        {/* Social Media */}
        <div className="py-8 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex justify-center"
          >
            <a
              href="https://www.instagram.com/luxe.premium.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-center space-y-4"
          >
            <p className="text-gray-400 text-xs sm:text-sm font-normal">
              © 2025, LUXE
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-normal">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Refund policy
              </a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy policy
              </a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of service
              </a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Shipping policy
              </a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Contact information
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}