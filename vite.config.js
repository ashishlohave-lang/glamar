import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env so we can pick up VITE_GLAMAR_ACCESS_KEY for proxy rewrites.
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const APP_KEY = process.env.VITE_GLAMAR_ACCESS_KEY || "";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
    // Allow the active ngrok host and ngrok subdomains, and proxy pixelbin
    // API requests during dev. Adding the explicit host addresses the
    // "host is not allowed" message while keeping the broader regex.
    allowedHosts: [
      "chantal-fogless-awhile.ngrok-free.dev",
      /\\.ngrok-free\\.dev$/,
    ],
    proxy: {
      // local proxy so client-side SDK requests to api.pixelbin.io can be
      // routed through the dev server (avoids CORS preflight/credentials issues)
      // We also rewrite any accidental '/apps/undefined' in the path to the
      // configured access key so the SDK doesn't fetch /apps/undefined/...
      "/__proxy/pixelbin": {
        target: "https://api.pixelbin.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          let out = path.replace(/^\/__proxy\/pixelbin/, "");
          if (out.includes("/apps/undefined") && APP_KEY) {
            out = out.replace(/\/apps\/undefined/g, `/apps/${APP_KEY}`);
          }
          return out;
        },
      },
    },
  },
  preview: {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  },
});
