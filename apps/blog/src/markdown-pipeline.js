// Markdown pipeline shared by article rendering and the search index.

import rehypeExternalLinks from "rehype-external-links";
import remarkCodeTitle from "./plugins/remark-code-title.js";
import remarkDirective from "remark-directive";
import remarkDirectiveHandler from "./plugins/remark-directive-handler.js";
import remarkTwitterEmbed from "./plugins/remark-twitter-embed.js";
import remarkTypst from "./plugins/remark-typst.js";
import rehypeFootnoteBackrefIcon from "./plugins/rehype-footnote-backref-icon.js";

/** @type {any[]} */
export const remarkPlugins = [
  remarkTypst,
  remarkCodeTitle,
  remarkDirective,
  remarkDirectiveHandler,
  remarkTwitterEmbed,
];

/** @type {any[]} */
export const rehypePlugins = [
  rehypeFootnoteBackrefIcon,
  [
    rehypeExternalLinks,
    {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      properties: {
        class: "link--underline link--external",
      },
    },
  ],
];
