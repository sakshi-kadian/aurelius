"use client";

import { useState } from "react";
import CosmosCanvas from "@/components/cosmos/CosmosCanvas";
import ReasoningConsole from "@/components/console/ReasoningConsole";
import UploadPanel from "@/components/upload/UploadPanel";
import NavBar from "@/components/nav/NavBar";
import { useGraphStore } from "@/store/useGraphStore";
import { Upload, BarChart2 } from "lucide-react";

export default function EnginePage() {
    const [showUpload, setShowUpload] = useState(false);
    const { nodeCount, edgeCount, lastQueryMs, pathNodes, pathConfidence } = useGraphStore();

    return (
        <main className="fixed inset-0 w-full h-full bg-black text-white overflow-hidden">

            {/* ── Nav Bar (Step 20) ── */}
            <NavBar />

            {/* ── 3D Cosmos Background ── */}
            <CosmosCanvas />

            {/* ── Reasoning Console (left panel) ── */}
            <div className="absolute inset-0 pt-16 pointer-events-none">
                <div className="pointer-events-auto">
                    <ReasoningConsole />
                </div>
            </div>

            {/* ── Upload Panel (right panel, toggleable) ── */}
            {showUpload && (
                <div className="absolute inset-0 pt-16 pointer-events-none">
                    <div className="pointer-events-auto">
                        <UploadPanel onClose={() => setShowUpload(false)} />
                    </div>
                </div>
            )}

            {/* ── Upload Toggle Button (Step 17) ── */}
            {!showUpload && (
                <button
                    onClick={() => setShowUpload(true)}
                    className="absolute right-10 top-[80px] z-30 flex items-center gap-2 px-4 py-2.5 bg-black/80 backdrop-blur-xl border border-purple-500/40 rounded-xl text-[11px] font-bold text-purple-300 hover:border-purple-400 hover:text-purple-200 transition-all group shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                >
                    <Upload size={13} className="group-hover:scale-110 transition-transform" />
                    INJECT KNOWLEDGE
                </button>
            )}

            {/* ── STEP 21: Graph Complexity Metrics HUD ── */}
            <div className="absolute bottom-8 right-10 z-30 space-y-1 text-right pointer-events-none">
                <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-white/30 tracking-widest">
                    <BarChart2 size={10} className="text-white/20" />
                    <span className="uppercase">Graph Metrics</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-mono">
                        <span className="text-white/30">NODES</span>
                        <span className="text-white/80 text-right">{nodeCount || "—"}</span>
                        <span className="text-white/30">EDGES</span>
                        <span className="text-white/80 text-right">{edgeCount || "—"}</span>
                        <span className="text-white/30">PATH LEN</span>
                        <span className="text-white/80 text-right">{pathNodes.length > 0 ? pathNodes.length : "—"}</span>
                        <span className="text-white/30">CONFIDENCE</span>
                        <span
                            className="text-right font-bold"
                            style={{ color: pathConfidence >= 0.7 ? "#10b981" : pathConfidence > 0 ? "#f59e0b" : "#ffffff40" }}
                        >
                            {pathConfidence > 0 ? `${Math.round(pathConfidence * 100)}%` : "—"}
                        </span>
                        {lastQueryMs > 0 && <>
                            <span className="text-white/30">LATENCY</span>
                            <span className="text-white/80 text-right">{lastQueryMs}ms</span>
                        </>}
                    </div>
                </div>
            </div>

        </main>
    );
}
