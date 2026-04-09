# Work Plan: UI Improvement — Retention, Navigation & Reduced Friction
Date: 2026-04-09

## Goal
Improve the HealthLog app UI to encourage user retention, improve feature discoverability, and reduce friction for common tasks.

## Tasks

### Frontend
- [x] Expand bottom nav from 3 to 4 tabs (Home, Today, AI, Settings) — direct access to daily logging
- [x] Add back button to PageHeader for deep pages (forms, edit) with animated transition
- [x] Add streak badge to dashboard — show consecutive days with logged meals
- [x] Improve empty states on day view — motivational CTAs instead of plain "未入力" / "運動記録なし"
- [x] Add floating action button (FAB) on day view — quick access to add meals/exercises
- [x] Add weekly mini-summary on dashboard below calendar — avg calories, exercise days, best day

### QA
- [x] Run type check (`bunx tsc -b --noEmit`) — pass
- [x] Run lint/format (`bunx biome check --write`) — pass
- [x] Commit: `feat(ui): improve navigation, retention hooks, and empty states` (c5755a9)

## Execution Order
1. Frontend: All UI changes (parallel-safe — different components)
2. QA: Verify and commit

## Deliverables
- `src/components/bottom-nav.tsx`: 4-tab navigation
- `src/components/page-header.tsx`: Back button support
- `src/components/streak-badge.tsx`: Streak counter component
- `src/components/day-fab.tsx`: Floating action button
- `src/components/dashboard.tsx`: Streak badge + weekly summary integration
- `src/app/day/page.tsx`: Improved empty states + FAB

## Risks / Notes
- Streak calculation is client-side using existing summary API — no backend changes needed
- FAB must not overlap with bottom nav (position above it)
- Back button uses router.back() — works with vinext/shims/navigation
