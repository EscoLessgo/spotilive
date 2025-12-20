export async function handler(event, context) {
    // 1. Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ""
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: "Method Not Allowed"
        };
    }

    // 2. Parse Body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        console.error("Failed to parse body:", event.body);
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: "Invalid JSON body" })
        };
    }

    const { code, client_id, client_secret, redirect_uri } = body;

    if (!code || !client_id || !client_secret) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ error: "Missing parameters: code, ID, or Secret" })
        };
    }

    // 3. Exchange Code for Token
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
    });

    const authHeader = 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Spotify Token Error:", data);
            return {
                statusCode: response.status,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Spotify Token Exchange Failed",
                    details: data
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Token Exchange Exception:", error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "Internal Server Error during exchange",
                details: error.message
            })
        };
    }
}
