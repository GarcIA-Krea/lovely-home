# IT Requirements Checklist: GSD AI Academy Project

**To:** GSD Information Technology / Security Team
**From:** GSD AI Development Team (Liz/Natalyia/Andres)
**Date:** February 13, 2026
**Subject:** Environment Configuration for "Project Jade" (AI Academy)

> **Context**: To execute the "Services-as-Software" roadmap approved by Executive Leadership, the following development environment configurations are required. These tools allow us to connect our internal data (SOPs) to the AI engine securely via MCP (Model Context Protocol).

---

## 1. Core Runtimes (Critical)
*   [ ] **Python 3.12+**:
    *   **Requirement**: Must be installed and added to the System PATH (`python` command must be executable from terminal).
    *   **Reason**: Runs the local "Factory Engine" and MCP servers.
*   [ ] **Node.js (LTS Version 20+)**:
    *   **Requirement**: Must include `npm` (Node Package Manager).
    *   **Reason**: Required for certain MCP connectors and the React frontend build tools.

## 2. Terminal & Shell Permissions
*   [ ] **PowerShell Execution Policy**:
    *   **Requirement**: Set to `RemoteSigned` or `Unrestricted` for the user.
    *   **Command**: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
    *   **Reason**: We need to run local scripts (virtual environment activation, dependency installation) to build the software. Currently, it is "Undefined" (Restricted).

## 3. Network Whitelist (Firewall/Proxy)
Please ensure the following domains are reachable (HTTPS/443):
*   `pypi.org` (Python Package Index - for installing standard libraries like `pandas`, `fastapi`).
*   `registry.npmjs.org` (Node Package Registry - for React/Frontend tools).
*   `notebooklm.google.com` (The Knowledge Base Core).
*   `github.com` (For cloning open-source MCP adapters).

## 4. Specific Tooling (The "Connector" Stack)
*   [ ] **VS Code** (or similar IDE) with "Python" and "Pylance" extensions allowed.
*   [ ] **Docker Desktop** (Optional but Recommended): If we containerize the "Factory" for security, we will need Docker. (Priority: Medium).

---

## 5. Security Note for IT
*   **Data Flow**: All "PHI" (Patient Health Information) processing happens *locally* or within our approved enterprise cloud instance (NotebookLM).
*   **No "Shadow AI"**: This stack prevents employees from using public ChatGPT. It forces them to use our controlled, compliant "Factory" environment.
