# rei78.cc

monorepo that manage `rei78.cc` by npm workspaces.

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
npm install
npm run dev       # starting up /blog and /me at each ports
npm run dev:blog
npm run dev:me
npm run build     # production build for blog and me
npm run preview   # preview on localhost:8000
npm run preview:blog
npm run tags:check
```
production build generates each site at `dist/blog/` and `dist/me/`. 

blog 固有の記法と開発ツールは [apps/blog/README.md](./apps/blog/README.md) を参照してください。
