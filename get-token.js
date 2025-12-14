import express from 'express';
import axios from 'axios';
import open from 'open'; // We might not have open, so we'll just log link
import readline from 'readline';

// CONFIG
const PORT = 8888;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n--- SPOTIFY REFRESH TOKEN GENERATOR ---\n");
console.log("1. Go to Spotify Dashboard: https://developer.spotify.com/dashboard");
console.log(`2. Edit Settings > Redirect URIs > Add: ${REDIRECT_URI} > Save`);
console.log("\n(Note: http://localhost is ALLOWED by Spotify for development)\n");

rl.question('Enter your Spotify Client ID: ', (clientId) => {
    rl.question('Enter your Spotify Client SECRET: ', (clientSecret) => {

        const app = express();

        app.get('/login', (req, res) => {
            const scope = 'user-read-playback-state user-read-currently-playing';
            res.redirect('https://accounts.spotify.com/authorize?' +
                new URLSearchParams({
                    response_type: 'code',
                    client_id: clientId.trim(),
                    scope: scope,
                    redirect_uri: REDIRECT_URI,
                }).toString());
        });

        app.get('/callback', async (req, res) => {
            const code = req.query.code || null;
            if (!code) return res.send("No code returned.");

            try {
                const response = await axios({
                    method: 'post',
                    url: 'https://accounts.spotify.com/api/token',
                    data: new URLSearchParams({
                        code: code,
                        redirect_uri: REDIRECT_URI,
                        grant_type: 'authorization_code'
                    }).toString(),
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        Authorization: 'Basic ' + (Buffer.from(clientId.trim() + ':' + clientSecret.trim()).toString('base64'))
                    }
                });

                const { refresh_token, access_token } = response.data;

                console.log("\n\n=======================================================");
                console.log("SUCCESS! HERE IS YOUR DATA FOR NETLIFY:");
                console.log("=======================================================\n");
                console.log(`SPOTIFY_CLIENT_ID=${clientId.trim()}`);
                console.log(`SPOTIFY_CLIENT_SECRET=${clientSecret.trim()}`);
                console.log(`SPOTIFY_REFRESH_TOKEN=${refresh_token}`);
                console.log("\n=======================================================\n");
                console.log("Copy the 3 lines above and paste them into Netlify > Site Settings > Environment Variables.");

                res.send("<h1>Success! Check your terminal for the Refresh Token.</h1>");
                process.exit(0);

            } catch (error) {
                console.error("Error getting token:", error.response?.data || error.message);
                res.send("Error getting token. Check terminal.");
            }
        });

        app.listen(PORT, () => {
            console.log(`\nServer running. Please open this URL in your browser to login:`);
            console.log(`http://localhost:${PORT}/login`);
        });

        rl.close();
    });
});
