import { spawn } from "node:child_process";
import os from "node:os";

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  wallTimeMs: number;
}

export interface HardwareInfo {
  os: string;
  cpu: string;
  cpuCores: number;
  ramGb: number;
}

/**
 * Run a solver command with level content piped to stdin.
 * Returns stdout (actions), stderr (debug), and timing info.
  */
export function runSolver(
  command: string,
  levelContent: string,
  timeoutMs: number
): Promise<RunResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    const child = spawn(command, {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: timeoutMs,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("close", (code, signal) => {
      const wallTimeMs = performance.now() - startTime;
      resolve({
        stdout,
        stderr,
        exitCode: code,
        timedOut: signal === "SIGTERM",
        wallTimeMs,
      });
    });
    child.on("error", (err) => {
      const wallTimeMs = performance.now() - startTime;
      resolve({
        stdout: "",
        stderr: err.message,
        exitCode: -1,
        timedOut: false,
        wallTimeMs,
      });
    });

    child.stdin.write(levelContent);
    child.stdin.end();
  });
}

/** Collect hardware info from the local machine */
export function collectHardware(): HardwareInfo {
  const cpus = os.cpus();
  return {
    os: `${os.platform()} ${os.arch()}`,
    cpu: cpus[0]?.model ?? "unknown",
    cpuCores: cpus.length,
    ramGb: Math.round(os.totalmem() / 1024 ** 3),
  }
}