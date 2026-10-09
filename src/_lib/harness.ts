// Shared micro-benchmark harness.
//
// - Warmup, then calibrate the iteration count so each timed round lasts ~TARGET_MS.
// - ROUNDS timed rounds, best (highest ops/s) is reported.
// - Every result is written to a sink so the JIT cannot drop the call.
// - Each bench() gets its own timing loop. A shared loop sees every closure at one call site, and
//   after a few sections its JIT state, not the code under test, set the number: identical code read
//   65M to 509M ops/s depending on what ran before it.
// - Suites are saved to results/raw/<file>.json and assembled by scripts/build-results.ts.
// - BENCH_MERGE=1 keeps the better of this run and the saved file per entry, so separate
//   processes can be combined (scripts/run-all.sh); one process can sit in a slow JIT mode.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROUNDS = Number(process.env.BENCH_ROUNDS ?? 3);
const TARGET_MS = Number(process.env.BENCH_TARGET_MS ?? 300);
const WARMUP = 1_000;
const MIN_ITERATIONS = 1_000;

export interface BenchOptions {
  /** Fixed iteration count per round (skips calibration). */
  iterations?: number;
  /** Runs before each timed round, outside the timed region. */
  beforeRound?: (iterations: number) => void | Promise<void>;
}

const c = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};
export { c as color };

function report(label: string, ops: number, iterations: number) {
  console.log(`  ${label.padEnd(28)} ${ops.toLocaleString().padStart(14)} ops/s  ${c.dim(`(best of ${ROUNDS} × ${iterations.toLocaleString()})`)}`);
}

export let sink: unknown;
const box: { sink: unknown } = { sink: undefined };
let loops = 0;

type SyncLoop = (fn: (i: number) => unknown, n: number) => number;
type AsyncLoop = (fn: (i: number) => Promise<unknown>, n: number) => Promise<number>;
const AsyncFunction = (async () => {}).constructor as FunctionConstructor;

// The source is unique per loop: JSC shares compiled code between identical function sources,
// which would make the loops one shared loop again.
function syncLoop(label: string): SyncLoop {
  return new Function("box", `return function runSync(fn, n) { // ${label.replace(/[\r\n]/g, " ")} #${loops++}
  const start = performance.now();
  for (let i = 0; i < n; i++) box.sink = fn(i);
  return performance.now() - start;
};`)(box);
}

function asyncLoop(label: string): AsyncLoop {
  const loop = new AsyncFunction("box", "fn", "n", `// ${label.replace(/[\r\n]/g, " ")} #${loops++}
  const start = performance.now();
  for (let i = 0; i < n; i++) box.sink = await fn(i);
  return performance.now() - start;`);
  return (fn, n) => loop(box, fn, n);
}

function scale(n: number, elapsed: number): number {
  return Math.max(MIN_ITERATIONS, Math.ceil((n * TARGET_MS) / Math.max(elapsed, 0.001)));
}

export function bench(label: string, fn: (i: number) => unknown, opts: BenchOptions = {}): number {
  const runSync = syncLoop(label);
  let n = opts.iterations ?? 0;
  if (!n) {
    runSync(fn, WARMUP);
    n = MIN_ITERATIONS;
    let t: number;
    while ((t = runSync(fn, n)) < TARGET_MS / 10) n *= 4;
    n = scale(n, t);
  } else {
    opts.beforeRound?.(Math.min(WARMUP, n));
    runSync(fn, Math.min(WARMUP, n));
  }
  let best = 0;
  for (let r = 0; r < ROUNDS; r++) {
    opts.beforeRound?.(n);
    best = Math.max(best, n / runSync(fn, n));
  }
  sink = box.sink;
  const ops = Math.round(best * 1000);
  report(label, ops, n);
  return ops;
}

export async function benchAsync(label: string, fn: (i: number) => Promise<unknown>, opts: BenchOptions = {}): Promise<number> {
  const runAsync = asyncLoop(label);
  let n = opts.iterations ?? 0;
  if (!n) {
    await runAsync(fn, WARMUP);
    n = MIN_ITERATIONS;
    let t: number;
    while ((t = await runAsync(fn, n)) < TARGET_MS / 10) n *= 4;
    n = scale(n, t);
  } else {
    await opts.beforeRound?.(Math.min(WARMUP, n));
    await runAsync(fn, Math.min(WARMUP, n));
  }
  let best = 0;
  for (let r = 0; r < ROUNDS; r++) {
    await opts.beforeRound?.(n);
    best = Math.max(best, n / (await runAsync(fn, n)));
  }
  sink = box.sink;
  const ops = Math.round(best * 1000);
  report(label, ops, n);
  return ops;
}

/**
 * Sanity check run once before benchmarking: a benchmark that silently measures the
 * wrong path (e.g. a validator rejecting "valid" input) is worse than no benchmark.
 */
export function expectOk(label: string, fn: () => unknown, isOk: (result: unknown) => boolean = () => true) {
  let result: unknown;
  try { result = fn(); } catch (e) { throw new Error(`[sanity] ${label}: expected success, got throw: ${(e as Error).message}`); }
  if (!isOk(result)) throw new Error(`[sanity] ${label}: unexpected result ${JSON.stringify(result)}`);
}

export function expectFail(label: string, fn: () => unknown, isFail: (result: unknown) => boolean = () => false) {
  let result: unknown;
  try { result = fn(); } catch { return; }
  if (!isFail(result)) throw new Error(`[sanity] ${label}: expected failure, got ${JSON.stringify(result)}`);
}

export function header(title: string, subtitle?: string) {
  const sep = c.cyan("━".repeat(50));
  console.log(sep);
  console.log(`  ${c.bold(c.cyan(`◈ ${title}`))}`);
  if (subtitle) console.log(`  ${c.dim(subtitle)}`);
  console.log(sep);
}

export function section(title: string) {
  console.log(`\n${c.bold(title)}`);
}

// ------------------------------------------------------------------
// Result recording
// ------------------------------------------------------------------

export interface SuiteMeta {
  id: string;
  /** README table this suite belongs to, and its row label there. */
  group: string;
  row: string;
  library: string;
  type: "http" | "throughput" | "wire-size";
  description: string;
  code: string;
  unit: string;
  higherIsBetter: boolean;
}

export interface RawSuite extends SuiteMeta {
  entries: { name: string; value: number }[];
}

export class Recorder {
  readonly suites: RawSuite[] = [];

  constructor(readonly file: string) {}

  suite(meta: SuiteMeta) {
    const s: RawSuite = { ...meta, entries: [] };
    this.suites.push(s);
    return {
      add: (name: string, value: number) => { s.entries.push({ name, value }); return value; },
    };
  }

  save() {
    const dir = join(import.meta.dir, "../../results/raw");
    mkdirSync(dir, { recursive: true });
    const path = join(dir, `${this.file}.json`);
    if (process.env.BENCH_MERGE === "1" && existsSync(path)) {
      const prev = (JSON.parse(readFileSync(path, "utf8")) as { suites: RawSuite[] }).suites;
      for (const s of this.suites) {
        const old = prev.find((p) => p.id === s.id);
        for (const e of s.entries) {
          const o = old?.entries.find((x) => x.name === e.name)?.value;
          if (o !== undefined) e.value = s.higherIsBetter ? Math.max(e.value, o) : Math.min(e.value, o);
        }
      }
    }
    writeFileSync(path, JSON.stringify({ file: this.file, date: new Date().toISOString(), suites: this.suites }, null, 2) + "\n");
    console.log(`\n${c.green("✓")} ${c.dim(`saved ${path.replace(join(import.meta.dir, "../../"), "")}`)}`);
  }
}
