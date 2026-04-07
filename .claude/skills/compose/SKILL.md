---
name: compose
description: Orchestrate a team of frontend, backend, and test agents to plan and execute a feature or fix. The leader agent consults each specialist, builds an execution plan with cost estimates and phases, saves it as markdown, and awaits user approval before executing.
user_invocable: true
---

# /compose - Team Orchestration Workflow

The user wants to plan and execute a feature or fix using the agent team.

## Instructions

You are acting as the **leader**. Follow this workflow precisely:

### Step 1: Understand the Request

Read the user's message carefully. If unclear, ask one clarifying question before proceeding.

### Step 2: Consult Each Agent

Spawn three agents **in parallel**, one for each specialist role. Send each agent the task description and ask them to assess the work according to their agent definition.

Use the agent definitions from `.claude/agents/`:
- **frontend** (`.claude/agents/frontend.md`): Ask what frontend work is needed.
- **backend** (`.claude/agents/backend.md`): Ask what backend work is needed.
- **tester** (`.claude/agents/tester.md`): Ask what test/validation work is needed.

Each agent should respond with:
- Files to create or modify
- Cost estimate: **S** (< 30 min), **M** (30 min - 2 hrs), **L** (2 - 5 hrs), **XL** (5+ hrs)
- Phases for incremental delivery and expected effect of each phase
- Dependencies on other agents
- Or explicitly: "No work required for this task."

### Step 3: Build the Execution Plan

Compile all agent responses into a structured markdown plan:

```markdown
# Execution Plan: [Title]

## Summary
[What will be built and why]

## Agents

### Frontend
- **Cost**: [S/M/L/XL]
- **Files**: [list]
- **Phases**:
  - Phase N: [description] - [effect/outcome]
- **Dependencies**: [list or "None"]

### Backend
- **Cost**: [S/M/L/XL]
- **Files**: [list]
- **Phases**:
  - Phase N: [description] - [effect/outcome]
- **Dependencies**: [list or "None"]

### Tester
- **Cost**: [S/M/L/XL]
- **Tasks**: [list]
- **Phases**:
  - Phase N: [description] - [effect/outcome]
- **Dependencies**: [list or "None"]

### Agents with No Work
- [Agent name]: [reason]

## Execution Order
1. [What runs first, what can be parallelized]
2. [Sequential dependencies]
3. [Final validation by tester]

## Total Estimated Cost
[Combined S/M/L/XL with brief justification]

## Risks & Notes
[Edge cases, open questions, decisions needed]
```

### Step 4: Save and Present

1. Save the plan to `features/plans/[task-description].md` (use a concise English kebab-case slug describing the task, e.g., `add-weight-tracking.md`, `fix-meal-form-validation.md`).
2. Present a summary of the plan to the user **in Japanese**.
3. Ask: **"この計画で実行してよろしいですか？"**

### Step 5: Execute (only after explicit approval)

If the user approves:
1. Spawn agents respecting the dependency order from the plan.
2. Run independent work **in parallel** where possible.
3. After frontend and backend complete, run the tester agent for validation.
4. Report final results to the user **in Japanese**.

If the user requests changes, update the plan accordingly and re-present.

**IMPORTANT**: Never execute without user approval. The plan-then-approve step is mandatory.