# Work Plan: Meal Recording UX Improvement
Date: 2026-04-09

## Goal
食事記録の手間を減らす。テンプレート機能、よく使う食品の表示、前日コピー機能を追加する。

## Tasks

### Backend (Phase 1: Schema)
- [x] Prisma スキーマに `MealTemplate` + `MealTemplateItem` モデル追加、マイグレーション実行
  - MealTemplate: id, name, mealType?, createdAt
  - MealTemplateItem: id, templateId, foodId, quantity (Float, default 1), Food リレーション
- [x] `src/lib/db.ts` に `MealTemplateRow`, `MealTemplateItemRow` 型追加
- [x] `src/lib/schema.ts` に `mealTemplateCreateSchema`, `mealCopySchema` 追加

### Backend (Phase 2: API)
- [x] `GET /api/templates` — テンプレート一覧 (items + food 含む)
- [x] `POST /api/templates` — テンプレート作成 (name, mealType?, items[])
- [x] `DELETE /api/templates?id=xxx` — テンプレート削除
- [x] `GET /api/foods/frequent?limit=10` — 使用頻度順の食品リスト ($queryRaw で GROUP BY)
- [x] `POST /api/meals/copy` — from_date → to_date に食事コピー
- [x] `src/lib/api.ts` に templates, foods.frequent, meals.copy メソッド追加

### Frontend
- [x] `add-meal-dialog.tsx`: 検索未入力時に 2 セクション表示
  - 「テンプレート」— 横スクロールのピル/カード。タップでバスケットにアイテム一括展開
  - 「よく使う食品」— 使用頻度順リスト (最大 5 件)。既存の検索結果と同じ行スタイル
- [x] `add-meal-dialog.tsx`: バスケットに「テンプレートとして保存」ボタン追加
  - インライン名前入力 → POST /api/templates → toast 通知
- [x] `day/page.tsx`: 食事セクションに「前日からコピー」ボタン追加

### QA
- [x] 型チェック + Lint + コミット

## Execution Order
1. Backend Phase 1: Prisma マイグレーション + 型定義 + Zod スキーマ
2. Parallel: Backend Phase 2 (API 5本) + Frontend (UI 3箇所)
3. Sequential: QA

## Deliverables
- `prisma/schema.prisma`: MealTemplate, MealTemplateItem モデル
- `prisma/migrations/xxx/migration.sql`: マイグレーション SQL
- `src/app/api/templates/route.ts`: テンプレート CRUD (新規)
- `src/app/api/foods/frequent/route.ts`: 頻度順食品 API (新規)
- `src/app/api/meals/copy/route.ts`: 食事コピー API (新規)
- `src/lib/schema.ts`: Zod スキーマ追加
- `src/lib/db.ts`: 型定義追加
- `src/lib/api.ts`: API クライアント更新
- `src/components/add-meal-dialog.tsx`: テンプレート選択 + よく使う食品 + テンプレ保存
- `src/app/day/page.tsx`: 前日コピーボタン

## Risks / Notes
- Prisma D1 は `groupBy` 集約が不完全なため、frequent foods は `$queryRaw` を使用
- 初回ユーザーはテンプレート・頻度データがないため空の場合は従来のプレースホルダーにフォールバック
- テンプレート選択後もバスケット上で自由に編集可能（追加・削除・数量変更）
- コピーは既存食事に追加される（上書きではない）
