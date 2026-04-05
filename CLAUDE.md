# CLAUDE.md

## プロジェクト概要

Vinext (Vite ベース App Router) + React 19 + Cloudflare Workers の Web アプリケーション。

## コマンド

- `bun install` - 依存関係のインストール
- `bun run dev` - 開発サーバー起動 (port 11000)
- `bun run build` - プロダクションビルド
- `bun run deploy` - Cloudflare Workers へデプロイ

## コーディング規約

- **言語**: TypeScript (strict モード)
- **Linter/Formatter**: Biome (`bunx biome check --write` で修正)
  - インデント: スペース 2
  - セミコロン: 不要時省略 (`asNeeded`)
  - クォート: シングルクォート
  - JSX クォート: シングルクォート
  - トレーリングカンマ: なし
  - 行幅: JS/TS は 120、その他は 80
- **パスエイリアス**: `@/*` → `./src/*`
- **パッケージマネージャー**: Bun (npm/yarn/pnpm は使わない)

## アーキテクチャ

- `app/` - Vinext App Router (layout.tsx, page.tsx でファイルベースルーティング)
- `src/components/ui/` - shadcn/ui コンポーネント (自動生成、直接編集しない)
- `src/components/` - アプリ固有のコンポーネント
- `src/lib/` - ユーティリティ関数
- `vite.config.ts` - Vinext + Cloudflare Vite Plugin + Tailwind CSS
- `wrangler.toml` - Workers 設定 (nodejs_compat_v2)

## 重要な注意事項

- shadcn/ui は New York スタイル、Lucide アイコン使用
- tsconfig で `src/components/ui/**/*.tsx` は型チェック対象外
- Cloudflare Workers の `compatibility_date` は `2026-01-01`
