# rei78.cc

Bun workspaces で `rei78.cc` 配下のサイトを管理する monorepo です。

```text
apps/
  web/     rei78.cc 本体（現在は placeholder）
  blog/    https://rei78.cc/blog/
  me/      https://rei78.cc/me/
packages/
  shared/  将来の共通 UI / styles / config
```

## Commands

```sh
bun install
bun run dev          # blog と me の dev server を同時起動
bun run dev:blog     # blog のみ
bun run dev:me       # me のみ
bun run build        # blog と me の production build
bun run preview      # 両方をビルドして localhost:8000 で確認
bun run preview:blog
bun run tags:check
```

production build は `dist/blog/` と `dist/me/` に各サイトを生成します。Cloudflare Pages の build output directory は `dist` を指定します。

`bun run preview` では `http://localhost:8000/blog/` と `http://localhost:8000/me/` を同時に確認できます。静的ファイルの配信なので、変更後は再起動して再ビルドしてください。

`rei78.cc` の Cloudflare 設定手順は [docs/domain-migration.md](./docs/domain-migration.md) を参照してください。

blog 固有の記法と開発ツールは [apps/blog/README.md](./apps/blog/README.md) を参照してください。
