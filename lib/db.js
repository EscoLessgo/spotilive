// Analytics disabled temporarily to ensure stability on Netlify
// This removes the 'better-sqlite3' dependency which causes crashes in serverless environments
const db = {
    prepare: () => ({
        run: () => ({ lastInsertRowid: 0 }),
        all: () => []
    }),
    exec: () => { }
};

export default db;
