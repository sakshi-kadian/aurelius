"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ReasoningTrace {
    entities: string[];
    path: string[];
    confidence: number;
    type: string;
    chunksUsed: number;
}

export default function ReasoningConsole() {
    const [messages, setMessages] = useState<string[]>([
        "[SYSTEM] Aurelius v1.0 Initialized.",
        "[SYSTEM] Neuro-Symbolic Engine Ready.",
    ]);
    const [input, setInput] = useState("");
    const [showTrace, setShowTrace] = useState(false);
    const [lastTrace, setLastTrace] = useState<ReasoningTrace | null>(null);

    const { focusNode, setPathNodes, setIsReasoning, isReasoning, setLastQueryMs } = useGraphStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = async (queryOverride?: string) => {
        const queryToProcess = queryOverride || input;
        if (!queryToProcess.trim() || isReasoning) return;

        const startTime = Date.now();
        setMessages(prev => [...prev,
        `[USER] ${queryToProcess}`,
            `[AURELIUS] Initializing Reasoning Pipeline...`
        ]);
        setInput("");
        setIsReasoning(true);
        setLastTrace(null);

        try {
            const response = await fetch(`${API_URL}/api/v1/reason`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryToProcess }),
            });

            if (!response.ok) throw new Error(`Engine HTTP Error: ${response.status}`);
            const data = await response.json();

            // Record query time
            setLastQueryMs(Date.now() - startTime);

            // 1. Staggered chain-of-thought step feed
            if (data.steps) {
                data.steps.forEach((step: string, index: number) => {
                    setTimeout(() => {
                        setMessages(prev => [...prev, `[LOG] ${step}`]);
                    }, index * 380);
                });
            }

            // 2. Final answer + visualization
            const totalDelay = (data.steps?.length || 0) * 380 + 600;
            setTimeout(() => {
                setMessages(prev => [...prev, `[AURELIUS] ${data.answer}`]);

                // Update Golden Beam visualization
                if (data.path?.nodes?.length > 0) {
                    setPathNodes(
                        data.path.nodes,
                        data.path.confidence || 0,
                        data.entities_found || []
                    );
                }

                // Store explainability trace
                setLastTrace({
                    entities: data.entities_found || [],
                    path: data.path?.nodes || [],
                    confidence: data.path?.confidence || 0,
                    type: data.path?.type || "Unknown",
                    chunksUsed: data.vector_chunks_used || 0,
                });
                setShowTrace(true);  // Auto-open trace panel
                setIsReasoning(false);
            }, totalDelay);

        } catch (e) {
            console.error("Reasoning Error:", e);
            setMessages(prev => [...prev, `[ERROR] Connection failed. Ensure backend is running on port 8000.`]);
            setIsReasoning(false);
        }
    };

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const confidenceColor = (c: number) => c >= 0.75 ? "#10b981" : c >= 0.5 ? "#f59e0b" : "#ef4444";
    const confidencePct = Math.round((lastTrace?.confidence || 0) * 100);

    return (
        <div className="absolute left-10 top-10 bottom-10 w-[390px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-[20px] flex flex-col overflow-hidden shadow-2xl z-20">

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isReasoning ? "bg-amber-400" : "bg-emerald-500"}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isReasoning ? "bg-amber-400" : "bg-emerald-500"}`} />
                    </span>
                    <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase font-mono">
                        {isReasoning ? "Reasoning..." : "Aurelius"}
                    </span>
                </div>
                {isReasoning && (
                    <span className="text-[9px] font-mono text-amber-400/70 tracking-widest animate-pulse uppercase">
                        PROCESSING
                    </span>
                )}
            </div>

            {/* ── Command Input ── */}
            <div className="px-6 pt-4 pb-2">
                <div className="flex items-center border-b border-white/20 pb-2">
                    <span className="text-emerald-500 text-sm font-mono font-bold mr-3">{">"}</span>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        placeholder={isReasoning ? "Reasoning in progress..." : "Initialize Reasoning Sequence..."}
                        disabled={isReasoning}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white placeholder-white/25 focus:ring-0 selection:bg-emerald-500/30"
                        style={{ color: "white", colorScheme: "dark" }}
                        autoComplete="off"
                        autoFocus
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isReasoning || !input.trim()}
                        className={`ml-2 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-md w-8 h-8 cursor-pointer transition-all duration-300 ${input.length > 0 && !isReasoning ? "opacity-100" : "opacity-30 cursor-not-allowed"}`}
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* ── Quick Query Triggers ── */}
            <div className="px-6 py-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {[
                        { label: "Path Trace", query: "Trace the reasoning path for attention mechanisms" },
                        { label: "Truth Check", query: "Verify: do transformers use self-attention?" },
                        { label: "Deep Audit", query: "What are the key relationships between neural networks and symbolic reasoning?" },
                    ].map((btn, i) => (
                        <button
                            key={i}
                            onClick={() => !isReasoning && setInput(btn.query)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-cyan-300 font-bold hover:bg-white/10 hover:border-cyan-500/50 transition-all uppercase tracking-wider cursor-pointer font-mono"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Message Feed ── */}
            <div
                ref={scrollRef}
                className="flex-1 px-6 py-4 overflow-y-auto font-mono text-xs space-y-4 pr-4"
            >
                {/* Step 19: Loading progress bar */}
                {isReasoning && (
                    <div className="flex flex-col gap-2 py-2">
                        <div className="text-[10px] text-amber-400/70 uppercase tracking-widest animate-pulse">
                            Neural-Symbolic Loop Active
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full animate-pulse"
                                style={{ width: "60%", transition: "width 0.5s" }}
                            />
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isUser = msg.includes("[USER]");
                    const isError = msg.includes("[ERROR]");
                    const isAurelius = msg.includes("[AURELIUS]");
                    const isLog = msg.includes("[LOG]");
                    const isSystem = msg.includes("[SYSTEM]");

                    return (
                        <div key={i} className="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <span className="text-[10px] text-white/25 mt-0.5 whitespace-nowrap font-sans">
                                {new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                            <div className="flex-1">
                                {isUser && <span className="text-cyan-400 font-bold block mb-1 tracking-wider">USER_INPUT:</span>}
                                {isAurelius && <span className="text-emerald-400 font-bold block mb-1 tracking-wider">AURELIUS_CORE:</span>}
                                {isError && <span className="text-red-500 font-bold block mb-1 tracking-wider">SYSTEM_ERROR:</span>}
                                {isLog && <span className="text-yellow-500/80 font-bold block mb-1 tracking-wider">REASONING_TRACE:</span>}
                                {isSystem && <span className="text-purple-400 font-bold block mb-1 tracking-wider">SYSTEM_STATUS:</span>}
                                <span className={`block font-mono font-medium ${isLog ? "text-yellow-100/80" : isError ? "text-red-300" : "text-white"}`}>
                                    {msg.replace(/\[.*?\]/g, "").trim()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── STEP 18: AI Explainability Panel ── */}
            {lastTrace && (
                <div className="border-t border-white/10">
                    <button
                        onClick={() => setShowTrace(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-3 text-[10px] font-mono text-white/40 hover:text-white/70 transition-colors uppercase tracking-widest"
                    >
                        <span>⚡ Reasoning Trace</span>
                        {showTrace ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </button>

                    {showTrace && (
                        <div className="px-6 pb-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">

                            {/* Entities */}
                            {lastTrace.entities.length > 0 && (
                                <div>
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Entities Extracted</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {lastTrace.entities.map((e, i) => (
                                            <span key={i} className="text-[10px] bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 font-mono">
                                                {e}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reasoning Path */}
                            {lastTrace.path.length > 0 && (
                                <div>
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Graph Path ({lastTrace.type})</p>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {lastTrace.path.map((node, i) => (
                                            <span key={i} className="flex items-center gap-1">
                                                <span className="text-[10px] bg-amber-900/40 text-amber-300 px-2 py-1 rounded border border-amber-500/30 font-mono">
                                                    {node}
                                                </span>
                                                {i < lastTrace.path.length - 1 && (
                                                    <span className="text-white/20 text-xs">→</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Confidence Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Confidence</p>
                                    <span className="text-[10px] font-mono" style={{ color: confidenceColor(lastTrace.confidence) }}>
                                        {confidencePct}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${confidencePct}%`,
                                            backgroundColor: confidenceColor(lastTrace.confidence),
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Vector Context */}
                            <div className="flex gap-4 text-[9px] text-white/25 font-mono">
                                <span>Vector chunks: {lastTrace.chunksUsed}</span>
                                <span>Graph nodes: {lastTrace.path.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Footer ── */}
            <div className="px-6 py-3 border-t border-white/10 bg-black/50">
                <div className="flex justify-between items-center text-[9px] text-white/30 font-mono uppercase tracking-widest">
                    <span>Neuro-Symbolic · v1.0</span>
                    <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isReasoning ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
                        {isReasoning ? "Processing" : "Standby"}
                    </span>
                </div>
            </div>
        </div>
    );
}
