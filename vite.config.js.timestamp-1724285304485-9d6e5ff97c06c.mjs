// vite.config.js
import { defineConfig } from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "url";
import react from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/@vitejs/plugin-react/dist/index.mjs";
import image from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/@rollup/plugin-image/dist/es/index.js";
import { viteStaticCopy } from "file:///Users/jonathanmiranda/Desktop/chatmate-widget/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///Users/jonathanmiranda/Desktop/chatmate-widget/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    image(),
    viteStaticCopy({
      targets: [
        {
          src: "public/timeTracker.js",
          dest: ""
        }
      ]
    })
  ],
  define: {
    // In dev, we need to disable this, but in prod, we need to enable it
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      },
      {
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util",
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, "");
        }
      }
    ]
  },
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "Chatmate",
      formats: ["umd"],
      fileName: (_format) => `chatmate-chat-widget.js`
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
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    cssCodeSplit: false,
    assetsInlineLimit: 1e8,
    minify: "esbuild",
    outDir: "dist",
    emptyOutDir: true,
    inlineDynamicImports: true,
    assetsDir: "",
    sourcemap: "inline"
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      },
      plugins: []
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvam9uYXRoYW5taXJhbmRhL0Rlc2t0b3AvY2hhdG1hdGUtd2lkZ2V0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvam9uYXRoYW5taXJhbmRhL0Rlc2t0b3AvY2hhdG1hdGUtd2lkZ2V0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qb25hdGhhbm1pcmFuZGEvRGVza3RvcC9jaGF0bWF0ZS13aWRnZXQvdml0ZS5jb25maWcuanNcIjsvLyB2aXRlLmNvbmZpZy5qc1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBpbWFnZSBmcm9tIFwiQHJvbGx1cC9wbHVnaW4taW1hZ2VcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGltYWdlKCksXG4gICAgdml0ZVN0YXRpY0NvcHkoe1xuICAgICAgdGFyZ2V0czogW1xuICAgICAgICB7XG4gICAgICAgICAgc3JjOiBcInB1YmxpYy90aW1lVHJhY2tlci5qc1wiLFxuICAgICAgICAgIGRlc3Q6IFwiXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICBdLFxuICBkZWZpbmU6IHtcbiAgICAvLyBJbiBkZXYsIHdlIG5lZWQgdG8gZGlzYWJsZSB0aGlzLCBidXQgaW4gcHJvZCwgd2UgbmVlZCB0byBlbmFibGUgaXRcbiAgICBcInByb2Nlc3MuZW52Lk5PREVfRU5WXCI6IEpTT04uc3RyaW5naWZ5KFwicHJvZHVjdGlvblwiKSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbXG4gICAgICB7XG4gICAgICAgIGZpbmQ6IFwiQFwiLFxuICAgICAgICByZXBsYWNlbWVudDogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBwcm9jZXNzOiBcInByb2Nlc3MvYnJvd3NlclwiLFxuICAgICAgICBzdHJlYW06IFwic3RyZWFtLWJyb3dzZXJpZnlcIixcbiAgICAgICAgemxpYjogXCJicm93c2VyaWZ5LXpsaWJcIixcbiAgICAgICAgdXRpbDogXCJ1dGlsXCIsXG4gICAgICAgIGZpbmQ6IC9efi4rLyxcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICh2YWwpID0+IHtcbiAgICAgICAgICByZXR1cm4gdmFsLnJlcGxhY2UoL15+LywgXCJcIik7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogXCJzcmMvbWFpbi50c3hcIixcbiAgICAgIG5hbWU6IFwiQ2hhdG1hdGVcIixcbiAgICAgIGZvcm1hdHM6IFtcInVtZFwiXSxcbiAgICAgIGZpbGVOYW1lOiAoX2Zvcm1hdCkgPT4gYGNoYXRtYXRlLWNoYXQtd2lkZ2V0LmpzYCxcbiAgICB9LFxuICAgIC8vIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAvLyAgIGV4dGVybmFsOiBbXG4gICAgLy8gICAgIC8vIFJlZHVjZXMgdHJhbnNmb3JtYXRpb24gdGltZSBieSA1MCUgYW5kIHdlIGRvbid0IGV2ZW4gdXNlIHRoaXMgdmFyaWFudCwgc28gd2UgY2FuIGlnbm9yZS5cbiAgICAvLyAgICAgL0BwaG9zcGhvci1pY29uc1xcL3JlYWN0XFwvZGlzdFxcL3Nzci8sXG4gICAgLy8gICBdLFxuICAgIC8vIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsvQHBob3NwaG9yLWljb25zXFwvcmVhY3RcXC9kaXN0XFwvc3NyL10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiY2hhdG1hdGUtY2hhdC13aWRnZXQuanNcIixcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUgPT09IFwidGltZVRyYWNrZXIuanNcIikge1xuICAgICAgICAgICAgcmV0dXJuIFwidGltZVRyYWNrZXIuanNcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIFwiW25hbWVdLltleHRdXCI7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgICB9LFxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDEwMDAwMDAwMCxcbiAgICBtaW5pZnk6IFwiZXNidWlsZFwiLFxuICAgIG91dERpcjogXCJkaXN0XCIsXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgaW5saW5lRHluYW1pY0ltcG9ydHM6IHRydWUsXG4gICAgYXNzZXRzRGlyOiBcIlwiLFxuICAgIHNvdXJjZW1hcDogXCJpbmxpbmVcIixcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIGRlZmluZToge1xuICAgICAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxuICAgICAgfSxcbiAgICAgIHBsdWdpbnM6IFtdLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGVBQWUsV0FBVztBQUNuQyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsc0JBQXNCO0FBTHFLLElBQU0sMkNBQTJDO0FBT3JQLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLGVBQWU7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLHdCQUF3QixLQUFLLFVBQVUsWUFBWTtBQUFBLEVBQ3JEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sYUFBYSxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxNQUM5RDtBQUFBLE1BQ0E7QUFBQSxRQUNFLFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWEsQ0FBQyxRQUFRO0FBQ3BCLGlCQUFPLElBQUksUUFBUSxNQUFNLEVBQUU7QUFBQSxRQUM3QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUNmLFVBQVUsQ0FBQyxZQUFZO0FBQUEsSUFDekI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU9BLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxtQ0FBbUM7QUFBQSxNQUM5QyxRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGNBQUksVUFBVSxTQUFTLGtCQUFrQjtBQUN2QyxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsaUJBQWlCO0FBQUEsTUFDZix5QkFBeUI7QUFBQSxJQUMzQjtBQUFBLElBQ0EsY0FBYztBQUFBLElBQ2QsbUJBQW1CO0FBQUEsSUFDbkIsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2Isc0JBQXNCO0FBQUEsSUFDdEIsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLFNBQVMsQ0FBQztBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
