// Native fetch is available in Node 18+ (Netlify default)

export async function handler(event, context) {
    const CID = process.env.SPOTIFY_CLIENT_ID?.trim();
    const SEC = process.env.SPOTIFY_CLIENT_SECRET?.trim();
    const REF = process.env.SPOTIFY_REFRESH_TOKEN?.trim();

    if (!CID || !SEC || !REF) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Configuration Error: Missing Env Vars." })
        };
    }

    try {
        // 1. Get Access Token
        const basicAuth = Buffer.from(`${CID}:${SEC}`).toString('base64');
        const tokenResp = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: REF }).toString()
        });

        const tokenData = await tokenResp.json();

        if (!tokenResp.ok) {
            console.error("Token Error:", tokenData);
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Auth Fail", details: tokenData })
            };
        }

        const accessToken = tokenData.access_token;

        // 2. Get Now Playing
        const musicResp = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        // Handle 204 No Content (Not playing)
        if (musicResp.status === 204) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ is_playing: false })
            };
        }

        // Handle Errors (Status != 200)
        if (!musicResp.ok) {
            const errorText = await musicResp.text(); // Read as text first to avoid crash
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Spotify API Error", status: musicResp.status, details: errorText })
            };
        }

        // Parse JSON only if OK and not empty
        const musicData = await musicResp.json();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(musicData)
        };

    } catch (e) {
        console.error("Function Crash:", e.message);
        return {
            statusCode: 200, // Still return 200 for frontend peace of mind
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ error: "Function Crash", details: e.message })
        };
    }
}
