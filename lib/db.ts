import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "data", "bgsc.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      trial_start TEXT NOT NULL DEFAULT (datetime('now')),
      trial_end   TEXT NOT NULL DEFAULT (datetime('now', '+7 days')),
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS email_queue (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      template_name TEXT NOT NULL,
      scheduled_for TEXT NOT NULL DEFAULT (datetime('now')),
      sent_at       TEXT,
      status        TEXT NOT NULL DEFAULT 'pending',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'team',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      tier            TEXT NOT NULL,
      name            TEXT NOT NULL,
      email           TEXT NOT NULL COLLATE NOCASE,
      phone           TEXT,
      location        TEXT,
      training_history TEXT,
      goals           TEXT,
      why_now         TEXT,
      status          TEXT NOT NULL DEFAULT 'new',
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default config
  const configStmt = db.prepare(`INSERT OR IGNORE INTO site_config (key, value) VALUES (?, ?)`);
  configStmt.run("passion_app_url", "http://Badgirlstrengthclub.passion.io");
  configStmt.run("trial_days", "7");
  configStmt.run("cta_url", "");

  // Seed default owner account
  const existingOwner = db.prepare(`SELECT id FROM admin_users WHERE role = 'owner'`).get();
  if (!existingOwner) {
    const hash = bcrypt.hashSync("BGSCadmin2024!", 10);
    db.prepare(`INSERT INTO admin_users (email, password_hash, role) VALUES (?, ?, 'owner')`)
      .run("admin@badgirlstrengthclub.com", hash);
  }
}

export type User = {
  id: number;
  name: string;
  email: string;
  trial_start: string;
  trial_end: string;
  is_active: number;
  created_at: string;
};

export type AdminUser = {
  id: number;
  email: string;
  role: string;
};

export type SiteConfig = Record<string, string>;

export function getConfig(): SiteConfig {
  const db = getDb();
  const rows = db.prepare(`SELECT key, value FROM site_config`).all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
