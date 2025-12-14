import React, { useState, useEffect, useRef } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import Login from './Login';
import Controls from './Controls';
import Visualizer from './Visualizer';

const spotifyApi = new SpotifyWebApi();

function App() {
  const [token, setToken] = useState(null);
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [beat, setBeat] = useState(false); // For visualizer pulse

  // 1. Auth Handling
  useEffect(() => {
    const hash = window.location.hash;
    let _token = window.localStorage.getItem("spotify_token");

    if (!_token && hash) {
      const tokenParam = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"));
      if (tokenParam) {
        _token = tokenParam.split("=")[1];
        window.location.hash = "";
        window.localStorage.setItem("spotify_token", _token);
      }
    }

    if (_token) {
      setToken(_token);
      spotifyApi.setAccessToken(_token);
    }
  }, []);

  // 2. Polling for State
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      spotifyApi.getMyCurrentPlaybackState()
        .then((response) => {
          if (response && response.item) {
            setTrack(response.item);
            setIsPlaying(response.is_playing);
            setProgress(response.progress_ms);
          } else {
            // Not playing or private session
            setIsPlaying(false);
          }
        })
        .catch(err => {
          if (err.status === 401) {
            // Token expired
            setToken(null);
            window.localStorage.removeItem("spotify_token");
          }
          console.error(err);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  // 3. Beat Simulation (Visualizer Driver)
  // Since we can't get real-time audio data easily without playing in-browser,
  // we simulate a beat based on presence of playback.
  useEffect(() => {
    if (!isPlaying) {
      setBeat(false);
      return;
    }

    const bpm = 120; // Default assumption
    const msPerBeat = (60 / bpm) * 1000;

    const beatInterval = setInterval(() => {
      setBeat(prev => !prev);
    }, msPerBeat / 2); // Toggle on/off for pulse effect

    return () => clearInterval(beatInterval);
  }, [isPlaying]);


  // 4. Control Handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      spotifyApi.pause();
      setIsPlaying(false); // Optimistic update
    } else {
      spotifyApi.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    spotifyApi.skipToNext();
    // Optimistic: wait for poll to update track
  };

  const handlePrev = () => {
    spotifyApi.skipToPrevious();
  };

  if (!token) return <Login />;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* 3D Background */}
      <Visualizer playing={isPlaying} beat={beat} trackId={track?.id} />

      {/* UI Overlay */}
      <Controls
        track={track}
        isPlaying={isPlaying}
        progress={progress}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      {/* Logout / Reset (Hidden or small) */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
        <button
          onClick={() => {
            setToken(null);
            window.localStorage.removeItem("spotify_token");
          }}
          style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
