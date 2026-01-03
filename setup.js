import express from 'express';
import axios from 'axios';
import open from 'open';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

// CONFIG
const PORT = 8888;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.resolve(process.cwd(), '.env');

console.log("\n=================================");
console.log("   SPOTIFY VISUALIZER SETUP");
console.log("=================================\n");

console.log("1. Go to Spotify Dashboard: https://developer.spotify.com/dashboard");
console.log(`2. Add this Redirect URI:   ${REDIRECT_URI}`);
console.log("   (If you plan to use this script, you MUST add the above URL)\n");

rl.question('Enter your Spotify Client ID: ', (clientId) => {
    rl.question('Enter your Spotify Client SECRET: ', (clientSecret) => {
        rl.question('Enter your Redirect URI (Leave empty for http://localhost:8888/callback): ', (inputUri) => {
            const REDIRECT_URI = inputUri.trim() || `http://localhost:${PORT}/callback`;

            console.log(`\nUsing Redirect URI: ${REDIRECT_URI}`);
            console.log(`IMPORTANT: Ensure '${REDIRECT_URI}' is added to your Spotify Dashboard Redirect URIs!`);

            const app = express();

            app.get('/login', (req, res) => {
                const scope = 'user-read-playback-state user-read-currently-playing';
                const authUrl = 'https://accounts.spotify.com/authorize?' +
                    new URLSearchParams({
                        response_type: 'code',
                        client_id: clientId.trim(),
                        scope: scope,
                        redirect_uri: REDIRECT_URI,
                    }).toString();
                res.redirect(authUrl);
            });

            // Adjust callback path handling if using ngrok (might be redundant but safe)
            const callbackPath = new URL(REDIRECT_URI).pathname;

            app.get(callbackPath, async (req, res) => {
                const code = req.query.code || null;
                if (!code) return res.send("Error: No code returned from Spotify.");

                try {
                    const response = await axios({
                        method: 'post',
                        url: 'https://accounts.spotify.com/api/token',
                        data: new URLSearchParams({
                            code: code,
                            redirect_uri: REDIRECT_URI, // Must match exactly
                            grant_type: 'authorization_code'
                        }).toString(),
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            Authorization: 'Basic ' + (Buffer.from(clientId.trim() + ':' + clientSecret.trim()).toString('base64'))
                        }
                    });

                    const { refresh_token } = response.data;
                    const cid = clientId.trim();
                    const sec = clientSecret.trim();

                    // Generate .env content
                    const envContent = `SPOTIFY_CLIENT_ID=${cid}
SPOTIFY_CLIENT_SECRET=${sec}
SPOTIFY_REFRESH_TOKEN=${refresh_token}
`;

                    fs.writeFileSync(envPath, envContent);

                    console.log("\n\n✅ SUCCESS!");
                    console.log(" Credentials saved to .env");
                    console.log(" You can now run 'npm run dev'");

                    res.send("<h1>Setup Complete!</h1><p>Credentials saved to .env. You can close this window and start the app.</p>");

                    setTimeout(() => process.exit(0), 1000);

                } catch (error) {
                    console.error("Error getting token:", error.response?.data || error.message);
                    res.send("Error getting token. Check terminal.");
                }
            });

            const server = app.listen(PORT, async () => {
                const loginUrl = `http://localhost:${PORT}/login`; // We still start local server
                console.log(`\nLocal server running on port ${PORT}`);

                if (REDIRECT_URI.includes('localhost')) {
                    console.log(`Waiting for Spotify login...`);
                    console.log(`Opening browser: ${loginUrl}`);
                    await open(loginUrl);
                } else {
                    console.log(`\nSince you are using a custom Redirect URI (${REDIRECT_URI}),`);
                    console.log(`Please open your ngrok (or other) URL ending with /login`);
                    console.log(`Example: ${REDIRECT_URI.replace('/callback', '/login')}`);
                }
            });

        });
    });
});
