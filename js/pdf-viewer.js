// PDF.js Side-by-Side Document Viewer Implementation

// Configure PDF.js worker CDN URL
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1; // Always odd numbers for left page when side-by-side (1, 3, 5, etc.)
let pageRendering = false;
let pageNumPending = null;
let scale = 1.0;
let isSideBySide = true;

const url = 'assets/pdfs/CO-OWNERSHIP AND PROPERTY OPERATING AGREEMENT.pdf';

const canvasLeft = document.getElementById('pdf-canvas-left');
const ctxLeft = canvasLeft.getContext('2d');
const canvasRight = document.getElementById('pdf-canvas-right');
const ctxRight = canvasRight.getContext('2d');

const wrapperLeft = document.getElementById('pdf-page-1-wrapper');
const wrapperRight = document.getElementById('pdf-page-2-wrapper');
const loadingOverlay = document.getElementById('pdf-loading');
const pageIndicator = document.getElementById('pdf-page-num');

const prevBtn = document.getElementById('pdf-prev-btn');
const nextBtn = document.getElementById('pdf-next-btn');
const zoomInBtn = document.getElementById('pdf-zoom-in');
const zoomOutBtn = document.getElementById('pdf-zoom-out');
const zoomVal = document.getElementById('pdf-zoom-val');
const pagesContainer = document.getElementById('pdf-pages-container');

// Detect layout mode based on screen width
function checkViewMode() {
    const prevMode = isSideBySide;
    isSideBySide = window.innerWidth > 768;
    
    // If we switch to side-by-side, pageNum should be an odd number (1, 3, 5...) representing the left page.
    if (prevMode !== isSideBySide && isSideBySide && pageNum % 2 === 0) {
        pageNum = Math.max(1, pageNum - 1);
    }
}

// Render a specific page to a canvas
async function renderPage(num, canvas, ctx, wrapper) {
    pageRendering = true;
    try {
        const page = await pdfDoc.getPage(num);
        
        // Calculate dynamic scale to fit pages in container width
        const containerWidth = pagesContainer.clientWidth - 48; // padding
        const gap = 24; // gap between side-by-side pages
        
        let targetWidth = containerWidth;
        if (isSideBySide) {
            targetWidth = (containerWidth - gap) / 2;
        }
        
        // Limit maximum width per page to keep it legible and not excessively large
        targetWidth = Math.min(targetWidth * scale, 850 * scale);
        
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const dynamicScale = targetWidth / unscaledViewport.width;
        
        const viewport = page.getViewport({ scale: dynamicScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        wrapper.style.width = `${viewport.width}px`;
        wrapper.style.height = `${viewport.height}px`;
        wrapper.style.display = 'flex';
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
    } catch (err) {
        console.error('Error rendering page:', err);
    } finally {
        pageRendering = false;
        if (pageNumPending !== null) {
            pageNum = pageNumPending;
            pageNumPending = null;
            renderPages();
        }
    }
}

// Render both left and right pages (or left only on mobile)
async function renderPages() {
    if (!pdfDoc) return;
    
    // Show loading overlay
    loadingOverlay.style.opacity = '1';
    loadingOverlay.style.display = 'flex';
    
    checkViewMode();
    
    // Render Left/Single page
    await renderPage(pageNum, canvasLeft, ctxLeft, wrapperLeft);
    
    // Render Right page if in side-by-side mode and it exists
    if (isSideBySide && (pageNum + 1 <= pdfDoc.numPages)) {
        wrapperRight.style.display = 'flex';
        await renderPage(pageNum + 1, canvasRight, ctxRight, wrapperRight);
    } else {
        wrapperRight.style.display = 'none';
    }
    
    updateToolbar();
    
    // Hide loading overlay with transition
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
        if (loadingOverlay.style.opacity === '0') {
            loadingOverlay.style.display = 'none';
        }
    }, 200);
}

// Update UI buttons and page indicators
function updateToolbar() {
    if (isSideBySide) {
        const nextPage = pageNum + 1;
        if (nextPage <= pdfDoc.numPages) {
            pageIndicator.textContent = `Pages ${pageNum}-${nextPage} of ${pdfDoc.numPages}`;
        } else {
            pageIndicator.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
        }
    } else {
        pageIndicator.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
    }
    
    prevBtn.disabled = pageNum <= 1;
    
    if (isSideBySide) {
        nextBtn.disabled = pageNum + 1 >= pdfDoc.numPages;
    } else {
        nextBtn.disabled = pageNum >= pdfDoc.numPages;
    }
    
    zoomVal.textContent = `${Math.round(scale * 100)}%`;
    zoomOutBtn.disabled = scale <= 0.6;
    zoomInBtn.disabled = scale >= 2.0;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        pageNum = num;
        renderPages();
    }
}

function onPrevPage() {
    if (pageNum <= 1) return;
    
    let prevPageNum;
    if (isSideBySide) {
        prevPageNum = Math.max(1, pageNum - 2);
    } else {
        prevPageNum = pageNum - 1;
    }
    
    queueRenderPage(prevPageNum);
}

function onNextPage() {
    if (!pdfDoc) return;
    
    let nextPageNum;
    if (isSideBySide) {
        nextPageNum = pageNum + 2;
        if (nextPageNum > pdfDoc.numPages) return;
    } else {
        nextPageNum = pageNum + 1;
        if (nextPageNum > pdfDoc.numPages) return;
    }
    
    queueRenderPage(nextPageNum);
}

function zoomOut() {
    if (scale <= 0.6) return;
    scale = Math.max(0.6, scale - 0.15);
    renderPages();
}

function zoomIn() {
    if (scale >= 2.0) return;
    scale = Math.min(2.0, scale + 0.15);
    renderPages();
}

// Display error UI if loading PDF fails (e.g. file:// CORS block)
function showErrorState(error) {
    loadingOverlay.style.display = 'none';
    
    pagesContainer.innerHTML = `
        <div class="pdf-error-container">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: var(--space-sm);">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
            <h4>Unable to Display Document</h4>
            <p>Due to browser security policies, interactive PDF files cannot be viewed directly when opened as local <code>file://</code> files. It runs fully when served via localhost or from a web server.</p>
            <a href="assets/pdfs/CO-OWNERSHIP AND PROPERTY OPERATING AGREEMENT.pdf" download class="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Operating Agreement
            </a>
        </div>
    `;
    
    pageIndicator.textContent = 'Error';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    zoomInBtn.disabled = true;
    zoomOutBtn.disabled = true;
}

// Event Listeners
prevBtn.addEventListener('click', onPrevPage);
nextBtn.addEventListener('click', onNextPage);
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Only handle keydown events if the viewer is in the user's viewport
    const rect = pagesContainer.getBoundingClientRect();
    const inViewport = (
        rect.top >= -rect.height &&
        rect.bottom <= window.innerHeight + rect.height
    );
    if (!inViewport) return;

    if (e.key === 'ArrowLeft') {
        onPrevPage();
    } else if (e.key === 'ArrowRight') {
        onNextPage();
    }
});

// Debounced Window Resize event
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        renderPages();
    }, 150);
});

// Initialize PDF Document
(async () => {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        pdfDoc = await loadingTask.promise;
        renderPages();
    } catch (error) {
        console.error('Error loading PDF:', error);
        showErrorState(error);
    }
})();
