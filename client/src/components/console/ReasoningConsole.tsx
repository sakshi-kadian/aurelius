"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Cpu, Search } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";

export default function ReasoningConsole() {
    const [messages, setMessages] = useState<string[]>([
        "[SYSTEM] Aurelius v1.0 Initialized.",
        "[SYSTEM] Connected to Neural-Symbolic Engine.",
    ]);
    const [input, setInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const { focusNode } = useGraphStore();

    const handleSend = async (queryOverride?: string) => {
        const queryToProcess = queryOverride || input;
        if (!queryToProcess) return;

        setMessages((prev) => [...prev, `[USER] ${queryToProcess}`, "[AURELIUS] Initializing Reasoning Path..."]);
        setInput("");
        setIsFocused(false);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const response = await fetch(`${API_URL}/api/v1/reason`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryToProcess })
            });

            if (!response.ok) throw new Error(`Engine HTTP Error: ${response.status}`);

            const data = await response.json();

            // 1. Chain of Thought Feed
            if (data.steps) {
                data.steps.forEach((step: string, index: number) => {
                    setTimeout(() => {
                        setMessages(prev => [...prev, `[LOG] ${step}`]);
                    }, index * 400); // Staggered feed for "thinking" effect
                });
            }

            // 2. Final Synthesis
            const totalDelay = (data.steps?.length || 0) * 400 + 500;
            setTimeout(() => {
                setMessages(prev => [...prev, `[AURELIUS] ${data.answer}`]);

                // 3. Visual Sync (3D Cosmos)
                if (data.path && data.path.nodes && data.path.nodes.length > 0) {
                    focusNode(data.path.nodes[0]);
                }
            }, totalDelay);

        } catch (e) {
            console.error("Reasoning Error:", e);
            setMessages(prev => [...prev, `[ERROR] Connection Failure. Is the backend running on port 8000?`]);
        }
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="absolute left-10 top-10 bottom-10 w-[380px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-[20px] flex flex-col overflow-hidden shadow-2xl z-20">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase font-mono">Aurelius</span>
                </div>
            </div>

            {/* Command Interface */}
            <div className="px-6 py-4">
                <div className="flex items-center group/input border-b border-white/20 pb-2">
                    <span className="text-emerald-500 text-sm font-mono font-bold mr-3">{'>'}</span>
                    <input
                        type="text"
                        value={input}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Initialize Reasoning Sequence..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white placeholder-white/30 focus:ring-0 selection:bg-emerald-500/30 selection:text-white"
                        style={{ color: 'white', colorScheme: 'dark' }}
                        autoComplete="off"
                        autoFocus
                    />
                    <button
                        onClick={() => handleSend()}
                        className={`transition-all duration-300 ml-2 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md w-8 h-8 cursor-pointer ${input.length > 0 ? "opacity-100" : "opacity-50"}`}
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* Controls: Logic Protocols */}
            <div className="px-6 py-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {[
                        { label: "Pathfinding", query: "Trace reasoning path for: Attention Mechanisms" },
                        { label: "Truth Check", query: "Verify truth for: LLM Hallucinations" },
                        { label: "Deep Audit", query: "Semantic cluster analysis on reasoning steps" }
                    ].map((btn, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(btn.query)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-cyan-300 font-bold hover:bg-white/10 hover:border-cyan-500/50 transition-all uppercase tracking-wider cursor-pointer font-mono"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Feed: High-Contrast Logs */}
            <div
                ref={scrollRef}
                className="flex-1 px-6 py-4 overflow-y-auto font-mono text-xs space-y-4 pr-4"
            >
                {messages.map((msg, i) => {
                    const isUser = msg.includes("[USER]");
                    const isError = msg.includes("[ERROR]");
                    const isAurelius = msg.includes("[AURELIUS]");
                    const isLog = msg.includes("[LOG]");
                    const isSystem = msg.includes("[SYSTEM]"); // <-- ADD THIS

                    return (
                        <div key={i} className={`flex gap-3 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {/* Timestamp */}
                            <span className="text-[10px] text-white/30 mt-0.5 whitespace-nowrap font-sans">
                                {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <div className="flex-1">
                                {/* HEATERS FOR DIFFERENT MESSAGE TYPES */}
                                {isUser && <span className="text-cyan-400 font-bold block mb-1 font-mono tracking-wider">USER_INPUT:</span>}
                                {isAurelius && <span className="text-emerald-400 font-bold block mb-1 font-mono tracking-wider">AURELIUS_CORE:</span>}
                                {isError && <span className="text-red-500 font-bold block mb-1 font-mono tracking-wider">SYSTEM_ERROR:</span>}

                                {/* FIX: Give Logs a Label and Color */}
                                {isLog && <span className="text-yellow-500/80 font-bold block mb-1 font-mono tracking-wider">REASONING_TRACE:</span>}
                                {isSystem && <span className="text-purple-400 font-bold block mb-1 font-mono tracking-wider">SYSTEM_STATUS:</span>}

                                {/* Message Content */}
                                <span className={`block font-mono font-medium drop-shadow-md ${isLog ? "text-yellow-100/90" : "text-white"}`}>
                                    {msg.replace(/\[.*?\]/g, '').trim()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-black/50">
                <div className="flex justify-between items-center text-[9px] text-white/40 font-mono uppercase tracking-widest">
                    <span>Secure Link: Active</span>
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online
                    </span>
                </div>
            </div>
        </div>
    );
}
