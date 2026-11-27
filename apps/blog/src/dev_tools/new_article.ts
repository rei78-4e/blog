#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Resolve paths from this script instead of the caller's working directory.
// `./new` is also exposed at the monorepo root, so cwd may be either the
// repository root or apps/blog.
const project_root = path.resolve(import.meta.dirname, "../..");
const has_project_manifest = existsSync(path.join(project_root, "package.json"));

if (!has_project_manifest) {
  console.error(`Could not locate the blog project at ${project_root}`);

  process.exit(1);
}

const content_root = path.join(project_root, "src/content");

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const now = new Date();
const pad = (value: number) => String(value).padStart(2, "0");
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const base_stamp = `${date}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

// Avoid collisions within the same second. The suffix stays URL-safe.
let suffix = 1;
let stamp = base_stamp;
while (
  existsSync(path.join(content_root, `${stamp}.md`)) ||
  existsSync(path.join(content_root, stamp))
) {
  suffix += 1;
  stamp = `${base_stamp}_${suffix}`;
}

const frontmatter = [
  "---",
  'title: ""',
  `date: ${date}`,
  'description: ""',
  "tags: []",
  "published: false",
  "---",
  "",
].join("\n");

const article_path = path.join(content_root, `${stamp}.md`);
const display_path = path.relative(process.cwd(), article_path);

try {
  await mkdir(content_root, { recursive: true });
  await writeFile(article_path, frontmatter);
} catch (e) {
  fail(`failed write: ${e instanceof Error ? e.message : String(e)}`);
}

console.error(`created at ${display_path}`);
console.log(display_path);
