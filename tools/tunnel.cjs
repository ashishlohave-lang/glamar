// tools/tunnel.cjs
const ngrok = require("@ngrok/ngrok");   // ✔ make sure package.json uses @ngrok/ngrok
const fs = require("fs");
const path = require("path");
require('dotenv').config(); // will read NGROK_AUTHTOKEN from a .env file if you prefer


(async () => {
  try {
    // Prefer reading authtoken from env (PowerShell: setx NGROK_AUTHTOKEN "YOUR_TOKEN" then reopen terminal)
    const listener = await ngrok.connect({
      // You can pass a number or a string URL. Both work in v5.
      addr: "http://127.0.0.1:5173",
      authtoken_from_env:process.env.NGROK_AUTHTOKEN
    });

    const url = listener.url();
    const banner = `
──────────────────────────────────────────────
 NGROK HTTPS TUNNEL READY
 → ${url}

 1) Open this URL in your browser
 2) Add this EXACT origin to GlamAR Allowed Domains (no trailing slash)
──────────────────────────────────────────────
`;
    console.log(banner);

    const outPath = path.resolve(".ngrok-url.txt");
    fs.writeFileSync(outPath, url + "\n", "utf8");
    console.log(`Saved URL to ${outPath}`);

    // Keep process alive so the tunnel stays up
    process.stdin.resume();

    const shutdown = async () => {
      console.log("Closing ngrok…");
      await listener.close();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("ngrok failed:", err?.message || err);
    process.exit(1);
  }
})();
