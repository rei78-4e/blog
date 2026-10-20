#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const root = process.cwd();
const check = process.argv.includes("--check");
const skipBuild = process.argv.includes("--skip-build");
const validOptions = new Set(["--check", "--skip-build", "--help", "-h"]);

if (process.argv.slice(2).some((option) => !validOptions.has(option))) {
  console.error("Unknown option. Use --help to see available options.");
  process.exit(2);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Usage: npm run prepare:git [--check] [--skip-build]

Prepares the working tree before Git operations:
  1. normalize, deduplicate, and sort tags
  2. compress eligible images in src/content
  3. format source and configuration files with Prettier
  4. build the production site

  --check       inspect tags and images without changing files; still builds
  --skip-build  skip the production build
`);
  process.exit(0);
}

const run = async ([command, ...args]: string[]) => {
  const child = spawn(command, args, { cwd: root, stdio: "inherit" });
  const exitCode = await new Promise<number>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) process.exit(exitCode);
};

if (!existsSync(`${root}/package.json`)) {
  console.error("Run this command from the repository root.");
  process.exit(2);
}

console.log(`\n==> Tag ${check ? "check" : "normalization and sorting"}`);
await run([
  "node",
  "src/dev_tools/check_tags.ts",
  ...(check ? ["--check", "--sort"] : ["--fix", "--sort"]),
]);

console.log(`\n==> Image compression (${check ? "dry run" : "apply"})`);
await run([
  "python3",
  "src/dev_tools/image_compress.py",
  ...(check ? [] : ["--apply", "--no-backup"]),
]);

if (!check) {
  console.log("\n==> Formatting source and configuration files");
  await run([
    "npx",
    "prettier",
    "--write",
    "src",
    "package.json",
    "astro.config.mjs",
    "wrangler.jsonc",
    "../../package.json",
    "../../biome.jsonc",
  ]);
}

if (!skipBuild) {
  console.log("\n==> Production build");
  await run(["npm", "run", "build"]);
}

console.log(
  "\nPreparation complete. Review the changes before staging and committing them.",
);
