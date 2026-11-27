#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import prompts from "prompts";
import { generateSlugFromGemini, normalizeSlug } from "./generate_slug.ts";

const project_root = path.resolve(import.meta.dirname, "../..");
const content_root = path.join(project_root, "src/content");

const timestamp_file_pattern = /^\d{4}-\d{2}-\d{2}_\d{6}(?:_\d+)?\.md$/;

const fail: (message: string) => never = (message) => {
  console.error(message);
  process.exit(1);
};

const with_prompts_on_stderr = async <T>(run: () => Promise<T>) => {
  const original_write = process.stdout.write;
  process.stdout.write = ((chunk: any, ...args: any[]) =>
    (process.stderr.write as any)(chunk, ...args)) as typeof process.stdout.write;

  try {
    return await run();
  } finally {
    process.stdout.write = original_write;
  }
};

const resolve_input = (input: string) =>
  [
    path.resolve(process.cwd(), input),
    path.resolve(project_root, input),
    path.resolve(project_root, "../..", input),
  ].find((candidate) => existsSync(candidate)) ??
  path.resolve(process.cwd(), input);

const find_latest_article = async () => {
  const entries = await readdir(content_root, { withFileTypes: true });
  const latest = entries
    .filter((entry) => entry.isFile() && timestamp_file_pattern.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .at(-1);

  if (!latest) {
    fail("No timestamp-named article found. Pass a path: ./name <article.md>");
  }

  return path.join(content_root, latest);
};

const input = process.argv[2];
const article_path = input ? resolve_input(input) : await find_latest_article();
const relative_path = path.relative(content_root, article_path);

if (relative_path.startsWith("..") || path.isAbsolute(relative_path)) {
  fail(`Article must be inside ${content_root}`);
}
if (!article_path.endsWith(".md") || !existsSync(article_path)) {
  fail(`Article not found: ${article_path}`);
}

const source = await readFile(article_path, "utf8");
const frontmatter_match =
  source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/) ??
  fail(`Missing frontmatter: ${article_path}`);

const [frontmatter_block, frontmatter] = frontmatter_match;
const body = source.slice(frontmatter_block.length).replace(/^\r?\n+/, "");

const read_string = (name: string) => {
  const value = frontmatter.match(
    new RegExp(`^${name}:\\s*(?:"([^"]*)"|'([^']*)'|(.*?))\\s*$`, "m"),
  );
  return value?.[1] ?? value?.[2] ?? value?.[3]?.trim() ?? "";
};

const read_tags = () => {
  const raw = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1];
  if (raw === undefined) return [];

  return raw
    .split(",")
    .map((tag) => tag.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
};

const current_title = read_string("title");
const current_description = read_string("description");
const current_tags = read_tags();
const current_date = read_string("date") || null;
const current_published =
  frontmatter.match(/^published:\s*(true|false)\s*$/m)?.[1] === "true";

const resp = await with_prompts_on_stderr(() =>
  prompts([
    {
      type: "text",
      name: "title",
      message: "title",
      initial: current_title,
    },
    {
      type: "text",
      name: "slug",
      message: "slug (leave empty to generate with Gemini)",
    },
    {
      type: "text",
      name: "desc",
      message: "description",
      initial: current_description,
    },
    {
      type: "text",
      name: "tags",
      message: "enter the values separated by ` ` or `,`.",
      initial: current_tags.join(" "),
    },
    {
      type: "confirm",
      name: "is_public",
      message: "is public?",
      initial: current_published,
    },
  ]),
);

if (resp.title === undefined) {
  console.error("canceled");
  process.exit(1);
}

const title = String(resp.title ?? "").trim();
if (!title) {
  fail("title is required.");
}

const description = String(resp.desc ?? "").trim();
const tags = String(resp.tags ?? "")
  .split(/[ ,]+/)
  .map((tag) => tag.trim())
  .filter(Boolean);
const published = Boolean(resp.is_public);

const input_slug = String(resp.slug ?? "").trim();
const slug = input_slug
  ? normalizeSlug(input_slug)
  : await generateSlugFromGemini({ title, description, content: body });

if (!slug) {
  fail("failed to generate slug.");
}

const now = new Date();
const pad = (value: number) => String(value).padStart(2, "0");
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const date = current_date ?? today;

const output = [
  "---",
  `title: "${title}"`,
  `date: ${date}`,
  `description: "${description}"`,
  `tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]`,
  `published: ${published}`,
  "---",
  "",
  body,
].join("\n");

const current_directory = path.dirname(article_path);
const current_basename = path.basename(article_path, ".md");
const is_article_directory =
  current_directory !== content_root &&
  path.basename(current_directory) === current_basename;

if (current_directory !== content_root && !is_article_directory) {
  fail(
    "Nested articles must use src/content/<slug>/<slug>.md before they can be renamed.",
  );
}

const destination = is_article_directory
  ? path.join(content_root, slug)
  : path.join(content_root, `${slug}.md`);
const current_location = is_article_directory ? current_directory : article_path;

let final_path: string;

if (destination === current_location) {
  await writeFile(article_path, output);
  final_path = article_path;
} else {
  if (existsSync(destination)) fail(`Destination already exists: ${destination}`);

  if (is_article_directory) {
    const renamed_article = path.join(current_directory, `${slug}.md`);
    if (existsSync(renamed_article)) {
      fail(`Destination already exists: ${renamed_article}`);
    }
    // Rename the .md first so sibling assets move with the directory.
    await rename(article_path, renamed_article);
    await rename(current_directory, destination);
    final_path = path.join(destination, `${slug}.md`);
  } else {
    await rename(article_path, destination);
    final_path = destination;
  }

  await writeFile(final_path, output);
}

console.error(
  `renamed ${relative_path} -> ${path.relative(content_root, final_path)}`,
);
console.log(path.relative(process.cwd(), final_path));
