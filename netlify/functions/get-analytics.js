import db from '../../lib/db.js';
import { parsePlatform } from '../../lib/analytics.js';

export const handler = async (event, context) => {
    try {
        // Simple authentication could go here

        const rows = db.prepare('SELECT * FROM page_views ORDER BY timestamp DESC LIMIT 100').all();

        const enrichedRows = rows.map(row => ({
            ...row,
            device: parsePlatform(row.userAgent)
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enrichedRows)
        };
    } catch (error) {
        console.error('Get Analytics Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve analytics' })
        };
    }
};
