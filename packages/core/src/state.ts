import type { Level, Agent, Box, Action } from './types';
import { Position, ACTION, ACTION_TYPE } from './common';

export class State {
  agents: Agent[];
  boxes: Box[];
  step: number;
  solved: boolean;

  constructor(agents: Agent[], boxes: Box[], step: number, solved: boolean = false) {
    // we always deep copy agents and boxes
    this.agents = agents.map((a) => ({ ...a, position: a.position.clone() }));
    this.boxes = boxes.map((b) => ({ ...b, position: b.position.clone() }));
    this.step = step;
    this.solved = solved;
  }

  findBoxByPos(pos: Position) {
    return this.boxes.find((b) => b.position.eq(pos));
  }

  findAgentByPos(pos: Position) {
    return this.agents.find((a) => a.position.eq(pos));
  }

  isFree(pos: Position, level: Level) {
    function isWall(p: Position) {
      if (p.row < 0 || p.row >= level.height) return true;
      if (p.col < 0 || p.col >= level.width) return true;
      return level.walls[p.row][p.col];
    }
    if (isWall(pos)) return false;
    if (this.findAgentByPos(pos)) return false;
    if (this.findBoxByPos(pos)) return false;

    return true;
  }

  /**
   * Apply one time step for one agent to the game state.
   * Update state and returns whether the step was valid.
   *
   * Rules:
   * - An agent can move into an empty floor cell
   * - An agent cannot walk into a wall or another agent or another box
   * - An agent can push a box if the cell behind the box is empty floor
   * - An agent cannot push two boxes at once
   * - An agent can pull a box if the cell behind agent is empty floor
   * - An agent cannot pull two boxes at once
   * - An agent cannot apply push/pull if no box neighbor to agent
   */
  applyOneAgent(
    level: Level,
    agent: Agent | Agent['id'],
    action: Action
  ): {
    valid: boolean;
    error?: string;
  } {
    let agentIns;
    if (typeof agent === 'number') {
      agentIns = this.agents.find((a) => a.id === agent);
    } else {
      agentIns = this.agents.find((a) => a === agent);
    }

    if (!agentIns) {
      throw new Error('The agent do not exist.');
    }

    const actionMeta = ACTION[action] || {};

    if (actionMeta.type === ACTION_TYPE.NoOp) return { valid: true };

    const agentTargetPos = agentIns.position.add(actionMeta.agentMoveDelta);
    if (actionMeta.type === ACTION_TYPE.Move) {
      if (this.isFree(agentTargetPos, level)) {
        agentIns.position = agentTargetPos;
        return { valid: true };
      }
      return {
        valid: false,
        error: `The agent tries to move to ${agentTargetPos.toString()}, which is not free.`,
      };
    }

    if (actionMeta.type === ACTION_TYPE.Push) {
      // the box is at the position that agent will be
      const boxAt = agentTargetPos;
      const boxTargetPos = boxAt.add(actionMeta.boxMoveDelta);

      const box = this.findBoxByPos(boxAt);
      if (!box) return { valid: false, error: `No box at ${boxAt.toString()}` };
      if (box.color !== agentIns.color)
        return {
          valid: false,
          error: `The color do not match, agent color: ${agentIns.color} and box color is ${box.color}.`,
        };
      if (this.isFree(boxTargetPos, level)) {
        box.position = boxTargetPos;
        agentIns.position = agentTargetPos;
        return { valid: true };
      }
      return {
        valid: false,
        error: `The agent tries to push a box to ${boxTargetPos.toString()}, which is not free.`,
      };
    }

    if (actionMeta.type === ACTION_TYPE.Pull) {
      // the target box position will be the agent current position
      // so the current box position is at negative movement of box
      const boxAt = agentIns.position.sub(actionMeta.boxMoveDelta);
      const box = this.findBoxByPos(boxAt);

      if (!box) return { valid: false, error: `No box at ${boxAt.toString()}` };
      if (box.color !== agentIns.color)
        return {
          valid: false,
          error: `The color do not match, agent color: ${agentIns.color} and box color is ${box.color}.`,
        };
      if (this.isFree(agentTargetPos, level)) {
        agentIns.position = agentTargetPos;
        box.position = box.position.add(actionMeta.boxMoveDelta);
        return { valid: true };
      }
      return {
        valid: false,
        error: `The agent tries to move to ${agentTargetPos.toString()}, which is not free.`,
      };
    }

    return {
      valid: false,
      error: `Invalid action ${action}`,
    };
  }

  apply(actions: Action[], level: Level) {
    actions = Array.isArray(actions) ? actions : [actions];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const agent = this.agents[i];

      const res = this.applyOneAgent(level, agent, action);

      if (res.valid === false) {
        return res
      }
    }

    return { valid: true }
  }

  nextState() {
    return new State(this.agents, this.boxes, this.step + 1, false);
  }
}
