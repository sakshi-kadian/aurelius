"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef } from "react";
import { SceneGraph } from "./SceneGraph";

export default function CosmosCanvas() {
    return (
        <div className="absolute inset-0 w-full h-full bg-[#050505]">


            <Canvas dpr={[1, 2]} gl={{ antialias: false }} performance={{ min: 0.5 }}>
                <PerspectiveCamera makeDefault position={[0, 0, 40]} fov={60} />

                {/* Cinematic Controls (Damped for smooth flying) */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    rotateSpeed={0.5}
                    zoomSpeed={0.5}
                    dampingFactor={0.1}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />

                {/* Ambient Universe */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#4f4f4f" />

                {/* The Knowledge Graph (Suspended for async loading) */}
                <Suspense fallback={null}>
                    <SceneGraph />
                </Suspense>

                {/* Post-Processing (The "Sci-Fi" Glow) */}
                <EffectComposer enableNormalPass={false}>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
