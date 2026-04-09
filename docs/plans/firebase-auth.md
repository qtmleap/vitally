# Work Plan: Firebase Auth + Multi-User
Date: 2026-04-09

## Goal
Firebase Auth (Google ログイン) を導入し、マルチユーザー対応にする。

## Tasks

### Backend
- [x] `prisma/schema.prisma` — `User` モデル追加 (id=Firebase UID, email, displayName, photoUrl, createdAt)
- [x] `Meal`, `Exercise`, `MealTemplate` に `userId` カラム追加 (cascade delete)
- [x] マイグレーション SQL 生成・適用
- [x] `wrangler.toml` — `FIREBASE_PROJECT_ID` 環境変数追加
- [x] `src/lib/firebase-auth.ts` — Workers 上で Firebase ID トークン検証 (Web Crypto API + Google JWKS)
- [x] `src/lib/auth-middleware.ts` — Authorization ヘッダーから token 検証 → userId 取得、401 返却
- [x] `POST /api/auth/session` — トークン検証 → User upsert → ユーザー情報返却
- [x] 全 API ルート (meals, exercises, templates, summary) に auth middleware 適用、userId でスコープ

### Frontend
- [x] `firebase` パッケージインストール
- [x] `src/lib/firebase.ts` — Firebase 初期化
- [x] `src/lib/auth.ts` — signInWithGoogle, signOut ヘルパー
- [x] `src/components/auth-provider.tsx` — onAuthStateChanged で user/loading 管理、providers.tsx に追加
- [x] `src/app/login/page.tsx` — Google ログインボタン付きログイン画面
- [x] `src/components/auth-guard.tsx` — 未認証→ /login リダイレクト
- [x] `src/app/layout.tsx` — ConditionalAuthGuard でラップ (login ページは除外)
- [x] `src/lib/api.ts` — 全リクエストに Authorization: Bearer <token> ヘッダー付与
- [x] `src/app/settings/page.tsx` — ユーザー情報表示 + ログアウトボタン

### QA
- [x] `bunx biome check --write src/`
- [x] `bunx tsc --noEmit` — zero errors
- [x] Commit in commitlint format

## Execution Order
1. Backend: schema → migration → token verification → middleware → API routes update
2. Frontend: firebase setup → auth provider → login page → auth guard → API token → settings UI
3. QA: after both complete

## Deliverables
- Prisma schema with User model and userId on all relevant tables
- Firebase ID token verification (no firebase-admin, Web Crypto API)
- Auth middleware for all API routes
- Login page with Google sign-in
- Auth guard for protected routes
- Settings page with user info + logout

## Risks / Notes
- Workers 環境では firebase-admin が使えない → Google JWKS で直接 JWT 検証
- Food テーブルは共有 (userId なし) — 食品マスタは全ユーザー共通
- 既存データはマイグレーション時に userId が空になる — 必要に応じてデフォルト値を検討
- Firebase プロジェクトの作成・Google プロバイダ有効化は手動で事前に必要
