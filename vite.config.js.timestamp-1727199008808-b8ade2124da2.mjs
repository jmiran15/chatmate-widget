// vite.config.js
import image from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/@rollup/plugin-image/dist/es/index.js";
import terser from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/@rollup/plugin-terser/dist/es/index.js";
import react from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/@vitejs/plugin-react-swc/index.mjs";
import esbuild from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/rollup-plugin-esbuild/dist/index.mjs";
import { visualizer } from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/vite/dist/node/index.js";
import compression from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/vite-plugin-compression/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///Users/jonathanmiranda/Desktop/chatmate-widget/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    image(),
    compression({ algorithm: "brotli", ext: ".br" }),
    compression({ algorithm: "gzip", ext: ".gz" }),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true
    }),
    esbuild({
      minify: true,
      target: "es2020"
      // Updated target to 'es2020'
    })
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    ]
  },
  build: {
    target: "es2020",
    // Specifies the build target environment
    lib: {
      entry: "src/main.tsx",
      name: "Chatmate",
      formats: ["es"],
      fileName: (_format) => `chatmate-chat-widget.js`
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
            "uuid"
          ]
        }
      },
      plugins: [
        terser({
          format: {
            comments: false
          },
          compress: {
            drop_console: false,
            drop_debugger: true
          }
        })
      ]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    cssCodeSplit: false,
    assetsInlineLimit: 8192,
    // 8KB
    minify: false,
    // Disable Vite's default minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1e3
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
      "uuid"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvam9uYXRoYW5taXJhbmRhL0Rlc2t0b3AvY2hhdG1hdGUtd2lkZ2V0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvam9uYXRoYW5taXJhbmRhL0Rlc2t0b3AvY2hhdG1hdGUtd2lkZ2V0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qb25hdGhhbm1pcmFuZGEvRGVza3RvcC9jaGF0bWF0ZS13aWRnZXQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgaW1hZ2UgZnJvbSBcIkByb2xsdXAvcGx1Z2luLWltYWdlXCI7XG5pbXBvcnQgdGVyc2VyIGZyb20gXCJAcm9sbHVwL3BsdWdpbi10ZXJzZXJcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgZXNidWlsZCBmcm9tIFwicm9sbHVwLXBsdWdpbi1lc2J1aWxkXCI7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSBcInVybFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgaW1hZ2UoKSxcbiAgICBjb21wcmVzc2lvbih7IGFsZ29yaXRobTogXCJicm90bGlcIiwgZXh0OiBcIi5iclwiIH0pLFxuICAgIGNvbXByZXNzaW9uKHsgYWxnb3JpdGhtOiBcImd6aXBcIiwgZXh0OiBcIi5nelwiIH0pLFxuICAgIHZpc3VhbGl6ZXIoe1xuICAgICAgZmlsZW5hbWU6IFwiZGlzdC9zdGF0cy5odG1sXCIsXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcbiAgICAgIGJyb3RsaVNpemU6IHRydWUsXG4gICAgfSksXG4gICAgZXNidWlsZCh7XG4gICAgICBtaW5pZnk6IHRydWUsXG4gICAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsIC8vIFVwZGF0ZWQgdGFyZ2V0IHRvICdlczIwMjAnXG4gICAgfSksXG4gIF0sXG4gIGRlZmluZToge1xuICAgIFwicHJvY2Vzcy5lbnYuTk9ERV9FTlZcIjogSlNPTi5zdHJpbmdpZnkoXCJwcm9kdWN0aW9uXCIpLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmluZDogXCJAXCIsXG4gICAgICAgIHJlcGxhY2VtZW50OiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuL3NyY1wiLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsIC8vIFNwZWNpZmllcyB0aGUgYnVpbGQgdGFyZ2V0IGVudmlyb25tZW50XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogXCJzcmMvbWFpbi50c3hcIixcbiAgICAgIG5hbWU6IFwiQ2hhdG1hdGVcIixcbiAgICAgIGZvcm1hdHM6IFtcImVzXCJdLFxuICAgICAgZmlsZU5hbWU6IChfZm9ybWF0KSA9PiBgY2hhdG1hdGUtY2hhdC13aWRnZXQuanNgLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsvQHBob3NwaG9yLWljb25zXFwvcmVhY3RcXC9kaXN0XFwvc3NyL10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiY2hhdG1hdGUtY2hhdC13aWRnZXQuanNcIixcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUgPT09IFwidGltZVRyYWNrZXIuanNcIikge1xuICAgICAgICAgICAgcmV0dXJuIFwidGltZVRyYWNrZXIuanNcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFwiW25hbWVdLltoYXNoXS5bZXh0XVwiO1xuICAgICAgICB9LFxuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICByZWFjdDogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgICAgdmVuZG9yOiBbXG4gICAgICAgICAgICBcImRhdGUtZm5zXCIsXG4gICAgICAgICAgICBcImRvbXB1cmlmeVwiLFxuICAgICAgICAgICAgXCJmcmFtZXItbW90aW9uXCIsXG4gICAgICAgICAgICBcImhlXCIsXG4gICAgICAgICAgICBcImhpZ2hsaWdodC5qc1wiLFxuICAgICAgICAgICAgXCJsb2Rhc2hcIixcbiAgICAgICAgICAgIFwibWFya2Rvd24taXRcIixcbiAgICAgICAgICAgIFwidXVpZFwiLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGx1Z2luczogW1xuICAgICAgICB0ZXJzZXIoe1xuICAgICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgICAgY29tbWVudHM6IGZhbHNlLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICAgIGRyb3BfY29uc29sZTogZmFsc2UsXG4gICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICB9LFxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXG4gICAgfSxcbiAgICBjc3NDb2RlU3BsaXQ6IGZhbHNlLFxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA4MTkyLCAvLyA4S0JcbiAgICBtaW5pZnk6IGZhbHNlLCAvLyBEaXNhYmxlIFZpdGUncyBkZWZhdWx0IG1pbmlmaWNhdGlvblxuICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICBcInJlYWN0XCIsXG4gICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgXCJkYXRlLWZuc1wiLFxuICAgICAgXCJkb21wdXJpZnlcIixcbiAgICAgIFwiZnJhbWVyLW1vdGlvblwiLFxuICAgICAgXCJoZVwiLFxuICAgICAgXCJoaWdobGlnaHQuanNcIixcbiAgICAgIFwibG9kYXNoXCIsXG4gICAgICBcIm1hcmtkb3duLWl0XCIsXG4gICAgICBcInV1aWRcIixcbiAgICBdLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRULE9BQU8sV0FBVztBQUM5VSxPQUFPLFlBQVk7QUFDbkIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sYUFBYTtBQUNwQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLGVBQWUsV0FBVztBQUNuQyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGlCQUFpQjtBQVA0SyxJQUFNLDJDQUEyQztBQVNyUCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZLEVBQUUsV0FBVyxVQUFVLEtBQUssTUFBTSxDQUFDO0FBQUEsSUFDL0MsWUFBWSxFQUFFLFdBQVcsUUFBUSxLQUFLLE1BQU0sQ0FBQztBQUFBLElBQzdDLFdBQVc7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFBQSxJQUNELFFBQVE7QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBLElBQ1YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLHdCQUF3QixLQUFLLFVBQVUsWUFBWTtBQUFBLEVBQ3JEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sYUFBYSxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxNQUM5RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUE7QUFBQSxJQUNSLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxJQUFJO0FBQUEsTUFDZCxVQUFVLENBQUMsWUFBWTtBQUFBLElBQ3pCO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsbUNBQW1DO0FBQUEsTUFDOUMsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCLENBQUMsY0FBYztBQUM3QixjQUFJLFVBQVUsU0FBUyxrQkFBa0I7QUFDdkMsbUJBQU87QUFBQSxVQUNUO0FBQ0EsaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxjQUFjO0FBQUEsVUFDWixPQUFPLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDNUIsUUFBUTtBQUFBLFlBQ047QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxPQUFPO0FBQUEsVUFDTCxRQUFRO0FBQUEsWUFDTixVQUFVO0FBQUEsVUFDWjtBQUFBLFVBQ0EsVUFBVTtBQUFBLFlBQ1IsY0FBYztBQUFBLFlBQ2QsZUFBZTtBQUFBLFVBQ2pCO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLE1BQ2YseUJBQXlCO0FBQUEsSUFDM0I7QUFBQSxJQUNBLGNBQWM7QUFBQSxJQUNkLG1CQUFtQjtBQUFBO0FBQUEsSUFDbkIsUUFBUTtBQUFBO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYix1QkFBdUI7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
