import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env variables manually from the environments folder
  const env = loadEnv(mode, "./environments", "APP_");

  // Safely get APP_MODE from loaded env
  const isStaging = env.APP_MODE === "STAGING";
  const base_URL = isStaging ? `/v0/` : `/`;

  console.log("Is staging:", isStaging);
  console.log("APP_MODE:", env.APP_MODE);

  return {
    base: base_URL,
    plugins: [react(), compression()],
    envDir: "./environments",
    envPrefix: "APP_",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
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
      open: false,
      host: "0.0.0.0",
      port: 3001,
    },
  };
});
