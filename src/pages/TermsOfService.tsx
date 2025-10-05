import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
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
              className="font-bold text-center mb-8 text-[#111111]"
              style={{ fontSize: "32px", lineHeight: "1.2" }}
            >
              Terms of service
            </h1>

            <div
              className="text-left"
              style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: "17px",
                lineHeight: "1.6",
              }}
            >
              <p className="mb-6">
                Welcome to LUXE! By placing an order and using our website, you
                agree to the following terms and conditions:
              </p>

              <p className="mb-2 font-bold">Ordering:</p>
              <ul className="mb-6 list-none space-y-2">
                <li>
                  - When you place an order on LUXE, you agree to provide
                  accurate and complete information, including billing and
                  shipping details.
                </li>
                <li>
                  - We reserve the right to refuse or cancel any order for any
                  reason.
                </li>
              </ul>

              <p className="mb-2 font-bold">Payment:</p>
              <ul className="mb-6 list-none space-y-2">
                <li>
                  - By providing your payment information, you authorize us to
                  charge the total amount due for your order, including any
                  applicable taxes and shipping fees.
                </li>
                <li>
                  - <strong>Cash on Delivery (COD) is currently unavailable</strong> due to high Return to Origin (RTO) rates. We only accept online payments via UPI, cards, and other digital payment methods for faster and more secure transactions.
                </li>
              </ul>

              <p className="mb-2 font-bold">Product Availability:</p>
              <ul className="mb-6 list-none space-y-2">
                <li>
                  - While we strive to maintain accurate product availability
                  information, we cannot guarantee that all items will be in
                  stock at the time of your order.
                </li>
                <li>
                  - If a product is out of stock, we will notify you and provide
                  a refund or option to wait for restocking, at your discretion.
                </li>
              </ul>

              <p className="mb-2 font-bold">Shipping:</p>
              <ul className="mb-6 list-none space-y-2">
                <li>
                  - We strive to ship all orders within 24–48 hours of receipt,
                  but please allow 3–7 business days for delivery.
                </li>
                <li>
                  - Shipping fees and estimated delivery times are listed on our
                  website and may vary based on location and package size.
                </li>
              </ul>

              <p className="mb-2 font-bold">Returns and Refunds:</p>
              <ul className="mb-6 list-none space-y-2">
                <li>
                  - Please see our Refund Policy for details on returns and
                  refunds.
                </li>
              </ul>

              <p className="mb-2 font-bold">Contact Us:</p>
              <ul className="mb-6 list-none space-y-2">
                <li>
                  - If you have any questions or concerns, please don’t hesitate
                  to reach out to us:
                </li>
                <li>- WhatsApp: +91 9871629699</li>
                <li>- Email: luxe.premium.in@gmail.com</li>
              </ul>

              <p className="mt-6">
                Thank you for shopping with LUXE!
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
