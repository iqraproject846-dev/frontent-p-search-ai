// script.js
document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // MODEL CONFIGURATIONS
    // ========================================
    const MODEL_CONFIGS = {
        default: {
            name: "P-Search AI",
            systemInstruction: `
You are P-Search AI.
- Always reply like a real human
- Friendly, natural, clear
- Be helpful and polite
- Language user ke hisab se use karo
-short and precise replies
- Always reply in uk english, no matter what language user uses to talk to you.
            `.trim()
        }
    };

    let currentModel = sessionStorage.getItem("currentModel") || "default";

    let inputValue = document.getElementById("inputText");
    let sendBtn = document.querySelector(".send-btn");
    let voiceBtn = document.querySelector(".waveform-btn");
    let messageContainer = document.querySelector(".message");
    let newChatBtn = document.querySelector(".newchatadd");
    let chatListContainer = document.querySelector(".history");
    let welcomeMessage = document.querySelector(".wecome-message");
    let inputField = document.querySelector(".chat-container-footer");
    let activeChatOptions = document.querySelector(".active-chat-options");
    let NewChatsOptions = document.querySelector(".chat-options");
    let chatOptions = document.querySelector(".chat-options");
    let activeChatOptionsDiv = document.querySelector(".active-chat-options");
    let hidechat = document.querySelector(".hideChat-hisBtn");
    let chathistory = document.querySelector(".history");
    let Showchat = document.querySelector(".ShowChat-hisBtn");
    let sidebar = document.querySelector(".sidebar");
    let sidebarBtn = document.querySelector(".sidebarBtn");
    let logo = document.querySelector(".logo");
    const searchBtn = document.querySelector('.box[title="Search chats"]');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('chatSearchInput');
    const filePreviewBar = document.querySelector(".file-preview-bar");
    const ThreeDots = document.querySelector(".three-dots");
    const barBtn = document.querySelector(".barBtn");
    const sidebarCloseBtn = document.querySelector(".sidebarBtn");
    const mainContainer = document.querySelector(".main-container");
    const currentModelName = document.getElementById("current-model-name");
    const appnameDiv = document.querySelector(".Appname");
    const modelDropdown = document.querySelector(".model-dropdown");

    appnameDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        modelDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!appnameDiv.contains(e.target)) {
            modelDropdown.classList.add("hidden");
        }
    });

    modelDropdown.addEventListener("click", (e) => {
        const modelItem = e.target.closest(".model-item");
        if (!modelItem) return;
        const selectedModel = modelItem.dataset.model;
        if (selectedModel === currentModel) { modelDropdown.classList.add("hidden"); return; }
        switchModel(selectedModel);
        modelDropdown.classList.add("hidden");
    });

    function switchModel(modelKey) {
        currentModel = modelKey;
        sessionStorage.setItem("currentModel", modelKey);
        currentModelName.textContent = MODEL_CONFIGS[modelKey].name;
        mainContainer.dataset.theme = modelKey;
        sidebar.dataset.theme = modelKey;
        document.querySelectorAll(".model-item").forEach(item => item.classList.remove("active"));
        document.querySelector(`[data-model="${modelKey}"]`).classList.add("active");
        loadModelChats();
    }

    function loadModelChats() {
        const modelChats = Object.keys(chats).filter(id => chats[id].model === currentModel);
        if (modelChats.length === 0) { createNewChat(); } else { loadChat(modelChats[modelChats.length - 1]); }
        updateChatList();
    }

    mainContainer.dataset.theme = currentModel;
    sidebar.dataset.theme = currentModel;
    currentModelName.textContent = MODEL_CONFIGS[currentModel].name;
    document.querySelector(`[data-model="${currentModel}"]`)?.classList.add("active");

    barBtn.addEventListener("click", () => { sidebar.classList.add("open"); });
    sidebarCloseBtn.addEventListener("click", () => { sidebar.classList.remove("open"); });

    let selectedFiles = [];

    chatListContainer.addEventListener("click", (e) => {
        if (window.innerWidth <= 768 && e.target.closest(".chat-item")) {
            setTimeout(() => { sidebar.classList.remove("open"); }, 200);
            ThreeDots.style.display = "block";
        }
    });

    newChatBtn.addEventListener("click", () => {
        if (window.innerWidth <= 768) { setTimeout(() => { sidebar.classList.remove("open"); }, 200); }
    });

    searchBtn.addEventListener("click", () => {
        searchBox.style.display = searchBox.style.display === "none" ? "block" : "none";
        searchInput.value = "";
        updateChatList();
    });

    searchInput.addEventListener("input", () => { filterChats(searchInput.value.toLowerCase().trim()); });

    function filterChats(query) {
        chatListContainer.innerHTML = "";
        Object.keys(chats).reverse().forEach(chatId => {
            const chat = chats[chatId];
            if (chat.model !== currentModel) return;
            const title = chat.title || "New Chat";
            const titleMatch = title.toLowerCase().includes(query);
            const messageMatch = chat.messages.some(m => m.text.toLowerCase().includes(query));
            if (!query || titleMatch || messageMatch) {
                const item = document.createElement("div");
                item.className = "chat-item";
                item.dataset.chatId = chatId;
                item.innerHTML = `<div class="chat-item-text">${highlight(title, query)}</div><i class="fa-solid fa-ellipsis cht-historyThreedots"></i>`;
                item.addEventListener("click", () => loadChat(chatId));
                chatListContainer.appendChild(item);
            }
        });
    }

    function highlight(text, query) {
        if (!query) return text;
        return text.replace(new RegExp(`(${query})`, "gi"), `<mark>$1</mark>`);
    }

    let globalDropdown = null;
    let moreDropdown = null;
    let dropdownChatId = null;
    let isAIResponding = false;
    let currentAbortController = null;
    let lastUserMessageElement = null;

    barBtn.style.display = "none";

    sidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        inputField.classList.toggle("input-shifted");
        filePreviewBar.classList.toggle("file-preview-bar-shifted");
        if (sidebar.classList.contains("collapsed")) {
            logo.style.display = "none"; Showchat.style.display = "none"; chathistory.style.display = "none";
        } else {
            logo.style.display = "block"; chathistory.style.display = "block";
        }
    });

/* NAYA */
function autoResizeTextarea() {
    inputValue.style.height = "auto";
    const newHeight = Math.min(inputValue.scrollHeight, 160);
    inputValue.style.height = newHeight + "px";
    
    const inputFieldEl = document.querySelector(".input-field");
    if (inputFieldEl) {
        inputFieldEl.style.height = newHeight + 16 + "px";
    }
}
    inputValue.addEventListener("input", autoResizeTextarea);
    inputValue.style.height = "40px";

    Showchat.addEventListener("click", () => { hidechat.style.display = "inline-block"; Showchat.style.display = "none"; chathistory.style.display = "none"; });
    hidechat.addEventListener("click", () => { hidechat.style.display = "none"; Showchat.style.display = "inline-block"; chathistory.style.display = "block"; });

    const welcomeQuotes = [
        "What's on the agenda today?", "Hello! Ready to chat?",
        "New adventures await. Let's talk!", "Hey there! What shall we discuss today?",
        "Good day! How can I help you today?", "Time to brainstorm! What's on your mind?",
        "Let's get started! Ask me anything.", "Welcome back! What would you like to do today?",
    ];

    function getRandomWelcomeMessage() {
        return welcomeQuotes[Math.floor(Math.random() * welcomeQuotes.length)];
    }

    const API_KEYS = [
        "AIzaSyCJOFoeAjCcNT9ZR4XrzhF8TeR8OGeREY8",
        "AIzaSyAV17KTNvv77iGdVrM_YDJyD_vP4vDWKvo",
        "AIzaSyDvNyLdp4s4-p_X9Io8D9TJ_bOs0iTKUlw",
        "AIzaSyBoyaFpo9A6tpAJ8DuAXAhF8WN7TdhO7zk",
        "AIzaSyBTfh8At8y2osgqiVolpUinCBS42vvnGEc",
        "AIzaSyBy_NXAr23wHhE1nyu89cagzwLHG4baCrg",
        "AIzaSyDLThxryaKtqNoam9Anx2KTq4yhyMMAxUc",
        "AIzaSyC0K7GrhhFAE-lEGzBvw56r6b_RacG_aRc",
        "AIzaSyC4yze0-il6ykzFbP55IoF5BfYaluf5ZwA",
        "AIzaSyB3bVyVMbNtH1FKm289r8YASaL6L3reH9E",
        "AIzaSyBG4VeO8u9zBVYNG-7UgcqxoRJ53KnD8n8",
        "AIzaSyC1wtKMrR7x5IQpaEFj2oOqijMFGOMvAoA",
        "AIzaSyDhzPUkEPtXd_VBdH4zM8bdUw6KP988UHI",
        "AIzaSyDlVHYfBZqnTm2LVTFO5D4GxBgow_YTzXw",
        "AIzaSyD4iB_XByPZAPqj8sgdGwuOmrxKMyXXDPE",
        "AIzaSyCkmlcBceGMjmn50zASKeJj91T9FnSsDJU",
        "AIzaSyDm19TDuddYSEmGpAE680_cCQvK_X5Jm_E",
        "AIzaSyBy_NXAr23wHhE1nyu89cagzwLHG4baCrg"
    ];

    let currentKeyIndex = 0;

    function getGeminiURL() {
        return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEYS[currentKeyIndex]}`;
    }

    function getSystemInstruction() {
        return { role: "user", parts: [{ text: MODEL_CONFIGS[currentModel].systemInstruction }] };
    }

    sendBtn.style.display = "none";
    messageContainer.style.display = "none";
    activeChatOptionsDiv.style.display = "none";
    chatOptions.style.display = "flex";
    activeChatOptions.style.display = "flex";
    NewChatsOptions.style.display = "none";

    let firstMessageSent = false;
    let chats = {};

    // MongoDB se chats load karo
    async function loadChatsFromDB() {
        try {
            if (!window.API || typeof window.API.getAllChats !== 'function') { 
    await createNewChat(); 
    return; 
}
if (!window.__firebaseCurrentUser) {
        
            // Firebase ready hone ka wait karo
            await new Promise(r => setTimeout(r, 1000));
            if (!window.__firebaseCurrentUser) { await createNewChat(); return; }
        }
            const result = await window.API.getAllChats();
            result.chats.forEach(c => {
                chats[c.chatId] = {
                    title: c.title,
                    messages: [],
                    firstMessageSent: c.firstMessageSent,
                    pinned: c.pinned,
                    model: c.model,
                    isTemp: c.isTemp,
                };
            });
            updateChatList();
            // Active chat load karo
            const activeChatId = sessionStorage.getItem("activeChatId");
            if (activeChatId && chats[activeChatId]) {
                loadChat(activeChatId);
            } else {
                const modelChats = Object.keys(chats).filter(id => chats[id].model === currentModel);
                if (modelChats.length > 0) loadChat(modelChats[modelChats.length - 1]);
                else await createNewChat();
            }
        } catch (e) {
            console.warn("DB load failed:", e.message);
            createNewChat();
        }
    }
    let currentChatId = null;

    function saveChats() {
        // localStorage hatao — MongoDB mein save hota hai sendHandler mein
        console.log("✅ Chats in memory updated");
    }

    activeChatOptionsDiv.style.display = "none";
    NewChatsOptions.style.display = "flex";

    inputValue.addEventListener("input", () => {
        if (inputValue.value.trim().length > 0 || selectedFiles.length > 0) {
            sendBtn.style.display = "block"; voiceBtn.style.display = "none";
        } else {
            sendBtn.style.display = "none"; voiceBtn.style.display = "block";
        }
    });

    function fixInputField() {
        if (!firstMessageSent) {
            inputField.classList.add("input-fixed-bottom");
            firstMessageSent = true;
            if (currentChatId && chats[currentChatId]) { chats[currentChatId].firstMessageSent = true; saveChats(); }
        }
        welcomeMessage.style.display = "none";
        messageContainer.style.display = "flex";
        activeChatOptionsDiv.style.display = "flex";
        chatOptions.style.display = "none";
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ✅ FIX: blobToBase64 — sendVoiceMessage se PEHLE define karo
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(blob);
        });
    }

    function addUserMessage(text, imageData = null) {
        let msgWrapper = document.createElement("div");
        msgWrapper.classList.add("user-message-wrapper");
        let imageHTML = imageData ? `<div class="user-image-container"><img src="${imageData}" alt="Uploaded" class="user-uploaded-image" /></div>` : '';
        msgWrapper.innerHTML = `<div class="user-message-wrapper">${imageHTML}${text ? `<div class="userMess"><span>${text}</span></div>` : ''}</div><div class="msg-actions user-actions"><button class="copy-btn" title="Copy"><i class="fa-regular fa-copy"></i></button><button class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button></div>`;
        messageContainer.appendChild(msgWrapper);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        chats[currentChatId].messages.push({ sender: "user", text: text || "", image: imageData || null });
        saveChats();
        return msgWrapper;
    }

    async function sendHandler() {
        if (isAIResponding) return;
        let text = inputValue.value.trim();
        // Chat exist nahi karta toh wait karo
        if (!currentChatId || !chats[currentChatId]) {
            console.warn("Chat not ready, creating new...");
            await createNewChat();
            await new Promise(r => setTimeout(r, 500));
        }
        if (!currentChatId || !chats[currentChatId]) {
            console.error("Chat still not ready!");
            isAIResponding = false;
            toggleSendCancel(false);
            return;
        }

        isAIResponding = true;
        toggleSendCancel(true);

        let fileDisplayData = null;
        let fileParts = [];

        if (selectedFiles.length > 0) {
            try {
                const firstFile = selectedFiles[0];
                fileDisplayData = { type: firstFile.type, name: firstFile.name, data: await fileToBase64(firstFile) };

                for (let file of selectedFiles) {
                    const base64 = await fileToBase64(file);
                    const base64Data = base64.split(',')[1];
                    let mimeType = file.type;
                    const supportedTypes = {
                        'image/png': true, 'image/jpeg': true, 'image/webp': true, 'image/heic': true, 'image/heif': true,
                        'video/mp4': true, 'video/mpeg': true, 'video/mov': true, 'video/avi': true, 'video/x-flv': true,
                        'video/mpg': true, 'video/webm': true, 'video/wmv': true, 'video/3gpp': true,
                        'audio/wav': true, 'audio/mp3': true, 'audio/aiff': true, 'audio/aac': true, 'audio/ogg': true, 'audio/flac': true,
                        'application/pdf': true, 'text/plain': true, 'text/html': true, 'text/css': true,
                        'text/javascript': true, 'application/x-javascript': true, 'text/x-typescript': true,
                        'application/x-typescript': true, 'text/csv': true, 'text/markdown': true,
                        'text/x-python': true, 'application/x-python-code': true, 'application/json': true,
                        'text/xml': true, 'application/rtf': true,
                    };
                    if (!supportedTypes[mimeType]) {
                        if (file.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                        else if (file.name.endsWith('.pptx')) mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                        else if (file.name.endsWith('.xlsx')) mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                        else { console.warn("⚠️ Unsupported MIME type:", mimeType); continue; }
                    }
                    fileParts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
                }
            } catch (error) {
                console.error("❌ File processing error:", error);
                isAIResponding = false; toggleSendCancel(false);
                alert("Error processing file. Please try again.");
                return;
            }
        }

        lastUserMessageElement = addUserMessageWithFile(text, fileDisplayData);

        // Title backend se automatically aata hai — local bhi update karo
        if (chats[currentChatId] && !chats[currentChatId].title) {
            chats[currentChatId].title = "New Chat";
            updateChatList();
        }

        fixInputField();
        inputValue.value = "";
        selectedFiles = [];
        renderFilePreview();

        let loaderDiv = addThinkingLoader();
        currentAbortController = new AbortController();

        try {
            // Pehle MongoDB mein message save karo aur AI response wahan se lo
            if (window.API && window.__firebaseCurrentUser) {
                try {
                    const result = await window.API.sendMessage(
                        currentChatId,
                        text || "",
                        fileDisplayData?.data || null,
                        null,
                        currentModel
                    );
                    loaderDiv.remove();
                    // Backend se AI response use karo
                    addBotMessage(result.aiMessage.text);

                    // Title update karo agar mila
                    if (result.chatTitle && chats[currentChatId]) {
                        chats[currentChatId].title = result.chatTitle;
                        updateChatList();
                    }
                } catch (e) {
                    console.warn("⚠️ Backend failed, using Gemini directly:", e.message);
                    // Fallback: seedha Gemini se
                    let aiRawText = await getAIResponse(text, fileParts, currentAbortController.signal);
                    loaderDiv.remove();
                    addBotMessage(aiRawText);
                }
            } else {
                // Backend nahi hai toh seedha Gemini
                let aiRawText = await getAIResponse(text, fileParts, currentAbortController.signal);
                loaderDiv.remove();
                addBotMessage(aiRawText);
            }
        } catch (err) {
            loaderDiv.remove();
            console.error("❌ AI ERROR:", err);
            alert("AI analysis failed. Please try again.");
        }

        isAIResponding = false;
        toggleSendCancel(false);
    }

    const cancelBtn = document.querySelector(".cancel-btn");

    function toggleSendCancel(isLoading) {
        if (isLoading) { sendBtn.style.display = "none"; voiceBtn.style.display = "none"; cancelBtn.style.display = "block"; }
        else { cancelBtn.style.display = "none"; sendBtn.style.display = "none"; voiceBtn.style.display = "block"; }
    }

    cancelBtn.addEventListener("click", () => {
        if (currentAbortController) currentAbortController.abort();
        document.querySelector(".thinking")?.remove();
        if (lastUserMessageElement) { lastUserMessageElement.remove(); lastUserMessageElement = null; }
        if (chats[currentChatId]?.messages.length) {
            const lastMsg = chats[currentChatId].messages.at(-1);
            if (lastMsg.sender === "user") { inputValue.value = lastMsg.text; chats[currentChatId].messages.pop(); saveChats(); }
        }
        selectedFiles = []; renderFilePreview();
        isAIResponding = false; toggleSendCancel(false);
    });

    function updateChatList() {
        chatListContainer.innerHTML = "";
        const pinned = [], normal = [];
        Object.keys(chats).forEach(id => {
            if (chats[id].model !== currentModel) return;
            if (chats[id].pinned) pinned.push(id); else normal.push(id);
        });
        normal.reverse(); pinned.reverse();
        [...pinned, ...normal].forEach(id => {
            const chat = chats[id];
            const item = document.createElement("div");
            item.classList.add("chat-item");
            item.innerHTML = `<div class="chat-item-text">${chat.title || "New Chat"}</div>${chat.pinned ? '<i class="fa-solid fa-thumbtack pinned-icon"></i>' : ''}<i class="fa-solid fa-ellipsis cht-historyThreedots"></i>`;
            item.onclick = () => loadChat(id);
            chatListContainer.appendChild(item);
        });
    }

    async function loadChat(chatId) {
        currentChatId = chatId;
        sessionStorage.setItem("activeChatId", chatId);

        // MongoDB se messages fetch karo agar memory mein nahi hain
        if (!chats[chatId]) return;
        if (chats[chatId].messages.length === 0) {
            try {
        if (window.API && typeof window.API.getChat === 'function') {
            const result = await window.API.getChat(chatId);
            chats[chatId].messages = result.chat.messages || [];
        }
    } catch (e) {
        console.warn("Messages load failed:", e.message);
    }
        }

        let chat = chats[chatId];
        resetUI(true);
        chat.messages.forEach((m) => {
            if (m.sender === "user") renderUserMessage(m.text, m.image, m.isVoice, m.audioUrl);
            else renderBotMessage(m.text);
        });
        messageContainer.style.display = chat.messages.length > 0 ? "flex" : "none";
        if (chat.messages.length > 0) {
            welcomeMessage.style.display = "none"; inputField.classList.add("input-fixed-bottom"); firstMessageSent = true;
        } else {
            welcomeMessage.innerText = getRandomWelcomeMessage(); welcomeMessage.style.display = "block";
            inputField.classList.remove("input-fixed-bottom"); firstMessageSent = false;
        }
        updateHeaderUI(chat);
    }




    async function createNewChat() {
        try {
            if (window.API && window.__firebaseCurrentUser) {
                const result = await window.API.createChat({ model: currentModel });
                const chatId = result.chat.chatId;
                chats[chatId] = { title: "", messages: [], firstMessageSent: false, pinned: false, model: currentModel };
                currentChatId = chatId;
                sessionStorage.setItem("activeChatId", chatId);
            } else {
                // Fallback
                const chatId = "chat_" + Date.now();
                chats[chatId] = { title: "", messages: [], firstMessageSent: false, pinned: false, model: currentModel };
                currentChatId = chatId;
                sessionStorage.setItem("activeChatId", chatId);
            }
        } catch (e) {
            const chatId = "chat_" + Date.now();
            chats[chatId] = { title: "", messages: [], firstMessageSent: false, pinned: false, model: currentModel };
            currentChatId = chatId;
            sessionStorage.setItem("activeChatId", chatId);
        }
        saveChats(); resetUI(false); updateChatList();
        welcomeMessage.innerText = getRandomWelcomeMessage(); welcomeMessage.style.display = "block";
        updateHeaderUI(chats[currentChatId]);
    }

    function resetUI(isLoadingOld = false) {
        inputField.classList.remove("input-fixed-bottom");
        inputValue.value = ""; sendBtn.style.display = "none"; voiceBtn.style.display = "block";
        if (!isLoadingOld) welcomeMessage.style.display = "block";
        messageContainer.innerHTML = ""; messageContainer.style.display = "none";
        firstMessageSent = false; selectedFiles = []; renderFilePreview();
    }

    newChatBtn.addEventListener("click", () => {
        if (currentChatId && chats[currentChatId]?.messages?.length === 0) {
            showModal({ title: "Empty Chat", message: "Current chat is empty. Please send a message first.", yesText: "OK", noText: "Cancel" });
            return;
        }
        createNewChat();
    });

    // MongoDB se load karo
    // Page load hone ke baad immediately load karo
loadChatsFromDB();

    function addBotMessage(rawText) {
        let botWrapper = document.createElement("div");
        botWrapper.classList.add("bot-message-wrapper");
        botWrapper.innerHTML = `<div class="botMess">${formatAIText(rawText)}</div><div class="msg-actions bot-actions"><button class="copy-btn" title="Copy"><i class="fa-regular fa-copy"></i></button><button class="like-btn" title="Like"><i class="fa-regular fa-thumbs-up"></i></button><button class="dislike-btn" title="Dislike"><i class="fa-regular fa-thumbs-down"></i></button><button class="regen-btn" title="Regenerate"><i class="fa-solid fa-rotate-right"></i></button></div>`;
        messageContainer.appendChild(botWrapper);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        if (chats[currentChatId]) {
            chats[currentChatId].messages.push({ sender: "ai", text: rawText });
        }
    }

    async function generateTitleFromAI(userText) {
        const prompt = `Give ONLY a short chat title.\nRules:\n- Maximum 4 words\n- No punctuation\n- No quotes\n- No emojis\n- No explanation\n- Just plain words\n\nUser message:\n${userText}`;
        try {
            const aiResponse = await getAIResponse(prompt, []);
            if (!aiResponse) return createFallbackTitle(userText);
            let title = aiResponse.replace(/["'`]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").trim().split(" ").slice(0, 4).join(" ");
            return title.length < 3 ? createFallbackTitle(userText) : capitalizeTitle(title);
        } catch (err) { return createFallbackTitle(userText); }
    }

    function createFallbackTitle(text) {
        return capitalizeTitle(text.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(" ").slice(0, 4).join(" ")) || "New Chat";
    }

    function capitalizeTitle(str) {
        return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }

    function addThinkingLoader() {
        messageContainer.style.display = "flex";
        let loader = document.createElement("div");
        loader.classList.add("botMess", "thinking");
        loader.innerHTML = `<div class="thinking-indicator"><span></span><span></span><span></span></div>`;
        messageContainer.appendChild(loader);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        return loader;
    }

    async function getAIResponse(userText, imageParts = [], signal) {
        let attempts = API_KEYS.length;
        while (attempts > 0) {
            try {
                let chatHistory = chats[currentChatId].messages.map(msg => ({ role: msg.sender === "user" ? "user" : "model", parts: [{ text: msg.text || "" }] }));
                let parts = [];
                if (imageParts && imageParts.length > 0) parts.push(...imageParts);
                if (userText && userText.trim()) parts.push({ text: userText });
                else if (imageParts.length > 0) parts.push({ text: "Describe this image." });
                else parts.push({ text: userText || "" });
                let contents = [getSystemInstruction(), ...chatHistory, { role: "user", parts: parts }];
                let response = await fetch(getGeminiURL(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents }), signal });
                let data = await response.json();
                if (!response.ok || data.error) throw new Error("API error");
                return data?.candidates?.[0]?.content?.parts?.[0]?.text;
            } catch (err) {
                if (signal && signal.aborted) throw err;
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                attempts--;
            }
        }
        throw new Error("AI failed completely");
    }

    // ✅ FIX: sirf ek listener — recording bhi handle karta hai, normal send bhi
    // Purana sendBtn.addEventListener("click", sendHandler) HATA diya
    sendBtn.addEventListener("click", async function (e) {
        if (isRecording) {
            await stopAndSendRecording();
        } else {
            await sendHandler();
        }
    });

    inputValue.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendHandler(); } });

   function formatAIText(text) {
    return text.split(/(```[\s\S]*?```)/g).map(part => {
        if (part.startsWith("```")) {
            const match = part.match(/```(\w+)?/);
            const lang = match && match[1] ? match[1] : "plaintext";
            const code = part.replace(/```(\w+)?\n?/, "").replace(/```$/, "").trim();
            const escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const blockId = "cb_" + Math.random().toString(36).substr(2, 8);
            return `<div class="code-block" id="${blockId}">
                <div class="code-header">
                    <span class="code-lang">${lang}</span>
                    <button class="code-copy-btn" data-target="${blockId}">
                        <i class="fa-regular fa-copy"></i> Copy
                    </button>
                </div>
                <pre><code>${escapedCode}</code></pre>
            </div>`;
        }
        return part
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
            .replace(/\*(.*?)\*/g, "<i>$1</i>")
            .split("\n")
            .map(line => line.trim() ? `<p>${line}</p>` : "")
            .join("");
    }).join("");
}

    function openChatDropdown(x, y, chatId) {
        closeGlobalDropdown(); dropdownChatId = chatId;
        globalDropdown = document.createElement("div");
        globalDropdown.className = "chat-dropdown";
        globalDropdown.innerHTML = `<div class="item" data-action="pin"><i class="fa-solid fa-thumbtack"></i>${chats[chatId].pinned ? "Unpin Chat" : "Pin Chat"}</div><div class="item" data-action="rename"><i class="fa-solid fa-pen"></i> Rename</div><div class="item" data-action="archive"><i class="fa-solid fa-box-archive"></i> Archive</div><div class="item" data-action="more"><i class="fa-solid fa-ellipsis"></i> More Options</div><hr class="dropdown-divider"/><div class="item delete" data-action="delete"><i class="fa-solid fa-trash"></i> Delete</div>`;
        document.body.appendChild(globalDropdown);
        globalDropdown.style.top = y + "px"; globalDropdown.style.left = x + "px";
        globalDropdown.onclick = handleDropdownAction;
    }

    function closeGlobalDropdown() { if (globalDropdown) { globalDropdown.remove(); globalDropdown = null; dropdownChatId = null; } }

    ThreeDots.addEventListener("click", (e) => { e.stopPropagation(); if (!currentChatId) return; openChatDropdown(e.clientX - 160, e.clientY, currentChatId); });

    async function deleteCurrentChat() {
        if (!currentChatId) return;
        try {
            if (window.API && window.__firebaseCurrentUser) {
                await window.API.deleteChat(currentChatId);
            }
        } catch (e) { console.warn("DB delete failed:", e.message); }
        delete chats[currentChatId]; updateChatList(); messageContainer.innerHTML = "";
        const remaining = Object.keys(chats).filter(id => chats[id].model === currentModel);
        if (remaining.length > 0) loadChat(remaining[remaining.length - 1]); else createNewChat();
    }

    function updateHeaderUI(chat) {
        if (chat.messages.length > 0) { chatOptions.style.display = "none"; activeChatOptionsDiv.style.display = "flex"; }
        else { chatOptions.style.display = "flex"; activeChatOptionsDiv.style.display = "none"; }
    }

    const modalOverlay = document.getElementById("modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const modalYes = document.getElementById("modal-yes");
    const modalNo = document.getElementById("modal-no");

    function showModal({ title = "Confirm", message = "", yesText = "Yes", noText = "No", onYes = () => { }, onNo = () => { } }) {
        modalTitle.innerText = title; modalMessage.innerText = message;
        modalYes.innerText = yesText; modalNo.innerText = noText;
        modalOverlay.classList.remove("modal-hidden");
        modalYes.onclick = () => { closeModal(); onYes(); };
        modalNo.onclick = () => { closeModal(); onNo(); };
    }

    function closeModal() { modalOverlay.classList.add("modal-hidden"); }
    async function togglePinChat(chatId) {
        chats[chatId].pinned = !chats[chatId].pinned;
        try {
            if (window.API && window.__firebaseCurrentUser) {
                await window.API.updateChat(chatId, { pinned: chats[chatId].pinned });
            }
        } catch (e) { console.warn("DB pin failed:", e.message); }
        updateChatList();
    }

    const renameModal = document.getElementById("rename-modal");
    const renameInput = document.getElementById("rename-input");
    const renameCancel = document.getElementById("rename-cancel");
    const renameOk = document.getElementById("rename-ok");
    let renameChatId = null;

    function openRenameModal(chatId) { renameChatId = chatId; renameInput.value = chats[chatId].title || ""; renameModal.classList.remove("modal-hidden"); renameInput.focus(); }
    function closeRenameModal() { renameModal.classList.add("modal-hidden"); renameChatId = null; }
    renameCancel.onclick = closeRenameModal;
    renameOk.onclick = async () => {
        const t = renameInput.value.trim();
        if (!t) return;
        chats[renameChatId].title = t;
        try {
            if (window.API && window.__firebaseCurrentUser) {
                await window.API.updateChat(renameChatId, { title: t });
            }
        } catch (e) { console.warn("DB rename failed:", e.message); }
        updateChatList(); closeRenameModal();
    };

    let chatDropdown = null;

    chatListContainer.addEventListener("click", (e) => {
        const dots = e.target.closest(".cht-historyThreedots");
        if (!dots) return;
        e.stopPropagation();
        const chatItem = dots.closest(".chat-item");
        const chatTitle = chatItem.querySelector(".chat-item-text").innerText;
        const chatId = Object.keys(chats).find(id => chats[id].title === chatTitle);
        if (!chatId) return;
        currentChatId = chatId; sessionStorage.setItem("activeChatId", chatId);
        closeChatDropdown();
        chatDropdown = document.createElement("div");
        chatDropdown.className = "chat-dropdown";
        chatDropdown.innerHTML = `<div class="item" id="pin"><i class="fa-solid fa-thumbtack"></i>${chats[chatId].pinned ? "Unpin Chat" : "Pin Chat"}</div><div class="sharechats item" id="share"><i class="fa-solid fa-share-nodes"></i> Share</div><div class="chatWithFriends item" id="chatwithfriends"><i class="fa-solid fa-user-group"></i> Chat with Friends</div><hr class="dropdown-divider"/><div class="item" id="rename"><i class="fa-solid fa-pen"></i> Rename</div><div class="Archive item" id="archive"><i class="fa-solid fa-box-archive"></i> Archive</div><div class="item delete" id="delete"><i class="fa-solid fa-trash"></i> Delete</div>`;
        document.body.appendChild(chatDropdown);
        chatDropdown.style.top = `${e.clientY}px`; chatDropdown.style.left = `${e.clientX - 40}px`;
        chatDropdown.querySelector("#pin").onclick = () => { togglePinChat(chatId); closeChatDropdown(); };
        chatDropdown.querySelector("#archive").onclick = () => { showModal({ title: "Archive", message: "Archive feature coming soon.", yesText: "OK" }); closeChatDropdown(); };
        chatDropdown.querySelector("#share").onclick = () => { showModal({ title: "Share", message: "Share feature coming soon.", yesText: "OK" }); closeChatDropdown(); };
        chatDropdown.querySelector("#chatwithfriends").onclick = () => { showModal({ title: "Chat with Friends", message: "Chat with Friends feature coming soon.", yesText: "OK" }); closeChatDropdown(); };
        chatDropdown.querySelector("#rename").onclick = () => { openRenameModal(chatId); closeChatDropdown(); };
        chatDropdown.querySelector("#delete").onclick = () => { showModal({ title: "Delete Chat", message: "This chat will be permanently deleted.", yesText: "Delete", noText: "Cancel", onYes: () => { deleteCurrentChat(); } }); closeChatDropdown(); };
    });

    document.addEventListener("click", () => { closeChatDropdown(); });
    function closeChatDropdown() { if (chatDropdown) { chatDropdown.remove(); chatDropdown = null; } }

    function handleDropdownAction(e) {
        e.stopPropagation();
        const item = e.target.closest(".item");
        if (!item) return;
        switch (item.dataset.action) {
            case "pin": togglePinChat(dropdownChatId); closeGlobalDropdown(); break;
            case "rename": openRenameModal(dropdownChatId); closeGlobalDropdown(); break;
            case "archive": showModal({ title: "Archive", message: "Archive feature coming soon.", yesText: "OK" }); closeGlobalDropdown(); break;
            case "more": openMoreDropdown(globalDropdown.getBoundingClientRect().right, globalDropdown.getBoundingClientRect().top, dropdownChatId); break;
            case "delete": showModal({ title: "Delete Chat", message: "This chat will be permanently deleted.", yesText: "Delete", noText: "Cancel", onYes: deleteCurrentChat }); closeGlobalDropdown(); break;
        }
    }

    function openMoreDropdown(x, y, chatId) {
        closeMoreDropdown();
        moreDropdown = document.createElement("div");
        moreDropdown.className = "more-submenu";
        moreDropdown.innerHTML = `<div class="item" data-more="duplicate"><i class="fa-solid fa-copy"></i> Duplicate Chat</div><div class="item" data-more="export"><i class="fa-solid fa-file-export"></i> Export Chat</div><div class="item" data-more="clear"><i class="fa-solid fa-broom"></i> Clear Messages</div>`;
        document.body.appendChild(moreDropdown);
        moreDropdown.style.top = (y + 70) + "px"; moreDropdown.style.left = (x - 300) + "px";
        moreDropdown.addEventListener("click", (e) => { e.stopPropagation(); });
        moreDropdown.onclick = (e) => {
            const action = e.target.closest(".item")?.dataset.more; if (!action) return;
            switch (action) {
                case "duplicate": showModal({ title: "Duplicate", message: "Duplicate feature coming soon.", yesText: "OK" }); break;
                case "export": showModal({ title: "Export", message: "Export feature coming soon.", yesText: "OK" }); break;
                case "clear": showModal({ title: "Clear Messages", message: "This will clear all messages.", yesText: "Clear", noText: "Cancel", onYes: () => { chats[chatId].messages = []; saveChats(); loadChat(chatId); } }); break;
            }
            closeMoreDropdown(); closeGlobalDropdown();
        };
    }

    document.addEventListener("click", (e) => {
        if (globalDropdown && !globalDropdown.contains(e.target) && (!moreDropdown || !moreDropdown.contains(e.target))) { closeGlobalDropdown(); closeMoreDropdown(); }
        if (chatDropdown && !chatDropdown.contains(e.target)) closeChatDropdown();
    });

    function closeMoreDropdown() { if (moreDropdown) { moreDropdown.remove(); moreDropdown = null; } }

    messageContainer.addEventListener("scroll", () => {

    if (!currentChatId) return; sessionStorage.setItem("scroll_" + currentChatId, messageContainer.scrollTop); });

    messageContainer.addEventListener("click", (e) => {
         const codeCopyBtn = e.target.closest(".code-copy-btn");
    if (codeCopyBtn) {
        const blockId = codeCopyBtn.dataset.target;
        const codeEl = document.getElementById(blockId)?.querySelector("code");
        if (codeEl) {
            navigator.clipboard.writeText(codeEl.innerText).then(() => {
                codeCopyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => {
                    codeCopyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                }, 2000);
            });
        }
        return;
    }
        const copyBtn = e.target.closest(".copy-btn");
        const editBtn = e.target.closest(".edit-btn");
        const regenBtn = e.target.closest(".regen-btn");
        const likeBtn = e.target.closest(".like-btn");
        const dislikeBtn = e.target.closest(".dislike-btn");

        if (copyBtn) { const msg = copyBtn.closest(".user-message-wrapper, .bot-message-wrapper").querySelector(".userMess, .botMess").innerText; navigator.clipboard.writeText(msg); }

        if (editBtn) {
            const wrapper = editBtn.closest(".user-message-wrapper");
            inputValue.value = wrapper.querySelector(".userMess")?.innerText || "";
            inputValue.focus(); wrapper.remove(); messageContainer.lastElementChild?.remove();
            chats[currentChatId].messages.splice(-2); saveChats();
        }

        if (regenBtn) {
            const lastUserMsg = [...chats[currentChatId].messages].reverse().find(m => m.sender === "user");
            if (!lastUserMsg) return;
            messageContainer.lastElementChild.remove(); chats[currentChatId].messages.pop(); saveChats();
            isAIResponding = true; toggleSendCancel(true);
            let loaderDiv = addThinkingLoader(); currentAbortController = new AbortController();
            getAIResponse(lastUserMsg.text, [], currentAbortController.signal)
                .then(aiText => { loaderDiv.remove(); addBotMessage(aiText); isAIResponding = false; toggleSendCancel(false); })
                .catch(() => { loaderDiv.remove(); isAIResponding = false; toggleSendCancel(false); });
        }

        if (likeBtn) likeBtn.classList.toggle("active");
        if (dislikeBtn) dislikeBtn.classList.toggle("active");
    });

    setTimeout(() => { messageContainer.scrollTop = messageContainer.scrollHeight; }, 0);
    const savedScroll = sessionStorage.getItem("scroll_" + currentChatId);
    setTimeout(() => { messageContainer.scrollTop = savedScroll !== null ? savedScroll : messageContainer.scrollHeight; }, 0);

    // ============================================
    // VOICE RECORDING
    // ============================================

    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let recordingStartTime = 0;
    let recordingTimer = null;

    const micBtn = document.querySelector(".mic-btn");
    const textArea = document.getElementById("inputText");

    const recordingUI = document.createElement("div");
    recordingUI.className = "recording-ui-inline hidden";
    recordingUI.innerHTML = `<div class="recording-wave"><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div></div><div class="recording-time">0:00</div><button class="cancel-recording-btn" title="Cancel"><i class="fa-solid fa-xmark"></i></button>`;
    textArea.parentNode.insertBefore(recordingUI, textArea.nextSibling);

    micBtn.addEventListener("click", async () => {
        if (isRecording) return;
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
        if (!isSecure && !navigator.mediaDevices) {
            showModal({ title: "Not Supported", message: "Microphone access is not available. Try opening via HTTPS or a local server.", yesText: "OK" });
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 } });
            startRecording(stream);
        } catch (error) {
            console.error("Mic error:", error);
            let msg = "Microphone access denied.";
            if (error.name === "NotFoundError") msg = "No microphone found on this device.";
            else if (error.name === "NotAllowedError") msg = "Microphone permission denied. Please allow mic access in your browser settings.";
            else if (error.name === "NotSupportedError") msg = "Your browser doesn't support audio recording.";
            showModal({ title: "Microphone Error", message: msg, yesText: "OK" });
        }
    });

    function getSupportedMimeType() {
        const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4', 'audio/aac', ''];
        for (const type of types) { if (type === '' || MediaRecorder.isTypeSupported(type)) return type; }
        return '';
    }

    function startRecording(stream) {
        textArea.style.display = "none"; recordingUI.classList.remove("hidden");
        micBtn.style.display = "none"; sendBtn.style.display = "block";
        isRecording = true; audioChunks = []; recordingStartTime = Date.now();

        const mimeType = getSupportedMimeType();
        console.log("🎙️ Using MIME type:", mimeType);
        const options = mimeType ? { mimeType } : {};

        try { mediaRecorder = new MediaRecorder(stream, options); }
        catch (e) { mediaRecorder = new MediaRecorder(stream); }

        mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.push(event.data); };
        mediaRecorder.onstop = () => { stream.getTracks().forEach(track => track.stop()); };
        mediaRecorder.start(100);
        updateRecordingTime();
        recordingTimer = setInterval(updateRecordingTime, 1000);
    }

    function updateRecordingTime() {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        document.querySelector(".recording-time").textContent = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
    }

    document.querySelector(".cancel-recording-btn").addEventListener("click", (e) => { e.stopPropagation(); cancelRecording(); });

    function cancelRecording() {
        if (!isRecording) return;
        isRecording = false; clearInterval(recordingTimer);
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        textArea.style.display = "block"; recordingUI.classList.add("hidden");
        sendBtn.style.display = "none"; voiceBtn.style.display = "block"; micBtn.style.display = "block";
        audioChunks = [];
    }

    async function stopAndSendRecording() {
        if (!isRecording) return;
        isRecording = false; clearInterval(recordingTimer);
        mediaRecorder.stop();
        await new Promise(resolve => { mediaRecorder.onstop = () => resolve(); });
        textArea.style.display = "block"; recordingUI.classList.add("hidden");
        sendBtn.style.display = "none"; voiceBtn.style.display = "block"; micBtn.style.display = "block";

        if (audioChunks.length > 0) {
            const detectedMimeType = mediaRecorder.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunks, { type: detectedMimeType });
            console.log("🎙️ Audio size:", audioBlob.size, "bytes. MIME:", detectedMimeType);
            if (audioBlob.size < 500) {
                showModal({ title: "Too Short", message: "Recording too short. Please try again.", yesText: "OK" });
                audioChunks = []; return;
            }
            await sendVoiceMessage(audioBlob);
        }
        audioChunks = [];
    }

    async function sendVoiceMessage(audioBlob) {
        if (isAIResponding) return;
        isAIResponding = true; toggleSendCancel(true);

        try {
            const base64Audio = await blobToBase64(audioBlob);
            const base64Data = base64Audio.split(',')[1];
            const audioDataUrl = base64Audio;
            const detectedMime = audioBlob.type.split(';')[0] || 'audio/webm';

            lastUserMessageElement = addVoiceMessage(audioDataUrl);
            fixInputField();

            let loaderDiv = addThinkingLoader();
            currentAbortController = new AbortController();
            console.log("🟡 SENDING VOICE TO AI... MIME:", detectedMime);

            const aiResponse = await getAIResponseWithAudio(base64Data, currentAbortController.signal, detectedMime);

            loaderDiv.remove();
            addBotMessage(aiResponse);

            if (chats[currentChatId].messages.length === 1 && !chats[currentChatId].title) {
                generateTitleFromAI(text || fileDisplayData?.name || "File upload").then(async title => {
                    chats[currentChatId].title = title;
                    try {
                        if (window.API && window.__firebaseCurrentUser) {
                            await window.API.updateChat(currentChatId, { title });
                        }
                    } catch (e) { }
                    updateChatList();
                });
            }
        } catch (err) {
            document.querySelector(".thinking")?.remove();
            console.error("❌ VOICE ERROR:", err);
            showModal({ title: "Voice Error", message: "Failed to process voice message. Please try again.", yesText: "OK" });
        }

        isAIResponding = false; toggleSendCancel(false);
    }

    function addVoiceMessage(audioDataUrl) {
        let msgWrapper = document.createElement("div");
        msgWrapper.classList.add("user-message-wrapper");
        msgWrapper.innerHTML = `
            <div class="voice-message-bubble">
                <button class="voice-play-btn"><i class="fa-solid fa-play"></i></button>
                <div class="voice-waveform">
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                </div>
                <span class="voice-duration">0:00</span>
            </div>
            <div class="msg-actions user-actions">
                <button class="copy-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
            </div>`;
        messageContainer.appendChild(msgWrapper);
        messageContainer.scrollTop = messageContainer.scrollHeight;

        const durationSpan = msgWrapper.querySelector('.voice-duration');
        const playBtn = msgWrapper.querySelector('.voice-play-btn');
        const audio = new Audio();

        // ✅ pehle events, phir src
        audio.addEventListener('loadedmetadata', () => {
            if (isFinite(audio.duration) && audio.duration > 0) {
                const mins = Math.floor(audio.duration / 60);
                const secs = Math.floor(audio.duration % 60);
                durationSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            }
        });
        audio.addEventListener('timeupdate', () => {
            const mins = Math.floor(audio.currentTime / 60);
            const secs = Math.floor(audio.currentTime % 60);
            durationSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        });
        audio.addEventListener('ended', () => {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            if (isFinite(audio.duration) && audio.duration > 0) {
                const mins = Math.floor(audio.duration / 60);
                const secs = Math.floor(audio.duration % 60);
                durationSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            }
        });
        audio.src = audioDataUrl; // ✅ src baad mein

        playBtn.addEventListener('click', () => {
            if (audio.paused) { audio.play(); playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
            else { audio.pause(); playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; }
        });

        chats[currentChatId].messages.push({
            sender: "user", text: "[Voice Message]", isVoice: true, audioUrl: audioDataUrl
        });
        saveChats();
        return msgWrapper;
    }

    async function getAIResponseWithAudio(base64AudioData, signal, mimeType = 'audio/webm') {
        let attempts = API_KEYS.length;
        while (attempts > 0) {
            try {
                let chatHistory = chats[currentChatId].messages
                    .filter(msg => !msg.isVoice)
                    .map(msg => ({ role: msg.sender === "user" ? "user" : "model", parts: [{ text: msg.text || "" }] }));
                let parts = [
                    { inlineData: { mimeType: mimeType, data: base64AudioData } },
                    { text: "Listen to this audio and respond naturally to what the person said. Transcribe if needed and reply accordingly." }
                ];
                let contents = [getSystemInstruction(), ...chatHistory, { role: "user", parts: parts }];
                let response = await fetch(getGeminiURL(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents }), signal });
                let data = await response.json();
                if (!response.ok || data.error) throw new Error("API error");
                const finalText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!finalText) throw new Error("No response text");
                return finalText;
            } catch (err) {
                if (signal && signal.aborted) throw err;
                currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                attempts--;
            }
        }
        throw new Error("All API keys failed");
    }

    function renderUserMessage(text, imageData = null, isVoice = false, audioUrl = null) {
        let wrapper = document.createElement("div");
        wrapper.className = "user-message-wrapper";

        let imageHTML = imageData
            ? `<div class="user-image-container"><img src="${imageData}" alt="Uploaded" class="user-uploaded-image" /></div>`
            : '';

        let messageHTML = '';
        if (isVoice && audioUrl) {
            messageHTML = `
                <div class="voice-message-bubble">
                    <button class="voice-play-btn"><i class="fa-solid fa-play"></i></button>
                    <div class="voice-waveform">
                        <div class="waveform-bar"></div>
                        <div class="waveform-bar"></div>
                        <div class="waveform-bar"></div>
                        <div class="waveform-bar"></div>
                        <div class="waveform-bar"></div>
                        <div class="waveform-bar"></div>
                        <div class="waveform-bar"></div>
                    </div>
                    <span class="voice-duration">0:00</span>
                </div>`;
        } else if (text) {
            messageHTML = `<div class="userMess">${text}</div>`;
        } else {
            messageHTML = `<div class="userMess">[Voice Message - Error Loading]</div>`;
        }

        wrapper.innerHTML = `
            ${imageHTML}
            ${messageHTML}
            <div class="msg-actions user-actions">
                <button class="copy-btn"><i class="fa-regular fa-copy"></i></button>
                ${!isVoice ? '<button class="edit-btn"><i class="fa-solid fa-pen"></i></button>' : ''}
            </div>`;

        messageContainer.appendChild(wrapper);

        if (isVoice && audioUrl) {
            const durationSpan = wrapper.querySelector('.voice-duration');
            const playBtn = wrapper.querySelector('.voice-play-btn');
            const audio = new Audio();

            // ✅ pehle events, phir src
            audio.addEventListener('loadedmetadata', () => {
                if (isFinite(audio.duration) && audio.duration > 0) {
                    const mins = Math.floor(audio.duration / 60);
                    const secs = Math.floor(audio.duration % 60);
                    durationSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
            });
            audio.addEventListener('timeupdate', () => {
                const mins = Math.floor(audio.currentTime / 60);
                const secs = Math.floor(audio.currentTime % 60);
                durationSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            });
            audio.addEventListener('ended', () => {
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                if (isFinite(audio.duration) && audio.duration > 0) {
                    const mins = Math.floor(audio.duration / 60);
                    const secs = Math.floor(audio.duration % 60);
                    durationSpan.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
            });
            audio.addEventListener('error', () => { durationSpan.textContent = '--:--'; });
            audio.src = audioUrl; // ✅ src baad mein

            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (audio.paused) {
                    audio.play().catch(err => console.error('Play error:', err));
                    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                } else {
                    audio.pause();
                    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                }
            });
        }
    }

    function renderBotMessage(text) {
        let wrapper = document.createElement("div");
        wrapper.className = "bot-message-wrapper";
        wrapper.innerHTML = `<div class="botMess">${formatAIText(text)}</div><div class="msg-actions bot-actions"><button class="copy-btn"><i class="fa-regular fa-copy"></i></button><button class="like-btn"><i class="fa-regular fa-thumbs-up"></i></button><button class="dislike-btn"><i class="fa-regular fa-thumbs-down"></i></button><button class="regen-btn"><i class="fa-solid fa-rotate-right"></i></button></div>`;
        messageContainer.appendChild(wrapper);
    }

    const addBtn = document.querySelector(".add-btn");
    const addDropdown = document.querySelector(".add-dropdown");
    const fileInput = document.getElementById("fileInput");

    addBtn.addEventListener("click", (e) => { e.stopPropagation(); addDropdown.classList.toggle("hidden"); });
    document.addEventListener("click", () => { addDropdown.classList.add("hidden"); });
    addDropdown.addEventListener("click", (e) => {
        const item = e.target.closest(".add-item"); if (!item) return;
        const action = item.dataset.action; addDropdown.classList.add("hidden");
        if (action === "file") fileInput.click();
        if (action === "image") showModal({ title: "Create Image", message: "Image generation mode enabled.", yesText: "OK" });
        if (action === "thinking") showModal({ title: "Thinking Mode", message: "Thinking mode enabled.", yesText: "OK" });
        if (action === "research") showModal({ title: "Deep Research", message: "Deep research mode enabled.", yesText: "OK" });
    });

    fileInput.addEventListener("change", async () => {
        const files = Array.from(fileInput.files);
        if (files.length === 0) return;
        const activeChatId = sessionStorage.getItem("activeChatId");
        const chatsLocal = chats; // memory se lo
        const chatTitle = chatsLocal[activeChatId]?.title || "Untitled Chat";
        for (let file of files) {
            const fileType = file.type;
            if (fileType.startsWith('image/') || fileType.startsWith('video/') || fileType.startsWith('audio/') || fileType === 'application/pdf' || fileType.includes('document') || fileType.includes('presentation') || fileType.includes('spreadsheet') || fileType === 'text/plain') {
                selectedFiles.push(file);
                try { const base64Data = await fileToBase64(file); if (window.saveFileToLibrary) window.saveFileToLibrary(file, base64Data, activeChatId, chatTitle); }
                catch (error) { console.error("❌ Library save error:", error); }
            } else { alert(`File type not supported: ${file.name}`); }
        }
        renderFilePreview(); fileInput.value = "";
        if (selectedFiles.length > 0) { sendBtn.style.display = "block"; voiceBtn.style.display = "none"; }
    });

    function renderFilePreview() {
        filePreviewBar.innerHTML = "";
        if (selectedFiles.length === 0) { filePreviewBar.classList.remove("show"); return; }
        filePreviewBar.classList.add("show");
        selectedFiles.forEach((file, index) => {
            const chip = document.createElement("div"); chip.className = "file-chip";
            const reader = new FileReader();
            reader.onload = (e) => {
                chip.innerHTML = `<img src="${e.target.result}" class="file-preview-img" /><span>${file.name}</span><button>&times;</button>`;
                chip.querySelector("button").onclick = () => {
                    selectedFiles.splice(index, 1); renderFilePreview();
                    if (selectedFiles.length === 0 && !inputValue.value.trim()) { sendBtn.style.display = "none"; voiceBtn.style.display = "block"; }
                };
            };
            reader.readAsDataURL(file); filePreviewBar.appendChild(chip);
        });
    }

    function addUserMessageWithFile(text, fileData = null) {
        let msgWrapper = document.createElement("div"); msgWrapper.classList.add("user-message-wrapper");
        let fileHTML = '';
        if (fileData) {
            const ft = fileData.type;
            if (ft.startsWith('image/')) fileHTML = `<div class="user-file-container"><img src="${fileData.data}" alt="${fileData.name}" class="user-uploaded-image" /></div>`;
            else if (ft.startsWith('video/')) fileHTML = `<div class="user-file-container"><video src="${fileData.data}" controls class="user-uploaded-video"></video></div>`;
            else if (ft.startsWith('audio/')) fileHTML = `<div class="user-file-container audio-container"><i class="fa-solid fa-file-audio"></i><span>${fileData.name}</span><audio src="${fileData.data}" controls class="user-uploaded-audio"></audio></div>`;
            else if (ft === 'application/pdf') fileHTML = `<div class="user-file-container file-indicator"><i class="fa-solid fa-file-pdf"></i><span>${fileData.name}</span></div>`;
            else if (ft.includes('document') || ft.includes('wordprocessing')) fileHTML = `<div class="user-file-container file-indicator"><i class="fa-solid fa-file-word"></i><span>${fileData.name}</span></div>`;
            else if (ft.includes('presentation')) fileHTML = `<div class="user-file-container file-indicator"><i class="fa-solid fa-file-powerpoint"></i><span>${fileData.name}</span></div>`;
            else if (ft.includes('spreadsheet')) fileHTML = `<div class="user-file-container file-indicator"><i class="fa-solid fa-file-excel"></i><span>${fileData.name}</span></div>`;
            else if (ft.startsWith('text/')) fileHTML = `<div class="user-file-container file-indicator"><i class="fa-solid fa-file-lines"></i><span>${fileData.name}</span></div>`;
            else fileHTML = `<div class="user-file-container file-indicator"><i class="fa-solid fa-file"></i><span>${fileData.name}</span></div>`;
        }
        msgWrapper.innerHTML = `${fileHTML}${text ? `<div class="userMess"><span>${text}</span></div>` : ''}<div class="msg-actions user-actions"><button class="copy-btn" title="Copy"><i class="fa-regular fa-copy"></i></button></div>`;
        messageContainer.appendChild(msgWrapper); messageContainer.scrollTop = messageContainer.scrollHeight;
        if (!chats[currentChatId]) {
            chats[currentChatId] = { title: "", messages: [], firstMessageSent: false, pinned: false, model: currentModel };
        }
        chats[currentChatId].messages.push({ sender: "user", text: text || `[${fileData?.name || 'File'}]`, fileData: fileData || null });
        saveChats();
        return msgWrapper;
    }

    console.log("✅ script.js loaded");

}); // END DOMContentLoaded