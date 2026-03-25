// ========================================
// IMAGE PREVIEW POPUP FEATURE image.js
// Click any image in chats or library to view in fullscreen
// ========================================

(function() {
    console.log("🖼️ Image preview popup initializing...");
    
    let currentImageData = null;
    let isZoomed = false;
    
    // ========================================
    // CREATE PREVIEW POPUP HTML
    // ========================================
    
    function createImagePreviewPopup() {
        const popup = document.createElement('div');
        popup.className = 'image-preview-overlay';
        popup.id = 'image-preview-popup';
        
        popup.innerHTML = `
            <div class="image-preview-container">
                <button class="image-preview-close" title="Close (Esc)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                
                <div class="image-preview-wrapper">
                    <div class="image-preview-loading" style="display:none;">
                        <i class="fa-solid fa-spinner"></i>
                    </div>
                    <img class="image-preview-img" src="" alt="Preview" />
                </div>
                
                <div class="image-preview-info">
                    <span class="image-preview-name">Image</span>
                    <div class="image-preview-actions">
                        <button class="image-preview-action-btn zoom" title="Zoom In/Out">
                            <i class="fa-solid fa-magnifying-glass-plus"></i>
                        </button>
                        <button class="image-preview-action-btn download" title="Download">
                            <i class="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add event listeners
        setupPopupEvents(popup);
        
        return popup;
    }
    
    // ========================================
    // SETUP EVENT LISTENERS
    // ========================================
    
    function setupPopupEvents(popup) {
        const closeBtn = popup.querySelector('.image-preview-close');
        const img = popup.querySelector('.image-preview-img');
        const zoomBtn = popup.querySelector('.zoom');
        const downloadBtn = popup.querySelector('.download');
        
        // Close button
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePreview();
        });
        
        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePreview();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('show')) {
                closePreview();
            }
        });
        
        // Zoom toggle
        zoomBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleZoom();
        });
        
        // Click image to zoom
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleZoom();
        });
        
        // Download button
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadImage();
        });
    }
    
    // ========================================
    // OPEN PREVIEW
    // ========================================
    
    function openImagePreview(imageSrc, imageName = "Image") {
        let popup = document.getElementById('image-preview-popup');
        
        // Create popup if not exists
        if (!popup) {
            popup = createImagePreviewPopup();
        }
        
        const img = popup.querySelector('.image-preview-img');
        const nameSpan = popup.querySelector('.image-preview-name');
        const loading = popup.querySelector('.image-preview-loading');
        
        // Store current image data
        currentImageData = {
            src: imageSrc,
            name: imageName
        };
        
        // Reset zoom
        isZoomed = false;
        img.classList.remove('zoomed');
        updateZoomButton();
        
        // Show loading
        loading.style.display = 'block';
        img.style.display = 'none';
        
        // Set image
        img.onload = () => {
            loading.style.display = 'none';
            img.style.display = 'block';
        };
        
        img.onerror = () => {
            loading.style.display = 'none';
            img.style.display = 'block';
            console.error("Failed to load image");
        };
        
        img.src = imageSrc;
        nameSpan.textContent = imageName;
        
        // Show popup
        popup.classList.add('show');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    // ========================================
    // CLOSE PREVIEW
    // ========================================
    
    function closePreview() {
        const popup = document.getElementById('image-preview-popup');
        if (!popup) return;
        
        popup.classList.remove('show');
        
        // Reset zoom
        isZoomed = false;
        const img = popup.querySelector('.image-preview-img');
        img.classList.remove('zoomed');
        updateZoomButton();
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Clear current image
        currentImageData = null;
    }
    
    // ========================================
    // ZOOM TOGGLE
    // ========================================
    
    function toggleZoom() {
        const popup = document.getElementById('image-preview-popup');
        if (!popup) return;
        
        const img = popup.querySelector('.image-preview-img');
        
        isZoomed = !isZoomed;
        
        if (isZoomed) {
            img.classList.add('zoomed');
        } else {
            img.classList.remove('zoomed');
        }
        
        updateZoomButton();
    }
    
    function updateZoomButton() {
        const popup = document.getElementById('image-preview-popup');
        if (!popup) return;
        
        const zoomBtn = popup.querySelector('.zoom');
        const icon = zoomBtn.querySelector('i');
        
        if (isZoomed) {
            icon.className = 'fa-solid fa-magnifying-glass-minus';
            zoomBtn.title = 'Zoom Out';
        } else {
            icon.className = 'fa-solid fa-magnifying-glass-plus';
            zoomBtn.title = 'Zoom In';
        }
    }
    
    // ========================================
    // DOWNLOAD IMAGE
    // ========================================
    
    function downloadImage() {
        if (!currentImageData) return;
        
        const link = document.createElement('a');
        link.href = currentImageData.src;
        link.download = currentImageData.name || 'image.png';
        link.click();
        
        console.log("✅ Image downloaded:", currentImageData.name);
    }
    
    // ========================================
    // ATTACH CLICK LISTENERS TO ALL IMAGES
    // ========================================
    
    function attachImageClickListeners() {
        // Chat images (user uploaded)
        const chatImages = document.querySelectorAll('.user-uploaded-image');
        chatImages.forEach(img => {
            if (img.dataset.previewAttached) return; // Skip if already attached
            
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                const imageName = img.alt || 'Chat Image';
                openImagePreview(img.src, imageName);
            });
            
            img.dataset.previewAttached = 'true';
        });
        
        // Library images
        const libraryImages = document.querySelectorAll('.library-file-card img');
        libraryImages.forEach(img => {
            if (img.dataset.previewAttached) return;
            
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileCard = img.closest('.library-file-card');
                const imageName = fileCard?.querySelector('.file-name')?.textContent || 'Library Image';
                openImagePreview(img.src, imageName);
            });
            
            img.dataset.previewAttached = 'true';
        });
        
        // File preview bar images
        const previewImages = document.querySelectorAll('.file-preview-img');
        previewImages.forEach(img => {
            if (img.dataset.previewAttached) return;
            
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                openImagePreview(img.src, 'Preview Image');
            });
            
            img.dataset.previewAttached = 'true';
        });
    }
    
    // ========================================
    // AUTO-ATTACH ON DOM CHANGES
    // ========================================
    
    function initImagePreview() {
        // Initial attachment
        attachImageClickListeners();
        
        // Watch for new images being added to DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    // Small delay to ensure images are rendered
                    setTimeout(() => {
                        attachImageClickListeners();
                    }, 100);
                }
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log("✅ Image preview popup ready!");
    }
    
    // ========================================
    // INITIALIZE WHEN DOM IS READY
    // ========================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImagePreview);
    } else {
        initImagePreview();
    }
    
    // Expose functions globally if needed
    window.imagePreview = {
        open: openImagePreview,
        close: closePreview
    };
    
})();