"use client";

import CosmosCanvas from "@/components/cosmos/CosmosCanvas";
import ReasoningConsole from "@/components/console/ReasoningConsole";

export default function EnginePage() {
    return (
        <main className="fixed inset-0 w-full h-full bg-black text-white z-50 overflow-hidden">
            {/* The Engine View */}
            <CosmosCanvas />

            {/* The Chat Interface Overlay */}
            <ReasoningConsole />
        </main>
    );
}
