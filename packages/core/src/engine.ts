import type { Level, TimeStep } from './types';
import { State } from './state';

/** Create initial game state from a level */
export function createInitialState(level: Level): State {
  return new State(level.agents, level.boxes, 0, false);
}

/** Check if all boxes are at their goal positions */
export function checkSolved(state: State, level: Level): boolean {
  for (const box of state.boxes) {
    const goal = level.goals.get(box.id);
    if (!goal || !box.position.eq(goal)) {
      return false;
    }
  }
  return true;
}

/** Count how many boxes are at their goal positions */
export function countBoxesPlaced(state: State, level: Level): number {
  let count = 0;
  for (const box of state.boxes) {
    const goal = level.goals.get(box.id);
    if (goal && box.position.eq(goal)) {
      count++;
    }
  }
  return count;
}

export function applyStep(level: Level, state: State, timeStep: TimeStep): {
  valid: boolean,
  state: State,
  error?: string
} {
  const nextState = state.nextState();

  const res = nextState.apply(timeStep.actions, level);

  if (res.valid) {
    nextState.solved = checkSolved(nextState, level);
    return { valid: true, state: nextState };
  } else {
    return { valid: false, state: nextState, error: res.error };
  }

}

/**
 * Replay a full sequence of actions and return all intermediate states.
 */
export function replay(
  level: Level,
  actions: TimeStep[]
): { states: State[]; error?: string } {
  const states: State[] = [];
  let current = createInitialState(level);
  states.push(current);

  for (const timeStep of actions) {
    const result = applyStep(level, current, timeStep);
    if (!result.valid) {
      return { states, error: result.error };
    }
    current = result.state;
    states.push(current);

    if (current.solved) break;
  }

  return { states };
}
