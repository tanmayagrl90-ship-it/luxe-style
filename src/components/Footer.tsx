import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { useLocation } from "react-router";
import NewsletterForm from "./Footer.NewsletterForm";
import { useAuth } from "@/hooks/use-auth";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { isAuthenticated, user } = useAuth();
  const allowedEmails = new Set<string>(["vidhigadgets@gmail.com"]);
  const isAdmin =
    !!isAuthenticated &&
    !!user &&
    (((user.role as string | undefined) === "admin") ||
      (user.email ? allowedEmails.has(user.email) : false));

  const sendAll = useAction(api.emails.sendNewsletterToAll);

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section - Only show on homepage */}
        {isHomePage && (
          <div className="py-16 sm:py-20 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-xl mx-auto"
            >
              <NewsletterForm />
              {isHomePage && isAdmin && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={async () => {
                      try {
                        await sendAll({});
                        // Use window alert to keep dependencies minimal, or you can use Sonner if preferred here.
                        alert("Sent email to all subscribers.");
                      } catch (e: any) {
                        alert(e?.message || "Failed to send to all subscribers.");
                      }
                    }}
                    className="text-xs rounded-full px-4 py-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/20 transition-colors"
                    aria-label="Send email to all subscribers"
                  >
                    Send email to all subscribers
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="py-8 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm sm:text-base"
          >
            <a
              href="/about"
              className="text-white hover:text-gray-300 transition-colors duration-200 underline font-normal"
            >
              About Us
            </a>
            <a
              href="/track-order"
              className="text-white hover:text-gray-300 transition-colors duration-200 underline font-normal"
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
              href="https://www.instagram.com/luxe.premium.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200 inline-block"
              aria-label="Visit our Instagram page"
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
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <a href="/refund-policy" className="text-gray-400 hover:text-white transition-colors duration-200 font-normal">
                Refund policy
              </a>
              <span className="text-gray-600">·</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 font-normal">
                Privacy policy
              </a>
              <span className="text-gray-600">·</span>
              <a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors duration-200 font-normal">
                Terms of service
              </a>
              <span className="text-gray-600">·</span>
              <a href="/shipping-policy" className="text-gray-400 hover:text-white transition-colors duration-200 font-normal">
                Shipping policy
              </a>
              <span className="text-gray-600">·</span>
              <a
                href="/contact"
                className="text-gray-400 hover:text-white transition-colors duration-200 font-normal"
              >
                Contact information
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}