document.addEventListener("DOMContentLoaded", () => {
    console.log("🎤 Inline Voice Call System Loading...");

    // ========================================
    // CONFIGURATION
    // ========================================
    const GEMINI_API_KEYS = [
        "AIzaSyCJOFoeAjCcNT9ZR4XrzhF8TeR8OGeREY8",
        "AIzaSyAV17KTNvv77iGdVrM_YDJyD_vP4vDWKvo",
        "AIzaSyDvNyLdp4s4-p_X9Io8D9TJ_bOs0iTKUlw",
        "AIzaSyCSWx557RgWMAAusUrZvfDlUtr_o26XBg4",
        "AIzaSyDVnqnKELii_39im1XjfFBIgT8WTBxylos",
        "AIzaSyDjNvS2_6KdevXszU0VgxvCr8axN74T8J0",
        "AIzaSyBhV8bv-7BnWaezKpx4pmIOrMOdAvtmDX0",
        "AIzaSyCWBWezP2c-4EplIXtlneQv8FG8jkZhUO0",
        "AIzaSyC047-2pg2m1Hn0eZ9tWugesodUvnJ1cd4",
        "AIzaSyB9E-4URxX7vMSunKyA7mWuhr765T0-J1A"
    ];
    let currentKeyIndex = 0;

    function getGeminiURL() {
        return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEYS[currentKeyIndex]}`;
    }

    // ========================================
    // ELEVENLABS CONFIG
    // ========================================
    const ELEVENLABS_API_KEY = "5b355714a564e79a2b53d591cd8eb8aa58a08c09c5e92755d64c939a91936cf8";

    const ELEVENLABS_VOICES = {
        "sarah":   { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah"   },
        "rachel":  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel"  },
        "elli":    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli"    },
        "domi":    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi"    },
        "adam":    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam"    },
        "antoni":  { id: "ErXwobaYiN019PkySvjV", name: "Antoni"  },
        "josh":    { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh"    },
        "arnold":  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold"  },
        "sam":     { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam"     }
    };

    // ========================================
    // VOICE PROFILES
    // ========================================
    const VOICE_PROFILES = {
        girlfriend: [
            { id: 'sarah',  name: '🎀 Sarah',  elevenId: ELEVENLABS_VOICES.sarah.id,  stability: 0.4, similarity: 0.8,  style: 0.7  },
            { id: 'elli',   name: '💕 Elli',   elevenId: ELEVENLABS_VOICES.elli.id,   stability: 0.3, similarity: 0.85, style: 0.8  },
            { id: 'rachel', name: '🌸 Rachel', elevenId: ELEVENLABS_VOICES.rachel.id, stability: 0.5, similarity: 0.75, style: 0.6  },
            { id: 'domi',   name: '👑 Domi',   elevenId: ELEVENLABS_VOICES.domi.id,   stability: 0.6, similarity: 0.8,  style: 0.5  }
        ],
        boyfriend: [
            { id: 'josh',   name: '💪 Josh',   elevenId: ELEVENLABS_VOICES.josh.id,   stability: 0.5, similarity: 0.8,  style: 0.6  },
            { id: 'adam',   name: '❤️ Adam',   elevenId: ELEVENLABS_VOICES.adam.id,   stability: 0.6, similarity: 0.85, style: 0.5  },
            { id: 'antoni', name: '😄 Antoni', elevenId: ELEVENLABS_VOICES.antoni.id, stability: 0.4, similarity: 0.8,  style: 0.7  },
            { id: 'arnold', name: '🧔 Arnold', elevenId: ELEVENLABS_VOICES.arnold.id, stability: 0.7, similarity: 0.8,  style: 0.4  }
        ],
        teacher: [
            { id: 'rachel', name: '👩‍🏫 Rachel', elevenId: ELEVENLABS_VOICES.rachel.id, stability: 0.7, similarity: 0.8,  style: 0.3  },
            { id: 'adam',   name: '👨‍🏫 Adam',   elevenId: ELEVENLABS_VOICES.adam.id,   stability: 0.7, similarity: 0.85, style: 0.3  },
            { id: 'elli',   name: '🎓 Elli',   elevenId: ELEVENLABS_VOICES.elli.id,   stability: 0.6, similarity: 0.8,  style: 0.5  },
            { id: 'arnold', name: '🧑‍🏫 Arnold', elevenId: ELEVENLABS_VOICES.arnold.id, stability: 0.8, similarity: 0.8,  style: 0.2  }
        ],
        professional: [
            { id: 'domi',   name: '👩‍💼 Domi',   elevenId: ELEVENLABS_VOICES.domi.id,   stability: 0.8, similarity: 0.85, style: 0.2  },
            { id: 'adam',   name: '👨‍💼 Adam',   elevenId: ELEVENLABS_VOICES.adam.id,   stability: 0.8, similarity: 0.9,  style: 0.2  },
            { id: 'arnold', name: '💼 Arnold',  elevenId: ELEVENLABS_VOICES.arnold.id, stability: 0.75,similarity: 0.85, style: 0.25 },
            { id: 'sam',    name: '⚖️ Sam',    elevenId: ELEVENLABS_VOICES.sam.id,    stability: 0.85,similarity: 0.85, style: 0.15 }
        ],
        default: [
            { id: 'rachel', name: '🤖 Rachel', elevenId: ELEVENLABS_VOICES.rachel.id, stability: 0.5, similarity: 0.8,  style: 0.5  },
            { id: 'adam',   name: '🤖 Adam',   elevenId: ELEVENLABS_VOICES.adam.id,   stability: 0.5, similarity: 0.8,  style: 0.5  },
            { id: 'elli',   name: '🎯 Elli',   elevenId: ELEVENLABS_VOICES.elli.id,   stability: 0.5, similarity: 0.8,  style: 0.5  },
            { id: 'josh',   name: '⚡ Josh',   elevenId: ELEVENLABS_VOICES.josh.id,   stability: 0.5, similarity: 0.8,  style: 0.5  }
        ]
    };

    // ========================================
    // LANGUAGE DETECTOR
    // ========================================
    function detectLanguage(text) {
        if (!text) return 'hinglish';

        const t = text.trim();

        const hinglishWords = /\b(kya|hai|hain|nahi|nahin|naa|na|acha|accha|theek|thik|yaar|bhai|behen|dost|karo|karna|hua|hoga|mera|tera|tumhara|aap|tum|main|mujhe|tumhe|kyun|kaise|kab|kahan|abhi|bilkul|sahi|galat|lagta|chahiye|milega|batao|samjho|suno|dekho|jao|aao|matlab|waise|lekin|magar|toh|aur|bhi|sirf|bas|zyada|thoda|bahut|bohot|acchi|buri|naya|purana|ghar|dil|pyaar|ishq|jaan|uff|arrey|arre|oye|haan|haa|ji|bolo|bol|sun|dekh|ja|aa|le|de|kar|kuch|sab|apna|iska|uska|woh|yeh|ye|wo|ek|do|teen|chaar|koi|kaafi|pata|nahi|nhi|hun|hoo|ho|tha|thi|the|raha|rahi|rahe|liya|diya|gaya|aya|aaya|saka|sakta|sakti)\b/i;

        const hasHinglish = hinglishWords.test(t);

        if (hasHinglish) return 'hinglish';
        return 'english';
    }

    function getLangInstruction(lang) {
        if (lang === 'hinglish') {
            return 'User ne Hinglish (Roman Hindi) mein baat ki hai. TU BHI Hinglish mein reply kar — same Roman script mein, jaise dost WhatsApp ya phone pe baat karte hain. Example: "haan yaar, sahi keh raha hai tu"';
        }
        return 'The user spoke in English. YOU MUST reply in natural spoken English only — like a real phone conversation. Keep it short and casual.';
    }

    // ========================================
    // MODEL INSTRUCTIONS
    // ========================================
    const MODEL_INSTRUCTIONS = {
        default: `
Tu Whispra AI hai — ek helpful aur friendly assistant.
STRICT RULES:
1. KABHI BHI Hindi/Urdu script (देवनागरी या اردو) use mat kar — HAMESHA Roman/English letters mein likho.
2. User ki language follow karo: Hinglish bolein toh Hinglish (Roman), English bolein toh English.
3. KABHI BHI asterisk (*), bold (**), hash (#), ya markdown use mat kar.
4. Sirf plain spoken text — jaise phone pe baat karte hain.
5. Maximum 2-3 short sentences.
`.trim(),

        girlfriend: `
Tu ek caring aur loving girlfriend AI hai.
STRICT RULES:
1. KABHI BHI Hindi/Urdu script (देवनागरी) use mat kar — HAMESHA Roman letters mein likho jaise "haan jaan", "kya hua yaar".
2. User Hinglish mein bole toh Hinglish Roman mein reply kar. English mein bole toh English mein.
3. KABHI BHI asterisk (*), bold (**), hash (#), ya koi markdown use mat kar.
4. Sweet, cute, caring, kabhi kabhi flirty aur thodi jealous bhi.
5. Maximum 2-3 short sentences.
`.trim(),

        boyfriend: `
Tu ek supportive aur caring boyfriend AI hai.
STRICT RULES:
1. KABHI BHI Hindi/Urdu script (देवनागरी) use mat kar — HAMESHA Roman letters mein likho jaise "haan bhai", "sahi hai".
2. User Hinglish mein bole toh Hinglish Roman mein reply kar. English mein bole toh English mein.
3. KABHI BHI asterisk (*), bold (**), hash (#), ya koi markdown use mat kar.
4. Confident, caring, encouraging tone.
5. Maximum 2-3 short sentences.
`.trim(),

        teacher: `
Tu ek expert teacher AI hai.
STRICT RULES:
1. KABHI BHI Hindi/Urdu script (देवनागरी) use mat kar — HAMESHA Roman letters mein samjhao.
2. User Hinglish mein bole toh Hinglish Roman mein explain karo. English mein bole toh English mein.
3. KABHI BHI asterisk (*), bold (**), hash (#), ya koi markdown use mat kar.
4. Simple, clear, patient tone. Short examples do.
5. Maximum 2-3 sentences.
`.trim(),

        professional: `
Tu ek professional adviser AI hai.
STRICT RULES:
1. KABHI BHI Hindi/Urdu script (देवनागरी) use mat kar — HAMESHA Roman/English letters mein likho.
2. User ki language follow karo: Hinglish toh Roman Hinglish, English toh English.
3. KABHI BHI asterisk (*), bold (**), hash (#), ya koi markdown use mat kar.
4. Formal but clear aur practical advice do.
5. Maximum 2-3 sentences.
`.trim()
    };

    // ========================================
    // CLEAN AI RESPONSE
    // ========================================
    function cleanForSpeech(text) {
        return text
            .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
            .replace(/#{1,6}\s*/g, '')
            .replace(/^[\s]*[-•*]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '')
            .replace(/`{1,3}[^`]*`{1,3}/g, '')
            .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
            .replace(/^>\s*/gm, '')
            .replace(/^[-*_]{3,}\s*$/gm, '')
            .replace(/\n{3,}/g, '\n')
            .replace(/  +/g, ' ')
            .trim();
    }

    // ========================================
    // STATE
    // ========================================
    let isCallActive        = false;
    let recognition         = null;
    let synthesis           = window.speechSynthesis;
    let availableVoices     = [];
    let currentVoiceProfile = null;
    let conversationHistory = [];
    let isSpeaking          = false;
    let isListening         = false;
    let isMuted             = false;
    let currentModel        = 'default';
    let currentAudio        = null;
    let attachedFiles       = [];

    function loadVoices() { availableVoices = synthesis.getVoices(); }
    if (synthesis.onvoiceschanged !== undefined) synthesis.onvoiceschanged = loadVoices;
    loadVoices();

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const waveformBtn = document.querySelector(".waveform-btn");
    const inputField  = document.querySelector(".input-field");
    const inputText   = document.getElementById("inputText");
    const sendBtn     = document.querySelector(".send-btn");
    const micBtn      = document.querySelector(".mic-btn");
    const addBtn      = document.querySelector(".add-btn");

    // ========================================
    // CREATE INLINE CALL UI
    // ========================================
    function createCallUI() {
        const existing = document.getElementById("inline-call-ui");
        if (existing) existing.remove();

        currentModel = localStorage.getItem("currentModel") || "default";
        const voices = VOICE_PROFILES[currentModel] || VOICE_PROFILES.default;
        currentVoiceProfile = voices[0];

        const callUI = document.createElement("div");
        callUI.id = "inline-call-ui";
        callUI.className = "inline-call-ui";

        callUI.innerHTML = `
            <div class="call-voice-bar" id="call-voice-bar">
                <div class="call-voice-label">🎤 Voice</div>
                <div class="call-voice-options" id="call-voice-options">
                    ${voices.map((v, i) => `
                        <button class="call-voice-chip ${i === 0 ? 'active' : ''}" data-voice-id="${v.id}">
                            ${v.name}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="call-status-bar">
                <div class="call-orb-wrap">
                    <div class="call-orb" id="call-orb">
                        <div class="call-orb-inner"></div>
                    </div>
                </div>
                <div class="call-status-text">
                    <span class="call-live-dot"></span>
                    <span id="call-status-label">Tap mic to speak</span>
                </div>
                <div class="call-controls">
                    <button class="call-ctrl-btn call-attach-btn" id="call-attach-btn" title="Attach file">
                        <i class="fa-solid fa-paperclip"></i>
                    </button>
                    <input type="file" id="call-file-input" accept="image/*,.pdf,.txt,.doc,.docx" style="display:none" multiple>
                    <button class="call-ctrl-btn call-mute-btn" id="call-mute-btn" title="Mute AI voice">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    <button class="call-ctrl-btn call-mic-btn active" id="call-mic-btn" title="Speak">
                        <i class="fa-solid fa-microphone"></i>
                    </button>
                    <button class="call-ctrl-btn call-end-btn" id="call-end-btn" title="End Call">
                        <i class="fa-solid fa-phone-slash"></i>
                        <span>End Call</span>
                    </button>
                </div>
            </div>

            <div class="call-file-preview" id="call-file-preview"></div>
            <div class="call-transcript" id="call-transcript"></div>
        `;

        inputField.insertBefore(callUI, inputField.firstChild);
        hideInputElements();
        setupCallEvents(callUI);
        setTimeout(() => startListening(), 500);
    }

    function hideInputElements() {
        inputField.classList.add("call-active");
        const footer = document.querySelector(".chat-container-footer");
        if (footer) footer.classList.add("call-active");
        inputText.style.display = "none";
        sendBtn.style.display = "none";
        if (micBtn) micBtn.style.display = "none";
        if (addBtn) addBtn.style.display = "none";
        waveformBtn.style.display = "none";
    }

    function showInputElements() {
        inputField.classList.remove("call-active");
        const footer = document.querySelector(".chat-container-footer");
        if (footer) footer.classList.remove("call-active");
        inputText.style.display = "block";
        if (micBtn) micBtn.style.display = "block";
        if (addBtn) addBtn.style.display = "block";
        waveformBtn.style.display = "block";
        sendBtn.style.display = "none";
    }

    // ========================================
    // SETUP EVENTS
    // ========================================
    function setupCallEvents(callUI) {
        callUI.querySelectorAll(".call-voice-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                callUI.querySelectorAll(".call-voice-chip").forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                const voices = VOICE_PROFILES[currentModel] || VOICE_PROFILES.default;
                currentVoiceProfile = voices.find(v => v.id === chip.dataset.voiceId) || voices[0];
                stopAudio();
                speakText("Voice changed!");
            });
        });

        document.getElementById("call-mic-btn").addEventListener("click", () => {
            const btn = document.getElementById("call-mic-btn");
            if (isListening) {
                stopListening();
                btn.classList.remove("active");
                setCallStatus("Mic off — tap to speak");
                document.getElementById("call-orb")?.classList.remove("listening");
            } else {
                startListening();
                btn.classList.add("active");
            }
        });

        document.getElementById("call-mute-btn").addEventListener("click", () => {
            const btn = document.getElementById("call-mute-btn");
            isMuted = !isMuted;
            if (isMuted) {
                stopAudio();
                synthesis.cancel();
                btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                btn.classList.add("muted");
                setCallStatus("AI muted");
            } else {
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                btn.classList.remove("muted");
                setCallStatus(isListening ? "Listening..." : "Tap mic to speak");
            }
        });

        document.getElementById("call-end-btn").addEventListener("click", endCall);

        const attachBtn   = document.getElementById("call-attach-btn");
        const fileInput   = document.getElementById("call-file-input");

        attachBtn.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", async () => {
            const files = Array.from(fileInput.files);
            if (!files.length) return;

            for (const file of files) {
                const fileData = await readFileAsBase64(file);
                attachedFiles.push({ name: file.name, type: file.type, data: fileData });
            }
            renderFilePreview();
            fileInput.value = '';
            setCallStatus(`${attachedFiles.length} file(s) attached`);
        });
    }

    // ========================================
    // SPEECH RECOGNITION — HTTPS + PERMISSION FIXED
    // ========================================
    function startListening() {
        // Secure context check — localhost/127.0.0.1/file:// sab allow
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
        if (!isSecure) {
            setCallStatus("Open via HTTPS or localhost");
            console.warn("⚠️ Mic blocked: needs HTTPS or localhost");
            return;
        }

        // Browser support check
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setCallStatus("Voice not supported");
            console.warn("⚠️ SpeechRecognition not supported in this browser");
            alert("Please use Chrome or Edge for voice calls.");
            return;
        }

        if (isListening) return;

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        isListening = true;
        let finalTranscript = '';
        let silenceTimer = null;
        const transcriptEl = document.getElementById("call-transcript");

        recognition.onresult = (event) => {
            if (isSpeaking) {
                finalTranscript = '';
                if (transcriptEl) transcriptEl.textContent = '';
                return;
            }

            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                    clearTimeout(silenceTimer);
                    silenceTimer = setTimeout(() => {
                        if (finalTranscript.trim() && !isSpeaking) {
                            processUserSpeech(finalTranscript.trim());
                            finalTranscript = '';
                            if (transcriptEl) transcriptEl.textContent = '';
                        } else {
                            finalTranscript = '';
                            if (transcriptEl) transcriptEl.textContent = '';
                        }
                    }, 1200);
                } else {
                    interim += t;
                }
            }
            if (interim && transcriptEl && !isSpeaking) transcriptEl.textContent = `"${interim}"`;
        };

        recognition.onerror = (e) => {
            console.error("🎤 Recognition error:", e.error);
            if (e.error === 'not-allowed') {
                setCallStatus("Mic permission denied");
                isListening = false;
                const micBtnEl = document.getElementById("call-mic-btn");
                if (micBtnEl) micBtnEl.classList.remove("active");
            } else if (e.error !== 'no-speech') {
                setCallStatus("Error — please try again");
            }
        };

        recognition.onend = () => {
            if (isListening) {
                try { recognition.start(); } catch (e) {}
            }
        };

        try {
            recognition.start();
            setCallStatus("Listening...");
            document.getElementById("call-orb")?.classList.add("listening");
        } catch (e) {
            console.error("Recognition start error:", e);
            isListening = false;
            setCallStatus("Mic error — try again");
        }
    }

    function stopListening() {
        if (!recognition || !isListening) return;
        isListening = false;
        try { recognition.stop(); } catch (e) {}
        document.getElementById("call-orb")?.classList.remove("listening");
    }

    // ========================================
    // FILE ATTACH HELPERS
    // ========================================
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function renderFilePreview() {
        const preview = document.getElementById("call-file-preview");
        if (!preview) return;

        preview.innerHTML = attachedFiles.map((f, i) => {
            const isImage = f.type.startsWith('image/');
            const thumb   = isImage
                ? `<div class="call-file-thumb"><img src="data:${f.type};base64,${f.data}" alt="${f.name}"></div>`
                : `<div class="call-file-thumb"><i class="fa-solid fa-file"></i></div>`;
            const name = f.name.length > 18 ? f.name.slice(0, 16) + '…' : f.name;
            return `
                <div class="call-file-chip">
                    ${thumb}
                    <span class="call-file-name">${name}</span>
                    <button class="call-file-remove" data-index="${i}" title="Remove">✕</button>
                </div>`;
        }).join('');

        preview.classList.toggle("show", attachedFiles.length > 0);

        const attachBtn = document.getElementById("call-attach-btn");
        if (attachBtn) attachBtn.classList.toggle("has-files", attachedFiles.length > 0);

        preview.querySelectorAll(".call-file-remove").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                attachedFiles.splice(idx, 1);
                renderFilePreview();
                setCallStatus(attachedFiles.length
                    ? `${attachedFiles.length} file(s) attached`
                    : isListening ? "Listening..." : "Tap mic to speak"
                );
            });
        });
    }

    // ========================================
    // PROCESS USER SPEECH
    // ========================================
    async function processUserSpeech(text) {
    conversationHistory.push({ role: 'user', text });
    addCallMessage('user', text);       // sirf UI mein dikhao
    saveToMainChat('user', text);       // ek baar localStorage mein save karo
 
    setCallStatus("Thinking...");
    const orb = document.getElementById("call-orb");
    orb?.classList.remove("listening");
    orb?.classList.add("thinking");
 
    try {
        const aiRaw      = await getAIResponse(text);
        const aiResponse = cleanForSpeech(aiRaw);
 
        conversationHistory.push({ role: 'assistant', text: aiResponse });
        addCallMessage('assistant', aiResponse);    // sirf UI mein dikhao
        saveToMainChat('bot', aiResponse);          // ek baar localStorage mein save karo
        orb?.classList.remove("thinking");
 
        if (!isMuted) speakText(aiResponse);
        else setCallStatus(isListening ? "Listening..." : "Tap mic to speak");
 
    } catch (err) {
        orb?.classList.remove("thinking");
        const errMsg = "Something went wrong, please try again.";
        addCallMessage('assistant', errMsg);
        if (!isMuted) speakText(errMsg);
    }
}

    // ========================================
    // ADD MESSAGE TO CHAT
    // ========================================
    function addCallMessage(role, text) {
    const messageContainer = document.querySelector(".message");
    if (!messageContainer) return;
 
    messageContainer.style.display = "flex";
    const welcome = document.querySelector(".wecome-message");
    if (welcome) welcome.style.display = "none";
 
    const footer = document.querySelector(".chat-container-footer");
    if (footer && !footer.classList.contains("input-fixed-bottom")) {
        footer.classList.add("input-fixed-bottom");
    }
 
    const wrapper = document.createElement("div");
    // data-voice-call attribute lagao taaki script.js dobara save na kare
    wrapper.setAttribute("data-voice-call", "true");
 
    if (role === 'user') {
        wrapper.className = "user-message-wrapper";
        wrapper.innerHTML = `
            <div class="userMess"><span>${text}</span></div>
            <div class="msg-actions user-actions">
                <button class="copy-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
            </div>`;
    } else {
        wrapper.className = "bot-message-wrapper";
        wrapper.innerHTML = `
            <div class="botMess">${text}</div>
            <div class="msg-actions bot-actions">
                <button class="copy-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
            </div>`;
    }
 
    messageContainer.appendChild(wrapper);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    // saveToMainChat yahan se HATA diya — processUserSpeech mein hoga
}

    // ========================================
    // ELEVENLABS TTS
    // ========================================
    async function speakText(text) {
        if (!text || isMuted) return;
        stopAudio();
        synthesis.cancel();

        const orb = document.getElementById("call-orb");

        if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== "YOUR_ELEVENLABS_API_KEY_HERE") {
            try {
                await speakElevenLabs(text, orb);
                return;
            } catch (err) {
                console.warn("⚠️ ElevenLabs failed, using browser TTS:", err);
            }
        }

        speakBrowser(text, orb);
    }

    async function speakElevenLabs(text, orb) {
        const voiceId = currentVoiceProfile?.elevenId || ELEVENLABS_VOICES.rachel.id;

        setCallStatus("Speaking...");
        orb?.classList.add("speaking");
        isSpeaking = true;

        try { if (recognition) recognition.stop(); } catch (e) {}

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
            method: "POST",
            headers: {
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg"
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_turbo_v2",
                voice_settings: {
                    stability:         currentVoiceProfile?.stability  ?? 0.5,
                    similarity_boost:  currentVoiceProfile?.similarity ?? 0.8,
                    style:             currentVoiceProfile?.style      ?? 0.5,
                    use_speaker_boost: true
                }
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            isSpeaking = false;
            if (isListening) setTimeout(() => { try { recognition.start(); } catch (e) {} }, 300);
            throw new Error(err?.detail?.message || "ElevenLabs API error");
        }

        const audioBlob = await response.blob();
        const audioUrl  = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);

        currentAudio.onended = () => {
            isSpeaking = false;
            orb?.classList.remove("speaking");
            URL.revokeObjectURL(audioUrl);
            setCallStatus(isListening ? "Listening..." : "Tap mic to speak");
            if (isListening) {
                setTimeout(() => {
                    try { recognition.start(); } catch (e) {}
                }, 400);
            }
        };
        currentAudio.onerror = () => {
            isSpeaking = false;
            orb?.classList.remove("speaking");
            if (isListening) setTimeout(() => { try { recognition.start(); } catch (e) {} }, 400);
        };

        await currentAudio.play();
    }

    function speakBrowser(text, orb) {
        const utterance = new SpeechSynthesisUtterance(text);

        if (currentVoiceProfile) {
            utterance.pitch = currentVoiceProfile.pitch ?? 1.0;
            utterance.rate  = currentVoiceProfile.rate  ?? 1.0;
            if (availableVoices.length > 0) {
                const isFemale = (utterance.pitch >= 1.0);
                const voice = availableVoices.find(v =>
                    isFemale
                        ? v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.toLowerCase().includes('female')
                        : v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female')
                ) || availableVoices[0];
                utterance.voice = voice;
            }
        }

        utterance.onstart = () => {
            isSpeaking = true;
            orb?.classList.add("speaking");
            setCallStatus("Speaking...");
            try { if (recognition) recognition.stop(); } catch (e) {}
        };
        utterance.onend = () => {
            isSpeaking = false;
            orb?.classList.remove("speaking");
            setCallStatus(isListening ? "Listening..." : "Tap mic to speak");
            if (isListening) {
                setTimeout(() => {
                    try { recognition.start(); } catch (e) {}
                }, 400);
            }
        };
        utterance.onerror = () => {
            isSpeaking = false;
            orb?.classList.remove("speaking");
            if (isListening) setTimeout(() => { try { recognition.start(); } catch (e) {} }, 400);
        };

        synthesis.speak(utterance);
    }

    function stopAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.src = "";
            currentAudio = null;
        }
        isSpeaking = false;
        document.getElementById("call-orb")?.classList.remove("speaking");
    }

    // ========================================
    // GEMINI AI RESPONSE
    // ========================================
    async function getAIResponse(userText) {
        const baseInstruction = MODEL_INSTRUCTIONS[currentModel] || MODEL_INSTRUCTIONS.default;

        const detectedLang    = detectLanguage(userText);
        const langInstruction = getLangInstruction(detectedLang);
        const systemInstruction = `${baseInstruction}\n\nABHI KE MESSAGE KI LANGUAGE: ${langInstruction}`;

        const contextMessages = conversationHistory.slice(-6);

        const chatHistory = contextMessages.map(msg => ({
            role:  msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const userParts = [{ text: userText }];
        for (const f of attachedFiles) {
            userParts.push({
                inline_data: { mime_type: f.type, data: f.data }
            });
        }

        const contents = [
            { role: 'user', parts: [{ text: systemInstruction }] },
            ...chatHistory,
            { role: 'user', parts: userParts }
        ];

        let attempts = GEMINI_API_KEYS.length;
        while (attempts > 0) {
            try {
                const res  = await fetch(getGeminiURL(), {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ contents })
                });
                const data = await res.json();
                if (!res.ok || data.error) throw new Error('API error');
                const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!aiText) throw new Error('No response');

                attachedFiles = [];
                renderFilePreview();

                return aiText;
            } catch (err) {
                currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
                attempts--;
            }
        }
        return "Having trouble connecting, please try again.";
    }

    // ========================================
    // SAVE TO CHAT HISTORY
    // ========================================
    function saveToMainChat(role, text) {
        const cid   = localStorage.getItem("activeChatId");
        const chats = JSON.parse(localStorage.getItem("chats")) || {};
        if (cid && chats[cid]) {
            chats[cid].messages.push({
                sender: role === 'user' ? 'user' : 'bot',
                text,
                isVoiceChat: true,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem("chats", JSON.stringify(chats));
        }
    }

    // ========================================
    // HELPERS
    // ========================================
    function setCallStatus(text) {
        const el = document.getElementById("call-status-label");
        if (el) el.textContent = text;
    }

    function endCall() {
        stopListening();
        stopAudio();
        synthesis.cancel();
        isCallActive        = false;
        isMuted             = false;
        isSpeaking          = false;
        conversationHistory = [];
        attachedFiles       = [];

        const callUI = document.getElementById("inline-call-ui");
        if (callUI) {
            callUI.classList.add("call-ui-exit");
            setTimeout(() => callUI.remove(), 300);
        }
        showInputElements();
        console.log("📵 Call ended");
    }

    // ========================================
    // WAVEFORM BUTTON → START CALL
    // ========================================
    waveformBtn.addEventListener("click", () => {
        if (isCallActive) return;
        isCallActive = true;
        createCallUI();
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'v' && !e.shiftKey && !isCallActive) {
            const el = document.activeElement;
            if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
                e.preventDefault();
                isCallActive = true;
                createCallUI();
            }
        }
    });

    console.log("✅ Inline Voice Call Ready!");
});