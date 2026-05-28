import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

loadDotEnv();

const databaseUrl = getRequiredEnv("TURSO_DATABASE_URL");
const authToken = getRequiredEnv("TURSO_AUTH_TOKEN");

await seedRemoteDatabase(databaseUrl, authToken);

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getRequiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required to seed the remote Turso database`);
  }

  return value;
}

async function seedRemoteDatabase(url, authToken) {
  const { createClient } = await import("@libsql/client");
  const client = createClient({ url, authToken });

  await createSchema({
    exec: (sql) => client.execute(sql),
  });

  const existing = await client.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: ["admin"],
  });

  if (existing.rows.length === 0) {
    const password = bcrypt.hashSync("admin123", 10);
    await client.execute({
      sql: "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
      args: ["admin", password, "管理员", "admin"],
    });
    console.log("Admin user created: admin / admin123");
  } else {
    console.log("Admin user already exists");
  }
}

async function createSchema(db) {
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
