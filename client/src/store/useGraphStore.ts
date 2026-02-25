import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────

interface GraphNode {
    id: string;
    name?: string;
    description?: string;
    group?: number;
    val?: number;
}

interface GraphLink {
    source: string;
    target: string;
    type: string;
}

export interface GraphState {
    // Graph Data
    nodes: GraphNode[];
    links: GraphLink[];
    isLoading: boolean;

    // Reasoning State (Step 16: Golden Beam)
    targetNode: string | null;
    pathNodes: string[];
    pathConfidence: number;
    isReasoning: boolean;
    lastEntities: string[];

    // Graph Stats (Step 21: Metrics Panel)
    nodeCount: number;
    edgeCount: number;
    lastQueryMs: number;

    // Backend Status (Step 20: NavBar)
    backendStatus: 'online' | 'offline' | 'checking';

    // Actions
    fetchGraph: () => Promise<void>;
    focusNode: (nodeId: string) => void;
    setPathNodes: (nodes: string[], confidence: number, entities: string[]) => void;
    setIsReasoning: (val: boolean) => void;
    setLastQueryMs: (ms: number) => void;
    checkBackendHealth: () => Promise<void>;
}

// ─────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────

export const useGraphStore = create<GraphState>((set, get) => ({
    // Initial State
    nodes: [],
    links: [],
    isLoading: false,
    targetNode: null,
    pathNodes: [],
    pathConfidence: 0,
    isReasoning: false,
    lastEntities: [],
    nodeCount: 0,
    edgeCount: 0,
    lastQueryMs: 0,
    backendStatus: 'checking',

    // Fetch the full knowledge graph for 3D visualization
    fetchGraph: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_URL}/api/v1/graph`);
            if (!response.ok) throw new Error(`Graph fetch failed: ${response.status}`);
            const data = await response.json();
            set({
                nodes: data.nodes || [],
                links: data.links || [],
                nodeCount: (data.nodes || []).length,
                edgeCount: (data.links || []).length,
                isLoading: false,
            });
        } catch (error) {
            console.error('❌ Failed to fetch Knowledge Graph:', error);
            set({ isLoading: false });
        }
    },

    // Trigger camera fly-to for a single node
    focusNode: (nodeId: string) => set({ targetNode: nodeId }),

    // Set the full reasoning path + trigger Golden Beam effect
    setPathNodes: (nodes: string[], confidence: number, entities: string[]) => set({
        pathNodes: nodes,
        pathConfidence: confidence,
        lastEntities: entities,
        targetNode: nodes[0] || null,  // Fly-to the first node in the path
    }),

    setIsReasoning: (val: boolean) => set({ isReasoning: val }),

    setLastQueryMs: (ms: number) => set({ lastQueryMs: ms }),

    // Health check for NavBar live status indicator
    checkBackendHealth: async () => {
        set({ backendStatus: 'checking' });
        try {
            const response = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
            set({ backendStatus: response.ok ? 'online' : 'offline' });
        } catch {
            set({ backendStatus: 'offline' });
        }
    },
}));
