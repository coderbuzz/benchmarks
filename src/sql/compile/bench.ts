import { sqlite } from "@coderbuzz/sql/sqlite";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import {
  eq, and, gt, gte, lt, lte, ne, like, inArray,
} from "drizzle-orm";
import { Kysely, SqliteDialect } from "kysely";
import { Recorder, bench, expectOk, header, section } from "../../_lib/harness";

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
  dialect: new SqliteDialect({ database: new Database(":memory:") as any }),
});

// --- shared data ---
const batchRows = Array.from({ length: 100 }, (_, i) => ({ id: i, name: "User" + i }));

const rec = new Recorder("sql-compile");
header("SQL Compile Benchmark", "query compilation throughput (no DB execution)");

type Q = () => { sql: string };
function benchGroup(id: string, title: string, code: string, cb: Q, dz: Q, ky: Q) {
  // Sanity: every builder must produce SQL text.
  for (const [n, q] of [["@coderbuzz/sql", cb], ["drizzle-orm", dz], ["kysely", ky]] as const) {
    expectOk(`${title} ${n}`, q, (r: any) => typeof r?.sql === "string" && r.sql.length > 0);
  }
  section(`${title}:`);
  const s = rec.suite({
    id, group: "SQL", row: title, library: "@coderbuzz/sql", type: "throughput",
    description: `${title}: query builder → SQL string + params`, code,
    unit: "ops/s", higherIsBetter: true,
  });
  s.add("@coderbuzz/sql", bench("@coderbuzz/sql", cb));
  s.add("Kysely", bench("kysely", ky));
  s.add("Drizzle ORM", bench("drizzle-orm", dz));
}

benchGroup("sql-simple", "SELECT simple", "db.select().from('users').where({ id: 1 }).toSQL()",
  () => cbDb.select().from("users").where({ id: 1 }).toSQL(),
  () => dzDb.select().from(users).where(eq(users.id, 1)).toSQL(),
  () => kyDb.selectFrom("users").selectAll().where("id", "=", 1).compile(),
);

benchGroup("sql-join", "SELECT JOIN", "db.select().from('users').inner_join('posts', 'users.id = posts.user_id').toSQL()",
  () => cbDb.select().from("users").inner_join("posts", "users.id = posts.user_id").toSQL(),
  () => dzDb.select().from(users).innerJoin(posts, eq(users.id, posts.user_id)).toSQL(),
  () => kyDb.selectFrom("users").innerJoin("posts", "users.id", "posts.user_id").selectAll().compile(),
);

benchGroup("sql-insert", "INSERT single", "db.insert_into('users').values([{ id: 1, name: 'Alice' }]).toSQL()",
  () => cbDb.insert_into("users").values([{ id: 1, name: "Alice" }]).toSQL(),
  () => dzDb.insert(users).values({ id: 1, name: "Alice" }).toSQL(),
  () => kyDb.insertInto("users").values({ id: 1, name: "Alice" } as any).compile(),
);

benchGroup("sql-batch", "INSERT batch 100", "db.insert_into('users').values(batchRows).toSQL()",
  () => cbDb.insert_into("users").values(batchRows).toSQL(),
  () => dzDb.insert(users).values(batchRows).toSQL(),
  () => kyDb.insertInto("users").values(batchRows as any).compile(),
);

const sq = dzDb.$with("active_users").as(
  dzDb.select().from(users).where(eq(users.active, true)),
);
const kyCte = (qb: any) => qb.selectFrom("users").select(["id", "name"]).where("active", "=", 1);

benchGroup("sql-cte", "CTE", "db.with('active', q => q.select('id', 'name').from('users').where(eq('active', true))).select('id', 'name').from('active').toSQL()",
  () => cbDb.with("active", (q: any) =>
    q.select("id", "name").from("users").where(sqlite.eq("active", true)),
  ).select("id", "name").from("active").toSQL(),
  () => dzDb.with(sq).select().from(sq).toSQL(),
  () => kyDb.with("sq", kyCte).selectFrom("sq").selectAll().compile(),
);

benchGroup("sql-10-conditions", "SELECT 10 conditions", "db.select().from('users').where(and(eq(...), gt(...), lt(...), ne(...), like(...), gte(...), lte(...), inList(...), eq(...), eq(...))).toSQL()",
  () => cbDb.select().from("users").where(
    sqlite.and(
      sqlite.eq("status", "active"), sqlite.gt("age", 18), sqlite.lt("age", 100),
      sqlite.ne("deleted", true), sqlite.like("name", "%John%"),
      sqlite.gte("created_at", "2024-01-01"), sqlite.lte("updated_at", "2025-01-01"),
      sqlite.inList("role", ["admin", "user", "moderator"]),
      sqlite.eq("email_verified", true), sqlite.eq("plan", "premium"),
    ),
  ).toSQL(),
  () => dzDb.select().from(users).where(
    and(
      eq(users.status, "active"), gt(users.age, 18), lt(users.age, 100),
      ne(users.deleted, true), like(users.name, "%John%"),
      gte(users.created_at, "2024-01-01"), lte(users.updated_at, "2025-01-01"),
      inArray(users.role, ["admin", "user", "moderator"]),
      eq(users.email_verified, true), eq(users.plan, "premium"),
    ),
  ).toSQL(),
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
);

cbDb.close();
rec.save();
