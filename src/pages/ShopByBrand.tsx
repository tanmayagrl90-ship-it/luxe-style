import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Brand data with logos from reliable CDN sources
const BRAND_LOGOS: Record<string, { name: string; logo: string }> = {
  "gucci": {
    name: "Gucci",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Gucci-Logo.png"
  },
  "mont blanc": {
    name: "Mont Blanc",
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Montblanc-Logo.png"
  },
  "montblanc": {
    name: "Mont Blanc",
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Montblanc-Logo.png"
  },
  "burberry": {
    name: "Burberry",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Burberry-Logo.png"
  },
  "hermes": {
    name: "Hermès",
    logo: "https://logos-world.net/wp-content/uploads/2020/11/Hermes-Logo.png"
  },
  "hermès": {
    name: "Hermès",
    logo: "https://logos-world.net/wp-content/uploads/2020/11/Hermes-Logo.png"
  },
  "louis vuitton": {
    name: "Louis Vuitton",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Louis-Vuitton-Logo.png"
  },
  "lv": {
    name: "Louis Vuitton",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Louis-Vuitton-Logo.png"
  },
  "ferragamo": {
    name: "Ferragamo",
    logo: "https://logos-world.net/wp-content/uploads/2021/02/Salvatore-Ferragamo-Logo.png"
  },
  "marc jacobs": {
    name: "Marc Jacobs",
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Marc-Jacobs-Logo.png"
  },
  "marc jacob": {
    name: "Marc Jacobs",
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Marc-Jacobs-Logo.png"
  },
  "prada": {
    name: "Prada",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Prada-Logo.png"
  },
  "celine": {
    name: "Celine",
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Celine-Logo.png"
  },
  "chanel": {
    name: "Chanel",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Chanel-Logo.png"
  },
  "tom ford": {
    name: "Tom Ford",
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Tom-Ford-Logo.png"
  },
  "tomford": {
    name: "Tom Ford",
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Tom-Ford-Logo.png"
  },
  "coach": {
    name: "Coach",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Coach-Logo.png"
  },
  "guess": {
    name: "Guess",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Guess-Logo.png"
  },
  "armani": {
    name: "Armani Exchange",
    logo: "https://logos-world.net/wp-content/uploads/2020/12/Armani-Exchange-Logo.png"
  },
  "armani exchange": {
    name: "Armani Exchange",
    logo: "https://logos-world.net/wp-content/uploads/2020/12/Armani-Exchange-Logo.png"
  },
  "michael kors": {
    name: "Michael Kors",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Michael-Kors-Logo.png"
  },
  "ferrari": {
    name: "Ferrari",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Ferrari-Logo.png"
  },
  "scuderia ferrari": {
    name: "Ferrari",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Ferrari-Logo.png"
  },
  "moscot": {
    name: "Moscot",
    logo: "https://moscot.com/cdn/shop/files/MOSCOT_LOGO_BLACK.png"
  },
  "cartier": {
    name: "Cartier",
    logo: "https://logos-world.net/wp-content/uploads/2020/11/Cartier-Logo.png"
  },
  "ray ban": {
    name: "Ray-Ban",
    logo: "https://logos-world.net/wp-content/uploads/2020/12/Ray-Ban-Logo.png"
  },
  "rayban": {
    name: "Ray-Ban",
    logo: "https://logos-world.net/wp-content/uploads/2020/12/Ray-Ban-Logo.png"
  }
};

export default function ShopByBrand() {
  const allBrands = useQuery(api.products.getAllBrands);
  const allProducts = useQuery(api.products.getAllProducts);

  // Extract brands from product names if brand field is not set
  const detectedBrands = new Set<string>();
  
  if (allProducts) {
    allProducts.forEach(product => {
      // If product has brand field, use it
      if (product.brand) {
        detectedBrands.add(product.brand);
      } else {
        // Otherwise, detect from product name
        const nameLower = product.name.toLowerCase();
        Object.keys(BRAND_LOGOS).forEach(brandKey => {
          if (nameLower.includes(brandKey)) {
            // Use the display name from BRAND_LOGOS
            detectedBrands.add(BRAND_LOGOS[brandKey].name);
          }
        });
      }
    });
  }

  // Map detected brands to logo data
  const availableBrands = Array.from(detectedBrands)
    .map(brand => {
      const brandKey = brand.toLowerCase();
      const logoData = BRAND_LOGOS[brandKey];
      
      if (logoData) {
        return {
          brand: brand,
          name: logoData.name,
          logo: logoData.logo
        };
      }
      
      // Fallback: create a simple text-based logo if no image available
      return {
        brand: brand,
        name: brand,
        logo: null
      };
    })
    .filter(b => b.logo !== null) // Only show brands with logos
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

  const handleBrandClick = (brand: string) => {
    window.open(`/brand/${encodeURIComponent(brand)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-20">
        <section className="bg-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                Shop By Brand
              </h1>
              <p className="text-gray-400 text-lg">
                Explore our curated collection of luxury brands
              </p>
            </div>

            {/* Brand Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {availableBrands.map((brandData, index) => (
                <motion.div
                  key={brandData.brand}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => handleBrandClick(brandData.brand)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square bg-white rounded-2xl p-6 sm:p-8 flex items-center justify-center overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-2xl">
                    <img
                      src={brandData.logo}
                      alt={brandData.name}
                      className="w-full h-full object-contain transition-all duration-200"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200 flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  
                  {/* Brand name */}
                  <div className="mt-4 text-center">
                    <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-gray-300 transition-colors duration-200">
                      {brandData.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty state */}
            {availableBrands.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No brands available at the moment.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}