# P-Search AI — Project Structure

## 📁 Folder Structure

```
P-Search-AI/
│
├── index.html          ← Landing page (home)
├── auth.html           ← Login / Register page (fixed ✅)
├── chatbot.html        ← Main chat interface
│
├── styles.css          ← Main chatbot styles
├── profile.css         ← Profile page styles
├── image.css           ← Image preview popup styles
├── temp-chat.css       ← Temporary chat styles
├── library.css         ← Library page styles
├── voice.css           ← Voice call UI styles
│
├── script.js           ← Main chatbot logic
├── api.js              ← Backend API handler (MongoDB/Render)
├── profile.js          ← Profile page logic
├── temp-chat.js        ← Temporary chat logic
├── library.js          ← Library page logic
├── image.js            ← Image preview popup logic
├── voice.js            ← Voice call logic
│
├── sw.js               ← Service Worker (PWA offline support)
├── manifest.json       ← PWA manifest
│
├── firebase.json       ← Firebase hosting config
├── _firebaserc         ← Firebase project config
│
└── icons/              ← PWA icons folder
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## 🔧 Changes Made
- **auth.html** — Lock icon fixed (vertically centered), Eye button inside input field, Google login removed

## 🚀 Firebase Deploy
```bash
firebase deploy
```

## 🌐 Backend
- Render: `https://p-search-ai.onrender.com/api`
