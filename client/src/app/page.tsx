"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Network,
  ChevronRight,
  FileText,
  Search,
  Cpu,
  Brain,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Command,
  Activity
} from "lucide-react";

export default function Home() {
  // Monochromatic Grey-Scale Palette (White Background Variation)
  const colors = {
    bg: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#475569",
    accent: "#64748B",
    border: "#F1F5F9",
    surface: "#F9FAFB"
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundColor: colors.bg,
      color: colors.text,
      fontFamily: "var(--font-inter), -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, oxygen, ubuntu, cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflowX: "hidden"
    }}>
      {/* --- Global Custom Styles (Hover Effects) --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .btn-primary:active { transform: scale(0.98); }
        .btn-secondary:hover { background-color: #f9f9f9 !important; }
        .feature-card:hover { border-color: #ddd !important; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05) !important; }
        @media (max-width: 768px) {
          .hero-title { font-size: 64px !important; }
          .hero-desc { font-size: 18px !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* --- Fixed Background --- */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: `radial-gradient(circle at 50% -20%, ${colors.surface} 0%, ${colors.bg} 100%)`,
        opacity: 0.8
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${colors.accent} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.1
        }} />
      </div>

      {/* --- MAIN CONTENT --- */}
      <main style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "1100px",
        paddingTop: "150px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h1
            className="hero-title"
            style={{
              fontSize: "clamp(60px, 12vw, 140px)",
              lineHeight: "0.85",
              fontWeight: "900",
              letterSpacing: "-0.05em",
              marginTop: "0",
              marginBottom: "32px",
              fontFamily: "var(--font-space), serif",
              textTransform: "uppercase",
              color: colors.text
            }}
          >
            AURELIUS
          </h1>

          <p
            className="hero-desc"
            style={{
              fontSize: "20px",
              maxWidth: "600px",
              color: colors.textSecondary,
              lineHeight: "1.4",
              fontWeight: "500",
              marginBottom: "40px",
              marginInline: "auto",
              letterSpacing: "-0.02em"
            }}
          >
            A Neuro-Symbolic reasoning engine bridging the gap between neural intuition and symbolic logic to mitigate LLM hallucinations through verifiable, graph-grounded inference.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/engine" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{
                height: "56px",
                padding: "0 32px",
                background: colors.text,
                color: colors.surface,
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "700",
                border: `1px solid ${colors.border}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: `0 10px 30px -5px rgba(0,0,0,0.1)`
              }}>
                Initialize Engine <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* --- COMPACT BENTO GRID (Strictly Grey) --- */}
        <div className="bento-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          width: "100%",
          padding: "0 20px 60px"
        }}>
          {/* Card 1: Main Reasoning (Span 2) */}
          <div className="feature-card" style={{
            gridColumn: "span 2",
            padding: "40px",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
            minHeight: "260px",
            transition: "all 0.3s ease"
          }}>
            <div style={{ width: "56px", height: "56px", background: "#FFFFFF", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
              <Network size={28} color={colors.accent} />
            </div>
            <div>
              <h3 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "12px", color: colors.text }}>Topological Pathfinding</h3>
              <p style={{ fontSize: "16px", color: colors.textSecondary, lineHeight: "1.5", fontWeight: "500", maxWidth: "540px" }}>
                Multi-hop traversals across billion-node graphs using weighted Dijkstra variants. Maps semantic distance to reconstruct high-fidelity reasoning paths from raw unstructured data.
              </p>
            </div>
          </div>

          {/* Card 2: Symbolic Grounding (Span 1) */}
          <div className="feature-card" style={{
            padding: "40px",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
            minHeight: "260px",
            transition: "all 0.3s ease"
          }}>
            <div style={{ width: "56px", height: "56px", background: "#FFFFFF", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
              <ShieldCheck size={28} color={colors.accent} />
            </div>
            <div>
              <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: colors.text }}>Symbolic Grounding</h4>
              <p style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: "1.5" }}>
                Token verification against rigid Neo4j schemas, mathematically eliminating the risk of Large Language Model hallucinations during generation.
              </p>
            </div>
          </div>

          {/* Bottom Row: Cards 3, 4, 5 (All Span 1) */}
          {[
            {
              icon: Search,
              title: "Triplet Extraction",
              desc: "Deconstructs natural language into (S-P-O) structures using Llama 3."
            },
            {
              icon: Zap,
              title: "Low-Latency Lookup",
              desc: "Optimized Cypher execution for sub-20ms path discovery in massive graphs."
            },
            {
              icon: Database,
              title: "Hybrid Vector-Graph",
              desc: "Fuses ChromaDB with Neo4j topology for 99.9% verifiable retrieval accuracy."
            }
          ].map((item, i) => (
            <div key={i} className="feature-card" style={{
              padding: "32px",
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              minHeight: "200px",
              justifyContent: "center",
              transition: "all 0.3s ease"
            }}>
              <div style={{ width: "44px", height: "44px", background: "#FFFFFF", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <item.icon size={22} color={colors.accent} />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px", color: colors.text }}>{item.title}</h4>
                <p style={{ fontSize: "13px", color: colors.textSecondary, lineHeight: "1.4" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- COMPACT STATS SECTION --- */}
        <section style={{ width: "100%", padding: "60px 20px", borderTop: `1px solid ${colors.border}`, background: colors.bg }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", textAlign: "center" }}>
            {[
              { val: "99.9%", l: "Accuracy" },
              { val: "22ms", l: "Latency" },
              { val: "4.2B", l: "Nodes" },
              { val: "0", l: "Hallucinations" }
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "32px", fontWeight: "900", color: colors.text, letterSpacing: "-0.04em" }}>{s.val}</div>
                <div style={{ fontSize: "10px", fontWeight: "800", color: colors.accent, textTransform: "uppercase", letterSpacing: "1px" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SIMPLIFIED FOOTER --- */}
        <footer style={{
          width: "100%",
          padding: "30px 20px",
          display: "flex",
          justifyContent: "center",
          borderTop: `1px solid ${colors.border}`
        }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "1px" }}>
            © 2026 Aurelius. All Rights Reserved.
          </span>
        </footer>
      </main>
    </div>
  );
}
