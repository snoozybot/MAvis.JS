##  MAvis.JS project overview

MAvis.JS (Multi-Agent Sokoban AI Simulation Environment) is a TypeScript monorepo that provides a game engine and CLI tool for solving multi-agent Sokoban puzzles.

**Why:** The project serves as a platform for evaluating AI solvers on multi-agent coordination puzzles, where agents must push/pull colored boxes to goal positions following strict rules (color matching, collision detection, etc.).

**How to apply:** When working on this project, keep in mind that the core library is designed to be dependency-free and pure. The CLI is the user-facing tool that orchestrates external solver programs. Changes to game rules should be made in `packages/core/src/state.ts`, parsing in `parser.ts`, and scoring in `scorer.ts`.

## Sokoban game rules and action model

**Game entities:** Agents (numbered 0,1,2...), Boxes (lettered A,B,C...), Walls (+), Goals, ColorGroups (map colors to agents+boxes).

**Action types per agent per timestep:**
- NoOp — do nothing
- Move (4 directions: N/S/E/W) — move agent only
- Push (12 variants: agent direction + box direction) — move agent and push adjacent box
- Pull (12 variants: agent direction + pull direction) — move agent while pulling box from behind

**Key rules (implemented in state.ts):**
1. Agents cannot move into walls, other agents, or boxes
2. Push/Pull only works on matching-color boxes
3. Can only push/pull one box at a time
4. Destination cell must be free for both agent and pushed box

**Scoring (scorer.ts):**
- 10 points per box placed at goal
- Bonus for fewer steps (up to 2x base points max)
- Status: solved / partial / failed / timeout / error

**Level file format (.lvl):** Sections `#colors`, `#initial`, `#goal`, `#end`. Colors section maps color names to agent IDs and box IDs.

**Why:** Understanding the action model and rules is critical when modifying engine logic or debugging solver output parsing.

**How to apply:** When implementing new features or fixing bugs, always validate against these rules. The action definitions live in `core/src/common.ts`, validation in `core/src/state.ts`.

## MAvis.JS architecture and tech stack

**Monorepo structure** using pnpm workspaces with two packages:

- `packages/core/` — Pure game engine library (no runtime dependencies). Exports: parsing, state management, engine (apply/replay), and scoring.
- `packages/cli/` — CLI runner (commander.js + chalk). Spawns external solver processes, feeds level data via stdin, parses solver output, replays and scores.

**Tech stack:** TypeScript 5.7+ (strict), Node.js >=20, tsup bundler, pnpm workspace.

**Key data flow:**
Level file (.lvl) → Parser → Level object → Initial State → Engine (applyStep per timestep) → Scorer (scoreLevel)

**External solver interface:** Any program that reads a `.lvl` file from stdin and outputs one action line per timestep (actions separated by `|` for multi-agent). CLI spawns the solver, captures output, validates, and scores.

**Build:** `pnpm build` builds all packages. `pnpm mavis` runs CLI. `pnpm dev` watches.

**Why:** Understanding the separation between core (pure logic) and cli (orchestration) is essential for placing new code correctly.

**How to apply:** Game rule changes → `core/src/state.ts`. New CLI features → `cli/src/`. New solver features → ensure core remains dependency-free.

