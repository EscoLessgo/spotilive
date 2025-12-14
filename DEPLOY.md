# Neon Tunes - Spotify Visualizer

A Synthwave-themed 3D visualizer for your Spotify playback, built with React Three Fiber.

## 🚀 Deployment Instructions (HTTPS Support Included)

To get this online with **HTTPS** (Required for Spotify), follow these steps:

### Option 1: Netlify Drop (Easiest)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the `dist` folder located at:  
   `C:\Users\voee1\.gemini\antigravity\scratch\spotify-visualizer\dist`
3. Netlify will give you a link (e.g., `https://random-name.netlify.app`). This is **HTTPS**.

### Option 2: Vercel / GitHub
1. Push this folder to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Vercel will build and give you an **HTTPS** link.

## ⚠️ Important Post-Deployment Step
Once you have your live URL (e.g., `https://neon-tunes.netlify.app`):
1. Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Select your App.
3. Click "Edit Settings".
4. Add your **NEW URL** to the **Redirect URIs**.
   - Example: `https://neon-tunes.netlify.app`
5. Save.

Now it will work online forever!
