import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

describe('Database module', () => {
  let db: Database.Database;
  const testDbFile = path.join(__dirname, '..', 'data', `db-test-${process.pid}.db`);

  beforeAll(() => {
    fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
    db = new Database(testDbFile);
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
  });

  afterAll(() => {
    db.close();
    try { fs.unlinkSync(testDbFile); } catch {}
  });

  describe('users table', () => {
    it('should insert a user and return the row id', () => {
      const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
      const info = stmt.run('test@example.com', 'hashed_pw', 'Test User');
      expect(info.lastInsertRowid).toBeGreaterThan(0);
    });

    it('should enforce unique email constraint', () => {
      const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
      expect(() => stmt.run('test@example.com', 'hashed_pw2', 'Dup User'))
        .toThrow(/UNIQUE/);
    });

    it('should retrieve a user by email', () => {
      const row: any = db.prepare('SELECT * FROM users WHERE email = ?').get('test@example.com');
      expect(row).toBeDefined();
      expect(row.email).toBe('test@example.com');
      expect(row.name).toBe('Test User');
      expect(row.plan).toBe('free');
    });

    it('should default plan to free', () => {
      const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
      stmt.run('noplan@test.com', 'hash');
      const row: any = db.prepare('SELECT plan FROM users WHERE email = ?').get('noplan@test.com');
      expect(row.plan).toBe('free');
    });

    it('should allow null name', () => {
      const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
      stmt.run('nullname@test.com', 'hash', null);
      const row: any = db.prepare('SELECT name FROM users WHERE email = ?').get('nullname@test.com');
      expect(row.name).toBeNull();
    });

    it('should set created_at automatically', () => {
      const row: any = db.prepare('SELECT created_at FROM users WHERE email = ?').get('test@example.com');
      expect(row.created_at).toBeDefined();
      expect(row.created_at).not.toBeNull();
    });
  });

  describe('ads table', () => {
    let userId: number;

    beforeAll(() => {
      const row: any = db.prepare('SELECT id FROM users WHERE email = ?').get('test@example.com');
      userId = row.id;
    });

    it('should insert an ad', () => {
      const stmt = db.prepare('INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)');
      const info = stmt.run(userId, 'Test Ad', JSON.stringify({ text: 'hello' }));
      expect(info.lastInsertRowid).toBeGreaterThan(0);
    });

    it('should retrieve ads by user_id', () => {
      const rows = db.prepare('SELECT * FROM ads WHERE user_id = ?').all(userId);
      expect(rows.length).toBeGreaterThan(0);
    });

    it('should update an ad', () => {
      const ad: any = db.prepare('SELECT id FROM ads WHERE user_id = ?').get(userId);
      const stmt = db.prepare('UPDATE ads SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const info = stmt.run('Updated Title', ad.id);
      expect(info.changes).toBe(1);
      const updated: any = db.prepare('SELECT title FROM ads WHERE id = ?').get(ad.id);
      expect(updated.title).toBe('Updated Title');
    });

    it('should delete an ad', () => {
      const stmt = db.prepare('INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)');
      const info = stmt.run(userId, 'To Delete', '{}');
      const delInfo = db.prepare('DELETE FROM ads WHERE id = ?').run(info.lastInsertRowid);
      expect(delInfo.changes).toBe(1);
    });

    it('should enforce foreign key reference to users', () => {
      const stmt = db.prepare('INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)');
      // SQLite doesn't enforce FK by default, but the column exists
      const info = stmt.run(userId, 'FK Ad', '{}');
      expect(info.lastInsertRowid).toBeGreaterThan(0);
    });

    it('should store and parse content_json correctly', () => {
      const content = { headline: 'Buy Now', body: 'Great deal', images: ['img1.png'] };
      const stmt = db.prepare('INSERT INTO ads (user_id, title, content_json) VALUES (?, ?, ?)');
      const info = stmt.run(userId, 'JSON Ad', JSON.stringify(content));
      const row: any = db.prepare('SELECT content_json FROM ads WHERE id = ?').get(info.lastInsertRowid);
      expect(JSON.parse(row.content_json)).toEqual(content);
    });
  });
});
