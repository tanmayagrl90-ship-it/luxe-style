import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, User, Search, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Navbar() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add live cart count
  const cartCount = useQuery(api.cart.getCartCount, {
    userId: user?._id ?? null,
  });

  const categories = [
    { name: "Home page", href: "/" },
    { name: "Goggles", href: "/category/goggles" },
    { name: "Watches", href: "/category/watches" },
    { name: "Belts", href: "/category/belts" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 left-0 right-0 z-50 bg-black text-white border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 border border-white/50 hover:bg-white/10 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="luxe-nav-overlay"
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer select-none"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/");
              }
            }}
          >
            <span
              className="text-xl font-extrabold tracking-widest"
              onClick={() => navigate("/")}
              role="button"
              tabIndex={-1}
            >
              LUXE
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-white/10">
              <Search className="h-5 w-5 text-white" />
            </Button>

            <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
              <ShoppingBag className="h-5 w-5 text-white" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-transparent border border-white/60 text-white">
                {cartCount ?? 0}
              </Badge>
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                  className="hover:bg-white/10"
                >
                  <User className="h-5 w-5 text-white" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="hidden sm:flex border-white/40 text-white bg-transparent hover:bg-white/10"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="border border-white/40 text-white bg-transparent hover:bg-white/10"
                variant="outline"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            id="luxe-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Full-viewport overlay below the navbar on ALL screen sizes
            className="fixed left-0 right-0 top-16 bottom-0 bg-black/80 backdrop-blur-sm border-t border-white/10 z-50"
          >
            <div className="max-w-md w-full h-full bg-black/90 p-6">
              <div className="flex flex-col space-y-4">
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href={category.href}
                    className="text-white/90 hover:text-white font-medium py-3 px-2 rounded hover:bg-white/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}