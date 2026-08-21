import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";

let db;

export function initDatabase() {
  const dbPath = path.join(
    app.getPath("userData"),
    "inventory.db"
  );

  db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      partNumber TEXT NOT NULL DEFAULT '',

      customerName TEXT NOT NULL DEFAULT '',

      poNumber TEXT NOT NULL DEFAULT '',

      location TEXT NOT NULL DEFAULT '',

      quantity INTEGER NOT NULL DEFAULT 0,

      notes TEXT NOT NULL DEFAULT '',

      archived INTEGER NOT NULL DEFAULT 0,

      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log(
    "Database initialized:",
    dbPath
  );
}

export function getDatabase() {
  if (!db) {
    throw new Error(
      "Database has not been initialized."
    );
  }

  return db;
}