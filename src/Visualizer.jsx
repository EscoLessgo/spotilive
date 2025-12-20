import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

// --- Constants ---
const PALETTES = [
    { sun: "#ff0080", gridMain: "#ff00de", gridSec: "#220044", fog: "#2b005e" }, // Vaporwave
    { sun: "#ffae00", gridMain: "#ff0000", gridSec: "#440000", fog: "#330000" }, // Outrun
    { sun: "#00ffff", gridMain: "#00ffcc", gridSec: "#003344", fog: "#001e36" }, // Cyberpunk
    { sun: "#ffffff", gridMain: "#aaaaaa", gridSec: "#222222", fog: "#000000" }, // Noir
];

function getPalette(trackId) {
    if (!trackId) return PALETTES[0];
    const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PALETTES[hash % PALETTES.length];
}

// --- Components ---

function Sun({ color }) {
    return (
        <mesh position={[0, 10, -50]}>
            <circleGeometry args={[15, 64]} />
            <meshBasicMaterial color={color} />
        </mesh>
    );
}

function Grid({ playing, palette }) {
    const gridRef = useRef();

    useFrame((state, delta) => {
        if (gridRef.current) {
            gridRef.current.position.z += (playing ? 10 : 2) * delta;
            if (gridRef.current.position.z > 20) {
                gridRef.current.position.z = 0;
            }
        }
    });

    return (
        <group ref={gridRef}>
            <gridHelper args={[200, 50, palette.gridMain, palette.gridSec]} position={[0, -5, 0]} />
            <gridHelper args={[200, 50, palette.gridMain, palette.gridSec]} position={[0, -5, -40]} />
        </group>
    );
}

function Terrain({ palette }) {
    const mesh = useRef();
    const noise2D = createNoise2D();

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(200, 100, 60, 30);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const valley = Math.abs(x) < 20 ? 0 : 1;
            const z = (Math.abs(x) > 10) ? Math.abs(noise2D(x * 0.05, y * 0.05)) * 20 * valley : 0;
            pos.setZ(i, z);
        }
        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh ref={mesh} geometry={geometry} position={[0, -6, -50]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
                color={palette.fog}
                wireframe={true}
                emissive={palette.gridMain}
                emissiveIntensity={0.5}
            />
        </mesh>
    );
}

function InteractiveLights({ beat, color }) {
    const light = useRef();
    useFrame(() => {
        if (light.current) {
            light.current.intensity = 1 + (beat ? 2 : 0);
        }
    })
    return <pointLight ref={light} position={[0, 20, -10]} color={color} intensity={1} distance={100} />;
}

export default function Visualizer({ playing, beat, trackId }) {
    const palette = useMemo(() => getPalette(trackId), [trackId]);

    return (
        <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={75} />

            {/* Environment */}
            <color attach="background" args={['#050510']} />
            <fog attach="fog" args={['#050510', 20, 100]} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={playing ? 1 : 0.2} />

            {/* Objects */}
            <Sun color={palette.sun} />
            <Grid playing={playing} palette={palette} />
            <Terrain palette={palette} />

            {/* Lighting */}
            <ambientLight intensity={0.2} />
            <InteractiveLights beat={beat} color={palette.gridMain} />
        </Canvas>
    );
}
