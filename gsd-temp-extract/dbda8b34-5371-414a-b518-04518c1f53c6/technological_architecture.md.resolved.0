# Technological Architecture: The Jade Protocol

> **Status**: DRAFT (Phase 3)
> **Metaphor**: The "Factory" is a **Digital Temple**. Data flows like water (Ink) through the system to nurture the student.

---

## 1. High-Level Architecture (The "Flow")

```mermaid
graph TD
    subgraph "The Source (Ink Pool)"
        NLM[NotebookLM Brain]
        Docs[SOPs / EMR Manuals]
        Docs --> NLM
    end

    subgraph "The Conductor (The Scribe)"
        MCP[MCP Server]
        Scout[Hunter Agent]
        MCP -->|Query| NLM
        NLM -->|Context| MCP
    end

    subgraph "The Engine (The Kiln)"
        API[FastAPI Backend]
        Arch[Architect Agent]
        MCP -->|Raw Knowledge| Arch
        Arch -->|Structured JSON| API
    end

    subgraph "The Interface (The Dojo)"
        UI[Maestro Console (React)]
        Sim[Simulation Lab]
        API -->|Course Config| UI
        UI -->|User Action| Sim
    end
```

---

## 2. Component Detail

### Layer 1: The Source (NotebookLM)
*   **Concept**: *The Resting Brain*.
*   **Function**: Stores the "Source of Truth" (Grounding Data).
*   **Aesthetic**: "The Library of Scrolls."
*   **Artifacts**:
    *   `master_notebook_rcm`: Contains all Denial Codes.
    *   `master_notebook_compliance`: Contains HIPAA 2026 rules.

### Layer 2: The Conductor (MCP Server)
*   **Concept**: *The Scribe*.
*   **Function**: The "Pipe" that connects the Brain to the App.
*   **Tech Stack**: `notebooklm-mcp-server` (local Python service).
*   **The Magic**: It allows the Architect Agent to "Read" the Notebooks programmatically.

### Layer 3: The Engine (FastAPI + Architect Agent)
*   **Concept**: *The Kiln*.
*   **Function**: Takes raw "Ink" (Knowledge) and fires it into "Porcelain" (Training Modules).
*   **Process**:
    1.  Receives Request: "Create Module for CPT Code 99214".
    2.  Agent queries MCP.
    3.  Agent formats data into **GSD-Universal-JSON**.
    4.  Outputs `module_99214.json`.

### Layer 4: The Interface (The Maestro Console)
*   **Concept**: *The Dojo*.
*   **Function**: Where the Human meets the Machine.
*   **Tech Stack**: React + Tailwind (custom "Jade" theme).
*   **Key Feature**: **The Simulation Lab**. A chat interface where the user "spars" with a Provider Agent.

---

## 3. Data Flow Example: "The Correction"

1.  **Event**: HHS updates the "Telehealth Billing" rule.
2.  **Hunter Agent**: Detects the change, updates NotebookLM.
3.  **MCP Trigger**: Alerts the Engine.
4.  **Architect Agent**: Re-generates the "Telehealth 101" Micro-Module.
5.  **LMS Push**: The new module appears in the user's "Daily Drop" the next morning.
*   **Time Elapsed**: 45 Minutes.
*   **Human Effort**: Zero.

---

## 4. Security & Compliance (The Shield)
*   **Local-First Check**: PII is scrubbed *before* it hits the LLM.
*   **The Stone Guardian**: A regex-based middleware that blocks unauthorized data egress.
