# ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension

A sophisticated AI-powered Chrome extension that leverages Optical Character Recognition (OCR) and Text-to-Speech (TTS) to dynamically narrate web comic text.

Enhance your web comic reading with customizable voice, pitch, and speed, making the experience more accessible and engaging.

---

![Build Status](https://img.shields.io/github/actions/workflow/user/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/ci.yml?style=flat-square&logo=githubactions)
![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension?style=flat-square&logo=codecov)
![Tech Stack: JavaScript](https://img.shields.io/badge/Tech%20Stack-JavaScript-blue?style=flat-square&logo=javascript)
![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-red?style=flat-square&logo=creativecommons)
![GitHub Stars](https://img.shields.io/github/stars/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension?style=flat-square&logo=github)

[Star ⭐ this Repo](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension)

---

## Table of Contents

*   [Project Overview](#project-overview)
*   [Key Features](#key-features)
*   [Technology Stack](#technology-stack)
*   [Architecture](#architecture)
*   [Getting Started](#getting-started)
*   [Usage](#usage)
*   [Development & Contribution](#development--contribution)
*   [License](#license)
*   [Security](#security)

---

## Project Overview

ComicNarrate is a cutting-edge Chrome extension designed to revolutionize how users consume web comics. By integrating advanced AI capabilities, it automatically extracts text from web comic panels using OCR (powered by Gemini's Vision capabilities) and converts it into speech using Text-to-Speech (TTS) synthesis. Users can personalize their listening experience with a variety of voices, adjust pitch, and control playback speed.

---

## Key Features

*   **AI-Powered OCR:** Accurately extracts text from web comic images using Google Gemini Vision.
*   **Text-to-Speech (TTS) Synthesis:** Converts extracted text into natural-sounding speech.
*   **Customizable Voices:** Offers a selection of voices to choose from.
*   **Adjustable Speech Parameters:** Control pitch and playback speed for a tailored experience.
*   **Browser Extension:** Seamlessly integrates with the Chrome browser.
*   **Accessibility Focused:** Enhances comic reading for visually impaired users or those who prefer auditory content.

---

## Technology Stack

*   **Core Language:** JavaScript (ES6+)
*   **Framework/Libraries:** Vanilla JS, Web Extension APIs
*   **AI Integration:** Google Gemini API (OCR capabilities)
*   **TTS Engine:** Browser's Web Speech API or external service integration
*   **Build Tools:** Vite (for development builds and optimization)
*   **Linting/Formatting:** Ruff (unified Python tool, adapted for JS tooling awareness)
*   **Testing:** Vitest (for unit testing), Playwright (for E2E testing)

---

## Architecture

ComicNarrate employs a modular, event-driven architecture optimized for browser extensions.

mermaid
graph TD
    A[Content Script] --> B{OCR Service Call (Gemini Vision)}
    B --> C{Text Extraction & Processing}
    C --> D{TTS Service Call (Web Speech API/External)}
    D --> E[Audio Playback]
    A --> F[UI Script/Popup]
    F --> G{User Configuration}
    G --> A


**Key Architectural Principles:**
*   **Modularity:** Each component (OCR, TTS, UI, Configuration) is designed for independent development and testing.
*   **Event-Driven:** Communication between different parts of the extension (e.g., content script, background script, popup) is handled asynchronously via messages and events.
*   **Client-Side Focus:** Primarily runs within the browser, minimizing server-side dependencies for core functionality.

---

## <details>
<summary>🤖 AI AGENT DIRECTIVES (DECEMBER 2025 EDITION)</summary>

**SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)**

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

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript/JavaScript)**
    *   **Stack:** This project leverages **JavaScript (ES6+)**, with **Vite** for development builds and optimization. Future-proofing suggests considering TypeScript. Core extension APIs are standard. **Google Gemini API** is integral for OCR. **Web Speech API** is used for TTS.
    *   **Architecture:** Adheres to a **Modular, Event-Driven Architecture** suitable for browser extensions, emphasizing clear separation of concerns via content scripts, background scripts, and popup UIs.
    *   **Linting/Formatting:** While Ruff is mentioned in the base, for JavaScript, **Biome** is the preferred ultra-fast linter and formatter for 2025 standards.
    *   **Testing:** **Vitest** for unit tests and **Playwright** for end-to-end (E2E) testing are the standard choices.

---

## 4. NAMING & VERSIONING CONVENTION (STAR VELOCITY ENGINE)

*   **Product Name:** `<Product-Name>-<Primary-Function>-<Platform>-<Type>`
*   **Format:** `Title-Case-With-Hyphens` (e.g., `ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension`).
*   **Versioning:** Semantic Versioning (SemVer) is mandatory.

---

## 5. CODE QUALITY & STANDARDS

*   **SOLID Principles:** Adhere to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
*   **DRY Principle:** Don't Repeat Yourself.
*   **YAGNI Principle:** You Ain't Gonna Need It - build only what is necessary.
*   **Linters & Formatters:** Integrate and enforce **Biome** for JavaScript. All code must pass linting and formatting checks.
*   **Type Safety:** Strongly recommend migrating to TypeScript for enhanced type safety and maintainability in complex JavaScript projects.

---

## 6. TESTING & VERIFICATION PROTOCOL

*   **Unit Testing:** Use **Vitest**. All new features must have corresponding unit tests.
*   **Integration Testing:** Mock dependencies where necessary. Use Vitest for integration tests.
*   **End-to-End (E2E) Testing:** Use **Playwright**. Simulate real user interactions within the browser environment.
*   **CI/CD Pipeline:** Automate testing and deployment using GitHub Actions.

---

## 7. SECURITY PROTOCOL (THE "FORTRESS" MANDATE)

*   **Dependency Scanning:** Regularly scan dependencies for vulnerabilities using `npm audit` or equivalent.
*   **API Key Management:** **NEVER** hardcode API keys. Use environment variables or secure browser extension storage mechanisms. Implement rate limiting and proper error handling for external API calls (e.g., Gemini).
*   **Input Sanitization:** Sanitize all user inputs and data received from external sources to prevent injection attacks.
*   **Least Privilege:** Grant only necessary permissions to the browser extension.
*   **Privacy:** Ensure user data is handled ethically and transparently, adhering to privacy regulations.

---

## 8. DOCUMENTATION & KNOWLEDGE MANAGEMENT

*   **README.md:** Comprehensive project overview, setup, usage, and contribution guidelines.
*   **AGENTS.md:** This document detailing AI agent directives and project standards.
*   **Code Comments:** Well-commented code, especially for complex logic or non-obvious implementations.
*   **Architecture Diagrams:** Maintain up-to-date diagrams (e.g., using Mermaid).

---

## 9. CONTRIBUTION GUIDELINES (THE "COLLABORATIVE EDGE")

*   **Fork & Clone:** Follow standard GitHub contribution workflow.
*   **Branching Strategy:** Use feature branches (e.g., `feature/your-new-feature`).
*   **Pull Requests:** Submit clear, concise Pull Requests with detailed descriptions.
*   **Code Reviews:** All PRs require review and approval.
*   **Issue Tracker:** Utilize GitHub Issues for bug reports and feature requests.

---

## 10. DEPLOYMENT & MAINTENANCE (VELOCITY TO PRODUCTION)

*   **CI/CD:** GitHub Actions to automate builds, tests, and deployments to Chrome Web Store (manual steps may be required).
*   **Release Management:** Follow SemVer for releases.
*   **Monitoring:** Implement basic logging and error tracking within the extension.

---

## 11. ARCHIVAL PROTOCOL (THE "RETIRED PRODUCT" STANDARD)

*   **No "Junk":** Archived repositories are considered "Retired Products."
*   **Professionalism:** Maintain professional metadata (Name, Description, Topics) even upon archival.
*   **Value Preservation:** Ensure documentation remains accurate and accessible for historical reference.

</details>

---

## Getting Started

### Prerequisites

*   Google Chrome browser
*   Node.js (v18+ recommended)
*   npm or yarn
*   A Google Cloud project with Gemini API enabled and an API key.

### Installation

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension.git
    cd ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension
    

2.  **Install dependencies:**
    bash
    npm install
    # or
    # yarn install
    

3.  **Set up API Key:**
    Create a `.env` file in the root directory and add your Gemini API key:
    
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    
    *(Note: For production, API keys should be managed more securely, e.g., via Chrome's sync storage API with appropriate security measures or server-side processing if feasible.)*

4.  **Load the extension:**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable "Developer mode" (toggle switch in the top-right corner).
    *   Click "Load unpacked" and select the `dist` folder (or the folder containing your built extension files after running the build command).

---

## Usage

1.  Navigate to a web comic page.
2.  Click the ComicNarrate extension icon in your Chrome toolbar.
3.  The extension will attempt to detect comic panels and extract text.
4.  The extracted text will be read aloud using the default TTS settings.
5.  Access the extension's popup to customize voice, pitch, and speed.

---

## Development & Contribution

### Setup

Follow the Installation steps above.

### Development Scripts

| Script      | Description                                       |
| :---------- | :------------------------------------------------ | 
| `npm run dev` | Starts the Vite development server for the extension. |
| `npm run build`| Builds the extension for production.              |
| `npm run lint` | Runs the linter (Biome) to check code quality.    |
| `npm run test` | Runs unit and integration tests using Vitest.      |
| `npm run test:e2e` | Runs end-to-end tests using Playwright.         |

### Contributing

Contributions are welcome! Please refer to the [CONTRIBUTING.md](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/blob/main/.github/CONTRIBUTING.md) file for detailed guidelines on how to submit pull requests and report issues.

---

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**.

See the [LICENSE](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/blob/main/LICENSE) file for more details.

---

## Security

We take security seriously. Please refer to the [SECURITY.md](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/blob/main/.github/SECURITY.md) file for our security policy and reporting guidelines.

