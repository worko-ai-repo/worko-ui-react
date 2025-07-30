import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";

import path from "path";
// https://vite.dev/config/
// Check if APP_MODE is 'STAGING'
// Determine if we're in staging mode
const isStaging = process.env.APP_MODE != "STAGING";
console.log("Vite Config: isStaging =", isStaging);

export default defineConfig({
  base: "/v0/",
  plugins: [react(), compression()],
  envDir: "./environments", // Manually specify the directory where the environment files are located
  envPrefix: "APP_", // Manually specify the prefix for the environment variables
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Add alias for `src`
      "@Assets": path.resolve(__dirname, "src/assets/assets.ts"),
      "@Components": path.resolve(__dirname, "src/components"),
      "@Context": path.resolve(__dirname, "src/context"),
      "@Enums": path.resolve(__dirname, "src/types/enums"),
      "@Hooks": path.resolve(__dirname, "src/hooks"),
      "@Interfaces": path.resolve(__dirname, "src/types/interface"),
      "@Layouts": path.resolve(__dirname, "src/layouts"),
      "@Pages": path.resolve(__dirname, "src/pages"),
      "@Styles": path.resolve(__dirname, "src/styles"),
      "@Services": path.resolve(__dirname, "src/services"),
      "@Utils": path.resolve(__dirname, "src/utils"),
      "@Views": path.resolve(__dirname, "src/views"),
      "@Routes": path.resolve(__dirname, "src/routes.ts"),
    },
  },
  server: {
    proxy: {
      "/cognito": {
        target: "https://cognito-idp.ap-south-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cognito/, ""),
      },
    },
    open: false, // Manually open the browser window upon starting the server
    host: "0.0.0.0", //Manally specify the host so the app binds to all network interfaces and you can run the app on a different device
    port: 3001, // Manually specify the port for the server
  },
});
