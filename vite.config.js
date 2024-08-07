// vite.config.js
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import image from "@rollup/plugin-image";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    image(),
    viteStaticCopy({
      targets: [
        {
          src: "public/timeTracker.js",
          dest: "",
        },
      ],
    }),
  ],
  define: {
    // In dev, we need to disable this, but in prod, we need to enable it
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util",
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, "");
        },
      },
    ],
  },
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "Chatmate",
      formats: ["umd"],
      fileName: (_format) => `chatmate-chat-widget.js`,
    },
    // rollupOptions: {
    //   external: [
    //     // Reduces transformation time by 50% and we don't even use this variant, so we can ignore.
    //     /@phosphor-icons\/react\/dist\/ssr/,
    //   ],
    // },
    rollupOptions: {
      external: [/@phosphor-icons\/react\/dist\/ssr/],
      output: {
        entryFileNames: "chatmate-chat-widget.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "timeTracker.js") {
            return "timeTracker.js";
          }
          return "[name].[ext]";
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    minify: "esbuild",
    outDir: "dist",
    emptyOutDir: true,
    inlineDynamicImports: true,
    assetsDir: "",
    sourcemap: "inline",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [],
    },
  },
});
