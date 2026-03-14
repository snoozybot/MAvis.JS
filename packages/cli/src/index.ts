import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { program } from "commander";
import chalk from "chalk";
import { parseLevel, parseActions, scoreLevel } from "@mavis/core";
import type { LevelResult } from "@mavis/core";
import { runSolver, collectHardware } from "./runner";

const DEFAULT_TIMEOUT = 120;

function statusIcon(status: LevelResult["status"]): string {
  switch (status) {
    case "solved":
      return chalk.green("✓");
    case "partial":
      return chalk.yellow("△");
    case "timeout":
      return chalk.red("⏱");
    default:
      return chalk.red("✗");
  }
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

program
  .name("mavis")
  .description("MAvis - Multi-Agent Sokoban AI Simulation Environment")
  .version("0.1.0");

// ── run: single level ──
program
  .command("run")
  .description("Run a solver on a single level")
  .requiredOption("-l, --level <file>", "Level file path")
  .requiredOption("-c, --command <cmd>", "Solver command")
  .option("-t, --timeout <seconds>", "Timeout per level in seconds", String(DEFAULT_TIMEOUT))
  .option("-g, --gui", "Open GUI replay after solving")
  .action(async (opts) => {
    const levelPath = resolve(opts.level);
    const content = readFileSync(levelPath, "utf-8");
    const levelName = basename(levelPath, ".lvl");
    const level = parseLevel(content, levelName);
    const timeoutMs = parseInt(opts.timeout) * 1000;
    const hw = collectHardware();

    console.log(
      chalk.bold(`Level: ${levelName}`) +
        `  (${level.agents.length} agents, ${level.boxes.length} boxes)`
    );
    console.log(`Running: ${opts.command}`);
    console.log(`Timeout: ${opts.timeout}s`);
    console.log(`Hardware: ${hw.cpu} (${hw.cpuCores} cores, ${hw.ramGb}GB RAM)`);
    console.log();

    const result = await runSolver(opts.command, content, timeoutMs);

    if (result.timedOut) {
      console.log(chalk.red(`✗ Timeout after ${opts.timeout}s`));
      return;
    }

    if (result.exitCode !== 0 && !result.stdout) {
      console.log(chalk.red(`✗ Solver exited with code ${result.exitCode}`));
      if (result.stderr) console.log(chalk.dim(result.stderr));
      return;
    }

    const actions = parseActions(result.stdout, level.agents.length);
    const scored = scoreLevel(level, actions, result.wallTimeMs);

    if (scored.error) {
      console.log(chalk.dim(scored.error + '\n'));
    }

    console.log(
      `${statusIcon(scored.status)} ${scored.status.toUpperCase()}  ` +
        `${scored.steps} steps  ` +
        `${scored.boxesPlaced}/${scored.boxesTotal} boxes  ` +
        `Score: ${scored.score}  ` +
        `Time: ${formatTime(scored.timeMs)}`
    );

    if (result.stderr) {
      console.log(chalk.dim("\nSolver stderr:"));
      console.log(chalk.dim(result.stderr.slice(0, 500)));
    }
  });

program.parse();
