import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [solidPlugin(), wasm()],
  base: "/crochess-solid",
  server: {
    port: 3000,
    fs: {
      allow: [".", "../crochess_engine/pkg/"],
    },
  },
  build: {
    target: "esnext",
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".wasm"],
  },
  optimizeDeps: {
    exclude: ["crochess_engine"],
  },
});
