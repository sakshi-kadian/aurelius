import { create } from 'zustand';

interface GraphNode {
    id: string;
    name?: string; // e.g. "Elon Musk"
    description?: string;
    group?: number;
    val?: number; // Size/Importance
}

interface GraphLink {
    source: string;
    target: string;
    type: string; // Predicate (e.g., "FOUNDED")
}

interface GraphState {
    nodes: GraphNode[];
    links: GraphLink[];
    targetNode: string | null; // For camera focus
    isLoading: boolean;
    fetchGraph: () => Promise<void>;
    focusNode: (nodeId: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
    nodes: [],
    links: [],
    targetNode: null,
    isLoading: false,
    fetchGraph: async () => {
        set({ isLoading: true });
        try {
            // PROXY: Next.js rewrites /api to FastAPI, or we call localhost:8000 directly via CORS
            const response = await fetch("http://localhost:8000/api/v1/graph");
            const data = await response.json();
            set({ nodes: data.nodes, links: data.links, isLoading: false });
        } catch (error) {
            console.error("❌ Failed to fetch Knowledge Graph:", error);
            set({ isLoading: false });
        }
    },
    focusNode: (nodeId) => set({ targetNode: nodeId }),
}));
