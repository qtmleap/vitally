# Work Plan: Meal Edit Dialog Migration
Date: 2026-04-09

## Goal
Convert the meal edit page (`/meals/[id]/edit`) into a dialog, and fix UI inconsistencies with the rest of the app.

## Tasks

### Frontend
- [x] Create `src/components/edit-meal-dialog.tsx` — Dialog with `open`, `onOpenChange`, `mealId` props
- [x] Fetch existing meal via `useQuery(['meal', mealId])` when dialog opens, seed state from response
- [x] Extract `useDebouncedValue` hook to `src/lib/hooks.ts`, share between both dialogs
- [x] Food search with Search-icon-prefixed Input, debounced query, motion-animated result list
- [x] Food row: rounded checkbox pattern with `Check` icon + `cn()` (matching AddMealDialog style)
- [x] Meal-type Select pre-populated from fetched meal
- [x] Quantity Input with +/- stepper buttons and quick-fraction buttons (reuse BasketRow pattern)
- [x] Save: `api.meals.update()` → invalidate `['meals']` → `toast.success()` → close dialog
- [x] Reset state on dialog close
- [x] `src/app/meals/page.tsx`: Replace edit Link with state-driven EditMealDialog
- [x] `src/app/day/page.tsx`: Replace edit Link with button + EditMealDialog
- [x] Delete `src/app/meals/[id]/edit/page.tsx` and empty parent directories

### QA
- [x] `bunx biome check --write src/`
- [x] `bunx tsc --noEmit` — zero errors
- [x] Commit in commitlint format

## Execution Order
1. Frontend: all tasks (sequential within agent)
2. QA: after frontend completes

## Deliverables
- `src/components/edit-meal-dialog.tsx`: New edit dialog component
- `src/lib/hooks.ts`: Shared `useDebouncedValue` hook
- `src/app/meals/page.tsx`: Updated to use dialog
- `src/app/day/page.tsx`: Updated to use dialog
- Removed: `src/app/meals/[id]/edit/page.tsx`

## Risks / Notes
- The edit dialog is for a single meal item (simpler than AddMealDialog's multi-item basket)
- Backend PUT `/api/meals/[id]` already supports partial updates — no backend changes needed
