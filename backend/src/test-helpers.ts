import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let testDbCounter = 0;

export function createTestDb(): Database.Database {
  const dbDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dbDir, { recursive: true });
  const dbFile = path.join(dbDir, `test-${process.pid}-${testDbCounter++}.db`);
  const db = new Database(dbFile);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return db;
}

export function cleanupTestDbs(): void {
  const dbDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dbDir)) return;
  const files = fs.readdirSync(dbDir).filter(f => f.startsWith('test-'));
  for (const file of files) {
    try {
      fs.unlinkSync(path.join(dbDir, file));
    } catch {
      // ignore
    }
  }
}
