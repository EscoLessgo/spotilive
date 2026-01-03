import Database from 'better-sqlite3';
import path from 'path';

// Use /tmp for serverless/read-only environments compatibility (ephemeral but working)
// Or use local directory if writable.
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'analytics.db')
    : 'analytics.db';

const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT,
    ip TEXT,
    country TEXT,
    countryCode TEXT,
    region TEXT,
    regionName TEXT,
    city TEXT,
    zip TEXT,
    lat REAL,
    lon REAL,
    isp TEXT,
    org TEXT,
    asName TEXT,
    mobile INTEGER,
    proxy INTEGER,
    hosting INTEGER,
    hostname TEXT,
    userAgent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    target TEXT,
    ip TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
