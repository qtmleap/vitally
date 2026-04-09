# Work Plan: Persist AI Advice to DB
Date: 2026-04-09

## Goal
AI の評価コメントを DB に日付ごとに保存し、ページ再訪問時にも表示されるようにする。

## Tasks

### Backend
- [ ] `prisma/schema.prisma` — `AiAdvice` モデル追加 (id, date unique, message, createdAt, updatedAt)
- [ ] マイグレーション SQL 生成・適用
- [ ] `GET /api/ai?date=` — 保存済みアドバイスを返す (なければ null)
- [ ] `POST /api/ai` — AI 生成後に upsert で DB 保存
- [ ] `src/lib/api.ts` — `api.ai.getSavedAdvice(date)` 追加

### Frontend
- [ ] `src/app/day/page.tsx` — useState → useQuery に変更、保存済みアドバイスをロード
- [ ] adviceMutation の onSuccess で query を invalidate
- [ ] `/ai` ページが不要なら削除

### QA
- [ ] `bunx biome check --write src/`
- [ ] `bunx tsc --noEmit` — zero errors
- [ ] Commit in commitlint format

## Execution Order
1. Backend: schema → migration → API endpoints → client method
2. Frontend: day page query integration
3. QA: after both complete

## Deliverables
- `prisma/schema.prisma`: AiAdvice model
- `prisma/migrations/`: New migration SQL
- `src/app/api/ai/route.ts`: GET + POST with DB persistence
- `src/lib/api.ts`: getSavedAdvice method
- `src/app/day/page.tsx`: useQuery for saved advice

## Risks / Notes
- date は unique 制約 — 1日1件のアドバイスを上書き保存
- GET で 404 の場合は null を返す（toast エラーにしない）
