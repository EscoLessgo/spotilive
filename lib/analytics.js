// Native fetch in Node 18+
// import dns from 'dns'; // Dynamically imported


// 1. Get Client IP Helper
export function getClientIP(event) {
    // Netlify/Express headers
    const headers = event.headers || {};
    let ip = headers['x-forwarded-for']?.split(',')[0] ||
        headers['x-real-ip'] ||
        headers['client-ip'] ||
        '127.0.0.1';

    if (ip.includes('::ffff:')) ip = ip.split(':').pop();
    if (ip === '::1') ip = '127.0.0.1';

    return ip.trim();
}

// 2. Geolocation Helper
export async function fetchGeolocation(ip) {
    try {
        // Mock data for local development so the User sees "something"
        if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return {
                status: 'success',
                country: 'Local Dev',
                countryCode: 'LOC',
                region: 'LH',
                regionName: 'Localhost',
                city: 'My Computer',
                zip: '00000',
                lat: 0,
                lon: 0,
                isp: 'Local Loopback',
                org: 'Development',
                as: 'AS12345 Local'
            };
        }

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,isp,org,as,query`);
        const data = await response.json();
        return data.status === 'success' ? data : null;
    } catch (e) {
        return null; // Fail silently
    }
}

// 3. Reverse DNS Helper (Async Update)
export async function updateHostname(db, table, id, ip) {
    // Allow localhost lookup now
    try {
        const { promises: dnsPromises } = await import('dns');
        const hostnames = await dnsPromises.reverse(ip);
        if (hostnames && hostnames.length > 0) {
            db.prepare(`UPDATE ${table} SET hostname = ? WHERE id = ?`).run(hostnames[0], id);
        }
    } catch (e) {
        // Limit logging to avoid noise
    }
}

// 4. Parse Platform Helper (for Admin UI)
export function parsePlatform(ua) {
    if (!ua) return 'Unknown';
    let platform = 'Unknown Device';

    if (ua.includes('Windows')) platform = 'Windows PC';
    else if (ua.includes('Macintosh')) platform = 'Mac';
    else if (ua.includes('iPhone')) platform = 'iPhone';
    else if (ua.includes('iPad')) platform = 'iPad';
    else if (ua.includes('Android')) platform = 'Android';
    else if (ua.includes('Linux')) platform = 'Linux';
    else if (ua.includes('CrOS')) platform = 'Chrome OS';

    if (ua.includes('Chrome/') && !ua.includes('Chromium')) platform += ' (Chrome)';
    else if (ua.includes('Firefox/')) platform += ' (Firefox)';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) platform += ' (Safari)';
    else if (ua.includes('Edge/')) platform += ' (Edge)';

    return platform;
}
