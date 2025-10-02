import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackOrder() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f2f2f2] text-[#111111]"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <Navbar />
      <main className="pt-2">
        <div className="max-w-[800px] mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="font-bold text-center mb-12 text-[#111111]"
              style={{ fontSize: '32px', lineHeight: '1.2' }}
            >
              Track Your Order
            </h1>

            <div className="max-w-[600px] mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <Label 
                    htmlFor="orderNumber" 
                    className="block mb-2 text-[#111111]"
                    style={{ fontSize: '17px', fontWeight: 'normal' }}
                  >
                    Order Number
                  </Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    className="w-full h-12 rounded-full border-2 border-[#111111] bg-white px-6"
                    style={{ fontSize: '17px' }}
                  />
                </div>

                <div className="flex-1 w-full">
                  <Label 
                    htmlFor="emailOrPhone" 
                    className="block mb-2 text-[#111111]"
                    style={{ fontSize: '17px', fontWeight: 'normal' }}
                  >
                    Email or Phone Number
                  </Label>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    className="w-full h-12 rounded-full border-2 border-[#111111] bg-white px-6"
                    style={{ fontSize: '17px' }}
                  />
                </div>

                <Button
                  className="h-12 px-8 rounded-full bg-[#111111] text-white hover:bg-[#111111]/90 font-medium"
                  style={{ fontSize: '17px' }}
                >
                  Track
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
