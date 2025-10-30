import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Small plugin: proxy local /_pixelbin/* requests to https://api.pixelbin.io/* to avoid CORS
function pixelbinProxy() {
  return {
    name: 'pixelbin-proxy',
    configureServer: async (server) => {
      const https = await import('node:https');
      server.middlewares.use('/_pixelbin', (req, res) => {
        try {
          const targetHost = 'api.pixelbin.io';
          // req.url starts with '/_pixelbin' followed by the actual path
          const path = req.url.replace(/^\/_pixelbin/, '') || '/';
          const options = {
            hostname: targetHost,
            port: 443,
            path: path,
            method: req.method,
            headers: Object.assign({}, req.headers, { host: targetHost })
          };
          // Avoid forwarding the browser's accept-encoding so node can handle compression
          delete options.headers['accept-encoding'];

          const proxyReq = https.request(options, (proxyRes) => {
            // Forward status and headers back to the browser
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          });

          proxyReq.on('error', (err) => {
            res.statusCode = 502;
            res.end(String(err));
          });

          // Pipe body
          req.pipe(proxyReq, { end: true });
        } catch (err) {
          res.statusCode = 500;
          res.end(String(err));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), pixelbinProxy()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
    cors: true,
    allowedHosts: ["chantal-fogless-awhile.ngrok-free.dev"],
  },
  preview: {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  },
});
