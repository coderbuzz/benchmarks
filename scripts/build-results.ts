// Assembles results/raw/*.json (written by each benchmark) into:
//   - results/latest.json and results/<YYYY-MM-DD>.json  (for AI agents)
//   - the generated results block in README.md            (for humans)
//
// Usage: bun scripts/build-results.ts

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { cpus, platform } from "node:os";
import { join } from "node:path";
import { $ } from "bun";
import type { RawSuite } from "../src/_lib/harness";

const ROOT = join(import.meta.dir, "..");
const RAW = join(ROOT, "results/raw");
const README = join(ROOT, "README.md");
const START = "<!-- results:start -->";
const END = "<!-- results:end -->";

// Suite order in latest.json and README follows the order of these files.
const FILES = [
  "velox-static-value", "velox-dynamic", "velox-validation",
  "veta-vs", "veta-coerce",
  "msgpack", "proto",
  "kvs",
  "velox-ws-wire-throughput", "velox-ws-wire-size",
  "sql-compile",
  "kvs-server",
];

interface GroupLayout {
  note: string;
  /** Show a Winner column (off where the comparison is a baseline, not a contest). */
  winner?: boolean;
  /** Show each value as a percentage of the first column. */
  pctOfFirst?: boolean;
}

// HTTP results within this fraction of the best count as a tie. Between two full runs on the reference
// machine the best-of-3 figure moved up to 8.1% (AGENTS.md, Methodology), so smaller gaps are noise.
const HTTP_TIE = 0.1;

const GROUPS: Record<string, GroupLayout> = {
  "Velox": { note: `req/s, higher is better. \`oha -c 100\`, 3 s warmup, best of 3 × 10 s runs. Static value: Velox/Elysia use a static route value, Hono/Express a handler. Results within ${HTTP_TIE * 100}% of the best are a tie (≈): repeat runs on the reference machine moved the best-of-3 figure by up to 8.1%.` },
  "Veta": { note: "ops/s, higher is better. TypeBox uses the compiled validator (`Compile(schema)`)." },
  "Msgpack": { note: "ops/s higher is better, wire size smaller is better. Msgpack libraries only: JSON.stringify returns an engine-native string, not bytes encoded in JS, so it is not a like-with-like contender." },
  "Proto": { note: "ops/s higher is better, wire size smaller is better." },
  "KVS": { note: "ops/s, higher is better. Sequential, one caller. PostgreSQL runs on the same machine. `increment()` is the store's atomic built-in.", winner: false },
  "Velox WS Wire": { note: "ops/s, higher is better. `encodePing()` returns a shared pre-built buffer, so PING encode measures call overhead only." },
  "Velox WS Wire (size)": { note: "bytes, smaller is better." },
  "SQL": { note: "ops/s, higher is better. Compilation only, no DB execution." },
  "KVS Server": { note: "ops/s, higher is better. Sequential, one client; % is of direct in-process access.", winner: false, pctOfFirst: true },
};

// ------------------------------------------------------------------

const round3 = (n: number) => Math.round(n * 1000) / 1000;

function rank(suite: RawSuite) {
  const hib = suite.higherIsBetter;
  const sorted = [...suite.entries].sort((a, b) => (hib ? b.value - a.value : a.value - b.value));
  const best = sorted[0]!.value;
  const ratio = (a: number, b: number) => (hib ? a / b : b / a);
  return sorted.map((e, i) => {
    const next = sorted[i + 1];
    return {
      name: e.name,
      value: e.value,
      winner: suite.type === "http" ? ratio(best, e.value) <= 1 + HTTP_TIE : e.value === best,
      factorVsNext: next ? round3(ratio(e.value, next.value)) : null,
      factorVsBest: round3(ratio(best, e.value)),
    };
  });
}

const raws = FILES.flatMap((f) => {
  try {
    return [JSON.parse(readFileSync(join(RAW, `${f}.json`), "utf8")) as { suites: RawSuite[] }];
  } catch {
    console.warn(`⚠ results/raw/${f}.json missing, run its benchmark first`);
    return [];
  }
});
const extra = readdirSync(RAW).filter((f) => f.endsWith(".json") && !FILES.includes(f.slice(0, -5)));
if (extra.length) console.warn(`⚠ ignoring unlisted raw files: ${extra.join(", ")}`);

const suites = raws.flatMap((r) => r.suites).map((s) => ({
  id: s.id, group: s.group, row: s.row, library: s.library, type: s.type,
  description: s.description, code: s.code, unit: s.unit, higherIsBetter: s.higherIsBetter,
  entries: rank(s),
}));

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const packages: Record<string, string> = {};
for (const name of Object.keys(pkg.dependencies)) {
  packages[name] = JSON.parse(readFileSync(join(ROOT, "node_modules", name, "package.json"), "utf8")).version;
}
// macOS: sysctl brand string ("Apple M3"); elsewhere: the CPU model plus core count,
// since a cloud VM's model name alone does not say how many cores the run had.
const chip = (await $`sysctl -n machdep.cpu.brand_string`.quiet().nothrow().text()).trim()
  || `${cpus()[0]?.model.trim() ?? "unknown CPU"}, ${cpus().length} cores, ${platform()}`;
const now = new Date();
const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const date = process.env.RESULTS_DATE ?? localDate;

const output = {
  meta: {
    schemaVersion: 2,
    date,
    runtime: `Bun ${Bun.version}`,
    machine: `${chip} (${process.arch})`,
    http: { tool: "oha", connections: 100, warmup: "3s", duration: "10s", runs: 3, take: "best", tieThreshold: HTTP_TIE },
    throughput: { warmupIterations: 1000, roundTargetMs: 300, rounds: 3, take: "best" },
    packages,
  },
  suites,
};

const json = JSON.stringify(output, null, 2) + "\n";
writeFileSync(join(ROOT, "results/latest.json"), json);
writeFileSync(join(ROOT, `results/${date}.json`), json);
console.log(`✓ results/latest.json + results/${date}.json (${suites.length} suites)`);

// ------------------------------------------------------------------
// README
// ------------------------------------------------------------------

const fmt = (s: { unit: string }, v: number) => (s.unit === "bytes" ? `${v} B` : v.toLocaleString("en-US"));
const short = (name: string) => name.replace(/^@coderbuzz\//, "");

const lines: string[] = [
  `## Latest Results (${date})`,
  "",
  `> ${output.meta.runtime} · ${output.meta.machine} · generated from [\`results/latest.json\`](./results/latest.json) by \`bun scripts/build-results.ts\``,
  "",
];

for (const [group, layout] of Object.entries(GROUPS)) {
  const rows = suites.filter((s) => s.group === group);
  if (!rows.length) continue;
  const columns: string[] = [];
  for (const s of rows) for (const e of s.entries) if (!columns.includes(e.name)) columns.push(e.name);
  // Column order: the order entries were recorded in the first suite of the group.
  const raw = raws.flatMap((r) => r.suites).find((s) => s.id === rows[0]!.id)!;
  columns.sort((a, b) => {
    const ia = raw.entries.findIndex((e) => e.name === a), ib = raw.entries.findIndex((e) => e.name === b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const withWinner = layout.winner !== false;

  lines.push(`### ${group}`, "");
  lines.push(`| Benchmark | ${columns.join(" | ")} |${withWinner ? " Winner |" : ""}`);
  lines.push(`|---|${columns.map(() => "---|").join("")}${withWinner ? "---|" : ""}`);
  for (const s of rows) {
    const first = s.entries.find((e) => e.name === columns[0]);
    const cells = columns.map((c) => {
      const e = s.entries.find((x) => x.name === c);
      if (!e) return "n/a";
      let cell = fmt(s, e.value);
      if (layout.pctOfFirst && first) cell += ` (${((e.value / first.value) * 100).toFixed(1)}%)`;
      return e.winner && withWinner ? `**${cell}**` : cell;
    });
    let winner = "";
    if (withWinner) {
      const winners = s.entries.filter((e) => e.winner);
      const runnerUp = s.entries.find((e) => !e.winner);
      const tie = winners.some((w) => w.value !== winners[0]!.value);
      const notes = tie ? ["tie"] : [];
      if (runnerUp) {
        const f = runnerUp.factorVsBest;
        notes.push(s.higherIsBetter ? `${f.toFixed(2)}× vs ${short(runnerUp.name)}` : `${((1 - 1 / f) * 100).toFixed(0)}% < ${short(runnerUp.name)}`);
      }
      winner = `**${winners.map((w) => short(w.name)).join(tie ? " ≈ " : " = ")}**`;
      if (notes.length) winner += ` (${notes.join("; ")})`;
      winner = ` ${winner} |`;
    }
    lines.push(`| ${s.row} | ${cells.join(" | ")} |${winner}`);
  }
  lines.push("", `*${layout.note}*`, "", "---", "");
}

const readme = readFileSync(README, "utf8");
const a = readme.indexOf(START), b = readme.indexOf(END);
if (a === -1 || b === -1) throw new Error(`README.md is missing the ${START} / ${END} markers`);
writeFileSync(README, readme.slice(0, a + START.length) + "\n" + lines.join("\n") + readme.slice(b));
console.log("✓ README.md results block regenerated");
