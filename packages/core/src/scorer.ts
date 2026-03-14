import type { Level, LevelResult, TimeStep } from "./types.js";
import { createInitialState, applyStep, countBoxesPlaced } from "./engine.js";

const POINTS_PER_BOX = 10;

/**
 * Run and score a level given a sequence of actions.
 */
export function scoreLevel(
  level: Level,
  actions: TimeStep[],
  timeMs: number
): LevelResult {
  const boxesTotal = level.boxes.length;
  const maxScore = boxesTotal * POINTS_PER_BOX;

  let current = createInitialState(level);
  let lastValidStep = 0;
  let error: string | undefined;

  for (let i = 0; i < actions.length; i++) {
    const result = applyStep(level, current, actions[i]);
    if (!result.valid) {
      error = result.error;
      break;
    }
    current = result.state;
    lastValidStep = i + 1;

    if (current.solved) break;
  }

  const boxesPlaced = countBoxesPlaced(current, level);
  const solved = current.solved;

  let score = boxesPlaced * POINTS_PER_BOX;

  // Bonus for solving: fewer steps → higher bonus
  if (solved) {
    const maxSteps = level.width * level.height * 4;
    const stepsUsed = lastValidStep;
    const bonus = Math.max(
      1,
      Math.floor(maxScore * (1 - stepsUsed / maxSteps))
    );
    score += bonus;
  }

  let status: LevelResult["status"];
  if (error) {
    status = boxesPlaced > 0 ? "partial" : "failed";
  } else if (solved) {
    status = "solved";
  } else {
    status = boxesPlaced > 0 ? "partial" : "failed";
  }

  return {
    levelName: level.name,
    status,
    steps: lastValidStep,
    boxesPlaced,
    boxesTotal,
    score,
    maxScore: maxScore + maxScore, // base + max possible bonus
    timeMs,
    actions: actions.slice(0, lastValidStep),
    error,
  };
}
