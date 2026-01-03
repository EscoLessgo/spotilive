import React, { useEffect, useState } from 'react';

export default function AdminPanel() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/.netlify/functions/get-analytics')
            .then(async res => {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    if (!res.ok) throw new Error(data.error || text);
                    if (data.error) throw new Error(data.error);
                    setLogs(data);
                } catch (jsonError) {
                    console.error("JSON Parse Error:", jsonError);
                    // If JSON fails, it's likely a 500 HTML page or raw text error
                    const preview = text.substring(0, 200);
                    throw new Error(`Server Error (${res.status}): ${preview}`);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={styles.container}>Loading Analytics...</div>;
    if (error) return <div style={styles.container}>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Analytics & Traffic Log</h1>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Time</th>
                            <th style={styles.th}>IP</th>
                            <th style={styles.th}>Device / Network</th>
                            <th style={styles.th}>Hostname</th>
                            <th style={styles.th}>Location</th>
                            <th style={styles.th}>ISP / Org</th>
                            <th style={styles.th}>Path</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={styles.tr}>
                                <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={styles.td}>{log.ip}</td>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: 'bold' }}>{log.device}</div>
                                    <div style={{ fontSize: '0.8em', color: '#888' }}>{log.userAgent?.substring(0, 50)}...</div>
                                </td>
                                <td style={styles.td}>{log.hostname || '-'}</td>
                                <td style={styles.td}>
                                    {log.city}, {log.regionName} {log.countryCode} <br />
                                    <span style={{ color: '#666', fontSize: '0.8em' }}>({log.lat}, {log.lon})</span>
                                </td>
                                <td style={styles.td}>
                                    <div>{log.isp}</div>
                                    <div style={{ color: '#666', fontSize: '0.8em' }}>{log.asName}</div>
                                </td>
                                <td style={styles.td}>{log.path}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        background: '#111',
        color: '#eee',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif'
    },
    header: {
        marginBottom: '20px',
        borderBottom: '1px solid #333',
        paddingBottom: '10px'
    },
    tableWrapper: {
        overflowX: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        background: '#1a1a1a',
        fontSize: '14px'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        background: '#252525',
        borderBottom: '2px solid #333',
        color: '#aaa',
        textTransform: 'uppercase',
        fontSize: '12px'
    },
    tr: {
        borderBottom: '1px solid #333',
    },
    td: {
        padding: '12px',
        verticalAlign: 'top'
    }
};
