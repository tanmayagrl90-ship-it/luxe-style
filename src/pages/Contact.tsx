import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f2f2f2] text-[#111111]"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <Navbar />
      <main className="pt-24">
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
              Contact information
            </h1>

            <div className="text-left" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '17px', lineHeight: '1.6' }}>
              <p className="mb-4">Dear valued customers,</p>

              <p className="mb-4">
                I'm Tanmay Agrawal, the proud owner of LUXE, where we're dedicated to
                providing you with the finest quality products. Whether you're seeking style,
                comfort, or durability, we've got you covered.
              </p>

              <p className="mb-4">
                For any inquiries, orders, or assistance, feel free to reach out to us via
                WhatsApp or email using the contact details below:
              </p>

              <div className="mb-4">
                <p>WhatsApp: +91 9871629699</p>
                <p>Email: luxe.premium.in@gmail.com</p>
              </div>

              <p className="mb-4">
                Your satisfaction is our priority, and we look forward to serving you!
              </p>

              <div style={{ marginTop: '15px' }}>
                <p>Warm regards,</p>
                <p>Tanmay Agrawal</p>
                <p>Owner, LUXE</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
