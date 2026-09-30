# rei78.cc

Bun workspaces で `rei78.cc` 配下のサイトを管理する monorepo です。

```text
apps/
  web/     rei78.cc 本体（現在は placeholder）
  blog/    https://rei78.cc/blog/
packages/
  shared/  将来の共通 UI / styles / config
```

## Commands

```sh
bun install
bun run dev          # blog dev server
bun run build        # blog production build
bun run preview:blog
bun run tags:check
```

production build は `dist/blog/` に blog を生成します。Cloudflare Pages の build output directory は `dist` を指定します。

`rei78.cc` の Cloudflare 設定手順は [docs/domain-migration.md](./docs/domain-migration.md) を参照してください。

blog 固有の記法と開発ツールは [apps/blog/README.md](./apps/blog/README.md) を参照してください。
