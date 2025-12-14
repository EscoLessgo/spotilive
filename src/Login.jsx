import React, { useState, useEffect } from 'react';
import { FaSpotify } from 'react-icons/fa';

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URI = window.location.origin; // Automatically current localhost
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming", // For web playback SDK if we used it, but good to have
];

export default function Login() {
  const [clientId, setClientId] = useState('');
  // Default to current origin, stripping trailing slash if present for consistency
  const [redirectUri, setRedirectUri] = useState(window.location.origin.replace(/\/$/, ""));

  useEffect(() => {
    const stored = localStorage.getItem('spotify_client_id');
    if (stored) setClientId(stored);
  }, []);

  const handleLogin = () => {
    if (!clientId) return alert("Please enter a Client ID");
    localStorage.setItem('spotify_client_id', clientId);

    // Ensure accurate matching
    const scopeParam = SCOPES.join("%20");
    const authUrl = `${AUTH_ENDPOINT}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopeParam}&response_type=token&show_dialog=true`;

    window.location.href = authUrl;
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
        <FaSpotify size={50} color="#1db954" style={{ marginBottom: '1rem' }} />

        <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>1. Spotify Client ID</label>
          <input
            type="text"
            placeholder="Paste Client ID here"
            value={clientId}
            onChange={(e) => setClientId(e.target.value.trim())} // Auto-trim whitespace
            style={{
              width: '100%',
              padding: '10px',
              background: '#333',
              border: 'none',
              color: 'white',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />

          <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>2. Redirect URI (Must match Spotify Dashboard EXACTLY)</label>
          <input
            type="text"
            value={redirectUri}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              background: '#222',
              border: '1px solid #555',
              color: '#aaa',
              borderRadius: '4px',
              marginBottom: '1rem',
              cursor: 'copy'
            }}
            onClick={(e) => { e.target.select(); document.execCommand('copy'); alert('Copied URI! Paste this into Spotify Dashboard.'); }}
            title="Click to Copy"
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            padding: '10px 20px',
            background: '#1db954',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem',
            textTransform: 'uppercase',
            width: '100%'
          }}
        >
          CONNECT TO THE GRID
        </button>
      </div>
    </div>
  );
}
