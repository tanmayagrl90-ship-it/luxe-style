import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutUs() {
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
              className="font-bold text-center mb-5 text-[#111111]"
              style={{ fontSize: '32px', lineHeight: '1.2' }}
            >
              About Us
            </h1>

            <div className="text-left" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '17px', lineHeight: '1.6' }}>
              <p className="mb-4">
                Welcome to LUXE, your number one source for all quality things
              </p>

              <p className="mb-4">
                We understand the importance of a great customer experience, and that's why we take pride in
                offering quick and responsive support. Our team is dedicated to ensuring that every customer
                is satisfied with their purchase, and we are always available to answer any questions or
                concern.
              </p>

              <p className="mb-4">
                Thank you for choosing LUXE. We look forward to serving you!
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
