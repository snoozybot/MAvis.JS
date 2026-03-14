import { Position, ACTION } from './common'

/** An agent (numbered 0, 1, 2, ...) */
export interface Agent {
  id: number;
  position: Position;
  color: string;
}

/** A box (lettered A, B, C, ...) */
export interface Box {
  id: string;
  position: Position;
  color: string;
}

/** Color group: an agent and its associated boxes share a color */
export interface ColorGroup {
  color: string;
  agentId: number;
  boxIds: string[];
}

/** Parsed level data */
export interface Level {
  name: string;
  width: number;
  height: number;
  /** true = wall */
  walls: boolean[][];
  agents: Agent[];
  boxes: Box[];
  goals: Map<string, Position>;
  colors: ColorGroup[];
}

/** Possible actions for an agent */
export type Action = keyof typeof ACTION;

/** One time step: actions for all agents */
export interface TimeStep {
  actions: Action[];
}

/** Result of a full level run */
export interface LevelResult {
  levelName: string;
  status: "solved" | "partial" | "failed" | "timeout" | "error";
  steps: number;
  boxesPlaced: number;
  boxesTotal: number;
  score: number;
  maxScore: number;
  timeMs: number;
  actions: TimeStep[];
  error?: string;
}
