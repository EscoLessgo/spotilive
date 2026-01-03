import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { handler as exchangeTokenHandler } from './netlify/functions/exchange-token.js';
import { handler as getNowPlayingHandler } from './netlify/functions/get-now-playing.js';
import { handler as trackViewHandler } from './netlify/functions/track-view.js';
import { handler as getAnalyticsHandler } from './netlify/functions/get-analytics.js';

dotenv.config();

const app = express();
const PORT = 8888;

// Middleware to parse JSON bodies (Netlify functions receive event.body as string)
app.use(express.json());
app.use(express.text());

// Helper to adapt Express req/res to Netlify event/context
const netlifyAdapter = (handler) => async (req, res) => {
  const event = {
    httpMethod: req.method,
    // Netlify body is a string. existing parsers might have made it an object.
    body: typeof req.body === 'object' ? JSON.stringify(req.body) : req.body,
    headers: req.headers,
    queryStringParameters: req.query
  };

  const context = {};

  try {
    const result = await handler(event, context);

    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.setHeader(key, result.headers[key]);
      });
    }

    res.status(result.statusCode || 200).send(result.body);
  } catch (error) {
    console.error("Adapter Error:", error);
    res.status(500).json({ error: "Internal Adapter Error" });
  }
};

// Mount the functions at the expected paths
// We use .all to handle POST, GET, OPTIONS, etc.
app.all('/.netlify/functions/exchange-token', netlifyAdapter(exchangeTokenHandler));
app.all('/.netlify/functions/get-now-playing', netlifyAdapter(getNowPlayingHandler));
app.all('/.netlify/functions/track-view', netlifyAdapter(trackViewHandler));
app.all('/.netlify/functions/get-analytics', netlifyAdapter(getAnalyticsHandler));

// Serve Static Assets (Production)
app.use(express.static('dist'));

// Handle SPA Routing
app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/.netlify/')) return res.status(404).send('Not Found');
  res.sendFile(path.resolve('dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
