import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";

export default function WhatsAppNewArrivals() {
  const handleWhatsAppClick = () => {
    const message = "Hi! I'd like to see your latest new arrivals and fresh designs.";
    const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-[#25D366]/10 via-black to-black border-[#25D366]/20 ring-1 ring-[#25D366]/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#25D366]/5 via-transparent to-transparent" />
            
            <div className="relative p-8 sm:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 mb-4">
                    <Sparkles className="h-4 w-4 text-[#25D366]" />
                    <span className="text-sm font-medium text-[#25D366]">Updated Daily</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                    Fresh Designs Daily
                  </h2>
                  
                  <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-2xl">
                    New premium accessories arrive every day. Get instant access to our latest collection before they're added to the website.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Button
                      onClick={handleWhatsAppClick}
                      className="h-14 px-8 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b] transition-colors duration-200 text-lg font-medium"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      View New Arrivals
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleWhatsAppClick}
                      className="h-14 px-8 rounded-full border-white/20 text-white hover:bg-white/10 transition-colors duration-200 text-lg"
                    >
                      Chat on WhatsApp
                    </Button>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative"
                  >
                    <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-[#25D366]/20 to-[#25D366]/5 flex items-center justify-center border border-[#25D366]/20">
                      <MessageCircle className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 text-[#25D366]" />
                    </div>
                    
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 rounded-full bg-[#25D366]/10 blur-xl"
                    />
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">Daily</p>
                    <p className="text-sm text-gray-400">New Products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">Instant</p>
                    <p className="text-sm text-gray-400">Updates</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">Exclusive</p>
                    <p className="text-sm text-gray-400">First Access</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
