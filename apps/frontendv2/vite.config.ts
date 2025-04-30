import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "public": path.resolve(__dirname, "public"),
      "@components": path.resolve(__dirname, "src/components"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@root": path.resolve(__dirname, "src/root"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@features": path.resolve(__dirname, "src/features"),
      "@entities": path.resolve(__dirname, "src/entities"),
      "@app": path.resolve(__dirname, "src/app"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/shared/utils"),
      "@hooks": path.resolve(__dirname, "src/shared/hooks"),
      "@store": path.resolve(__dirname, "src/shared/store"),
      "@config": path.resolve(__dirname, "src/shared/config"),
    },
  },
});
