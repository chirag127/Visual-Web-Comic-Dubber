# ComicNarrate-AI-Powered-Web-Comic-Dubber-Browser-Extension

<!-- BADGES START -->
[![Build Status](https://img.shields.io/github/actions/workflow/status/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/ci.yml?style=flat-square&logo=github)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/actions)
[![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension?style=flat-square&logo=codecov)](https://codecov.io/gh/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)
[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-JavaScript%2C%20HTML%2C%20CSS%2C%20Gemini%20API-blue?style=flat-square&logo=javascript)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)
[![Lint/Format](https://img.shields.io/badge/Linter%20%26%20Formatter-Biome-informational?style=flat-square&logo=biome)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgray?style=flat-square&logo=creativecommons)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension?style=flat-square&logo=github)](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)
<!-- BADGES END -->

## Star ⭐ this Repo

---


## BLUF (Bottom Line Up Front)

ComicNarrate transforms web comics into an accessible, hands-free experience by using AI (Gemini OCR & TTS) to read them aloud. Enhance your reading journey with customizable voices and playback.

---


## 🚀 Project Architecture

mermaid
graph TD
    A[Browser Extension]
    B[Web Comic Page]
    C[ComicNarrate Core Logic]
    D[Google Gemini API (OCR)]
    E[Google Gemini API (TTS)]
    F[User Configuration]

    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    D --> C
    E --> C
    C --> A


---


## 📜 Table of Contents

*   [BLUF (Bottom Line Up Front)](#bluf-bottom-line-up-front)
*   [🚀 Project Architecture](#-project-architecture)
*   [📜 Table of Contents](#-table-of-contents)
*   [✨ Features](#-features)
*   [🛠️ Tech Stack](#-tech-stack)
*   [💡 AI Agent Directives](#-ai-agent-directives)
*   [🚀 Development Setup](#-development-setup)
*   [📜 Contributing Guidelines](#-contributing-guidelines)
*   [⚖️ License](#-license)
*   [❤️ Acknowledgements](#-acknowledgements)

---


## ✨ Features

*   **AI-Powered OCR:** Leverages Google Gemini's Vision capabilities to accurately extract text from web comic panels.
*   **AI-Powered TTS:** Utilizes Google Gemini's Text-to-Speech functionality to read the extracted text aloud.
*   **Customizable Voices:** Select from a range of voices for narration.
*   **Adjustable Pitch & Speed:** Fine-tune the audio output to your preference.
*   **Hands-Free Reading:** Enjoy web comics without needing to actively read.
*   **Enhanced Accessibility:** Makes web comics accessible to visually impaired users or those who prefer audio.
*   **Seamless Integration:** Works directly within your browser as a Chrome Extension.

---


## 🛠️ Tech Stack

This project is built using a modern JavaScript stack, prioritizing performance, maintainability, and advanced AI integration.

*   **Language:** JavaScript (ESNext)
*   **Framework/Environment:** Chrome Extension APIs
*   **AI Integration:** Google Gemini API (Vision & TTS)
*   **Core Libraries:**
    *   Manifest V3
    *   HTML, CSS
*   **Development Tools:**
    *   **Package Manager:** npm
    *   **Bundler/Build Tool:** Vite (for potential future expansion or local dev)
    *   **Linter & Formatter:** Biome (ensures code consistency and quality)
    *   **Testing Framework:** Vitest (for unit and integration tests)
    *   **End-to-End Testing:** Playwright

---


## 💡 AI Agent Directives

<details>
  <summary>Click to view AI Agent Directives</summary>

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
    *   **No Guessing:** Do not hallucinate APIs.
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends**.
    *   **Validation:** Use `docfork` to verify *every* external API signature.
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

---

## 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
**Directives:** Detect the project type and apply the corresponding **Apex Toolchain**.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript / JavaScript)**
    *   **Stack:** This project leverages **JavaScript (ESNext)** and adheres to modern browser extension standards. Key tools include **npm** for package management, **Biome** (for ultra-fast linting and formatting), **Vitest** (for robust unit and integration testing), and **Playwright** (for end-to-end testing). Development may utilize **Vite** for efficient bundling and local development.
    *   **Architecture:** Follows the **Feature-Sliced Design (FSD)** pattern for maintainable and scalable browser extensions. Adheres to **Manifest V3** standards, prioritizing security, performance, and user privacy.
    *   **AI Integration:** Deeply integrated with **Google Gemini API** (e.g., `gemini-pro-vision` for OCR, `text-to-speech` for narration) for intelligent content processing. Prioritize modular design, clear API contracts, and robust error handling for all AI model interactions.

*   **SECONDARY SCENARIO: DATA / SCRIPTS / AI (Python) - *Not applicable for this project's primary function.***
    *   **Stack:** uv (Manager), Ruff (Linter), Pytest (Test).
    *   **Architecture:** Modular Monolith or Microservices.

---

## 4. CORE PRINCIPLES (STANDARD 11 COMPLIANCE)
*   **SOLID Principles:** Adhere strictly to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
*   **DRY (Don't Repeat Yourself):** Avoid redundant code. Abstract common logic into reusable modules or functions.
*   **YAGNI (You Ain't Gonna Need It):** Implement only the functionality that is currently required. Avoid premature optimization or feature creep.
*   **Security First:** Integrate security considerations from the outset. Sanitize all inputs, handle API keys securely (environment variables/secrets management), and be mindful of potential cross-site scripting (XSS) and other web vulnerabilities. For extensions, adhere to Manifest V3's security best practices.
*   **Performance Optimized:** Ensure efficient DOM manipulation, minimal resource usage, and asynchronous operations for AI calls and network requests.
*   **Maintainable Codebase:** Employ clear naming conventions, consistent formatting, comprehensive commenting for complex logic, and modular design.

---

## 5. TESTING AND VERIFICATION PROTOCOL
*   **Unit Testing:** All core logic, utility functions, and component interactions MUST be covered by unit tests using **Vitest**. Aim for >80% code coverage.
*   **Integration Testing:** Verify interactions between different modules and external services (mocked where appropriate) using **Vitest**.
*   **End-to-End (E2E) Testing:** Utilize **Playwright** to simulate user interactions and test the extension's behavior within a browser environment.
*   **Linting & Formatting:** **Biome** MUST be used for linting and formatting all code. Run `biome check --apply` and `biome format --write` before committing.
*   **CI/CD Verification:** All changes MUST pass the CI pipeline defined in `.github/workflows/ci.yml`.

---

## 6. API INTEGRATION PROTOCOL
*   **Gemini API:** Securely manage API keys using environment variables (e.g., `process.env.GEMINI_API_KEY`). Implement robust error handling, including rate limiting, network errors, and API-specific error responses.
*   **Asynchronous Operations:** All AI and network requests MUST be handled asynchronously using `async/await`.
*   **Data Handling:** Validate and sanitize all data received from the Gemini API before use.

---

## 7. USER EXPERIENCE (UX) & ACCESSIBILITY PROTOCOL
*   **Intuitive UI:** Design user interfaces that are clean, simple, and easy to navigate.
*   **Accessibility:** Ensure the extension meets WCAG 2.1 AA standards where applicable, especially for any UI elements it introduces.
*   **Customization:** Provide clear options for users to configure voice, pitch, and speed.

---

## 8. DOCUMENTATION PROTOCOL
*   **README:** MUST be comprehensive, detailing features, architecture, setup, and usage.
*   **AGENTS.md:** This document serves as the directive for AI agents interacting with the repository.
*   **Code Comments:** Use JSDoc for functions and complex logic blocks.

---

## 9. VERSIONING & DEPLOYMENT PROTOCOL
*   **Versioning:** Use Semantic Versioning (SemVer).
*   **Deployment:** Standard Chrome Extension publishing workflow, integrated with CI/CD.

---

## 10. SECURITY & PRIVACY PROTOCOL
*   **Data Minimization:** Only request and process data necessary for functionality.
*   **API Key Management:** Never hardcode API keys. Use `.env` files for local development and secure secrets management for production/CI.
*   **Permissions:** Request the minimum necessary browser permissions.
*   **User Consent:** Clearly inform users about data usage, especially regarding AI processing.

---

## 11. COMPLIANCE MANDATE (THE "STANDARD 11")
Every repository **MUST** appear professional. Ensure the presence and proper configuration of:
1.  README.md
2.  PROPOSED_README.md
3.  badges.yml
4.  LICENSE (CC BY-NC 4.0)
5.  .gitignore
6.  .github/workflows/ci.yml
7.  .github/CONTRIBUTING.md
8.  .github/ISSUE_TEMPLATE/bug_report.md
9.  .github/PULL_REQUEST_TEMPLATE.md
10. .github/SECURITY.md
11. AGENTS.md

All generated files MUST comply with these directives, including dynamic URL generation based on the current repository name: `ComicNarrate-AI-Powered-Web-Comic-Dubber-Browser-Extension`.

</details>

---


## 🚀 Development Setup

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension.git
    cd ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension
    

2.  **Install dependencies:**
    bash
    npm install
    

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    env
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    
    *Note: For security, ensure `.env` is included in your `.gitignore` file.*

4.  **Run linters and formatters:**
    bash
    npx @biomejs/biome check --apply
    npx @biomejs/biome format --write .
    

5.  **Run tests:**
    bash
    npm run test
    

6.  **Build for production:**
    bash
    npm run build
    

7.  **Load the extension in Chrome:**
    *   Open Chrome and go to `chrome://extensions/`.
    *   Enable "Developer mode" (toggle switch in the top right).
    *   Click "Load unpacked" (button in the top left).
    *   Select the `dist` folder (or your build output folder) from the project directory.

---


## 📜 Contributing Guidelines

We welcome contributions! Please read our [CONTRIBUTING.md](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/blob/main/.github/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

---


## ⚖️ License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0) - see the [LICENSE](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/blob/main/LICENSE) file for details.

---


## ❤️ Acknowledgements

*   Special thanks to Google for providing the powerful Gemini API.
*   Inspired by the need for greater accessibility in digital content consumption.
