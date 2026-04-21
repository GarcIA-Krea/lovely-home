# Compliance Framework: The Hierarchy of Truth

> **Objective**: Ensure every AI-generated course is legally defensible and strictly compliant with US Healthcare Regulations.
> **Mechanism**: The **"Citation-First" Generation Engine**.

---

## 1. The Source of Truth (The Knowledge Base)
We do not rely on the AI's "internal training data" (which might be outdated). We rely **exclusively** on the documents we load into NotebookLM.

### Tier 1: The Iron Law (Federal & State)
*   **Source**: Official .gov PDFs.
*   **Content**:
    *   **HIPAA Administrative Simplification (45 CFR Part 160, 162, 164)**.
    *   **HITECH Act**.
    *   **CMS Billing Guidelines (Medicare Claims Processing Manual)**.
*   **Rule**: If a client preference conflicts with Tier 1, **Tier 1 wins**. The Agent *refuses* the client instruction and flags it to Compliance.

### Tier 2: The Payer Matrix (Insurance Rules)
*   **Source**: Payer Provider Manuals (Aetna, UHC, BCBS).
*   **Content**: Denial Codes, Pre-Auth Requirements, Timely Filing Limits.
*   **Rule**: These rules change quarterly. The "Hunter Agent" must verify the date of the manual before generating training.

### Tier 3: The Client Preference (SOPs)
*   **Source**: Client Intranet / Email.
*   **Content**: "Dr. Smith likes text messages," "Office hours are 9-5."
*   **Rule**: This is the "Flavor". It applies *only* if it does not violate Tier 1 or Tier 2.

---

## 2. The Validation Protocol (How We Build It)

### Step 1: The "Citation Requirement"
The Architect Agent is forbidden from writing a training instruction without a citation.
*   *Bad Generation*: "You should email the patient the results."
*   *Good Generation*: "Per **HIPAA Security Rule 164.312(e)(1)**, you may email results **only if** the transmission is encrypted. [Source: hhs.gov_hipaa_security.pdf, Page 42]."

### Step 2: The "Conflict Check"
Before the course is published to the LMS, the **Compliance Agent** runs a "Red Team" check:
1.  **Input**: The generated course JSON.
2.  **Query**: "Does any step in this course violate 45 CFR Part 164?"
3.  **Result**:
    *   *Pass*: Publish to LMS.
    *   *Fail*: "Slide 4 suggests texting a diagnosis. This violates HIPAA-Unencrypted. **CORRECTION REQUIRED**."

---

## 3. The "Updates" Engine
When a law changes (e.g., HVAC 2026 Rules):
1.  We upload the new PDF to NotebookLM.
2.  We run a "Diff Check" against existing courses.
3.  The Factory automatically flags courses that reference the *old* rule for immediate regeneration.
