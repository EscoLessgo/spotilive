const https = require('https');
const querystring = require('querystring');

exports.handler = async function (event, context) {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        console.log("Missing Env Vars");
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Missing Env Vars" })
        };
    }

    // Helper to make HTTPS requests
    const makeRequest = (options, postData = null) => {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, body, headers: res.headers }));
            });
            req.on('error', (e) => reject(e));
            if (postData) req.write(postData);
            req.end();
        });
    };

    try {
        // 1. Get Access Token
        const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
        const postData = querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN
        });

        const tokenResp = await makeRequest({
            hostname: 'accounts.spotify.com',
            path: '/api/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        }, postData);

        if (tokenResp.statusCode !== 200) {
            console.log("Token Error:", tokenResp.body);
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Auth Fail", details: tokenResp.body })
            };
        }

        const accessToken = JSON.parse(tokenResp.body).access_token;

        // 2. Get Now Playing
        const musicResp = await makeRequest({
            hostname: 'api.spotify.com',
            path: '/v1/me/player/currently-playing',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (musicResp.statusCode === 204) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_playing: false })
            };
        }

        if (musicResp.statusCode !== 200) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Spotify API Error", details: musicResp.body })
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: musicResp.body
        };

    } catch (e) {
        console.error("Crash:", e);
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Function Crash", details: e.message })
        };
    }
};
