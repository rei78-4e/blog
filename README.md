# rei78.cc

monorepo that manage `rei78.cc` by bun workspace. 

```text
apps/
  web/     rei78.cc (placeholder）
  blog/    https://rei78.cc/blog/
  me/      https://rei78.cc/me/
packages/
  shared/  shared UI / styles / config
```

## Commands

```sh
bun install
bun run dev       # starting up /blog and /me at each ports
bun run dev:blog
bun run dev:me
bun run build     # production build for blog and me
bun run preview   # preview on localhost:8000
bun run preview:blog
bun run tags:check
```
production build generates each site at `dist/blog/` and `dist/me/`. 

blog 固有の記法と開発ツールは [apps/blog/README.md](./apps/blog/README.md) を参照してください。
