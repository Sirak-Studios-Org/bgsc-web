import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./data/bgsc.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'team',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      trial_start   TEXT NOT NULL DEFAULT (datetime('now')),
      trial_end     TEXT NOT NULL DEFAULT (datetime('now', '+7 days')),
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      type       TEXT NOT NULL,
      path       TEXT,
      referrer   TEXT,
      country    TEXT,
      meta       TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS courses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT,
      thumbnail   TEXT,
      position    INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id        INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title            TEXT NOT NULL,
      description      TEXT,
      video_url        TEXT,
      duration_seconds INTEGER,
      position         INTEGER NOT NULL DEFAULT 0,
      is_published     INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default config
  await db.executeMultiple(`
    INSERT OR IGNORE INTO site_config (key, value) VALUES ('passion_app_url', 'http://Badgirlstrengthclub.passion.io');
    INSERT OR IGNORE INTO site_config (key, value) VALUES ('trial_days', '7');
    INSERT OR IGNORE INTO site_config (key, value) VALUES ('cta_url', '');
    INSERT OR IGNORE INTO site_config (key, value) VALUES ('posthog_key', '');
  `);
}

let initialized = false;
export async function getDb() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
  return db;
}
