# Work Plan: Replace `new Date` with dayjs
Date: 2026-04-10

## Goal
ソースコードから `new Date` を取り除き、すべて dayjs に置き換える。必要に応じてプラグインを利用する。

## Tasks

### Frontend (direct edits)
- [ ] `src/lib/ai-rate-limit.ts:12` — `new Date().toISOString().slice(0, 10)` → `today()` (`@/lib/date`)
- [ ] `src/components/quick-add-sheet.tsx:21` — `new Date().getHours()` → `dayjs().hour()`
- [ ] `src/app/day/page.tsx:86` — `new Date().getHours()` → `dayjs().hour()`
- [ ] `src/components/add-meal-dialog.tsx:243` — `new Date().toISOString()` → `dayjs().toISOString()`

### QA
- [ ] `bunx tsc -b --noEmit`
- [ ] `bunx biome check --write src/`
- [ ] commitlint 形式でコミット

## Execution Order
1. Sequential: 4ファイルの編集 (互いに独立)
2. Sequential: QA (type check + lint + commit)

## Deliverables
- 上記 4 ファイルの修正

## Plugins
- dayjs コアのみで対応可能 (`hour()`, `toISOString()`, `format('YYYY-MM-DD')`)
- UTC/TZ プラグインは今回のスコープでは不要

## Risks / Notes
- `new Date().toISOString()` と `dayjs().toISOString()` は両方 UTC ISO 8601 を返すので等価
- `getHours()` はローカル時刻の時。`dayjs().hour()` も同じくローカル時刻なので等価
