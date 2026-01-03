import Database from 'better-sqlite3';
import path from 'path';

// Initialize DB file
const dbPath = path.resolve(process.cwd(), 'analytics.db');
let db;

try {
    db = new Database(dbPath);
    // Create Analytics Tables
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
            userAgent TEXT,
            hostname TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
} catch (err) {
    console.error("Failed to initialize SQLite (likely read-only environment like Netlify). Analytics disabled.");
    // Mock DB interface to prevent crashes
    db = {
        prepare: () => ({
            run: () => ({ lastInsertRowid: 0 }),
            all: () => []
        }),
        exec: () => { }
    };
}

export default db;
