export class Position {
  row: number;
  col: number;
  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  add(value: Position) {
    const row = this.row + value.row;
    const col = this.col + value.col;
    return new Position(row, col);
  }

  sub(value: Position) {
    const row = this.row - value.row;
    const col = this.col - value.col;
    return new Position(row, col);
  }

  add_(value: Position) {
    this.row = this.row + value.row;
    this.col = this.col + value.col;
    return this;
  }

  sub_(value: Position) {
    this.row = this.row - value.row;
    this.col = this.col - value.col;
    return this;
  }

  clone() {
    return new Position(this.row, this.col)
  }

  eq(value: Position) {
    if (this === value) return true;
    return this.row === value.row && this.col === value.col;
  }

  manhattanDistance(value: Position) {
    return Math.abs(this.row - value.row) + Math.abs(this.col - value.col);
  }

  toString() {
    return `Position(${this.row}, ${this.col})`;
  }
}

export const ACTION_TYPE = {
  NoOp: 0,
  Move: 1,
  Push: 2,
  Pull: 3,
} as const;

export const ACTION = {
  NoOp: {
    name: 'NoOp',
    type: ACTION_TYPE.NoOp,
    agentMoveDelta: new Position(0, 0),
    boxMoveDelta: new Position(0, 0)
  },
  MoveN: {
    name: 'Move(N)',
    type: ACTION_TYPE.Move,
    agentMoveDelta: new Position(-1, 0),
    boxMoveDelta: new Position(0, 0)
  },
  MoveS: {
    name: 'Move(S)',
    type: ACTION_TYPE.Move,
    agentMoveDelta: new Position(1, 0),
    boxMoveDelta: new Position(0, 0)
  },
  MoveE: {
    name: 'Move(E)',
    type: ACTION_TYPE.Move,
    agentMoveDelta: new Position(0, 1),
    boxMoveDelta: new Position(0, 0)
  },
  MoveW: {
    name: 'Move(W)',
    type: ACTION_TYPE.Move,
    agentMoveDelta: new Position(0, -1),
    boxMoveDelta: new Position(0, 0)
  },
  PushNN: {
    name: 'Push(N,N)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(-1, 0),
    boxMoveDelta: new Position(-1, 0)
  },
  PushNE: {
    name: 'Push(N,E)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(-1, 0),
    boxMoveDelta: new Position(0, 1)
  },
  PushNW: {
    name: 'Push(N,W)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(-1, 0),
    boxMoveDelta: new Position(0, -1)
  },
  PushSS: {
    name: 'Push(S,S)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(1, 0),
    boxMoveDelta: new Position(1, 0)
  },
  PushSE: {
    name: 'Push(S,E)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(1, 0),
    boxMoveDelta: new Position(0, 1)
  },
  PushSW: {
    name: 'Push(S,W)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(1, 0),
    boxMoveDelta: new Position(0, -1)
  },
  PushEE: {
    name: 'Push(E,E)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(0, 1),
    boxMoveDelta: new Position(0, 1)
  },
  PushEN: {
    name: 'Push(E,N)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(0, 1),
    boxMoveDelta: new Position(-1, 0)
  },
  PushES: {
    name: 'Push(E,S)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(0, 1),
    boxMoveDelta: new Position(1, 0)
  },
  PushWW: {
    name: 'Push(W,W)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(0, -1),
    boxMoveDelta: new Position(0, -1)
  },
  PushWN: {
    name: 'Push(W,N)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(0, -1),
    boxMoveDelta: new Position(-1, 0)
  },
  PushWS: {
    name: 'Push(W,S)',
    type: ACTION_TYPE.Push,
    agentMoveDelta: new Position(0, -1),
    boxMoveDelta: new Position(1, 0)
  },
  PullNN: {
    name: 'Pull(N,N)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(-1, 0),
    boxMoveDelta: new Position(-1, 0)
  },
  PullNE: {
    name: 'Pull(N,E)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(-1, 0),
    boxMoveDelta: new Position(0, 1)
  },
  PullNW: {
    name: 'Pull(N,W)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(-1, 0),
    boxMoveDelta: new Position(0, -1)
  },
  PullSS: {
    name: 'Pull(S,S)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(1, 0),
    boxMoveDelta: new Position(1, 0)
  },
  PullSE: {
    name: 'Pull(S,E)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(1, 0),
    boxMoveDelta: new Position(0, 1)
  },
  PullSW: {
    name: 'Pull(S,W)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(1, 0),
    boxMoveDelta: new Position(0, -1)
  },
  PullEE: {
    name: 'Pull(E,E)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(0, 1),
    boxMoveDelta: new Position(0, 1)
  },
  PullES: {
    name: 'Pull(E,S)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(0, 1),
    boxMoveDelta: new Position(1, 0)
  },
  PullEN: {
    name: 'Pull(E,N)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(0, 1),
    boxMoveDelta: new Position(-1, 0)
  },
  PullWW: {
    name: 'Pull(W,W)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(0, -1),
    boxMoveDelta: new Position(0, -1)
  },
  PullWS: {
    name: 'Pull(W,S)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(0, -1),
    boxMoveDelta: new Position(1, 0)
  },
  PullWN: {
    name: 'Pull(W,N)',
    type: ACTION_TYPE.Pull,
    agentMoveDelta: new Position(0, -1),
    boxMoveDelta: new Position(-1, 0)
  },
} as const;
