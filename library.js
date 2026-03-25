// ========================================
// LIBRARY FEATURE - FIXED VERSION
// Store all files (PDFs, images, videos) by model and chat
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    
    // ========================================
    // LIBRARY DATA STRUCTURE
    // ========================================
    
    /*
    library = {
        "default": {
            "chat_123": {
                chatTitle: "My Chat",
                files: [
                    {
                        id: "file_1234567890",
                        name: "document.pdf",
                        type: "application/pdf",
                        data: "base64...",
                        size: 12345,
                        uploadedAt: 1234567890,
                        chatId: "chat_123"
                    }
                ]
            }
        },
        "girlfriend": { ... },
        "boyfriend": { ... }
    }
    */

    // ========================================
    // SAVE FILE TO LIBRARY
    // ========================================
    
    function saveFileToLibrary(file, fileData, chatId, chatTitle) {
        const currentModel = localStorage.getItem("currentModel") || "default";
        
        // Get library
        let library = JSON.parse(localStorage.getItem("library")) || {};
        
        // Initialize model if not exists
        if (!library[currentModel]) {
            library[currentModel] = {};
        }
        
        // Initialize chat folder if not exists
        if (!library[currentModel][chatId]) {
            library[currentModel][chatId] = {
                chatTitle: chatTitle || "Untitled Chat",
                files: []
            };
        }
        
        // Create file object
        const fileObject = {
            id: "file_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            data: fileData, // base64
            size: file.size,
            uploadedAt: Date.now(),
            chatId: chatId
        };
        
        // Add file to library
        library[currentModel][chatId].files.push(fileObject);
        
        // Save to localStorage
        try {
            localStorage.setItem("library", JSON.stringify(library));
            console.log("✅ File saved to library:", file.name);
            return fileObject.id;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error("❌ Storage full! Cannot save file to library.");
                alert("Storage full! Please delete some files from library.");
                return null;
            }
            throw e;
        }
    }

    // ========================================
    // GET LIBRARY FOR CURRENT MODEL
    // ========================================
    
    function getLibraryForCurrentModel() {
        const currentModel = localStorage.getItem("currentModel") || "default";
        const library = JSON.parse(localStorage.getItem("library")) || {};
        return library[currentModel] || {};
    }

    // ========================================
    // GET FILES FOR SPECIFIC CHAT
    // ========================================
    
    function getFilesForChat(chatId) {
        const currentModel = localStorage.getItem("currentModel") || "default";
        const library = JSON.parse(localStorage.getItem("library")) || {};
        
        if (library[currentModel] && library[currentModel][chatId]) {
            return library[currentModel][chatId].files || [];
        }
        
        return [];
    }

    // ========================================
    // DELETE FILE FROM LIBRARY
    // ========================================
    
    function deleteFileFromLibrary(fileId) {
        const currentModel = localStorage.getItem("currentModel") || "default";
        let library = JSON.parse(localStorage.getItem("library")) || {};
        
        if (!library[currentModel]) return false;
        
        // Find and remove file
        let deleted = false;
        Object.keys(library[currentModel]).forEach(chatId => {
            const files = library[currentModel][chatId].files;
            const index = files.findIndex(f => f.id === fileId);
            
            if (index !== -1) {
                files.splice(index, 1);
                deleted = true;
                
                // If no files left in chat folder, remove it
                if (files.length === 0) {
                    delete library[currentModel][chatId];
                }
            }
        });
        
        if (deleted) {
            localStorage.setItem("library", JSON.stringify(library));
            console.log("✅ File deleted from library");
        }
        
        return deleted;
    }

    // ========================================
    // DELETE ALL FILES FOR A CHAT
    // ========================================
    
    function deleteAllFilesForChat(chatId) {
        const currentModel = localStorage.getItem("currentModel") || "default";
        let library = JSON.parse(localStorage.getItem("library")) || {};
        
        if (library[currentModel] && library[currentModel][chatId]) {
            delete library[currentModel][chatId];
            localStorage.setItem("library", JSON.stringify(library));
            console.log("✅ All files deleted for chat:", chatId);
            return true;
        }
        
        return false;
    }

    // ========================================
    // GET LIBRARY STATS
    // ========================================
    
    function getLibraryStats() {
        const library = JSON.parse(localStorage.getItem("library")) || {};
        
        let totalFiles = 0;
        let totalSize = 0;
        let filesByType = {
            images: 0,
            videos: 0,
            pdfs: 0,
            others: 0
        };
        
        Object.keys(library).forEach(model => {
            Object.keys(library[model]).forEach(chatId => {
                const files = library[model][chatId].files || [];
                
                files.forEach(file => {
                    totalFiles++;
                    totalSize += file.size || 0;
                    
                    if (file.type.startsWith('image/')) {
                        filesByType.images++;
                    } else if (file.type.startsWith('video/')) {
                        filesByType.videos++;
                    } else if (file.type === 'application/pdf') {
                        filesByType.pdfs++;
                    } else {
                        filesByType.others++;
                    }
                });
            });
        });
        
        return {
            totalFiles,
            totalSize,
            filesByType
        };
    }

    // ========================================
    // EXPOSE FUNCTIONS GLOBALLY
    // ========================================
    
    // Make saveFileToLibrary available globally for script.js
    window.saveFileToLibrary = saveFileToLibrary;
    
    window.libraryFunctions = {
        saveFileToLibrary,
        getLibraryForCurrentModel,
        getFilesForChat,
        deleteFileFromLibrary,
        deleteAllFilesForChat,
        getLibraryStats
    };

    // ========================================
    // HELPER FUNCTION
    // ========================================
    
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ========================================
    // OPEN LIBRARY PAGE
    // ========================================
    
    const libraryBtn = document.querySelector('.box[title="Library"]');
    
    if (libraryBtn) {
        libraryBtn.addEventListener("click", () => {
            openLibraryPage();
        });
    }

    function openLibraryPage() {
        const mainContainer = document.querySelector(".main-container");
        const profilePage = document.querySelector(".profile-page");
        const sidebar = document.querySelector(".sidebar");
        
        // Hide main container and profile
        if (mainContainer) {
            mainContainer.style.display = "none";
        }
        if (profilePage) {
            profilePage.classList.add("hidden");
        }
        
        // Create library page if not exists
        let libraryPage = document.querySelector(".library-page");
        
        if (!libraryPage) {
            libraryPage = createLibraryPage();
            document.body.appendChild(libraryPage);
        }
        
        // Show library page
        libraryPage.classList.remove("hidden");
        
        // Load library content
        loadLibraryContent();
    }

    function createLibraryPage() {
        const libraryPage = document.createElement("div");
        libraryPage.className = "library-page hidden";
        
        libraryPage.innerHTML = `
            <div class="library-header">
                <div class="buttons-and-title"> 
                    <button class="back-to-chats-btn library-back-btn">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back to Chats</span>
                    
                </button>
                <h1>📁 Library</h1>
                </div>
                
                
                <div class="library-stats">
                    <span id="library-total-files">0 files</span>
                    <span id="library-total-size">0 KB</span>
                </div>
            </div>
            
            <div class="library-content">
                <div class="library-sidebar">
                    <h3>Filter by Type</h3>
                    <button class="library-filter-btn active" data-filter="all">
                        <i class="fa-solid fa-folder"></i> All Files
                    </button>
                    <button class="library-filter-btn" data-filter="images">
                        <i class="fa-solid fa-image"></i> Images
                    </button>
                    <button class="library-filter-btn" data-filter="videos">
                        <i class="fa-solid fa-video"></i> Videos
                    </button>
                    <button class="library-filter-btn" data-filter="pdfs">
                        <i class="fa-solid fa-file-pdf"></i> PDFs
                    </button>
                    <button class="library-filter-btn" data-filter="others">
                        <i class="fa-solid fa-file"></i> Others
                    </button>
                    
                    <hr class="library-divider" />
                    
                    <button class="library-clear-btn">
                        <i class="fa-solid fa-trash"></i> Clear All
                    </button>
                </div>
                
                <div class="library-main">
                    <div id="library-folders-container"></div>
                </div>
            </div>
        `;
        
        // Back button - FIXED
        libraryPage.querySelector(".library-back-btn").addEventListener("click", () => {
            const mainContainer = document.querySelector(".main-container");
            
            // Hide library
            libraryPage.classList.add("hidden");
            
            // Show main container
            if (mainContainer) {
                mainContainer.style.display = "flex";
            }
        });
        
        // Filter buttons
        libraryPage.querySelectorAll(".library-filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                libraryPage.querySelectorAll(".library-filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                loadLibraryContent(btn.dataset.filter);
            });
        });
        
        // Clear all button
        libraryPage.querySelector(".library-clear-btn").addEventListener("click", () => {
            if (confirm("Delete ALL files from library? This cannot be undone!")) {
                const currentModel = localStorage.getItem("currentModel") || "default";
                let library = JSON.parse(localStorage.getItem("library")) || {};
                library[currentModel] = {};
                localStorage.setItem("library", JSON.stringify(library));
                loadLibraryContent();
            }
        });
        
        return libraryPage;
    }

    function loadLibraryContent(filter = "all") {
        const container = document.getElementById("library-folders-container");
        if (!container) return;
        
        container.innerHTML = "";
        
        const library = getLibraryForCurrentModel();
        const chatIds = Object.keys(library);
        
        if (chatIds.length === 0) {
            container.innerHTML = `
                <div class="library-empty">
                    <i class="fa-solid fa-folder-open"></i>
                    <h3>No files in library</h3>
                    <p>Upload files in your chats to see them here</p>
                </div>
            `;
            updateLibraryStats();
            return;
        }
        
        // Create folders
        chatIds.forEach(chatId => {
            const chatFolder = library[chatId];
            const files = chatFolder.files.filter(file => {
                if (filter === "all") return true;
                if (filter === "images") return file.type.startsWith("image/");
                if (filter === "videos") return file.type.startsWith("video/");
                if (filter === "pdfs") return file.type === "application/pdf";
                if (filter === "others") return !file.type.startsWith("image/") && 
                                                !file.type.startsWith("video/") && 
                                            file.type !== "application/pdf";
                return true;
            });
            
            if (files.length === 0) return;
            
            const folderDiv = document.createElement("div");
            folderDiv.className = "library-folder";
            
            folderDiv.innerHTML = `
                <div class="library-folder-header">
                    <div class="folder-title">
                        <i class="fa-solid fa-folder"></i>
                        <span>${chatFolder.chatTitle}</span>
                    </div>
                    <div class="folder-info">
                        <span>${files.length} file(s)</span>
                        <button class="delete-folder-btn" data-chat-id="${chatId}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="library-files-grid" id="files-${chatId}"></div>
            `;
            
            container.appendChild(folderDiv);
            
            // Add files to grid
            const filesGrid = document.getElementById(`files-${chatId}`);
            files.forEach(file => {
                const fileCard = createFileCard(file);
                filesGrid.appendChild(fileCard);
            });
            
            // Delete folder button
            folderDiv.querySelector(".delete-folder-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm(`Delete all files from "${chatFolder.chatTitle}"?`)) {
                    deleteAllFilesForChat(chatId);
                    loadLibraryContent(filter);
                }
            });
        });
        
        updateLibraryStats();
    }

    function createFileCard(file) {
        const card = document.createElement("div");
        card.className = "library-file-card";
        
        let preview = "";
        if (file.type.startsWith("image/")) {
            preview = `<img src="${file.data}" alt="${file.name}" />`;
        } else if (file.type.startsWith("video/")) {
            preview = `<video src="${file.data}"></video>`;
        } else if (file.type === "application/pdf") {
            preview = `<i class="fa-solid fa-file-pdf"></i>`;
        } else {
            preview = `<i class="fa-solid fa-file"></i>`;
        }
        
        card.innerHTML = `
            <div class="file-preview">${preview}</div>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${formatBytes(file.size)}</div>
            </div>
            <div class="file-actions">
                <button class="download-file-btn" data-file-id="${file.id}">
                    <i class="fa-solid fa-download"></i>
                </button>
                <button class="delete-file-btn" data-file-id="${file.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        
        // Download button
        card.querySelector(".download-file-btn").addEventListener("click", () => {
            downloadFile(file);
        });
        
        // Delete button
        card.querySelector(".delete-file-btn").addEventListener("click", () => {
            if (confirm(`Delete "${file.name}"?`)) {
                deleteFileFromLibrary(file.id);
                loadLibraryContent();
            }
        });
        
        return card;
    }

    function downloadFile(file) {
        const link = document.createElement("a");
        link.href = file.data;
        link.download = file.name;
        link.click();
    }

    function formatBytes(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    }

    function updateLibraryStats() {
        const stats = getLibraryStats();
        
        const totalFilesEl = document.getElementById("library-total-files");
        const totalSizeEl = document.getElementById("library-total-size");
        
        if (totalFilesEl) {
            totalFilesEl.textContent = `${stats.totalFiles} file(s)`;
        }
        
        if (totalSizeEl) {
            totalSizeEl.textContent = formatBytes(stats.totalSize);
        }
    }

    console.log("✅ Library feature loaded (FIXED VERSION)");
});