# CONTRIBUTING TO ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension

We welcome contributions to `ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension`! This project adheres to the Apex Technical Authority standards, ensuring high velocity, zero defects, and future-proof development.

## 1. OUR PHILOSOPHY

*   **Zero-Defect, High-Velocity, Future-Proof:** Every contribution should aim for quality, speed, and long-term maintainability.
*   **Professionalism:** We maintain FAANG-level standards and operate with absolute precision.
*   **Clarity:** Communicate intent and logic clearly.

## 2. CODE OF CONDUCT

This project adheres to the Contributor Covenant Code of Conduct. Please read the [CODE_OF_CONDUCT.md](https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension/blob/main/CODE_OF_CONDUCT.md) to understand the principles of respectful engagement.

## 3. DEVELOPMENT ENVIRONMENT SETUP

To contribute, you'll need to set up your local development environment. This project uses standard JavaScript/TypeScript tooling.

1.  **Fork this repository:** Create your own fork of `https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension`.
2.  **Clone your fork:**
    bash
    git clone https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension.git
    cd ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension
    
3.  **Install Dependencies:**
    bash
    npm install
    # Or if using yarn:
    # yarn install
    
4.  **Set up Browser Extension Development:** Follow Chrome Extension development guides for loading the unpacked extension locally.

## 4. CONTRIBUTING WORKFLOW

1.  **Identify an Issue or Feature:** Browse the existing issues on the project's GitHub page. If you have an idea for a new feature or improvement, please open an issue first to discuss it.
2.  **Create a New Branch:** For any new feature or bug fix, create a dedicated branch:
    bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/your-bug-fix-description
    
3.  **Make Your Changes:** Implement your changes, adhering to the project's coding style and architectural principles.
    *   **Linting & Formatting:** This project uses Biome for linting and formatting. Ensure your code adheres to these standards. Run `npm run lint` and `npm run format` to check and fix.
    *   **Testing:** Write comprehensive tests for your changes. Run `npm test` to execute the test suite.
4.  **Commit Your Changes:** Commit your work with clear, descriptive messages.
    bash
    git add .
    git commit -m "feat: Add new voice customization option"
    # Or for a bug fix:
    # git commit -m "fix: Resolve issue with OCR on certain comic formats"
    
5.  **Push to Your Fork:** Push your branch to your fork on GitHub.
    bash
    git push origin feature/your-feature-name
    
6.  **Open a Pull Request (PR):** Navigate to the original repository (`https://github.com/chirag127/ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension`) and open a new Pull Request. Ensure your PR targets the `main` branch and clearly describes your changes, the problem they solve, and how to test them.

## 5. CODE STANDARDS & ARCHITECTURE

*   **Technology Stack:** This project is built with **JavaScript/TypeScript**, leveraging modern browser extension APIs and potentially UI frameworks. Adherence to the latest ECMAScript standards is expected.
*   **Architecture:** The project follows best practices for browser extensions, emphasizing modularity, performance, and security. Key architectural principles include:
    *   **DRY (Don't Repeat Yourself):** Avoid redundant code.
    *   **SOLID Principles:** Apply object-oriented design principles where applicable.
    *   **Separation of Concerns:** Maintain distinct responsibilities for background scripts, content scripts, and UI components.
    *   **Asynchronous Operations:** Gracefully handle asynchronous tasks, especially those involving browser APIs, OCR, and TTS.
*   **Testing:** All new features must be accompanied by unit tests. E2E tests should be considered for critical user flows. We use Vitest for unit testing and Playwright for E2E testing.
*   **Linting:** Biome is used to enforce code style and catch potential errors. Ensure your code passes Biome checks.

## 6. AI AGENT DIRECTIVES

This project integrates with AI services, specifically Google Gemini OCR and TTS. Contributions involving AI components must:

*   **Adhere to `AGENTS.md`:** Understand and follow the directives outlined in the `AGENTS.md` file.
*   **API Key Management:** Never commit API keys directly into the codebase. Utilize environment variables or secure configuration methods.
*   **Error Handling:** Implement robust error handling for all AI API calls, considering network issues, rate limits, and unexpected responses.
*   **Performance:** Be mindful of the performance implications of AI processing, especially within a browser extension context. Optimize where possible.

## 7. SUBMITTING A PULL REQUEST

Your Pull Request should include:

*   A clear title and description.
*   References to any related GitHub issues.
*   A description of how to test your changes.
*   Confirmation that tests are passing and linting rules are satisfied.

## 8. GETTING HELP

If you have questions or need clarification, please open an issue or use the project's discussion forum (if available).

Thank you for contributing to `ComicNarrate-AI-Web-Comic-Dubber-Browser-Extension`!
