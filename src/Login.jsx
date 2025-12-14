import React from 'react';
import { FaSpotify } from 'react-icons/fa';

// --- CONFIGURATION ---
// It is safe to expose Client ID in a frontend app (Implicit Grant Flow)
// But NEVER expose your Client Secret.
const CLIENT_ID = "34266d4cdffa43c196216e2497d7bd8f";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
];

export default function Login() {

  const handleLogin = () => {
    // Automatically use the current website address as the Redirect URI
    // This allows it to work on Localhost AND your Deployment without code changes.
    const redirectUri = window.location.origin; // e.g., https://your-site.com or http://localhost:5173

    // Redirect to Spotify
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${SCOPES.join("%20")}&response_type=token&show_dialog=true`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(to bottom, #1db954 0%, #000 100%)',
      color: 'white',
      fontFamily: "'Courier New', Courier, monospace"
    }}>
      <h1 style={{ fontSize: '3rem', textShadow: '2px 2px #ff00de' }}>NEON TUNES</h1>
      <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2rem', borderRadius: '1rem', border: '1px solid #1db954', textAlign: 'center' }}>
        <FaSpotify size={60} color="#1db954" style={{ marginBottom: '1.5rem' }} />

        <p style={{ marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.6' }}>
          Ready to sync? <br />
          Click below to authorize Spotify.
        </p>

        <button
          onClick={handleLogin}
          style={{
            padding: '15px 40px',
            background: '#1db954',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 0 20px rgba(29, 185, 84, 0.5)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 0 30px rgba(29, 185, 84, 0.8)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 0 20px rgba(29, 185, 84, 0.5)";
          }}
        >
          CONNECT
        </button>

        <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.8rem' }}>
          Powered by Spotify API
        </p>
      </div>
    </div>
  );
}
