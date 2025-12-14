export default async function handler(req, context) {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

    if (!SPOTIFY_REFRESH_TOKEN) {
        return { statusCode: 500, body: JSON.stringify({ error: "No Refresh Token configured" }) };
    }

    const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

    // 1. Get Access Token
    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN,
        }),
    });

    const data = await response.json();
    const accessToken = data.access_token;

    if (!accessToken) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to get access token", details: data }) };
    }

    // 2. Get Currently Playing
    const nowPlayingRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (nowPlayingRes.status === 204 || nowPlayingRes.status > 400) {
        return {
            statusCode: 200,
            body: JSON.stringify({ is_playing: false }),
        };
    }

    const song = await nowPlayingRes.json();
    return {
        statusCode: 200,
        body: JSON.stringify(song),
    };
}
