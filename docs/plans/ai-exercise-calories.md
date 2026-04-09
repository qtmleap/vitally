# Work Plan: AI Exercise Calorie Estimation
Date: 2026-04-09

## Goal
AI で運動の消費カロリーを推定できるようにする。運動名と時間から消費カロリーを自動推定。

## Tasks

### Backend
- [x] `src/app/api/ai/exercise/route.ts` — POST handler: `{ name, duration_min }` → Workers AI → `{ calories }`
- [x] `src/lib/schema.ts` — `aiExerciseEstimateSchema` Zod スキーマ追加
- [x] `src/lib/api.ts` — `api.ai.estimateExercise()` メソッド追加

### Frontend
- [x] `src/components/exercise-form.tsx` — カロリー欄の横に Sparkles ボタン追加
- [x] AI 推定呼び出し: name + duration_min → API → calories フィールドに自動入力
- [x] ローディング状態、無効化条件 (name 空 or duration 未設定)、toast フィードバック

### QA
- [x] `bunx biome check --write src/`
- [x] `bunx tsc --noEmit` — zero errors
- [x] Commit in commitlint format

## Execution Order
1. Backend: API endpoint + schema + client method
2. Frontend: exercise form UI (depends on API client method)
3. QA: after both complete

## Deliverables
- `src/app/api/ai/exercise/route.ts`: AI exercise calorie estimation endpoint
- `src/lib/schema.ts`: Updated with exercise estimate schema
- `src/lib/api.ts`: Updated with estimateExercise method
- `src/components/exercise-form.tsx`: Updated with AI estimation button

## Risks / Notes
- Workers AI model accuracy for calorie estimation varies — results are approximate
- Same model as nutrition estimation (`@hf/nousresearch/hermes-2-pro-mistral-7b`)
