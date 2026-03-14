import type { Level, Agent, Box, ColorGroup, TimeStep, Action } from "./types";
import { Position, ACTION } from "./common";

interface ParsedColors {
  groups: ColorGroup[];
  charToColor: Map<string, string>;
}

function parseColors(lines: string[]): ParsedColors {
  const groups: ColorGroup[] = [];
  const charToColor = new Map<string, string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Format: "blue: 0, A"
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const color = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const items = trimmed
      .slice(colonIdx + 1)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const group: ColorGroup = { color, agentId: -1, boxIds: [] };

    for (const item of items) {
      if (/^\d+$/.test(item)) {
        group.agentId = parseInt(item, 10);
      } else if (/^[A-Z]$/.test(item)) {
        group.boxIds.push(item);
      }
      charToColor.set(item, color);
    }

    groups.push(group);
  }

  return { groups, charToColor };
}

interface GridParseResult {
  walls: boolean[][];
  agents: Agent[];
  boxes: Box[];
  width: number;
  height: number;
}

function parseGrid(
  lines: string[],
  charToColor: Map<string, string>
): GridParseResult {
  const agents: Agent[] = [];
  const boxes: Box[] = [];

  // Determine grid dimensions
  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.length));

  // Parse walls and entities
  const walls: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );

  for (let row = 0; row < height; row++) {
    const line = lines[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];

      if (ch === "+") {
        walls[row][col] = true;
      } else if (/\d/.test(ch)) {
        agents.push({
          id: parseInt(ch, 10),
          position: new Position(row, col),
          color: charToColor.get(ch) ?? "blue",
        });
      } else if (/[A-Z]/.test(ch)) {
        boxes.push({
          id: ch,
          position: new Position(row, col),
          color: charToColor.get(ch) ?? "blue",
        });
      }
    }
  }

  // Sort agents by id
  agents.sort((a, b) => a.id - b.id);

  return { walls, agents, boxes, width, height };
}

function parseGoals(
  lines: string[],
  _charToColor: Map<string, string>
): Map<string, Position> {
  const goals = new Map<string, Position>();

  for (let row = 0; row < lines.length; row++) {
    const line = lines[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (/[A-Z]/.test(ch)) {
        goals.set(ch, new Position(row, col));
      }
    }
  }

  return goals;
}

/**
 * Parse a level file content into a Level object.
 *
 * Format:
 * ```
 * #colors
 * blue: 0, A
 * green: 1, B
 * #initial
 * +++++++
 * +0A 1B+
 * ...
 * #goal
 * +++++++
 * +     +
 * ...
 * #end
 * ```
 */
export function parseLevel(content: string, name = "unnamed"): Level {
  const lines = content.split("\n");

  let section: "none" | "colors" | "initial" | "goal" = "none";
  const colorLines: string[] = [];
  const initialLines: string[] = [];
  const goalLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "#colors") {
      section = "colors";
      continue;
    }
    if (trimmed === "#initial") {
      section = "initial";
      continue;
    }
    if (trimmed === "#goal") {
      section = "goal";
      continue;
    }
    if (trimmed === "#end") {
      section = "none";
      continue;
    }

    switch (section) {
      case "colors":
        colorLines.push(line);
        break;
      case "initial":
        initialLines.push(line);
        break;
      case "goal":
        goalLines.push(line);
        break;
    }
  }

  const { groups, charToColor } = parseColors(colorLines);
  const { walls, agents, boxes, width, height } = parseGrid(
    initialLines,
    charToColor
  );
  const goals = parseGoals(goalLines, charToColor);

  return {
    name,
    width,
    height,
    walls,
    agents,
    boxes,
    goals,
    colors: groups,
  };
}

/**
 * Parse action output from a solver.
 * Each line is one timestep: "MoveN|PullNW" or just "MoveN" for single agent.
 */
export function parseActions(
  output: string,
  numAgents: number
): TimeStep[] {
  const steps: TimeStep[] = [];
  const lines = output.split("\n").filter((l) => l.trim() !== "");

  for (const line of lines) {
    const parts = line.trim().split("|");
    const actions = parts.map((p) => {
      const a = p.trim();
      if (a in ACTION) {
        return a as Action;
      }
      console.warn(`🚨 The action ${a} is invalid, fallback to NoOp. \n`)
      return "NoOp" as Action;
    });

    // Pad with noop if not enough actions
    while (actions.length < numAgents) {
      actions.push("NoOp");
    }

    steps.push({ actions: actions.slice(0, numAgents) });
  }

  return steps;
}
