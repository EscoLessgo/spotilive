import React from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaSpotify, FaShareAlt } from 'react-icons/fa';

const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
};

export default function Controls({ track, isPlaying, progress, error, onPlayPause, onNext, onPrev }) {
    if (error) return (
        <div style={styles.overlay}>
            <div style={{ ...styles.playerCard, borderColor: 'red', boxShadow: '0 0 30px red' }}>
                <h2 style={{ color: 'red', margin: 0 }}>⚠️ Error</h2>
                <p style={{ color: '#fff', marginTop: '10px' }}>{error}</p>
                {typeof error === 'string' && error.includes("Configuration") && <p style={{ fontSize: '0.8rem', color: '#aaa' }}>Check your Netlify Environment Variables.</p>}
            </div>
        </div>
    );
    if (!track) return (
        <div style={styles.overlay}>
            <div style={styles.playerCard}>
                <h2 style={{ color: '#fff', textShadow: '0 0 10px #fff', margin: 0 }}>
                    {isPlaying === false ? "Not Playing" : "Connecting..."}
                </h2>
                <p style={{ color: '#aaa', marginTop: '10px' }}>
                    {isPlaying === false ? "Play music on Spotify to see visualizer" : "Waiting for data..."}
                </p>
            </div>
        </div>
    );

    return (
        <div style={styles.overlay}>
            {/* Big Player Display */}
            <div style={styles.playerCard}>
                <img src={track.album.images[0]?.url} alt="Album Art" style={styles.albumArt} />

                <div style={styles.info}>
                    <h1 style={styles.title}>{track.name}</h1>
                    <h3 style={styles.artist}>{track.artists.map(a => a.name).join(', ')}</h3>
                    <div style={styles.progressContainer}>
                        <span style={styles.time}>{formatTime(progress)}</span>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: `${(progress / track.duration_ms) * 100}%` }} />
                        </div>
                        <span style={styles.time}>{formatTime(track.duration_ms)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.controlsRow}>
                    <button onClick={onPrev} style={styles.iconBtn}><FaStepBackward /></button>
                    <button onClick={onPlayPause} style={styles.playBtn}>
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={onNext} style={styles.iconBtn}><FaStepForward /></button>
                </div>

                {/* Discord/Social Actions */}
                <div style={styles.actionsRow}>
                    <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" style={styles.actionBtn}>
                        <FaSpotify style={{ marginRight: '8px' }} /> Listen Along
                    </a>
                    <button style={styles.actionBtn} onClick={() => alert("Jam link copied (simulation)")}>
                        <FaShareAlt style={{ marginRight: '8px' }} /> Invite to Jam
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks to pass through to visualizer if needed, but we intercept on card
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 10,
    },
    playerCard: {
        pointerEvents: 'auto',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
        padding: '40px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 0 50px rgba(138, 43, 226, 0.3)',
        textAlign: 'center',
        width: '400px',
        maxWidth: '90%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    albumArt: {
        width: '250px',
        height: '250px',
        borderRadius: '15px',
        marginBottom: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    },
    title: {
        margin: '0 0 5px 0',
        fontSize: '1.5rem',
        fontWeight: '700',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    },
    artist: {
        margin: '0 0 20px 0',
        fontSize: '1rem',
        color: '#ccc',
        fontWeight: '400',
    },
    progressContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        fontSize: '0.8rem',
        color: '#aaa',
    },
    progressBar: {
        flex: 1,
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        margin: '0 10px',
        position: 'relative',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: '#1db954',
        boxShadow: '0 0 10px #1db954',
    },
    controlsRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px',
    },
    iconBtn: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '1.5rem',
        cursor: 'pointer',
        transition: 'transform 0.1s',
    },
    playBtn: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'white',
        color: 'black',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
    },
    actionsRow: {
        display: 'flex',
        gap: '10px',
    },
    actionBtn: {
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '8px 16px',
        borderRadius: '20px',
        color: 'white',
        textDecoration: 'none',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s',
        fontWeight: '500',
    },
};
