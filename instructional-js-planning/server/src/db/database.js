import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../rps.db');

let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
      }
    });
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          db.run(`
            CREATE TABLE IF NOT EXISTS matches (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              player_score INTEGER DEFAULT 0,
              computer_score INTEGER DEFAULT 0,
              status TEXT DEFAULT 'in_progress',
              winner TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              completed_at DATETIME,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `, (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            db.run(`
              CREATE TABLE IF NOT EXISTS rounds (
                id TEXT PRIMARY KEY,
                match_id TEXT NOT NULL,
                round_number INTEGER NOT NULL,
                player_choice TEXT NOT NULL,
                computer_choice TEXT NOT NULL,
                winner TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (match_id) REFERENCES matches(id)
              )
            `, (err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              db.run('CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id)', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }

                db.run('CREATE INDEX IF NOT EXISTS idx_rounds_match_id ON rounds(match_id)', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }

                  db.run('COMMIT', (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      console.log('Database initialized successfully');
                      resolve();
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

function runAsync(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getAsync(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allAsync(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export { initializeDatabase, runAsync, getAsync, allAsync, getDb };
