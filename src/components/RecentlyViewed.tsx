import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const prettyName: Record<string, string> = {
  goggles: "Goggles",
  watches: "Watches",
  belts: "Belts",
};

export default function RecentlyViewed() {
  const { user } = useAuth();
  const recentlyViewed = useQuery(api.recentlyViewed.getRecentlyViewed, {
    userId: user?._id ?? null,
    limit: 4,
  });
  const navigate = useNavigate();

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  return (
    <section className="py-16 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white mb-6">Recently Viewed</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentlyViewed.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card
                className="group bg-transparent border-transparent shadow-none cursor-pointer"
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/10">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : null}
                  {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                    <Badge className="absolute top-2 left-2 z-10 bg-white text-black text-xs">
                      Sale
                    </Badge>
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-white text-sm line-clamp-1">
                    {item.product.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    ₹{item.product.price.toLocaleString()}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
