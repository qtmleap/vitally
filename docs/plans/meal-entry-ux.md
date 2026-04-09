# Work Plan: Meal Entry UX Improvement
Date: 2026-04-09

## Goal
食事追加の UX を改善する。外食時の自由テキスト入力に対する AI 栄養推定、過去の食品からのサジェスト、外食/自炊の切り替え UI を実装する。

## Tasks

### Backend
- [x] `POST /api/ai/nutrition` に `save` オプション追加 — `true` の場合、推定結果を Food テーブルに保存し、作成された Food レコード (id 含む) を返す。フロントエンドの2回のリクエストを1回に統合
- [x] `GET /api/foods` に `limit` クエリパラメータ追加 (デフォルト 50、最大 50) — サジェスト用に軽量なレスポンスを可能にする

### Frontend
- [x] `add-meal-dialog.tsx` に外食/自炊トグルを追加 (`ToggleGroup`)
  - 外食モード: プレースホルダー「料理名を入力（例: 麻婆豆腐）」、検索結果なし時に AI 推定ボタンを主アクションとして表示
  - 自炊モード: プレースホルダー「食品名を検索（例: 鶏むね肉）」、検索結果なし時は `/foods/new` へのリンク表示
- [x] 食品検索のデバウンス実装 (300ms) + ドロップダウン型オートコンプリート UI
  - 検索中のローディングスピナー表示
  - 外側クリックでドロップダウンを閉じる
- [x] AI 推定ボタンの実装 — 検索結果が空の時に表示、クリックで `/api/ai/nutrition` (save=true) を呼び出し、返された Food をバスケットに追加
  - ローディング中は Sparkles アイコンのアニメーション
  - 成功時にトースト通知 + 検索入力クリア

### QA
- [x] 型チェック (`bunx tsc -b --noEmit`)
- [x] Lint/Format (`bunx biome check --write src/`)
- [x] commitlint 形式でコミット

## Execution Order
1. Backend: AI nutrition save フラグ + foods limit パラメータ (並列)
2. Frontend: トグル + デバウンス + AI 推定ボタン (バックエンド完了後)
3. QA: 全タスク完了後

## Deliverables
- `src/app/api/ai/nutrition/route.ts`: save フラグ対応
- `src/app/api/foods/route.ts`: limit パラメータ対応
- `src/components/add-meal-dialog.tsx`: 外食/自炊トグル、デバウンス、AI 推定ボタン
- `src/lib/api.ts`: API クライアント更新
- `src/lib/hooks.ts`: useDebouncedValue フック (新規)

## Risks / Notes
- AI 推定の精度は Workers AI モデル依存。推定値は目安であることをユーザーに表示する
- Food モデルに `source` フィールドは追加しない（同じ食品が外食でも自炊でも使われるため、UI のみの区別）
- `useCount` による頻度ソートは今回スコープ外（別途検討）
