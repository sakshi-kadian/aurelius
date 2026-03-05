# AURELIUS: Project Implementation Master Plan

**Objective:** Build a research-grade Neuro-Symbolic AI engine to secure admission to Columbia/NYU Tandon MS CS.
**Status:** 🚀 Initiated

---

## 🟢 PHASE 1: Architecture & Infrastructure (The Foundation)
*Building the high-performance nervous system.*

- [x] **1.1. Project & Repo Initialization**
    - Create monorepo structure (`/server`, `/client`, `/infrastructure`).
    - Initialize Git repo.
- [x] **1.2. Docker Orchestration Setup**
    - Configure `docker-compose.yml` for Neo4j (Graph DB).
    - Configure `docker-compose.yml` for ChromaDB (Vector DB).
    - Setup networking between containers.
- [x] **1.3. Backend Core (FastAPI)**
    - Initialize Python 3.12 Environment with Poetry/Pip.
    - Setup FastAPI app with Async support.
    - Implement Neo4j Driver Connection (singleton pattern).
    - Implement ChromaDB Client.
- [x] **1.4. Frontend Core (Next.js 15)**
    - Initialize Next.js 15 (App Router, TypeScript).
    - Install & Config Tailwind CSS (Dark Mode Protocol).
    - Verify `React Three Fiber` installation.

---

## 🟡 PHASE 2: The Logic Engine (Backend Intelligence)
*Teaching the machine to read and structure data (Neural -> Symbolic).*

- [x] **2.1. PDF Ingestion Pipeline**
    - Create endpoint to upload/parse PDFs (`pypdf` or `unstructured`).
    - Text chunking strategy (sliding window).
- [x] **2.2. Triplet Extraction System (The "Neuro" bit)**
    - Implement Ollama (Llama 3.1) wrapper.
    - Design System Prompt for extracting `(Subject, Predicate, Object)` tuples.
    - Test extraction on complex academic text.
- [x] **2.3. Knowledge Graph Population**
    - Write logic to upsert Nodes and Relationships into Neo4j.
    - Implement "Entity Resolution" (merging "Elon" and "Elon Musk").
- [x] **2.4. Vector Embeddings**
    - Embed text chunks using local embedding model.
    - Store in ChromaDB for hybrid retrieval.
- [x] **2.5. The Clinical Knowledge Injection (Admissions Strategy)**
    - **Target:** Prof. Noemie Elhadad (Health/Bio-informatics).
    - **Action:** Ingest a complex Medical Graph Paper as the primary test case.
    - **Result:** Visualize "Drug -> Side Effect -> Organ" relationships to demonstrate interdisciplinary capability.

---

## 🟠 PHASE 3: The Nexus (3D Visualization)
*Creating the "Wow" factor interface.*

- [x] **3.1. Canvas Setup**
    - Initialize R3F Canvas with Post-processing (Bloom).
    - Implement Camera Controls (OrbitControls/FlyControls).
- [x] **3.2. Graph Data Management (Frontend)**
    - Create State Store (Zustand) for Graph Data (Nodes/Links).
    - Fetch data from FastAPI endpoint.
- [x] **3.3. 3D Node & Edge Rendering**
    - Create `NodeMesh` (InstancedMesh for performance).
    - Create `EdgeLine` (LineGeometry for glowing connections).
    - Implement Force-Directed Layout (d3-force-3d) to organize chaos.
- [x] **3.4. Interactivity**
    - Hover effects (highlight neighbors).
    - Click events (open "Source Knowledge" modal).

---

## 🔵 PHASE 4: The Reasoning Console (Graph RAG)
*Connecting the brain to the visualization.*

- [x] **4.1. "Golden Beam" Logic path & Confidence Scores**
    - Implement backend pathfinding (Shortest Path / Dijkstra) with edge weights.
    - **Secret Weapon:** Calculate "Confidence Score" for each connection.
    - **Visuals:** Thick Gold Beam for High Confidence (>80%), Thin/Flickering Ghost Line for Low Confidence (<40%).
    - Return "Path Segments" with style metadata to frontend.
- [x] **4.2. Chat Interface**
    - Build "Reasoning Console" UI (Chat input).
    - Connect to QA endpoint.
- [x] **4.3. Multi-Hop Answer Generation**
    - Retrieve Sub-graph based on query.
    - Pass Sub-graph + Query to Llama 3 for final answer.
- [x] **4.4. Visual Synchronization**
    - **CRITICAL:** Animate the camera to fly along the "Reasoning Path" when an answer is generated.

---

## 🟣 PHASE 5: Polish & UX Aesthetics (The "Premium" Feel)
*Ensuring it looks like a Tier-1 Product.*

- [x] **5.1. Design System Implementation**
    - Fonts: Inter / Space Grotesk.
    - Colors: Deep Void Black, Cyber-Gold, Holographic Blue.
- [x] **5.2. Landing Page & Storytelling**
    - Design "The Portal" entry page.
    - Add "About the Research" section (for Admissions).
- [x] **5.3. Performance Optimization**
    - Tree-shaking.
    - Graph LoD (Level of Detail) validation for 1000+ nodes.

---

## 🏁 PHASE 6: Final Review & Demo Assets
- [x] **6.1. Deployment Check** (Can run locally with one command).
- [ ] **6.2. Recording the Demo Video**.
- [x] **6.3. Writing the README / Project Paper**.
