export async function handler(event, context) {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        console.error("Missing Env Vars in get-now-playing");
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ error: "Configuration Error: Missing Netlify Environment Variables." })
        };
    }

    try {
        // 1. Get Access Token (Refresh Flow)
        const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
        const tokenParams = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN
        });

        const tokenResp = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenParams.toString()
        });

        const tokenData = await tokenResp.json();

        if (!tokenResp.ok) {
            console.error("Token Refresh Error:", tokenData);
            // We return 200 with an error object so the frontend can handle it nicely
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ error: "Auth Fail", details: tokenData })
            };
        }

        const accessToken = tokenData.access_token;

        // 2. Get Now Playing
        const musicResp = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (musicResp.statusCode === 204 || musicResp.status === 204) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ is_playing: false })
            };
        }

        const musicData = await musicResp.json();

        if (!musicResp.ok) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ error: "Spotify API Error", details: musicData })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
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
