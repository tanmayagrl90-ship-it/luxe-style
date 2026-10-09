import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// In the Base44 sandbox the app is served on port 3000 and the Convex backend
// runs as a compose service (docker-compose.base44.yml), reached through this
// dev server so everything stays same-origin. Unset anywhere else, which keeps
// the Vite defaults.
const sandboxPreview = process.env.BASE44_PREVIEW_MODE === "1";
const convexDeploymentUrl = "http://convex-backend:3210";
const convexHttpActionsUrl = "http://convex-backend:3211";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: sandboxPreview
    ? {
        host: true,
        port: 3000,
        strictPort: true,
        proxy: {
          // Convex HTTP actions, e.g. Convex Auth's /.well-known/jwks.json.
          "/.well-known": { target: convexHttpActionsUrl, changeOrigin: true },
          // Convex deployment API and its sync websocket.
          "/api": { target: convexDeploymentUrl, changeOrigin: true, ws: true },
        },
      }
    : undefined,
});
