# ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension

[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/ci.yml?style=flat-square&label=build)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/actions/workflows/ci.yml)
[![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension?style=flat-square)](https://codecov.io/gh/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)
[![Language](https://img.shields.io/github/languages/top/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension?style=flat-square)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-blue?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension?style=flat-square)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)

[⭐ Star this Repo ⭐](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)

--- 

## BLUF (Bottom Line Up Front)

**ComicNarrate** is a sophisticated Chrome extension that leverages Gemini Vision AI (OCR) to translate visual web comic panels into spoken word via advanced Text-to-Speech (TTS). This creates a seamless, accessible, and hands-free digital reading experience tailored for the modern consumer.

## 🌟 Overview

This project transforms static web comics, manga, and graphic novels into an interactive audio experience. By utilizing the Google Gemini API for highly accurate Optical Character Recognition (OCR) on image assets, the extension extracts textual dialogue, captions, and narration. This text is then synthesized using customizable TTS engines, allowing users to enjoy their content audibly with control over voice profile, pitch, and playback speed.

## 🏗️ Architecture Overview (Browser Extension)

ascii
                  +---------------------------+
                  |   User Interface (Popup)  |
                  +------------^--------------+
                               | (User Config)
+----------------------------v----------------------------+
|                   Content Script (DOM Interaction)        |
|   (Image Detection -> OCR Request/Response Handling)      |
+----------------------------^--------------+
                             | (API Calls)
                  +----------v--------------+
                  | Background Service Worker |
                  | (API Key Management, Global State) |
                  +------------|------------+
                               | (Gemini API 1.5 Pro/Flash)
                             \ v /
                      +-----------------+
                      | Gemini Vision API |
                      +-----------------+


## 📋 Table of Contents

1. [BLUF (Bottom Line Up Front)](#bluf-bottom-line-up-front)
2. [Overview](#-overview)
3. [Architecture Overview (Browser Extension)](#-architecture-overview-browser-extension)
4. [Table of Contents](#-table-of-contents)
5. [Features](#-features)
6. [Tech Stack (Apex Standard 2025)](#-tech-stack-apex-standard-2025)
7. [Getting Started](#-getting-started)
8. [Development & Verification](#-development--verification)
9. [Contribution Guidelines](#-contribution-guidelines)
10. [Security Policy](#-security-policy)

## ✨ Features

*   **Visual-to-Audio Conversion:** Real-time OCR powered by Gemini Vision to accurately capture speech bubbles and narration boxes.
*   **Customizable TTS Profiles:** Fine-grained control over voice selection, pitch modulation, and playback speed for optimal listening comfort.
*   **Accessibility Focused:** Provides a critical reading aid for visually impaired users or those engaging in multitasking.
*   **Multi-Panel Sequencing:** Intelligent ordering of extracted text to maintain narrative coherence.
*   **Manifest V3 Compliance:** Built entirely on modern, secure browser extension standards.

## ⚙️ Tech Stack (Apex Standard 2025)

This project adheres to the **Apex Extension Standard (AES)** for Late 2025, prioritizing security, performance (Vite), and strict typing (TypeScript).

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| Language | TypeScript 5.x | Strict typing, enhanced maintainability. |
| Build Tool | Vite 5.x (with WXT) | Extreme build speed and configuration simplicity for extensions. |
| AI Engine | Google Gemini API (Vision/TTS) | State-of-the-art multimodal processing for OCR accuracy. |
| State Mgmt | Browser Storage API + Signals | Lightweight, asynchronous state handling within the extension environment. |
| Linting/Formatting | Biome (Linter/Formatter) | Unified, high-performance code quality enforcement. |
| Testing | Vitest (Unit) / Playwright (E2E Simulation) | Comprehensive verification across extension boundaries. |

## 🚀 Getting Started

Follow these steps to set up the development environment. Ensure you have Node.js (v20+) and npm/uv installed.

### Prerequisites

1.  **Node.js:** Version 20.0 or higher.
2.  **API Key:** Secure a Google Gemini API Key and set it as an environment variable named `GEMINI_API_KEY`.

### Setup Commands

bash
# 1. Clone the repository
git clone https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension.git
cd ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension

# 2. Install dependencies using standard JS package manager
npm install

# 3. Verify code style compliance
npx @biomejs/biome check --apply

# 4. Load the extension locally (Development Mode)
npm run dev
# Follow browser instructions to load the 'dist' folder as an unpacked extension.


### Available Scripts

| Script Name | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Builds the extension in watch mode for rapid iteration. |
| `build` | `npm run build` | Creates the production-ready V3 build bundle. |
| `test` | `npm run test` | Runs comprehensive Unit and Integration tests via Vitest. |
| `e2e` | `npx playwright test` | Executes end-to-end behavioral tests against simulated browser environments. |
| `lint` | `npx @biomejs/biome check .` | Static analysis check without auto-fixing. |

## 🤖 AI Agent Directives

<details>
<summary>Apex Technical Authority Agent Configuration (December 2025)</summary>

# SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

## 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards and the wisdom of "Managing the Unmanageable."
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

---

## 2. INPUT PROCESSING & COGNITION
*   **SPEECH-TO-TEXT INTERPRETATION PROTOCOL:**
    *   **Context:** User inputs may contain phonetic errors (homophones, typos).
    *   **Semantic Correction:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
    *   **Logic Anchor:** Treat the `README.md` as the **Single Source of Truth (SSOT)**.
*   **MANDATORY MCP INSTRUMENTATION:**
    *   **No Guessing:** Do not hallucinate APIs. Use explicit library calls.
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends** (e.g., Web Components, new Manifest features).
    *   **Validation:** Use `docfork` to verify *every* external API signature (especially Gemini).
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

## 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
**Directives:** Detect the project type and apply the corresponding **Apex Toolchain**.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    *   **Stack:** This project, `ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension`, mandates **TypeScript 6.x (Strict)**, **Vite 7/WXT** for bundling, and **Tauri v2** principles applied to extension architecture (e.g., separation of concerns).
    *   **Linting/Testing:** Utilize **Biome** for unified linting/formatting speed and **Vitest/Playwright** for robust verification.
    *   **Architecture:** Enforce **Feature-Sliced Design (FSD)** principles within the content and background scripts, ensuring modularity for future voice provider swaps.
    *   **API Interaction:** All interaction with the **Google Gemini API** must be asynchronous, robustly error-handled, and utilize secure secrets management (Manifest V3 compliant `chrome.storage` or temporary session keys).

## 4. ARCHITECTURAL PRINCIPLES (PERMANENT MANDATES)
*   **SOLID:** Enforce Dependency Inversion (D) for the OCR/TTS modules to allow easy swapping of vendors (e.g., Gemini to Azure).
*   **DRY:** Centralize configuration (e.g., TTS parameters) away from UI handlers.
*   **YAGNI:** Avoid over-engineering complex state synchronization; keep background communication minimal and event-driven.

## 5. VERIFICATION COMMANDS (For immediate self-correction)

1.  **Lint Check:** `npx @biomejs/biome check .`
2.  **Unit Test Execution:** `npm run test`
3.  **Build Verification:** `npm run build` (Ensure no broken asset paths in the final build structure).
4.  **API Schema Check (Gemini):** Verify function calls against the latest Gemini API documentation for the Vision/OCR endpoint.

</details>

## 🤝 Contribution Guidelines

We welcome contributions that enhance accessibility, accuracy, or performance. Please adhere to the Apex standards:

1.  **Fork** the repository.
2.  Create a new feature branch (`git checkout -b feat/AmazingFeature`).
3.  Ensure all new code is covered by **Vitest** unit tests (minimum 85% coverage target).
4.  Run `npm run lint` and ensure zero errors before committing.
5.  Submit a detailed Pull Request referencing the issue being addressed.

See the full guidelines in [.github/CONTRIBUTING.md](/.github/CONTRIBUTING.md).

## 🛡️ Security Policy

Security is paramount, especially when dealing with API keys and user content. This project follows the **Zero Trust** model for external service interaction.

*   **API Key Handling:** Sensitive API keys are **NEVER** hardcoded. They must be managed via environment variables or securely stored in the user's local environment configuration, retrieved via background scripts.
*   **Input Sanitization:** All user-inputted configurations (e.g., pitch values) are strictly validated against type and bounds before being passed to underlying browser APIs or external services.

Refer to [.github/SECURITY.md](/.github/SECURITY.md) for reporting procedures.

## ⚖️ License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the [LICENSE](LICENSE) file for details.
