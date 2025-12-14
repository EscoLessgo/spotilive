const axios = require('axios');

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { code, client_id, client_secret, redirect_uri } = JSON.parse(event.body);

    if (!code || !client_id || !client_secret) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing parameters" }) };
    }

    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const data = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
    });

    const authHeader = 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64');

    try {
        const response = await axios.post(tokenEndpoint, data.toString(), {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        console.error("Token Exchange Error:", error.response?.data || error.message);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({
                error: "Token exchange failed",
                details: error.response?.data || error.message
            })
        };
    }
}
