import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [solidPlugin(), wasm()],
  base: "https://nksupermarket.github.io/crochess-solid",
  server: {
    port: 3000,
    fs: {
      allow: [".", "../rust_engine/pkg/"],
    },
  },
  build: {
    target: "esnext",
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".wasm"],
  },
  optimizeDeps: {
    exclude: ["rust_engine"],
  },
});
