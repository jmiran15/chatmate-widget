import image from "@rollup/plugin-image";
import terser from "@rollup/plugin-terser";
import react from "@vitejs/plugin-react-swc";
import esbuild from "rollup-plugin-esbuild";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
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
    compression({ algorithm: "brotli", ext: ".br" }),
    compression({ algorithm: "gzip", ext: ".gz" }),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
    esbuild({
      minify: true,
      target: "es2015",
    }),
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "Chatmate",
      formats: ["es"],
      fileName: (_format) => `chatmate-chat-widget.js`,
    },
    rollupOptions: {
      external: [/@phosphor-icons\/react\/dist\/ssr/],
      output: {
        entryFileNames: "chatmate-chat-widget.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "timeTracker.js") {
            return "timeTracker.js";
          }
          return "[name].[hash].[ext]";
        },
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: [
            "date-fns",
            "dompurify",
            "framer-motion",
            "he",
            "highlight.js",
            "lodash",
            "markdown-it",
            "uuid",
          ],
        },
      },
      plugins: [
        terser({
          format: {
            comments: false,
          },
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        }),
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    cssCodeSplit: false,
    assetsInlineLimit: 8192, // 8KB
    // minify: "terser",
    minify: false, // Disable Vite's default minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "date-fns",
      "dompurify",
      "framer-motion",
      "he",
      "highlight.js",
      "lodash",
      "markdown-it",
      "uuid",
    ],
  },
});
