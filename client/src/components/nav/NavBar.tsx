"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useGraphStore } from "@/store/useGraphStore";
import { Network, Cpu } from "lucide-react";

export default function NavBar() {
    const { backendStatus, checkBackendHealth, nodeCount, edgeCount } = useGraphStore();

    // Poll backend health every 30 seconds
    useEffect(() => {
        checkBackendHealth();
        const interval = setInterval(checkBackendHealth, 30_000);
        return () => clearInterval(interval);
    }, [checkBackendHealth]);

    const statusColor = {
        online: "#10b981",   // emerald
        offline: "#ef4444",  // red
        checking: "#f59e0b", // amber
    }[backendStatus];

    const statusLabel = {
        online: "Engine Online",
        offline: "Engine Offline",
        checking: "Connecting...",
    }[backendStatus];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5">
            {/* Left: Brand */}
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/30 transition-shadow">
                    <Network size={14} className="text-black" />
                </div>
                <span className="font-space font-bold text-white text-sm tracking-[0.15em] uppercase group-hover:text-amber-300 transition-colors">
                    Aurelius
                </span>
            </Link>

            {/* Center: Graph Stats (only when data is loaded) */}
            {nodeCount > 0 && (
                <div className="hidden md:flex items-center gap-6 text-[10px] font-mono text-white/40 tracking-widest uppercase">
                    <span>Nodes: <span className="text-white/70">{nodeCount}</span></span>
                    <span className="text-white/20">|</span>
                    <span>Edges: <span className="text-white/70">{edgeCount}</span></span>
                </div>
            )}

            {/* Right: Nav links + Status */}
            <div className="flex items-center gap-6">
                <Link
                    href="/engine"
                    className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-slate-400 hover:text-white transition-colors group"
                >
                    <Cpu size={14} className="group-hover:text-amber-400 transition-colors" />
                    Engine
                </Link>

                {/* Live status indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span
                        className="relative flex h-2 w-2"
                    >
                        {backendStatus === "online" && (
                            <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                style={{ backgroundColor: statusColor }}
                            />
                        )}
                        <span
                            className="relative inline-flex rounded-full h-2 w-2"
                            style={{ backgroundColor: statusColor }}
                        />
                    </span>
                    <span className="text-[10px] font-mono text-white/60 tracking-wider">
                        {statusLabel}
                    </span>
                </div>
            </div>
        </nav>
    );
}
