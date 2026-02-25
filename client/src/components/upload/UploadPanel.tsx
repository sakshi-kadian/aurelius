"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, Loader, X, ChevronRight } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type UploadPhase = "idle" | "uploading" | "extracting" | "graphing" | "done" | "error";

interface UploadResult {
    filename: string;
    chunks_processed: number;
    triplets_extracted: number;
    message: string;
}

export default function UploadPanel({ onClose }: { onClose: () => void }) {
    const [phase, setPhase] = useState<UploadPhase>("idle");
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { fetchGraph } = useGraphStore();

    const PHASES: { phase: UploadPhase; label: string }[] = [
        { phase: "uploading", label: "Uploading PDF..." },
        { phase: "extracting", label: "Extracting text & chunking..." },
        { phase: "graphing", label: "Injecting into Knowledge Graph..." },
        { phase: "done", label: "Injection complete!" },
    ];

    const handleFile = useCallback(async (file: File) => {
        if (!file.name.endsWith(".pdf")) {
            setError("Only PDF files are supported.");
            setPhase("error");
            return;
        }

        setPhase("uploading");
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            setPhase("uploading");
            await new Promise(r => setTimeout(r, 400)); // Visual pause for UX

            setPhase("extracting");
            const response = await fetch(`${API_URL}/api/v1/ingest`, {
                method: "POST",
                body: formData,
            });

            setPhase("graphing");
            await new Promise(r => setTimeout(r, 500)); // Visual pause for UX

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
            setPhase("done");

            // Refresh the 3D graph data
            await fetchGraph();

        } catch (e: any) {
            console.error("Upload error:", e);
            setError(e.message || "Upload failed. Is the backend running?");
            setPhase("error");
        }
    }, [fetchGraph]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const currentPhaseIndex = PHASES.findIndex(p => p.phase === phase);
    const isProcessing = ["uploading", "extracting", "graphing"].includes(phase);

    return (
        <div className="absolute right-10 top-10 bottom-10 w-[360px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-[20px] flex flex-col overflow-hidden shadow-2xl z-20">

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                    <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase font-mono">
                        Knowledge Injection
                    </span>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* Drop Zone */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8 gap-6">
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => !isProcessing && inputRef.current?.click()}
                    className={`
                        relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl
                        border-2 border-dashed transition-all duration-300 cursor-pointer
                        ${isDragging
                            ? "border-purple-500/70 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.2)]"
                            : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                        }
                        ${isProcessing ? "pointer-events-none opacity-60" : ""}
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                    />

                    {phase === "idle" && (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center">
                                <Upload size={28} className="text-purple-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white mb-1">Drop PDF Here</p>
                                <p className="text-xs text-white/40 font-mono">or click to browse</p>
                            </div>
                            <p className="text-[10px] text-white/25 font-mono tracking-wider text-center">
                                Research papers, textbooks, documents
                            </p>
                        </>
                    )}

                    {isProcessing && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <Loader size={32} className="text-purple-400 animate-spin" />
                            <p className="text-sm font-bold text-white">
                                {PHASES[currentPhaseIndex]?.label}
                            </p>
                            {/* Progress Steps */}
                            <div className="w-full space-y-2 mt-2">
                                {PHASES.filter(p => p.phase !== "done").map((p, i) => (
                                    <div key={p.phase} className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-500 ${i < currentPhaseIndex
                                                ? "bg-emerald-500"
                                                : i === currentPhaseIndex
                                                    ? "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                                                    : "bg-white/20"
                                            }`} />
                                        <span className={`text-[11px] font-mono transition-colors duration-300 ${i < currentPhaseIndex
                                                ? "text-emerald-400"
                                                : i === currentPhaseIndex
                                                    ? "text-white"
                                                    : "text-white/30"
                                            }`}>{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {phase === "done" && result && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <CheckCircle size={36} className="text-emerald-400" />
                            <p className="text-sm font-bold text-emerald-300">Injection Complete</p>
                            <div className="w-full grid grid-cols-2 gap-3 mt-1">
                                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-2xl font-bold text-white font-space">{result.chunks_processed}</div>
                                    <div className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Chunks</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-2xl font-bold text-amber-400 font-space">{result.triplets_extracted}</div>
                                    <div className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Triplets</div>
                                </div>
                            </div>
                            <p className="text-[11px] text-white/40 font-mono text-center">{result.filename}</p>
                        </div>
                    )}

                    {phase === "error" && (
                        <div className="flex flex-col items-center gap-3 w-full">
                            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
                                <X size={24} className="text-red-400" />
                            </div>
                            <p className="text-sm font-bold text-red-300">Upload Failed</p>
                            <p className="text-xs text-red-400/70 font-mono text-center">{error}</p>
                        </div>
                    )}
                </div>

                {/* Reset button */}
                {(phase === "done" || phase === "error") && (
                    <button
                        onClick={() => { setPhase("idle"); setResult(null); setError(null); }}
                        className="text-[11px] font-mono text-white/40 hover:text-white transition-colors mx-auto flex items-center gap-2"
                    >
                        <ChevronRight size={12} />
                        Upload Another Document
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-black/50">
                <p className="text-[9px] font-mono text-white/20 text-center uppercase tracking-widest">
                    Rate limited · 5 uploads / min · Max LIMIT 1000 nodes
                </p>
            </div>
        </div>
    );
}
