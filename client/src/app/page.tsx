"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Network,
  ShieldCheck,
  Zap,
  Database,
  Search,
  Cpu,
  Activity,
  Globe,
  Brain,
  FileText,
  ChevronRight,
  Terminal,
  Code
} from "lucide-react";

// Import 3D Cosmos Canvas (Ensure this component handles its own suspense)
import CosmosCanvas from "@/components/cosmos/CosmosCanvas";

export default function Home() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const y = useTransform(scrollY, [0, 600], [0, 200]);



  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-[#050505] text-slate-200">

      {/* --- 3D BACKGROUND (HERO ONLY) --- */}
      <motion.div
        style={{ opacity, y }}
        className="fixed inset-0 h-screen w-full z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-10" />
        {/* We use a key to force re-render if needed, but here just static for now */}
        {/* NOTE: If performance is an issue, we can conditionally render this only when in view */}
        <CosmosCanvas />
      </motion.div>

      <main className="relative z-10 flex flex-col items-center w-full">

        {/* --- HERO SECTION --- */}
        <section className="min-h-screen flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 relative">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-5xl mx-auto z-20"
          >
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-amber-200/90 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              VERSION 1.0
            </div>

            {/* Main Title */}
            <h1 className="text-[120px] md:text-[180px] font-space font-bold tracking-tighter mb-6 leading-[0.85] text-white drop-shadow-2xl">
              AURELIUS
            </h1>

            {/* Subtitle / Mission */}
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light tracking-wide">
              A <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-semibold">Neuro-Symbolic Reasoning Engine</span> designed to eliminate LLM hallucination through <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-500 font-semibold">mathematical verification</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/engine">
                <button className="cursor-pointer group relative px-10 py-5 bg-white text-black font-space font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]">
                  <span className="relative z-10 flex items-center gap-3">
                    INITIALIZE ENGINE <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen" />
                </button>
              </Link>
            </div>
          </motion.div>

        </section>

        {/* --- HOW IT WORKS (PIPELINE) --- */}
        <section className="w-full max-w-7xl mx-auto px-6 py-32 relative z-20">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-space font-bold text-white mb-6">THE <span className="text-purple-400">TRUTH PIPELINE</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Aurelius doesn't guess. It constructs a deterministic path from source document to final answer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-white/20 -z-10" />

            {[
              { step: "01", title: "Ingestion", icon: FileText, desc: "Convert raw unstructured PDFs into high-dimensional semantic vector chunks." },
              { step: "02", title: "Extraction", icon: Brain, desc: "Llama 3 extracts deterministic (Subject → Predicate → Object) relational triplets." },
              { step: "03", title: "Graphing", icon: Network, desc: "Facts are anchored into a rigid, mathematically verifiable Neo4j topology." },
              { step: "04", title: "Reasoning", icon: ShieldCheck, desc: "Traverse the graph with mathematical certainty to answer complex multi-hop queries." }
            ].map((s, i) => (
              <div key={i} className="group relative bg-[#0A0A0A] border border-white/5 p-8 rounded-2xl hover:border-white/20 transition-all duration-300">
                <div className="text-xs font-bold text-slate-500 mb-4 tracking-widest group-hover:text-white transition-colors">STEP {s.step}</div>
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors duration-300">
                  <s.icon size={24} className="text-slate-300 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* --- BENTO GRID (FEATURES) --- */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-32 relative z-20">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-space font-bold text-white mb-6 leading-tight">
              ENGINEERED FOR <br /> <span className="text-purple-400">ABSOLUTE CERTAINTY.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Experience the speed and precision of a system built on verifiable graph topology and deterministic reasoning.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 pb-12">
            {[
              { label: "Accuracy", value: "99.9%" },
              { label: "Latency", value: "22ms" },
              { label: "Nodes", value: "4.2B" },
              { label: "Hallucinations", value: "0" },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="text-4xl md:text-6xl font-space font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{stat.value}</div>
                <div className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase group-hover:text-emerald-500/70 transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Topological Pathfinding (Emerald) */}
            <div className="md:col-span-2 group relative p-10 rounded-3xl bg-[#080808] border border-white/10 overflow-hidden hover:border-emerald-500/50 transition-all duration-500 min-h-[320px] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="absolute top-[-40%] right-[-10%] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <Network className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Topological Pathfinding</h3>
                <p className="text-slate-400 text-lg max-w-lg">
                  Multi-hop traversals across billion-node graphs using weighted Dijkstra variants. Maps semantic distance to reconstruct high-fidelity reasoning paths.
                </p>
              </div>
            </div>

            {/* Card 2: Symbolic Grounding (Emerald) */}
            <div className="md:col-span-1 group relative p-10 rounded-3xl bg-[#080808] border border-white/10 overflow-hidden hover:border-emerald-500/50 transition-all duration-500 min-h-[320px] flex flex-col justify-between">
              <div className="absolute top-[-40%] right-[-40%] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <ShieldCheck className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Symbolic Grounding</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Token verification against rigid Neo4j schemas, mathematically eliminating the risk of Large Language Model hallucinations during generation.
                </p>
              </div>
            </div>

            {/* Row 2: Three Small Cards (All Emerald) */}

            {/* Card 3: Triplet Extraction (Emerald) */}
            <div className="group relative p-8 rounded-3xl bg-[#080808] border border-white/10 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-[-40%] right-[-40%] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                  <Search className="text-emerald-400" size={24} />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Triplet Extraction</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Deconstructs natural language into deterministic (Subject-Predicate-Object) structures using Llama 3.
                </p>
              </div>
            </div>

            {/* Card 4: Low-Latency Lookup (Emerald) */}
            <div className="group relative p-8 rounded-3xl bg-[#080808] border border-white/10 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-[-40%] right-[-40%] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                  <Zap className="text-emerald-400" size={24} />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Low-Latency Lookup</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Optimized Cypher execution for sub-20ms path discovery in massive billion-edge graphs.
                </p>
              </div>
            </div>

            {/* Card 5: Hybrid Vector-Graph (Emerald) */}
            <div className="group relative p-8 rounded-3xl bg-[#080808] border border-white/10 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute top-[-40%] right-[-40%] w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-900/20 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                  <Database className="text-emerald-400" size={24} />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Hybrid Vector-Graph</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Fuses ChromaDB embeddings with Neo4j topology for 99.9% verifiable retrieval accuracy.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* --- COMPARISON TABLE --- */}
        <section className="w-full bg-black/40 backdrop-blur-sm py-20 relative z-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-space font-bold text-white mb-6">WHY IT <span className="text-purple-400">MATTERS</span></h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">Standard RAG vs. Neuro-Symbolic Graph RAG</p>
            </div>

            <div className="w-full overflow-x-auto rounded-2xl border border-white/10 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-6 text-xs text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 w-[20%]">Feature</th>
                    <th className="p-6 text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-500/5 w-[40%]">Standard LLM</th>
                    <th className="p-6 text-xs text-amber-500 font-bold uppercase tracking-wider bg-amber-500/5 w-[40%]">Aurelius Engine</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 font-bold text-indigo-300 bg-indigo-500/5">Trust Mechanism</td>
                    <td className="p-6 text-slate-400 bg-slate-500/5">"Trust me bro" (Probabilistic)</td>
                    <td className="p-6 text-amber-200 bg-amber-500/5 font-bold">Mathematical Proof (Deterministic)</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 font-bold text-indigo-300 bg-indigo-500/5">Traceability</td>
                    <td className="p-6 text-slate-400 bg-slate-500/5">Vague citations</td>
                    <td className="p-6 text-amber-200 bg-amber-500/5 font-bold">Exact Graph Node ID</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 font-bold text-indigo-300 bg-indigo-500/5">Complex Reasoning</td>
                    <td className="p-6 text-slate-400 bg-slate-500/5">Fails at multi-hop logic</td>
                    <td className="p-6 text-amber-200 bg-amber-500/5 font-bold">Infinite-hop Traversal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>


        {/* --- FOOTER --- */}
        <footer className="w-full flex items-center justify-center py-8 mt-12 bg-[#050505] border-t border-white/5 relative z-20 text-center">

          <p className="text-[13px] font-medium text-slate-600 tracking-widest uppercase">
            © 2026 Aurelius. Research Grade Neuro-Symbolic AI.
          </p>
        </footer>

      </main>
    </div>
  );
}
