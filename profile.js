// profile.js — Firebase integrated, fully updated

(function () {
    function initProfile() {
        const profileTrigger = document.getElementById("profile-trigger");
        const profilePage    = document.querySelector(".profile-page");
        const backBtn        = document.querySelector(".back-to-chats-btn");
        const mainContainer  = document.querySelector(".main-container");
        if (!profileTrigger || !profilePage) return;

        const editAvatarBtn      = document.querySelector(".edit-avatar-btn");
        const avatarUpload       = document.getElementById("avatar-upload");
        const profileAvatarImg   = document.getElementById("profile-avatar-img");
        const profileAvatarIcon  = document.getElementById("profile-avatar-icon");
        const removeAvatarBtn    = document.getElementById("remove-avatar-btn");
        const sidebarImg         = document.getElementById("sidebar-profile-img");
        const sidebarIcon        = document.getElementById("sidebar-profile-placeholder");
        const editFieldBtns      = document.querySelectorAll(".edit-field-btn");
        const storageBarFill     = document.getElementById("storage-bar-fill");
        const storageUsed        = document.getElementById("storage-used");
        const storagePercentage  = document.getElementById("storage-percentage");
        const chatsSize          = document.getElementById("chats-size");
        const voiceSize          = document.getElementById("voice-size");
        const imagesSize         = document.getElementById("images-size");
        const clearAllChatsBtn   = document.getElementById("clear-all-chats-btn");
        const clearVoiceBtn      = document.getElementById("clear-voice-messages-btn");
        const themeOptions       = document.querySelectorAll(".theme-option");
        const fontSizeBtns       = document.querySelectorAll(".font-size-btn");
        const exportDataBtn      = document.getElementById("export-data-btn");
        const deleteAccountBtn   = document.getElementById("delete-account-btn");

        // ── Data helpers ─────────────────────────────────
        function loadProfile() {
            return JSON.parse(localStorage.getItem("userProfile") || "{}");
        }
        function saveProfile(updates) {
            const merged = { ...loadProfile(), ...updates };
            localStorage.setItem("userProfile", JSON.stringify(merged));
            if (updates.username !== undefined) {
                const el = document.getElementById("sidebar-username");
                if (el) el.textContent = updates.username;
            }
            // Push to Firestore if available
            if (window.__saveProfileToFirebase) {
                const firestoreUpdates = {};
                if (updates.username !== undefined) firestoreUpdates.name = updates.username;
                if (updates.bio      !== undefined) firestoreUpdates.bio  = updates.bio;
                if (Object.keys(firestoreUpdates).length > 0)
                    window.__saveProfileToFirebase(firestoreUpdates);
            }
        }

        // ── Avatar helpers ────────────────────────────────
        function updateSidebarAvatar(url) {
            if (url) {
                if (sidebarImg)  { sidebarImg.src = url; sidebarImg.style.display = "block"; }
                if (sidebarIcon) sidebarIcon.style.display = "none";
            } else {
                if (sidebarImg)  sidebarImg.style.display = "none";
                if (sidebarIcon) sidebarIcon.style.display = "block";
            }
        }

        // ── Init sidebar on load ──────────────────────────
        (function syncSidebar() {
            const p = loadProfile();
            updateSidebarAvatar(p.avatar || null);
            const nameEl = document.getElementById("sidebar-username");
            if (nameEl && p.username) nameEl.textContent = p.username;
            applyTheme(p.theme || "dark");
        })();

        // ── Init profile page fields ──────────────────────
        function initializeProfile() {
            const p = loadProfile();
            const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
            set("username-input", p.username);
            set("email-input",    p.email);
            set("phone-input",    p.phone);
            set("bio-input",      p.bio);

            if (p.avatar) {
                if (profileAvatarImg)  { profileAvatarImg.src = p.avatar; profileAvatarImg.style.display = "block"; }
                if (profileAvatarIcon) profileAvatarIcon.style.display = "none";
                if (removeAvatarBtn)   removeAvatarBtn.style.display = "block";
            } else {
                if (profileAvatarImg)  profileAvatarImg.style.display = "none";
                if (profileAvatarIcon) profileAvatarIcon.style.display = "block";
                if (removeAvatarBtn)   removeAvatarBtn.style.display = "none";
            }

            themeOptions.forEach(b => b.classList.toggle("active", b.dataset.theme === (p.theme || "dark")));
            fontSizeBtns.forEach(b => b.classList.toggle("active",  b.dataset.size  === (p.fontSize || "medium")));
            calculateStorage();
        }

        // ── Navigation ────────────────────────────────────
        profileTrigger.addEventListener("click", e => {
            e.stopPropagation();
            mainContainer.style.display = "none";
            profilePage.classList.remove("hidden");
            initializeProfile();
        });
        backBtn?.addEventListener("click", () => {
            profilePage.classList.add("hidden");
            mainContainer.style.display = "flex";
        });

        // ── Avatar upload ─────────────────────────────────
        editAvatarBtn?.addEventListener("click", () => avatarUpload?.click());
        avatarUpload?.addEventListener("change", e => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
            if (file.size > 500*1024) { alert("Image too large! Max 500KB"); return; }
            const reader = new FileReader();
            reader.onload = ev => {
                const url = ev.target.result;
                saveProfile({ avatar: url });
                if (profileAvatarImg)  { profileAvatarImg.src = url; profileAvatarImg.style.display = "block"; }
                if (profileAvatarIcon) profileAvatarIcon.style.display = "none";
                if (removeAvatarBtn)   removeAvatarBtn.style.display = "block";
                updateSidebarAvatar(url);
            };
            reader.readAsDataURL(file);
        });
        removeAvatarBtn?.addEventListener("click", () => {
            if (!confirm("Remove profile picture?")) return;
            saveProfile({ avatar: null });
            if (profileAvatarImg)  profileAvatarImg.style.display = "none";
            if (profileAvatarIcon) profileAvatarIcon.style.display = "block";
            removeAvatarBtn.style.display = "none";
            updateSidebarAvatar(null);
        });

        // ── Field editing ─────────────────────────────────
        editFieldBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const field = btn.dataset.field;
                const input = document.getElementById(`${field}-input`);
                if (!input) return;
                if (input.disabled) {
                    input.disabled = false; input.focus();
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    btn.classList.add("active");
                } else {
                    input.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-pen"></i>';
                    btn.classList.remove("active");
                    saveProfile({ [field]: input.value.trim() });
                }
            });
        });

        // ── Storage ───────────────────────────────────────
        function calculateStorage() {
            let chatBytes = 0, voiceBytes = 0, imgBytes = 0;
            const raw = localStorage.getItem("chats");
            if (raw) {
                chatBytes = new Blob([raw]).size;
                try {
                    Object.values(JSON.parse(raw)).forEach(chat => {
                        chat.messages.forEach(m => {
                            if (m.audioUrl) voiceBytes += m.audioUrl.length;
                            if (m.image)    imgBytes   += m.image.length;
                        });
                    });
                } catch(e) {}
            }
            const total = chatBytes + voiceBytes + imgBytes;
            const pct   = Math.min((total / (5*1024*1024)) * 100, 100);
            if (storageBarFill)    storageBarFill.style.width     = pct + "%";
            if (storageUsed)       storageUsed.textContent        = fmt(total);
            if (storagePercentage) storagePercentage.textContent  = pct.toFixed(1) + "%";
            if (chatsSize)         chatsSize.textContent  = fmt(chatBytes);
            if (voiceSize)         voiceSize.textContent  = fmt(voiceBytes);
            if (imagesSize)        imagesSize.textContent = fmt(imgBytes);
            if (storageBarFill) {
                storageBarFill.style.background = pct > 90
                    ? "linear-gradient(90deg,#ff4d4d,#dc2626)"
                    : pct > 70
                        ? "linear-gradient(90deg,#f59e0b,#d97706)"
                        : "linear-gradient(90deg,#3b82f6,#8b5cf6)";
            }
        }
        function fmt(bytes) {
            if (!bytes) return "0 Bytes";
            const k=1024, s=["Bytes","KB","MB","GB"], i=Math.floor(Math.log(bytes)/Math.log(k));
            return (bytes/Math.pow(k,i)).toFixed(2)+" "+s[i];
        }

        // Storage actions
        clearAllChatsBtn?.addEventListener("click", () => {
            if (!confirm("Delete ALL chats? This cannot be undone!")) return;
            localStorage.removeItem("chats"); localStorage.removeItem("activeChatId");
            calculateStorage(); alert("All chats deleted!");
        });
        clearVoiceBtn?.addEventListener("click", () => {
            if (!confirm("Delete all voice messages?")) return;
            const raw = localStorage.getItem("chats"); if (!raw) return;
            const chats = JSON.parse(raw);
            Object.values(chats).forEach(chat => {
                chat.messages = chat.messages.map(m =>
                    m.isVoice ? { ...m, audioUrl: null, text: "[Voice deleted]" } : m
                );
            });
            localStorage.setItem("chats", JSON.stringify(chats));
            calculateStorage(); alert("Voice messages cleared!");
        });

        // ── Theme ─────────────────────────────────────────
        function applyTheme(theme) {
            document.body.classList.remove("light-mode","dark-mode","auto-mode");
            if (theme === "light") document.body.classList.add("light-mode");
            else if (theme === "auto") {
                document.body.classList.add(
                    window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark-mode" : "light-mode"
                );
            }
        }
        themeOptions.forEach(btn => {
            btn.addEventListener("click", () => {
                themeOptions.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                saveProfile({ theme: btn.dataset.theme });
                applyTheme(btn.dataset.theme);
            });
        });
        applyTheme(loadProfile().theme || "dark");

        // ── Font size ─────────────────────────────────────
        fontSizeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                fontSizeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                saveProfile({ fontSize: btn.dataset.size });
                const mc = document.querySelector(".message");
                if (mc) { mc.classList.remove("font-small","font-medium","font-large"); mc.classList.add(`font-${btn.dataset.size}`); }
            });
        });

        // ── Export data ───────────────────────────────────
        exportDataBtn?.addEventListener("click", () => {
            const data = { profile: loadProfile(), chats: JSON.parse(localStorage.getItem("chats")||"{}"), exportDate: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
            const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `p-search-data-${Date.now()}.json` });
            a.click(); URL.revokeObjectURL(a.href);
            alert("Data exported!");
        });

        // ── Delete account ────────────────────────────────
        deleteAccountBtn?.addEventListener("click", () => {
            if (!confirm("Delete your account? All data will be permanently lost!")) return;
            if (!confirm("Are you absolutely sure?")) return;
            localStorage.clear();
            if (window.__firebaseSignOut) {
                window.__firebaseSignOut().then(() => window.location.replace("auth.html"));
            } else { location.reload(); }
        });

        // Logout is handled by Firebase module in index.html
        // but fallback:
        const legacyLogout = document.querySelector(".logout-btn:not(#firebase-logout-btn)");
        legacyLogout?.addEventListener("click", async () => {
            if (!confirm("Logout?")) return;
            if (window.__firebaseSignOut) {
                await window.__firebaseSignOut();
                window.location.replace("auth.html");
            } else { location.reload(); }
        });

        console.log("✅ Profile loaded");
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initProfile);
    else initProfile();
})();