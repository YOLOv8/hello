type SqlValue = string | number | bigint | Uint8Array | null;

interface RunResult {
  rowsAffected: number;
  lastInsertRowid?: number;
}

export interface AppDb {
  one<T>(sql: string, args?: SqlValue[]): Promise<T | undefined>;
  many<T>(sql: string, args?: SqlValue[]): Promise<T[]>;
  run(sql: string, args?: SqlValue[]): Promise<RunResult>;
  exec(sql: string): Promise<void>;
}

let dbPromise: Promise<AppDb> | undefined;
let schemaPromise: Promise<void> | undefined;

export async function getDb(): Promise<AppDb> {
  if (!dbPromise) {
    dbPromise = createDb();
  }

  const db = await dbPromise;

  if (!schemaPromise) {
    schemaPromise = initSchema(db);
  }

  await schemaPromise;
  return db;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.TURSO_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("TURSO_DATABASE_URL is required");
  }

  return databaseUrl;
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    return Number(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)])
    );
  }

  return value;
}

function normalizeRow<T>(row: unknown): T {
  return normalizeValue(row) as T;
}

async function createDb(): Promise<AppDb> {
  const databaseUrl = getDatabaseUrl();
  return createRemoteDb(databaseUrl);
}

async function createRemoteDb(databaseUrl: string): Promise<AppDb> {
  const { createClient } = await import("@libsql/client");

  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!authToken) {
    throw new Error("TURSO_AUTH_TOKEN is required");
  }

  const client = createClient({
    url: databaseUrl,
    authToken,
  });

  return {
    async one<T>(sql: string, args: SqlValue[] = []) {
      const result = await client.execute({ sql, args });
      const row = result.rows[0];
      return row ? normalizeRow<T>(row) : undefined;
    },
    async many<T>(sql: string, args: SqlValue[] = []) {
      const result = await client.execute({ sql, args });
      return result.rows.map((row) => normalizeRow<T>(row));
    },
    async run(sql: string, args: SqlValue[] = []) {
      const result = await client.execute({ sql, args });
      return {
        rowsAffected: result.rowsAffected ?? 0,
        lastInsertRowid:
          result.lastInsertRowid === undefined || result.lastInsertRowid === null
            ? undefined
            : Number(result.lastInsertRowid),
      };
    },
    async exec(sql: string) {
      await client.execute(sql);
    },
  };
}

async function initSchema(db: AppDb) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_no TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      class TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}
