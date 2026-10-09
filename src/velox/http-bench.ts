// HTTP benchmark runner: bun src/velox/http-bench.ts <static-value|dynamic|validation>
//
// Per framework: spawn server (NODE_ENV=production) → wait until it answers → sanity-check
// the response (and, for validation, that invalid input is rejected) → warmup → RUNS timed
// runs with oha (or wrk with WRK=1) → best req/s. Any non-2xx response fails the run.

import { $ } from "bun";
import { join } from "node:path";
import { Recorder, color, header } from "../_lib/harness";

const RUNS = Number(process.env.HTTP_RUNS ?? 3);
const DURATION = process.env.HTTP_DURATION ?? "10s";
const WARMUP = process.env.HTTP_WARMUP ?? "3s";
const CONNECTIONS = 100;
const PORT = 3000;
const USE_WRK = process.env.WRK === "1";
const ROOT = join(import.meta.dir, "../..");
const HOST = `http://127.0.0.1:${PORT}`;
const EXPECTED = JSON.stringify({ message: "Hello, World" });

interface Request { method: string; path: string; headers: Record<string, string>; body?: string }
interface Scenario {
  title: string;
  subtitle: string;
  suite: { id: string; row: string; description: string; code: string };
  request: Request;
  wrkScript?: string;
  /** Requests that a validating server must reject with a 4xx (a 500 means the framework failed, not rejected). */
  invalid?: Request[];
}

const postBody = await Bun.file(join(import.meta.dir, "validation/post-data.json")).text();
const validRequest: Request = {
  method: "POST",
  path: "/hello/test/123?name=john&excitement=high",
  headers: { "content-type": "application/json", "x-foo": "test" },
  body: JSON.stringify(JSON.parse(postBody)),
};

const SCENARIOS: Record<string, Scenario> = {
  "static-value": {
    title: "Static Value Benchmark",
    subtitle: "app.get('/hello', { message: ... }): static response where the framework supports it",
    suite: { id: "velox-static-value", row: "Static value", description: "GET /hello: inline JSON response (Velox/Elysia: static route value; Hono/Express: handler)", code: "app.get('/hello', { message: 'Hello, World' })" },
    request: { method: "GET", path: "/hello", headers: {} },
  },
  dynamic: {
    title: "Dynamic Handler Benchmark",
    subtitle: "app.get('/hello', () => ({ ... })): handler returning JSON",
    suite: { id: "velox-dynamic", row: "Dynamic handler", description: "GET /hello: handler function returning a JSON object (all frameworks)", code: "app.get('/hello', () => ({ message: 'Hello, World' }))" },
    request: { method: "GET", path: "/hello", headers: {} },
  },
  validation: {
    title: "Validation Benchmark",
    subtitle: "POST /hello/:par1/:par2: body + query + params + headers",
    suite: { id: "velox-validation", row: "Validation POST", description: "POST /hello/:par1/:par2: body + query + params + headers validation", code: "app.post('/hello/:par1/:par2', { json, query, params, headers }, handler)" },
    request: validRequest,
    wrkScript: "src/velox/validation/wrk-post.lua",
    invalid: [
      { ...validRequest, body: JSON.stringify({ ...JSON.parse(postBody), enumKey: "Bar" }) },
      { ...validRequest, body: JSON.stringify({ ...JSON.parse(postBody), requiredKey: [1.5] }) },
      { ...validRequest, body: JSON.stringify({ ...JSON.parse(postBody), requiredKey: [1, 2, 3, 4] }) },
      { ...validRequest, path: "/hello/test/abc?name=john&excitement=high" },
      { ...validRequest, body: "{oops" },
      { ...validRequest, headers: { "content-type": "application/json" } },
    ],
  },
};

const FRAMEWORKS = [
  ["@coderbuzz/velox", "Velox", "server-velox.ts"],
  ["Elysia", "Elysia", "server-elysia.ts"],
  ["Hono", "Hono", "server-hono.ts"],
  ["Express", "Express", "server-express.ts"],
] as const;

async function freePort() {
  await $`lsof -ti :${PORT} | xargs kill -9`.quiet().nothrow();
}

async function send(req: Request) {
  const res = await fetch(HOST + req.path, { method: req.method, headers: req.headers, body: req.body });
  return { status: res.status, body: await res.text() };
}

async function waitReady(proc: Bun.Subprocess, req: Request) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) throw new Error(`server exited with code ${proc.exitCode}`);
    try { return await send(req); } catch { await Bun.sleep(50); }
  }
  throw new Error("server did not become ready within 15s");
}

function ohaArgs(req: Request, duration: string) {
  const args = ["oha", "-c", String(CONNECTIONS), "-z", duration, "--no-tui", "--output-format", "json", "-m", req.method];
  for (const [k, v] of Object.entries(req.headers)) args.push("-H", `${k}: ${v}`);
  if (req.body) args.push("-d", req.body);
  args.push(HOST + req.path);
  return args;
}

async function load(s: Scenario, duration: string): Promise<number> {
  if (USE_WRK) {
    const args = ["wrk", "-t4", `-c${CONNECTIONS}`, `-d${duration}`];
    if (s.wrkScript) args.push("-s", join(ROOT, s.wrkScript));
    args.push(HOST + s.request.path);
    const out = await new Response(Bun.spawn(args, { stdout: "pipe" }).stdout).text();
    if (/Non-2xx or 3xx responses/.test(out)) throw new Error(`non-2xx responses:\n${out}`);
    return Number(out.match(/Requests\/sec:\s+([\d.]+)/)?.[1] ?? 0);
  }
  const out = await new Response(Bun.spawn(ohaArgs(s.request, duration), { stdout: "pipe" }).stdout).json();
  const bad = Object.entries(out.statusCodeDistribution as Record<string, number>).filter(([code]) => !code.startsWith("2"));
  if (bad.length) throw new Error(`non-2xx responses: ${JSON.stringify(out.statusCodeDistribution)}`);
  return out.summary.requestsPerSec as number;
}

const scenarioName = process.argv[2] ?? "";
const scenario = SCENARIOS[scenarioName];
if (!scenario) {
  console.error(`usage: bun src/velox/http-bench.ts <${Object.keys(SCENARIOS).join("|")}>`);
  process.exit(1);
}

header(scenario.title, scenario.subtitle);
console.log(color.dim(`  ${USE_WRK ? "wrk -t4" : "oha"} -c ${CONNECTIONS}, warmup ${WARMUP}, ${RUNS} × ${DURATION}, best run reported`));

const rec = new Recorder(`velox-${scenarioName}`);
const suite = rec.suite({
  ...scenario.suite, group: "Velox", library: "@coderbuzz/velox", type: "http",
  unit: "req/s", higherIsBetter: true,
});
const results: [string, number][] = [];

for (const [name, label, file] of FRAMEWORKS) {
  await freePort();
  console.log(`\n  ${color.bold(color.yellow(`▸ ${label}`))}`);
  const proc = Bun.spawn(["bun", join(import.meta.dir, scenarioName, file)], {
    cwd: ROOT, env: { ...process.env, NODE_ENV: "production" }, stdout: "ignore", stderr: "inherit",
  });
  try {
    const first = await waitReady(proc, scenario.request);
    if (first.status !== 200 || JSON.stringify(JSON.parse(first.body)) !== EXPECTED) {
      throw new Error(`[sanity] unexpected response ${first.status}: ${first.body}`);
    }
    for (const bad of scenario.invalid ?? []) {
      const r = await send(bad);
      if (r.status < 400 || r.status > 499) throw new Error(`[sanity] invalid request not rejected with 4xx (${r.status}): ${bad.path} ${JSON.stringify(bad.headers)} ${bad.body ?? ""}`);
    }
    await load(scenario, WARMUP);
    let best = 0;
    for (let i = 1; i <= RUNS; i++) {
      const rps = await load(scenario, DURATION);
      best = Math.max(best, rps);
      console.log(`    run ${i}: ${Math.round(rps).toLocaleString().padStart(10)} req/s`);
    }
    console.log(`    ${color.green("best")}: ${Math.round(best).toLocaleString().padStart(9)} req/s`);
    results.push([label, best]);
    suite.add(name, Math.round(best));
  } finally {
    proc.kill();
    await proc.exited;
    await freePort();
  }
}

console.log(`\n  ${color.bold("Summary (best of runs):")}`);
const top = Math.max(...results.map(([, v]) => v));
for (const [label, v] of [...results].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${label.padEnd(10)} ${Math.round(v).toLocaleString().padStart(10)} req/s  ${color.dim(`${((v / top) * 100).toFixed(1)}%`)}`);
}

rec.save();
