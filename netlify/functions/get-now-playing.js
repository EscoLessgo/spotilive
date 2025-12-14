const axios = require('axios');

exports.handler = async function (event, context) {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    // 1. Check Configuration
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
        console.error("Missing Environment Variables");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Configuration Error. Check Netlify Env Vars." })
        };
    }

    const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

    try {
        // 2. Get Access Token
        const tokenParams = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN,
        });

        const tokenRes = await axios.post(TOKEN_ENDPOINT, tokenParams.toString(), {
            headers: {
                Authorization: `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) throw new Error("No access token returned from Spotify");

        // 3. Get Currently Playing
        const nowPlayingRes = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            validateStatus: function (status) {
                return status < 500; // Resolve even if 204 (Not Playing)
            }
        });

        if (nowPlayingRes.status === 204 || nowPlayingRes.data === "") {
            return {
                statusCode: 200,
                body: JSON.stringify({ is_playing: false }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(nowPlayingRes.data),
        };

    } catch (error) {
        console.error("Backend Error:", error.message);
        console.error("Details:", error.response?.data);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to fetch data",
                details: error.response?.data || error.message
            }),
        };
    }
}
