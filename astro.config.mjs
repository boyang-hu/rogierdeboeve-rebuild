import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  vite: {
    build: {
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("/three/")) return "vendor-three";
            if (id.includes("/howler/")) return "vendor-audio";
            if (id.includes("/gsap/") || id.includes("/lenis/")) return "vendor-motion";
            return undefined;
          },
        },
      },
    },
  },
});
