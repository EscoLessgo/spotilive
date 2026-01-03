import db from '../../lib/db.js';
import { getClientIP, fetchGeolocation, updateHostname } from '../../lib/analytics.js';

export const handler = async (event, context) => {
    // Only allow POST/GET
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, body: '' };
    }

    try {
        const ip = getClientIP(event);
        const userAgent = event.headers['user-agent'] || '';
        const body = event.body ? JSON.parse(event.body) : {};
        const path = body.path || '/';

        // Async logging (don't wait for it if possible, but in serverless we must wait or it might freeze)
        // In local express, we can fire and forget, but better to await for correctness in this context.
        // For speed, we can do it quickly.

        const loc = await fetchGeolocation(ip);

        let rowId;
        if (loc) {
            const res = db.prepare(`
                INSERT INTO page_views (path, ip, country, countryCode, region, regionName, city, zip, lat, lon, isp, org, asName, userAgent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                path, ip, loc.country, loc.countryCode, loc.region, loc.regionName,
                loc.city, loc.zip, loc.lat, loc.lon, loc.isp, loc.org, loc.as, userAgent
            );
            rowId = res.lastInsertRowid;
        } else {
            const res = db.prepare(`INSERT INTO page_views (path, ip, userAgent) VALUES (?, ?, ?)`).run(path, ip, userAgent);
            rowId = res.lastInsertRowid;
        }

        // Trigger Reverse DNS (Fire and forget might work locally, but await to be safe)
        await updateHostname(db, 'page_views', rowId, ip);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, id: rowId })
        };
    } catch (error) {
        console.error('Analytics Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to record view' })
        };
    }
};
