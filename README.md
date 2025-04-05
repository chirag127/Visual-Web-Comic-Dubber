# 📘 Visual Web Comic Dubber

## ✨ Description

A Chrome extension that detects speech bubbles in web comics using OCR (Google Gemini 2.0 Flash API), reads them aloud using the Web Speech API (Text-to-Speech), and allows users to customize voice, speed, and pitch. Users can enjoy web comics in an audio-visual format, with automatic character voice assignments and seamless playback.

## 🚀 Live Demo

[Visit the Visual Web Comic Dubber Website](https://chirag127.github.io/Visual-Web-Comic-Dubber/)

## 🧰 Features

-   Detects speech bubbles in web comics
-   Extracts text using OCR (Google Gemini 2.0 Flash API)
-   Reads text aloud using Web Speech API
-   Customizable voice, speed, and pitch
-   Character-specific voice assignment
-   Floating UI controls

## 📌 Project Structure

```
project-root/
│
├── extension/         # Chrome Extension Frontend
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── ui/
│   │   ├── settings.html
│   │   └── settings.js
│   └── assets/
│       └── styles.css
│
└── backend/           # Node.js Backend for OCR
    ├── server.js
    ├── routes/ocr.js
    ├── services/geminiOCR.js
    └── .env
```

## 💾 Installation Instructions

### Backend Setup

1. Navigate to the backend directory:

    ```
    cd backend
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file based on `.env.example`:

    ```
    cp .env.example .env
    ```

4. Get a Gemini API key from [Google AI Studio](https://ai.google.dev/) and add it to the `.env` file.

5. Start the server:
    ```
    npm start
    ```

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable "Developer mode" by toggling the switch in the top right corner

3. Click "Load unpacked" and select the `extension` directory

4. The extension should now be installed and visible in your Chrome toolbar

## 🔧 Usage

1. Navigate to a web comic page

2. Click the extension icon in the toolbar to open the popup

3. Use the controls to play, pause, or stop the text-to-speech

4. Click the settings icon to customize voice, speed, and pitch

5. For advanced settings, click "Advanced Settings" in the popup

## 🔨 Tech Stack / Tools Used

-   **Frontend**: JavaScript, HTML, CSS, Web Speech API, Chrome Extension API
-   **Backend**: Node.js, Express.js, Google Gemini 2.0 Flash API
-   **Development Tools**: Git, GitHub, VS Code

## 🛠️ Development

### Backend Development

```
cd backend
npm run dev
```

This will start the server with nodemon, which will automatically restart when changes are detected.

### Extension Development

Make changes to the extension files, then reload the extension in Chrome:

1. Navigate to `chrome://extensions/`
2. Find the Visual Web Comic Dubber extension
3. Click the refresh icon

## 📸 Screenshots

_Coming soon_

## 👋 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👪 License

MIT License - See LICENSE file for details.

## 👏 Acknowledgements

-   [Google Gemini 2.0 Flash API](https://ai.google.dev/)
-   [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
-   [Chrome Extension API](https://developer.chrome.com/docs/extensions/)

---

Developed with ❤️ by Chirag Singhal
