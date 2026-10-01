// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import { remarkPlugins, rehypePlugins } from "./src/markdown-pipeline.js";

export default defineConfig({
  site: "https://rei78.cc",
  base: "/blog",
  outDir: "../../dist/blog",

  server: {
    host: true,
    allowedHosts: true,
  },

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },

  markdown: {
    processor: unified({ remarkPlugins, rehypePlugins }),
  },
});
