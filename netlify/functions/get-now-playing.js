export async function handler(event, context) {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    // 1. Basic Config Check
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        console.error("Missing Environment Variables");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Configuration Error: Missing Env Vars on Netlify" })
        };
    }

    try {
        // 2. Refresh Token (using native fetch, no axios deps)
        const basicAuth = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: SPOTIFY_REFRESH_TOKEN
            })
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            console.error("Spotify Token Error:", errText);
            return {
                statusCode: 200, // Return 200 to show error in UI instead of 500 page
                body: JSON.stringify({ error: "Spotify Auth Failed", details: errText })
            };
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 3. Get Now Playing
        const nowPlayingRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (nowPlayingRes.status === 204 || nowPlayingRes.status > 299) {
            // 204 = Not playing anything
            return {
                statusCode: 200,
                body: JSON.stringify({ is_playing: false })
            };
        }

        const data = await nowPlayingRes.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Handler Crash:", error);
        return {
            statusCode: 200,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
}
