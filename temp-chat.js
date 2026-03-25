// ========================================
// TEMPORARY CHAT FEATURE - FIXED
// Popup appears BEFORE creating chat
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    const tempChatBtn = document.querySelector(".temp-chat-btn");
    
    if (!tempChatBtn) {
        console.error("❌ Temp chat button not found!");
        return;
    }

    // ========================================
    // SHOW CONFIRMATION POPUP FIRST
    // ========================================
    
    tempChatBtn.addEventListener("click", () => {
        console.log("🕐 Temp chat button clicked - showing popup...");
        
        // Check if current chat already has messages
        const activeChatId = localStorage.getItem("activeChatId");
        const chats = JSON.parse(localStorage.getItem("chats")) || {};
        
        if (activeChatId && chats[activeChatId]) {
            const activeChat = chats[activeChatId];
            
            // If already temporary, ignore
            if (activeChat.isTemporary) {
                alert("This chat is already temporary!");
                return;
            }
            
            // If chat has messages, don't allow conversion
            if (activeChat.messages && activeChat.messages.length > 0) {
                alert("Cannot convert a chat with messages to temporary chat. Please create a new chat first.");
                return;
            }
        }
        
        // Calculate times
        const startTime = new Date();
        // const expiryTime = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
         const expiryTime = new Date(Date.now() + (5 * 60 * 1000)); // 5 minutes
        
        // Show popup FIRST
        showTempChatConfirmation(startTime, expiryTime);
    });

    // ========================================
    // CONFIRMATION POPUP
    // ========================================
    
    function showTempChatConfirmation(startTime, expiryTime) {
        // Create popup overlay
        const popup = document.createElement('div');
        popup.className = 'temp-chat-popup-overlay';
        popup.innerHTML = `
            <div class="temp-chat-popup">
                <div class="temp-chat-popup-icon">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <h2>⏰ Start Temporary Chat?</h2>
                <p class="temp-chat-popup-desc">This chat will automatically delete after 24 hours</p>
                
                <div class="temp-chat-time-display">
                    <div class="time-box">
                        <i class="fa-solid fa-play-circle"></i>
                        <div class="time-info">
                            <span class="time-label">Start Time</span>
                            <span class="time-value">${formatTime(startTime)}</span>
                            <span class="time-date">${formatDate(startTime)}</span>
                        </div>
                    </div>
                    
                    <div class="time-arrow">
                        <i class="fa-solid fa-arrow-right"></i>
                        <span class="duration-label">24 Hours</span>
                    </div>
                    
                    <div class="time-box end-time">
                        <i class="fa-solid fa-stop-circle"></i>
                        <div class="time-info">
                            <span class="time-label">End Time</span>
                            <span class="time-value">${formatTime(expiryTime)}</span>
                            <span class="time-date">${formatDate(expiryTime)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="temp-chat-popup-warning">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>All messages will be permanently deleted at end time</span>
                </div>
                
                <div class="temp-chat-popup-buttons">
                    <button class="temp-chat-cancel-btn">Cancel</button>
                    <button class="temp-chat-start-btn">Start Temporary Chat</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Animate in
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
        
        // Cancel button
        popup.querySelector('.temp-chat-cancel-btn').addEventListener('click', () => {
            closePopup(popup);
        });
        
        // Start button - THIS creates the chat
        popup.querySelector('.temp-chat-start-btn').addEventListener('click', () => {
            createTemporaryChat(expiryTime);
            closePopup(popup);
        });
        
        // Close on overlay click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePopup(popup);
            }
        });
    }
    
    function closePopup(popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }

    // ========================================
    // CONVERT CURRENT CHAT TO TEMPORARY (instead of creating new)
    // ========================================
    
    function createTemporaryChat(expiryTime) {
        console.log("🕐 Converting current chat to temporary...");
        
        // Get existing chats
        const chats = JSON.parse(localStorage.getItem("chats")) || {};
        const activeChatId = localStorage.getItem("activeChatId");
        const currentModel = localStorage.getItem("currentModel") || "default";
        
        let tempChatId;
        
        // If there's an active chat with NO messages, convert it
        if (activeChatId && chats[activeChatId] && chats[activeChatId].messages.length === 0) {
            console.log("✅ Converting existing empty chat to temporary");
            
            tempChatId = activeChatId;
            
            // Update existing chat to be temporary
            chats[tempChatId].isTemporary = true;
            chats[tempChatId].expiryTime = expiryTime.getTime();
            chats[tempChatId].createdAt = Date.now();
            chats[tempChatId].title = "Temporary Chat";
            
        } else {
            // Create new temp chat only if no empty chat exists
            console.log("📝 Creating new temporary chat");
            
            tempChatId = "temp_" + Date.now();
            
            chats[tempChatId] = {
                title: "Temporary Chat",
                messages: [],
                firstMessageSent: false,
                pinned: false,
                model: currentModel,
                isTemporary: true,
                expiryTime: expiryTime.getTime(),
                createdAt: Date.now()
            };
        }
        
        // Save chats
        localStorage.setItem("chats", JSON.stringify(chats));
        localStorage.setItem("activeChatId", tempChatId);
        
        console.log("✅ Temporary chat ready:", tempChatId);
        console.log("⏰ Expires at:", new Date(expiryTime).toLocaleString());
        
        // Reload to show changes
        location.reload();
    }

    // ========================================
    // TIME FORMATTING FUNCTIONS
    // ========================================
    
    function formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }
    
    function formatDate(date) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // ========================================
    // AUTO-DELETE EXPIRED CHATS
    // ========================================
    
    function deleteExpiredTempChats() {
        const chats = JSON.parse(localStorage.getItem("chats")) || {};
        const currentTime = Date.now();
        let deletedCount = 0;
        
        Object.keys(chats).forEach(chatId => {
            const chat = chats[chatId];
            
            // Check if temporary and expired
            if (chat.isTemporary && chat.expiryTime && currentTime > chat.expiryTime) {
                console.log("🗑️ Deleting expired temp chat:", chatId);
                delete chats[chatId];
                deletedCount++;
            }
        });
        
        if (deletedCount > 0) {
            localStorage.setItem("chats", JSON.stringify(chats));
            console.log(`✅ Deleted ${deletedCount} expired temporary chat(s)`);
            
            // If current chat was deleted, reload
            const activeChatId = localStorage.getItem("activeChatId");
            if (activeChatId && !chats[activeChatId]) {
                location.reload();
            }
        }
    }

    // ========================================
    // CHECK FOR EXPIRED CHATS ON PAGE LOAD
    // ========================================
    
    deleteExpiredTempChats();
    
    // Check every minute for expired chats
    setInterval(deleteExpiredTempChats, 60 * 1000);

    // ========================================
    // UPDATE CHAT LIST TO SHOW TEMP ICON
    // ========================================
    
    // Wait for updateChatList to be defined
    const waitForUpdateChatList = setInterval(() => {
        if (typeof window.updateChatList === 'function') {
            clearInterval(waitForUpdateChatList);
            
            const originalUpdateChatList = window.updateChatList;
            
            window.updateChatList = function() {
                originalUpdateChatList.call(this);
                setTimeout(() => addTemporaryIcons(), 100);
            };
            
            // Add icons immediately if chats already loaded
            addTemporaryIcons();
        }
    }, 100);

    function addTemporaryIcons() {
        const chats = JSON.parse(localStorage.getItem("chats")) || {};
        const chatItems = document.querySelectorAll(".chat-item");
        
        chatItems.forEach(item => {
            const chatText = item.querySelector(".chat-item-text");
            if (!chatText) return;
            
            const chatTitle = chatText.textContent.trim();
            
            // Find matching chat
            const chatId = Object.keys(chats).find(id => {
                return chats[id].title === chatTitle || chatTitle.includes("Temporary");
            });
            
            if (chatId && chats[chatId].isTemporary) {
                // Remove existing temp icon if any
                const existingIcon = item.querySelector(".temp-chat-icon");
                if (existingIcon) existingIcon.remove();
                
                // Calculate time remaining
                const timeRemaining = getTimeRemaining(chats[chatId].expiryTime);
                
                // Add temporary chat icon
                const tempIcon = document.createElement("i");
                tempIcon.className = "fa-solid fa-clock temp-chat-icon";
                tempIcon.title = timeRemaining;
                
                // Change color if expiring soon (less than 1 hour)
                const msRemaining = chats[chatId].expiryTime - Date.now();
                if (msRemaining < (60 * 60 * 1000)) {
                    tempIcon.classList.add("temp-chat-expiring");
                }
                
                // Insert before three dots
                const threeDots = item.querySelector(".cht-historyThreedots");
                if (threeDots) {
                    item.insertBefore(tempIcon, threeDots);
                } else {
                    chatText.appendChild(tempIcon);
                }
            }
        });
    }

    function getTimeRemaining(expiryTime) {
        const remaining = expiryTime - Date.now();
        
        if (remaining <= 0) return "Expired";
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `Expires in ${hours}h ${minutes}m`;
        } else {
            return `Expires in ${minutes}m`;
        }
    }

    // ========================================
    // UPDATE TEMP CHAT BUTTON STATE
    // ========================================
    
    function updateTempButtonState() {
        const activeChatId = localStorage.getItem("activeChatId");
        if (!activeChatId) return;
        
        const chats = JSON.parse(localStorage.getItem("chats")) || {};
        const activeChat = chats[activeChatId];
        
        if (activeChat && activeChat.isTemporary) {
            tempChatBtn.classList.add("active-temp");
            tempChatBtn.style.backgroundColor = "#f59e0b";
            tempChatBtn.style.color = "#fff";
            tempChatBtn.title = getTimeRemaining(activeChat.expiryTime);
        } else {
            tempChatBtn.classList.remove("active-temp");
            tempChatBtn.style.backgroundColor = "";
            tempChatBtn.style.color = "";
            tempChatBtn.title = "Turn on Temporary Chat";
        }
    }

    // Update button state
    updateTempButtonState();
    setInterval(updateTempButtonState, 5000);

    // ========================================
    // ADD TEMP INFO TO DROPDOWN
    // ========================================
    
    const waitForDropdown = setInterval(() => {
        if (typeof window.openChatDropdown === 'function') {
            clearInterval(waitForDropdown);
            
            const originalOpenChatDropdown = window.openChatDropdown;
            
            window.openChatDropdown = function(x, y, chatId) {
                if (originalOpenChatDropdown) {
                    originalOpenChatDropdown(x, y, chatId);
                }
                
                const chats = JSON.parse(localStorage.getItem("chats")) || {};
                const chat = chats[chatId];
                
                if (chat && chat.isTemporary) {
                    setTimeout(() => {
                        const dropdown = document.querySelector(".chat-dropdown");
                        if (dropdown) {
                            const expiryInfo = document.createElement("div");
                            expiryInfo.className = "temp-chat-info";
                            expiryInfo.innerHTML = `<i class="fa-solid fa-clock"></i> ${getTimeRemaining(chat.expiryTime)}`;
                            
                            dropdown.insertBefore(expiryInfo, dropdown.firstChild);
                        }
                    }, 10);
                }
            };
        }
    }, 100);

    console.log("✅ Temporary chat feature loaded (with confirmation popup)");
});
