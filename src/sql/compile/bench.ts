import { sqlite } from "@coderbuzz/sql/sqlite";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import {
  eq, and, or, gt, gte, lt, lte, ne, like, inArray,
} from "drizzle-orm";
import { Kysely, SqliteDialect } from "kysely";

// --- @coderbuzz/sql setup ---
const cbDb = sqlite.connect({ path: ":memory:" });

// --- drizzle-orm setup ---
const dzSqlite = new Database(":memory:");
const dzDb = drizzle(dzSqlite);
const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  status: text("status"),
  age: integer("age"),
  deleted: integer("deleted", { mode: "boolean" }),
  active: integer("active", { mode: "boolean" }),
  role: text("role"),
  created_at: text("created_at"),
  updated_at: text("updated_at"),
  email_verified: integer("email_verified", { mode: "boolean" }),
  plan: text("plan"),
});
const posts = sqliteTable("posts", {
  id: integer("id").primaryKey(),
  user_id: integer("user_id"),
  title: text("title"),
});

// --- kysely setup ---
interface UsersRow {
  id: number; name: string; email: string | null; status: string | null;
  age: number | null; deleted: number; active: number; role: string | null;
  created_at: string | null; updated_at: string | null;
  email_verified: number; plan: string | null;
}
interface PostsRow { id: number; user_id: number; title: string | null }
interface DB { users: UsersRow; posts: PostsRow }
const kyDb = new Kysely<DB>({
  dialect: new SqliteDialect({ database: new Database(":memory:") }),
});

// --- shared data ---
const batchRows = Array.from({ length: 100 }, (_, i) => ({ id: i, name: "User" + i }));

function bench(label: string, fn: () => void, iterations = 50_000) {
  for (let i = 0; i < 1000; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  const ops = Math.round((iterations / elapsed) * 1000);
  console.log(`  ${label}: ${ops.toLocaleString()} ops/s`);
}

function benchGroup(title: string, ...benches: [string, () => void][]) {
  console.log(`\n${title}:`);
  for (const [label, fn] of benches) bench(label, fn);
}

const SEP = "━".repeat(46);
console.log(`\x1b[36m${SEP}\x1b[0m`);
console.log(`  \x1b[1m\x1b[36m◈ SQL Compile Benchmark\x1b[0m`);
console.log(`  \x1b[2mQuery compilation throughput (no DB execution)\x1b[0m`);
console.log(`\x1b[36m${SEP}\x1b[0m`);

// 1. SELECT simple
benchGroup("SELECT simple",
  ["@coderbuzz/sql", () => cbDb.select().from("users").where({ id: 1 }).toSQL()],
  ["drizzle-orm", () => dzDb.select().from(users).where(eq(users.id, 1)).toSQL()],
  ["kysely", () => kyDb.selectFrom("users").selectAll().where("id", "=", 1).compile()],
);

// 2. SELECT JOIN
benchGroup("SELECT JOIN",
  ["@coderbuzz/sql", () => cbDb.select().from("users").inner_join("posts", "users.id = posts.user_id").toSQL()],
  ["drizzle-orm", () => dzDb.select().from(users).innerJoin(posts, eq(users.id, posts.user_id)).toSQL()],
  ["kysely", () => kyDb.selectFrom("users").innerJoin("posts", "users.id", "posts.user_id").selectAll().compile()],
);

// 3. INSERT single
benchGroup("INSERT single",
  ["@coderbuzz/sql", () => cbDb.insert_into("users").values([{ id: 1, name: "Alice" }]).toSQL()],
  ["drizzle-orm", () => dzDb.insert(users).values({ id: 1, name: "Alice" }).toSQL()],
  ["kysely", () => kyDb.insertInto("users").values({ id: 1, name: "Alice" }).compile()],
);

// 4. INSERT batch (100 rows)
benchGroup("INSERT batch 100",
  ["@coderbuzz/sql", () => cbDb.insert_into("users").values(batchRows).toSQL()],
  ["drizzle-orm", () => dzDb.insert(users).values(batchRows).toSQL()],
  ["kysely", () => kyDb.insertInto("users").values(batchRows).compile()],
);

// 5. CTE
const sq = dzDb.$with("active_users").as(
  dzDb.select().from(users).where(eq(users.active, true)),
);
const kyCte = kyDb.selectFrom("users").select(["id", "name"]).where("active", "=", 1).as("sq");

benchGroup("CTE",
  [
    "@coderbuzz/sql",
    () => cbDb.with("active", (q) =>
      q.select("id", "name").from("users").where(sqlite.eq("active", true)),
    ).select("id", "name").from("active").toSQL(),
  ],
  [
    "drizzle-orm",
    () => dzDb.with(sq).select().from(sq).toSQL(),
  ],
  [
    "kysely",
    () => kyDb.with("sq", kyCte).selectFrom("sq").selectAll().compile(),
  ],
);

// 6. SELECT with 10 nested conditions
benchGroup("SELECT 10 conditions",
  [
    "@coderbuzz/sql",
    () => cbDb.select().from("users").where(
      sqlite.and(
        sqlite.eq("status", "active"), sqlite.gt("age", 18), sqlite.lt("age", 100),
        sqlite.ne("deleted", true), sqlite.like("name", "%John%"),
        sqlite.gte("created_at", "2024-01-01"), sqlite.lte("updated_at", "2025-01-01"),
        sqlite.inList("role", ["admin", "user", "moderator"]),
        sqlite.eq("email_verified", true), sqlite.eq("plan", "premium"),
      ),
    ).toSQL(),
  ],
  [
    "drizzle-orm",
    () => dzDb.select().from(users).where(
      and(
        eq(users.status, "active"), gt(users.age, 18), lt(users.age, 100),
        ne(users.deleted, true), like(users.name, "%John%"),
        gte(users.created_at, "2024-01-01"), lte(users.updated_at, "2025-01-01"),
        inArray(users.role, ["admin", "user", "moderator"]),
        eq(users.email_verified, true), eq(users.plan, "premium"),
      ),
    ).toSQL(),
  ],
  [
    "kysely",
    () => kyDb.selectFrom("users").selectAll()
      .where("status", "=", "active")
      .where("age", ">", 18).where("age", "<", 100)
      .where("deleted", "!=", 1)
      .where("name", "like", "%John%")
      .where("created_at", ">=", "2024-01-01")
      .where("updated_at", "<=", "2025-01-01")
      .where("role", "in", ["admin", "user", "moderator"])
      .where("email_verified", "=", 1)
      .where("plan", "=", "premium")
      .compile(),
  ],
);

cbDb.close();
