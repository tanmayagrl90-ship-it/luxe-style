import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "@/pages/Admin.tsx";
import CategoryPage from "@/pages/Category.tsx";
import ProductPage from "@/pages/Product.tsx";
import Contact from "@/pages/Contact.tsx";
import AboutUs from "@/pages/AboutUs.tsx";
import TrackOrder from "@/pages/TrackOrder.tsx";
import TermsOfService from "@/pages/TermsOfService.tsx";
import ShippingPolicy from "@/pages/ShippingPolicy.tsx";
import RefundPolicy from "@/pages/RefundPolicy.tsx";
import AdminCustomers from "./pages/AdminCustomers";
import ShopByBrand from "./pages/ShopByBrand.tsx";
import BrandProducts from "./pages/BrandProducts.tsx";
import Checkout from "@/pages/Checkout.tsx";
import SearchResults from "./pages/SearchResults.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <AuthPage redirectAfterAuth="/" />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/admin/customers",
    element: <AdminCustomers />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/search",
    element: <SearchResults />,
  },
  {
    path: "/category/:category",
    element: <CategoryPage />,
  },
  {
    path: "/product/:id",
    element: <ProductPage />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/about",
    element: <AboutUs />,
  },
  {
    path: "/track-order",
    element: <TrackOrder />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
  },
  {
    path: "/shipping-policy",
    element: <ShippingPolicy />,
  },
  {
    path: "/refund-policy",
    element: <RefundPolicy />,
  },
  {
    path: "/shop-by-brand",
    element: <ShopByBrand />,
  },
  {
    path: "/brand/:brandName",
    element: <BrandProducts />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
    // Ensure we always start at the top on route changes
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);