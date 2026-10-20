#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { glob, readFile } from "node:fs/promises";
import path from "node:path";

type Article = {
  path: string;
  published: boolean;
  title: string;
};

const projectRoot = path.resolve(import.meta.dirname, "../..");
const contentRoot = path.join(projectRoot, "src/content");

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const readFrontmatter = (source: string, filePath: string): Article => {
  const frontmatter = source.match(
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/,
  )?.[1];
  if (frontmatter === undefined)
    return fail(`Missing frontmatter: ${filePath}`);

  const title = frontmatter.match(/^title:\s*["']?(.*?)["']?\s*$/m)?.[1];
  const published = frontmatter.match(/^published:\s*(true|false)\s*$/m)?.[1];

  if (title === undefined) return fail(`Missing title: ${filePath}`);
  if (published === undefined)
    return fail(`Missing published state: ${filePath}`);

  return { path: filePath, title, published: published === "true" };
};

const which = (command: string) =>
  spawnSync("sh", ["-c", 'command -v "$1"', "sh", command]).status === 0;

if (!which("fzf")) {
  fail("fzf is required.");
}
if (!which("nvim")) {
  fail("nvim is required.");
}

const articles = await Array.fromAsync(
  glob("**/*.md", { cwd: contentRoot }),
).then(async (files) =>
  Promise.all(
    files.map(async (file) => {
      const filePath = path.join(contentRoot, file);
      return readFrontmatter(await readFile(filePath, "utf8"), filePath);
    }),
  ),
);

if (articles.length === 0) {
  fail("No articles found.");
}

const candidates = articles
  .sort((a, b) => a.title.localeCompare(b.title, "ja"))
  .map(({ path: filePath, published, title }) =>
    [title, published ? "public" : "draft", filePath].join("\t"),
  )
  .join("\n");

const exited = (child: ReturnType<typeof spawn>) =>
  new Promise<number>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });

const fzf = spawn(
  "fzf",
  ["--delimiter=\t", "--with-nth=1,2", "--prompt=Article> "],
  { stdio: ["pipe", "pipe", "inherit"] },
);
fzf.stdin.end(candidates);

let output = "";
fzf.stdout.setEncoding("utf8");
fzf.stdout.on("data", (chunk: string) => {
  output += chunk;
});
const fzfExitCode = await exited(fzf);
const selected = output.trimEnd();
if (fzfExitCode !== 0 || !selected) {
  process.exit(0);
}

const selectedPath =
  selected.split("\t").at(-1) ??
  fail("Could not read the selected article path.");

const nvim = spawn("nvim", [selectedPath], { stdio: "inherit" });

process.exit(await exited(nvim));
