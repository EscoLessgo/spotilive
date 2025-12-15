import React, { useState, useEffect } from 'react';
import Controls from './Controls';
import Visualizer from './Visualizer';

// --- SETUP COMPONENT ---
function SetupMode() {
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState(localStorage.getItem('temp_cid') || '');
  const [clientSecret, setClientSecret] = useState(localStorage.getItem('temp_sec') || '');
  const [refreshToken, setRefreshToken] = useState('');

  // Auto-detect code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && clientId && clientSecret) {
      setStep(3); // Processing
      exchange(code);
    }
  }, []);

  const exchange = async (code) => {
    try {
      const redirectUri = window.location.origin; // Using root as redirect
      const res = await fetch('/.netlify/functions/exchange-token', {
        method: 'POST',
        body: JSON.stringify({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri })
      });
      const data = await res.json();
      if (data.refresh_token) {
        setRefreshToken(data.refresh_token);
        setStep(4); // Success
      } else {
        alert("Error getting token: " + JSON.stringify(data));
        setStep(1);
      }
    } catch (e) {
      console.error(e);
      alert("Network Error. Ensure your Netlify Functions are deployed and running.");
    }
  };

  const startAuth = () => {
    localStorage.setItem('temp_cid', clientId);
    localStorage.setItem('temp_sec', clientSecret);
    const redirectUri = window.location.origin;
    const scope = 'user-read-playback-state user-read-currently-playing';
    window.location.href = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  if (step === 4) return (
    <div style={{ ...styles.box, borderColor: '#0f0' }}>
      <h2>✅ SUCCCESS!</h2>
      <p>Here is your <b>SPOTIFY_REFRESH_TOKEN</b>:</p>
      <textarea readOnly value={refreshToken} style={styles.area} onClick={e => e.target.select()} />
      <p>Copy this into Netlify Environment Variables along with your ID and Secret.</p>
    </div>
  );

  if (step === 3) return <div style={styles.box}><h1>🔄 Exchanging Token...</h1></div>;

  return (
    <div style={styles.box}>
      <h1>⚙️ ADMIN SETUP</h1>
      <p>Since Localhost didn't work for you, we will use this HTTPS site generator.</p>

      <label>1. Add this exact URL to Spotify Redirect URIs:</label>
      <input readOnly value={window.location.origin} style={styles.inputReadOnly} />

      <label>2. Enter Client ID</label>
      <input value={clientId} onChange={e => setClientId(e.target.value)} style={styles.input} placeholder="Client ID" />

      <label>3. Enter Client Secret</label>
      <input value={clientSecret} onChange={e => setClientSecret(e.target.value)} style={styles.input} type="password" placeholder="Client Secret" />

      <button onClick={startAuth} style={styles.btn}>AUTHORIZE & GET TOKEN</button>
    </div>
  );
}

// --- MAIN APP ---
function App() {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [beat, setBeat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for Setup Mode
  const params = new URLSearchParams(window.location.search);
  if (params.get('setup') === 'true' || params.get('code')) {
    return <div style={{ width: '100vw', height: '100vh', background: '#111', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <SetupMode />
    </div>;
  }

  // Poll our own backend
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch('/.netlify/functions/get-now-playing');
        if (!res.ok) throw new Error("Backend Error");

        const data = await res.json();
        // If the backend says "No Refresh Token", we might want to prompt setup, but let's keep it clean

        if (data.error) {
          setError(data.error);
          setIsPlaying(false);
        } else if (data.is_playing) {
          setTrack(data.item);
          setIsPlaying(data.is_playing);
          setProgress(data.progress_ms);
          setError(null);
        } else {
          setIsPlaying(false);
          setError(null);
        }
      } catch (e) {
        console.error(e);
        setError("Backend Unreachable. If local, use 'netlify dev'.");
      } finally {
        setLoading(false);
      }
    };

    fetchNowPlaying(); // Initial
    const interval = setInterval(fetchNowPlaying, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPlaying) { setBeat(false); return; }
    const bpm = 120;
    const msPerBeat = (60 / bpm) * 1000;
    const beatInterval = setInterval(() => { setBeat(prev => !prev); }, msPerBeat / 2);
    return () => clearInterval(beatInterval);
  }, [isPlaying]);

  if (loading && !track) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', flexDirection: 'column' }}>
        <h1>CONNECTING TO NEON GRID...</h1>
        <p style={{ color: '#555', marginTop: '20px' }}>If this takes too long, add <code>?setup=true</code> to your URL to configure keys.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Visualizer playing={isPlaying} beat={beat} trackId={track?.id} />
      <Controls
        track={track}
        isPlaying={isPlaying}
        progress={progress}
        error={error}
        onPlayPause={() => { }}
        onNext={() => { }}
        onPrev={() => { }}
      />
    </div>
  );
}

const styles = {
  box: { background: '#222', padding: '40px', borderRadius: '10px', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #444' },
  input: { padding: '10px', background: '#333', border: '1px solid #555', color: 'white', borderRadius: '5px' },
  inputReadOnly: { padding: '10px', background: '#111', border: '1px solid #333', color: '#888', borderRadius: '5px', cursor: 'text' },
  btn: { padding: '15px', background: '#1db954', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  area: { height: '100px', background: '#111', color: '#0f0', border: 'none', padding: '10px', fontFamily: 'monospace' }
}

export default App;
