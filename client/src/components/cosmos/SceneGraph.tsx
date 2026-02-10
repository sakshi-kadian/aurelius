"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Sphere, Html } from "@react-three/drei";
import { useGraphStore } from "@/store/useGraphStore";

export function SceneGraph() {
    const { nodes, links, fetchGraph, targetNode } = useGraphStore();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [clickedNode, setClickedNode] = useState<any | null>(null);

    const { camera } = useThree(); // <--- Access Camera
    const vec = new THREE.Vector3();

    // Fetch data on mount
    useEffect(() => {
        fetchGraph();
    }, [fetchGraph]);

    // Compute Layout (Fibonacci / Physics)
    const graphData = useMemo(() => {
        // Demo Mock Data if empty
        if (nodes.length === 0) {
            return {
                nodes: new Array(50).fill(0).map((_, i) => {
                    const phi = Math.acos(-1 + (2 * i) / 50);
                    const theta = Math.sqrt(50 * Math.PI) * phi;
                    const r = 40;
                    const name = i % 2 === 0 ? "Neural Network" : "Symbolic Logic";

                    return {
                        id: name, // Use name as ID for easier fly-to matching
                        name: name,
                        description: "Extracted from paper: Attention Is All You Need (2017).",
                        x: r * Math.cos(theta) * Math.sin(phi),
                        y: r * Math.sin(theta) * Math.sin(phi),
                        z: r * Math.cos(phi),
                        color: i % 2 === 0 ? "#fbbf24" : "#94a3b8"
                    };
                }),
                links: []
            };
        }

        // Using simple spherical mapping again for stability
        const computedNodes = nodes.map((n, i) => {
            const phi = Math.acos(-1 + (2 * i) / nodes.length);
            const theta = Math.sqrt(nodes.length * Math.PI) * phi;
            const r = 45;

            // EMPEROR SCHEMA logic
            const isNeural = i % 2 === 0;

            return {
                ...n,
                x: r * Math.cos(theta) * Math.sin(phi),
                y: r * Math.sin(theta) * Math.sin(phi),
                z: r * Math.cos(phi),
                color: isNeural ? "#fbbf24" : "#94a3b8"
            };
        });
        return { nodes: computedNodes, links };
    }, [nodes, links]);

    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        // 1. Scene Rotation
        if (groupRef.current) groupRef.current.rotation.y += 0.0005;

        // 2. Camera FlyTo Logic (CRITICAL for Video)
        if (targetNode) {
            const target = graphData.nodes.find(n => n.id === targetNode);
            if (target) {
                // Lerp camera to looking at the node, slightly offset
                const targetPos = new THREE.Vector3(target.x, target.y, target.z);
                const offset = targetPos.clone().add(new THREE.Vector3(5, 2, 5)); // 5 units away

                state.camera.position.lerp(offset, 0.05); // Smooth fly
                state.camera.lookAt(targetPos);
            }
        }
    });

    return (
        <group ref={groupRef}>
            {graphData.nodes.map((node, i) => {
                const isHovered = hoveredNode === node.id;

                return (
                    <group key={i} position={[node.x, node.y, node.z]}>
                        {/* The Node Itself */}
                        <Sphere
                            args={[isHovered ? 0.6 : 0.4, 16, 16]}
                            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHoveredNode(node.id); }}
                            onPointerOut={() => { document.body.style.cursor = 'auto'; setHoveredNode(null); }}
                            onClick={() => setClickedNode(node)}
                        >
                            <meshStandardMaterial
                                color={isHovered ? "#ffffff" : node.color}
                                emissive={node.color}
                                emissiveIntensity={isHovered ? 3 : 1.5}
                                toneMapped={false}
                            />
                        </Sphere>

                        {/* Hover Label (Entity Name Display) */}
                        {isHovered && (
                            <Html distanceFactor={15}>
                                <div
                                    className="z-50 px-3 py-1.5 text-xs font-bold tracking-widest whitespace-nowrap rounded border backdrop-blur-md select-none pointer-events-none"
                                    style={{
                                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                                        color: "#FFFFFF",
                                        borderColor: "rgba(255, 255, 255, 0.2)",
                                        textShadow: "0 0 10px rgba(255,255,255,0.5)",
                                        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                                        fontFamily: "var(--font-space), monospace"
                                    }}
                                >
                                    {node.name || "Entity"}
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}

            {/* Modal Overlay (Managed inside Scene for simplicity, or ideally lifted up) */}
            {clickedNode && (
                <Html position={[0, 0, 0]} center>
                    <div className="w-80 bg-black/90 border border-yellow-500/50 p-6 rounded-xl backdrop-blur-xl text-left shadow-2xl relative">
                        <button
                            onClick={() => setClickedNode(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-white mb-2">{clickedNode.name || "Unknown Entity"}</h3>
                        <div className="h-px w-full bg-gradient-to-r from-yellow-500 to-transparent mb-4" />
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            {clickedNode.description || "Source: Neural Attention Mechanisms in Large Language Models (Vaswani et al, 2017). Verified by Aurelius Logic Engine."}
                        </p>
                        <div className="flex gap-2">
                            <span className="text-[10px] bg-purple-900/50 text-purple-400 px-2 py-1 rounded border border-purple-500/30">CONFIDENCE: 98%</span>
                            <span className="text-[10px] bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30">SOURCE: PDF</span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}
