import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";

export default function WhatsAppNewArrivals() {
  const handleCommunityClick = () => {
    const communityUrl = "https://chat.whatsapp.com/DBdZEP66bVk2NRcFoumLLx";
    window.location.href = communityUrl;
  };

  const handleDirectMessageClick = () => {
    const dmUrl = "https://wa.me/9871629699";
    window.location.href = dmUrl;
  };

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-[#25D366]/10 via-black to-black border-[#25D366]/20 ring-1 ring-[#25D366]/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#25D366]/5 via-transparent to-transparent" />
            
            <div className="relative p-6 sm:p-8 md:p-12 lg:p-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 mb-4">
                    <Sparkles className="h-4 w-4 text-[#25D366]" />
                    <span className="text-sm font-medium text-[#25D366]">Updated Daily</span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3 sm:mb-4">
                    Fresh Designs Daily
                  </h2>
                  
                  <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-5 sm:mb-6 max-w-2xl">
                    New premium accessories arrive every day. Get instant access to our latest collection before they're added to the website.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center lg:justify-start">
                    <Button
                      onClick={handleCommunityClick}
                      className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5b] active:bg-[#1ea952] transition-colors duration-200 text-base sm:text-lg font-medium shadow-lg touch-manipulation"
                    >
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      View New Arrivals
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleDirectMessageClick}
                      className="h-12 sm:h-14 px-6 sm:px-8 rounded-full border-2 border-white/40 bg-transparent text-white hover:bg-white/20 active:bg-white/30 hover:border-white/60 transition-all duration-200 text-base sm:text-lg font-medium touch-manipulation"
                    >
                      Chat on WhatsApp
                    </Button>
                  </div>
                </div>
                
                <div className="flex-shrink-0 hidden sm:block">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative"
                  >
                    <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-[#25D366]/20 to-[#25D366]/5 flex items-center justify-center border border-[#25D366]/20">
                      <MessageCircle className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 text-[#25D366]" />
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
                className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10"
              >
                <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">Daily</p>
                    <p className="text-xs sm:text-sm text-gray-400">New Products</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">Instant</p>
                    <p className="text-xs sm:text-sm text-gray-400">Updates</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">Exclusive</p>
                    <p className="text-xs sm:text-sm text-gray-400">First Access</p>
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
