# Vitally

食事・食品・運動を記録し、栄養とカロリーを管理する Web アプリケーションです。AI による栄養・運動情報の推定と相談機能を備えています。

## 実装している機能

- 食品の登録、食事の記録・コピー、よく使う食品と食事テンプレートの管理
- 運動の記録、日ごとの集計、プロフィールの管理
- バーコードによる食品検索
- AI による栄養・運動情報の推定と相談、用途別のモデル選択
- 利用者ごとの AI 利用回数の記録と日次上限
- Firebase Authentication の ID token 検証と、Cookie によるアプリのセッション管理

AI の推定値は実測値ではありません。また、リポジトリに機能が実装されていることは、一般公開・本番稼働の保証とは異なります。

## 技術スタック

- TypeScript、React、Vinext、Vite、Tailwind CSS、shadcn/ui
- TanStack Query、Jotai、Zod
- Cloudflare Workers、D1、Workers AI、Prisma
- Firebase Authentication、Bun、Biome

依存パッケージのバージョンは `package.json` と `bun.lock` を参照してください。

## セットアップと開発

```bash
bun install --frozen-lockfile
bun run db:generate
bun run dev
```

開発サーバーは `http://localhost:11575` で起動します。Prisma は `prisma.config.ts` で Wrangler のローカル D1 を探し、見つからない場合は `.wrangler/state/v3/d1/local.db` を使用します。DB スキーマとマイグレーションは `prisma/` を参照してください。

`wrangler.toml` に定義する `DB`・`AI` bindings と、セッション署名用の `SESSION_SECRET` が必要です。`AI_GATEWAY_ID` を設定すると AI Gateway を利用します。秘密値は Git 管理外の環境設定で渡します。

Firebase の設定は `src/lib/firebase.ts` にあります。開発モードでは Auth Emulator の `http://localhost:11599` に接続するため、ローカルでログインを検証する際はエミュレーターを起動してください。

## 検査とビルド

```bash
bun test
bunx biome check
bunx tsc --noEmit
bun run build
```

型検査・ビルドの前に Prisma client を生成してください。

## デプロイ

```bash
bun run deploy
```

`vinext deploy` を実行します。対象環境の Cloudflare 認証情報・DB・bindings・秘密値を用意してから実行してください。

## プロジェクト構成

| 場所 | 内容 |
| --- | --- |
| `src/app/` | 食事・食品・運動・プロフィールなどの画面 |
| `src/app/api/` | 記録・集計・認証・AI の API |
| `src/lib/` | DB、セッション、Firebase、AI 利用回数などの共通処理 |
| `schemas/` | API のデータスキーマ |
| `prisma/` | DB スキーマとマイグレーション |
| `src/lib/api-contract.test.ts` | API 契約のテスト |

Dev Container の構成は `.devcontainer/` にあります。
