"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Sphere, Html } from "@react-three/drei";
import { useGraphStore } from "@/store/useGraphStore";

export function SceneGraph() {
    const { nodes, links, fetchGraph, targetNode, pathNodes, isLoading } = useGraphStore();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [clickedNode, setClickedNode] = useState<any | null>(null);

    // Fetch graph data on mount
    useEffect(() => {
        fetchGraph();
    }, [fetchGraph]);

    // ─────────────────────────────────────────────
    // STEP 15: d3-force-3d Layout Engine
    // Replaces static Fibonacci sphere with physics simulation.
    // Connected nodes cluster together = semantically meaningful layout.
    // ─────────────────────────────────────────────
    const graphData = useMemo(() => {
        if (nodes.length === 0) {
            // Demo fallback: Fibonacci sphere with varied node types
            const demoNames = ["Neural Network", "Attention", "Transformer", "Symbolic Logic",
                "Knowledge Graph", "Reasoning", "Embedding", "Triplet", "Entity"];
            return {
                nodes: new Array(60).fill(0).map((_, i) => {
                    const phi = Math.acos(-1 + (2 * i) / 60);
                    const theta = Math.sqrt(60 * Math.PI) * phi;
                    const r = 38;
                    const name = demoNames[i % demoNames.length];
                    return {
                        id: `demo_${i}`,
                        name,
                        x: r * Math.cos(theta) * Math.sin(phi),
                        y: r * Math.sin(theta) * Math.sin(phi),
                        z: r * Math.cos(phi),
                        color: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#818cf8" : "#6ee7b7",
                    };
                }),
                links: [],
            };
        }

        // Real data: apply d3-force-3d physics layout
        try {
            const { forceSimulation, forceLink, forceManyBody, forceCenter } = require("d3-force-3d");

            // Clone to avoid mutating Zustand state
            const simNodes: any[] = nodes.map(n => ({ ...n }));
            const nodeIdSet = new Set(simNodes.map(n => n.id));
            const simLinks: any[] = links
                .filter(l => nodeIdSet.has(l.source) && nodeIdSet.has(l.target))
                .map(l => ({ ...l }));

            const simulation = forceSimulation(simNodes)
                .numDimensions(3)
                .force("link", forceLink(simLinks).id((d: any) => d.id).distance(10).strength(0.6))
                .force("charge", forceManyBody().strength(-70))
                .force("center", forceCenter(0, 0, 0));

            // Converge synchronously (no live ticking to keep the graph stable)
            simulation.tick(400);
            simulation.stop();

            // Normalize positions to fit within ±40 units
            const allCoords = simNodes.flatMap((n: any) => [Math.abs(n.x || 0), Math.abs(n.y || 0), Math.abs(n.z || 0)]);
            const maxExtent = Math.max(...allCoords, 1);
            const scale = 38 / maxExtent;

            return {
                nodes: simNodes.map((n: any, i: number) => ({
                    ...n,
                    x: (n.x || 0) * scale,
                    y: (n.y || 0) * scale,
                    z: (n.z || 0) * scale,
                    color: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#818cf8" : "#6ee7b7",
                })),
                links: simLinks,
            };
        } catch (err) {
            console.warn("d3-force-3d failed, using spherical fallback:", err);
            // Spherical fallback
            return {
                nodes: nodes.map((n, i) => {
                    const phi = Math.acos(-1 + (2 * i) / nodes.length);
                    const theta = Math.sqrt(nodes.length * Math.PI) * phi;
                    const r = 38;
                    return {
                        ...n,
                        x: r * Math.cos(theta) * Math.sin(phi),
                        y: r * Math.sin(theta) * Math.sin(phi),
                        z: r * Math.cos(phi),
                        color: i % 2 === 0 ? "#fbbf24" : "#818cf8",
                    };
                }),
                links,
            };
        }
    }, [nodes, links]);

    // ─────────────────────────────────────────────
    // STEP 14: Edge Geometry with Golden Beam
    // Build TWO sets of LineSegments:
    // 1. Normal edges (white, 12% opacity)
    // 2. Path edges (gold, pulsing — the Golden Beam)
    // ─────────────────────────────────────────────
    const nodePositionMap = useMemo(() => {
        const map: Record<string, THREE.Vector3> = {};
        graphData.nodes.forEach((n: any) => {
            map[n.id] = new THREE.Vector3(n.x || 0, n.y || 0, n.z || 0);
        });
        return map;
    }, [graphData.nodes]);

    const pathNodeSet = useMemo(() => new Set(pathNodes), [pathNodes]);

    const { normalEdgeGeo, pathEdgeGeo } = useMemo(() => {
        const normalPos: number[] = [];
        const pathPos: number[] = [];

        graphData.links.forEach((link: any) => {
            const sourceId = typeof link.source === "object" ? link.source.id : link.source;
            const targetId = typeof link.target === "object" ? link.target.id : link.target;
            const src = nodePositionMap[sourceId];
            const tgt = nodePositionMap[targetId];
            if (!src || !tgt) return;

            const onPath = pathNodeSet.has(sourceId) && pathNodeSet.has(targetId);
            const posArray = onPath ? pathPos : normalPos;
            posArray.push(src.x, src.y, src.z, tgt.x, tgt.y, tgt.z);
        });

        const makeGeo = (positions: number[]) => {
            const geo = new THREE.BufferGeometry();
            if (positions.length > 0) {
                geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            }
            return geo;
        };

        return { normalEdgeGeo: makeGeo(normalPos), pathEdgeGeo: makeGeo(pathPos) };
    }, [graphData.links, nodePositionMap, pathNodeSet]);

    // Refs for animation
    const groupRef = useRef<THREE.Group>(null);
    const pathBeamRef = useRef<THREE.LineSegments>(null);

    useFrame((state) => {
        // Slow scene rotation
        if (groupRef.current) groupRef.current.rotation.y += 0.0003;

        // Camera lerp fly-to the target node
        if (targetNode) {
            const target = graphData.nodes.find((n: any) =>
                n.id === targetNode || n.name === targetNode
            );
            if (target) {
                const targetPos = new THREE.Vector3(target.x, target.y, target.z);
                const camOffset = targetPos.clone().add(new THREE.Vector3(6, 3, 10));
                state.camera.position.lerp(camOffset, 0.04);
                state.camera.lookAt(targetPos);
            }
        }

        // STEP 16: Golden Beam pulsing animation
        if (pathBeamRef.current && pathNodes.length > 0) {
            const mat = pathBeamRef.current.material as THREE.LineBasicMaterial;
            mat.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 5) * 0.45;
        }
    });

    return (
        <group ref={groupRef}>

            {/* ── STEP 14: Normal Graph Edges ── */}
            {normalEdgeGeo.attributes.position && (
                <lineSegments geometry={normalEdgeGeo}>
                    <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
                </lineSegments>
            )}

            {/* ── STEP 16: Golden Beam Path Edges ── */}
            {pathEdgeGeo.attributes.position && (
                <lineSegments ref={pathBeamRef} geometry={pathEdgeGeo}>
                    <lineBasicMaterial color="#fbbf24" transparent opacity={0.9} />
                </lineSegments>
            )}

            {/* ── Nodes ── */}
            {graphData.nodes.map((node: any, i: number) => {
                const nodeId = node.id || String(i);
                const isHovered = hoveredNode === nodeId;
                const onPath = pathNodeSet.has(nodeId) || pathNodeSet.has(node.name);
                const nodeColor = onPath ? "#fbbf24" : node.color;
                const nodeSize = isHovered ? 0.75 : onPath ? 0.6 : 0.38;

                return (
                    <group key={nodeId} position={[node.x || 0, node.y || 0, node.z || 0]}>
                        <Sphere
                            args={[nodeSize, 16, 16]}
                            onPointerOver={() => {
                                document.body.style.cursor = "pointer";
                                setHoveredNode(nodeId);
                            }}
                            onPointerOut={() => {
                                document.body.style.cursor = "auto";
                                setHoveredNode(null);
                            }}
                            onClick={() => setClickedNode(node)}
                        >
                            <meshStandardMaterial
                                color={isHovered ? "#ffffff" : nodeColor}
                                emissive={nodeColor}
                                emissiveIntensity={isHovered ? 4 : onPath ? 3.5 : 1.5}
                                toneMapped={false}
                            />
                        </Sphere>

                        {/* Hover tooltip */}
                        {isHovered && (
                            <Html distanceFactor={15}>
                                <div style={{
                                    backgroundColor: "rgba(0,0,0,0.9)",
                                    color: "#fff",
                                    border: `1px solid ${onPath ? "#fbbf24" : "rgba(255,255,255,0.2)"}`,
                                    borderRadius: "6px",
                                    padding: "4px 12px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    letterSpacing: "0.1em",
                                    whiteSpace: "nowrap",
                                    pointerEvents: "none",
                                    fontFamily: "monospace",
                                    boxShadow: onPath ? "0 0 20px rgba(251,191,36,0.4)" : "none",
                                }}>
                                    {node.name || node.id || "Entity"}
                                    {onPath && <span style={{ color: "#fbbf24", marginLeft: 6 }}>◆</span>}
                                </div>
                            </Html>
                        )}
                    </group>
                );
            })}

            {/* ── Click Modal ── */}
            {clickedNode && (
                <Html position={[0, 0, 0]} center>
                    <div className="w-80 bg-black/90 border border-yellow-500/50 p-6 rounded-xl backdrop-blur-xl text-left shadow-2xl relative">
                        <button
                            onClick={() => setClickedNode(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-white text-lg"
                        >✕</button>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {clickedNode.name || "Unknown Entity"}
                        </h3>
                        <div className="h-px w-full bg-gradient-to-r from-yellow-500 to-transparent mb-4" />
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            {clickedNode.description || "Extracted and verified by the Aurelius Logic Engine from source documents."}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-[10px] bg-purple-900/50 text-purple-400 px-2 py-1 rounded border border-purple-500/30">
                                {pathNodeSet.has(clickedNode.id) ? "⚡ ON REASONING PATH" : "KNOWLEDGE NODE"}
                            </span>
                            <span className="text-[10px] bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30">
                                SOURCE: KG
                            </span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}
