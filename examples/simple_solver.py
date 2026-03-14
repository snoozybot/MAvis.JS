"""
A hardcoded solver for levels/simple.lvl.
Demonstrates the solver interface: read level from stdin, print actions to stdout.

Usage: mavis run -l levels/simple.lvl -c "python3 examples/simple_solver.py"

Level layout:
  ++++++
  + 0  +     Agent 0 at (1,2)
  + A  +     Box A at (2,2)
  +    +
  ++++++

Goal: Box A at (3,3)

Solution:
  1. PushSS → agent moves south, pushes A south: agent(2,2), A(3,2)
  2. MoveW  → agent moves west: agent(2,1)
  3. MoveS  → agent moves south: agent(3,1)
  4. PushEE → agent moves east, pushes A east: agent(3,2), A(3,3) done
"""

import sys

sys.stdin.read()

moves = ["MoveS", "MoveW", "MoveS", "PushEE"]
for m in moves:
    print(m)
