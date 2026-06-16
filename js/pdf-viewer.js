// PDF.js Sliding Document Viewer Implementation

// Configure PDF.js worker CDN URL
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1; // Active page number (1-indexed)
let scale = 1.0; // Current zoom scale
let currentScale = 1.0;
const url = 'assets/pdfs/CO-OWNERSHIP AND PROPERTY OPERATING AGREEMENT.pdf';

// Aspect ratio cache for each page (width / height)
let pageAspectRatios = [];

// Keep track of rendered pages for the current scale
let renderedPages = new Set();

// Current rendering promises
let renderingPromises = {};

// DOM Elements
const loadingOverlay = document.getElementById('pdf-loading');
const pageIndicator = document.getElementById('pdf-page-num');
const prevBtn = document.getElementById('pdf-prev-btn');
const nextBtn = document.getElementById('pdf-next-btn');
const zoomInBtn = document.getElementById('pdf-zoom-in');
const zoomOutBtn = document.getElementById('pdf-zoom-out');
const zoomVal = document.getElementById('pdf-zoom-val');
const pagesContainer = document.getElementById('pdf-pages-container');
const pdfSlider = document.getElementById('pdf-slider');

// Cache aspect ratio of each page on document load
async function cacheAspectRatios() {
    pageAspectRatios = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        try {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 });
            pageAspectRatios.push(viewport.width / viewport.height);
        } catch (err) {
            console.error(`Error fetching aspect ratio for page ${i}:`, err);
            pageAspectRatios.push(8.5 / 11); // Fallback to standard Letter
        }
    }
}

// Dynamically generate page wrappers and canvas elements
function initPageContainers() {
    pdfSlider.innerHTML = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-page-wrapper';
        wrapper.id = `pdf-page-wrapper-${i}`;
        wrapper.setAttribute('data-page', i);
        
        const canvas = document.createElement('canvas');
        canvas.id = `pdf-canvas-${i}`;
        
        wrapper.appendChild(canvas);
        pdfSlider.appendChild(wrapper);
    }
    renderedPages.clear();
    renderingPromises = {};
}

// Calculate layout properties based on zoom scale
function getLayoutConfig() {
    const containerWidth = pagesContainer.clientWidth;
    const sliderPadding = 40; // 20px padding left + 20px padding right on slider
    const innerWidth = Math.max(280, containerWidth - sliderPadding);
    const gap = 20; // Space between page wrappers
    
    let columns = 1;
    if (scale >= 1.0) {
        columns = 1;
    } else if (scale >= 0.7) {
        columns = 2;
    } else if (scale >= 0.45) {
        columns = 3;
    } else {
        columns = 4;
    }
    
    const pageWidth = (innerWidth - (columns - 1) * gap) / columns;
    
    return {
        columns,
        pageWidth,
        gap
    };
}

// Set width and height of each page wrapper based on aspect ratio
function updatePageDimensions(pageWidth, gap) {
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const wrapper = document.getElementById(`pdf-page-wrapper-${i}`);
        if (!wrapper) continue;
        
        const ratio = pageAspectRatios[i - 1] || (8.5 / 11);
        const pageHeight = pageWidth / ratio;
        
        wrapper.style.width = `${pageWidth}px`;
        wrapper.style.height = `${pageHeight}px`;
        wrapper.style.marginRight = `${gap}px`;
    }
}

// Set pagesContainer height to match the active page
function updateViewerHeight(pageWidth) {
    if (!pdfDoc || pageAspectRatios.length === 0) return;
    
    const ratio = pageAspectRatios[pageNum - 1] || (8.5 / 11);
    const activePageHeight = pageWidth / ratio;
    
    const styles = window.getComputedStyle(pagesContainer);
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;
    
    pagesContainer.style.height = `${activePageHeight + paddingTop + paddingBottom}px`;
}

// Highlight the active page wrapper
function updateActiveHighlight() {
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const wrapper = document.getElementById(`pdf-page-wrapper-${i}`);
        if (!wrapper) continue;
        
        if (i === pageNum) {
            wrapper.classList.add('active');
        } else {
            wrapper.classList.remove('active');
        }
    }
}

// Render a page dynamically onto its canvas
async function renderPage(num, pageWidth) {
    if (!pdfDoc) return;
    
    // Return existing rendering promise to avoid duplicates
    if (renderingPromises[num]) {
        return renderingPromises[num];
    }
    
    const renderPromise = (async () => {
        try {
            const page = await pdfDoc.getPage(num);
            const canvas = document.getElementById(`pdf-canvas-${num}`);
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const dynamicScale = pageWidth / unscaledViewport.width;
            const viewport = page.getViewport({ scale: dynamicScale });
            
            const dpr = window.devicePixelRatio || 1;
            canvas.width = viewport.width * dpr;
            canvas.height = viewport.height * dpr;
            
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
                transform: [dpr, 0, 0, dpr, 0, 0]
            };
            
            await page.render(renderContext).promise;
            renderedPages.add(num);
        } catch (err) {
            console.error(`Error rendering page ${num}:`, err);
        } finally {
            delete renderingPromises[num];
        }
    })();
    
    renderingPromises[num] = renderPromise;
    return renderPromise;
}

// Update sliding position, heights, visible pages and rendering queue
async function updateView() {
    if (!pdfDoc || pageAspectRatios.length === 0) return;
    
    const containerWidth = pagesContainer.clientWidth;
    const { columns, pageWidth, gap } = getLayoutConfig();
    
    // Clear render cache if scale changed
    if (scale !== currentScale) {
        renderedPages.clear();
        currentScale = scale;
    }
    
    // Update widths/heights of wrappers
    updatePageDimensions(pageWidth, gap);
    
    // Center the active page (offset by active page index and half the pageWidth)
    const pageCenter = (pageNum - 1) * (pageWidth + gap) + pageWidth / 2 + 20; // 20px padding left
    const translateX = containerWidth / 2 - pageCenter;
    
    pdfSlider.style.transform = `translateX(${translateX}px)`;
    
    updateActiveHighlight();
    updateViewerHeight(pageWidth);
    updateToolbar();
    
    // Identify pages visible in the current viewport bounds
    const viewportLeft = -translateX;
    const viewportRight = viewportLeft + containerWidth;
    const visiblePages = [];
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pageLeft = (i - 1) * (pageWidth + gap) + 20;
        const pageRight = pageLeft + pageWidth;
        
        // Use a 50px buffer to preload pages slightly before they enter the frame
        if (pageRight >= viewportLeft - 50 && pageLeft <= viewportRight + 50) {
            visiblePages.push(i);
        }
    }
    
    // Trigger render for visible pages
    const renderPromises = visiblePages.map(num => {
        if (!renderedPages.has(num)) {
            return renderPage(num, pageWidth);
        }
    });
    
    await Promise.all(renderPromises);
    
    // Pre-render adjacent pages for smoother transition
    const minVisible = Math.min(...visiblePages);
    const maxVisible = Math.max(...visiblePages);
    const preRenderList = [];
    
    if (minVisible > 1) preRenderList.push(minVisible - 1);
    if (maxVisible < pdfDoc.numPages) preRenderList.push(maxVisible + 1);
    
    preRenderList.forEach(num => {
        if (!renderedPages.has(num)) {
            renderPage(num, pageWidth);
        }
    });
}

// Update UI toolbar labels and enable/disable states
function updateToolbar() {
    if (!pdfDoc) return;
    
    pageIndicator.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
    
    prevBtn.disabled = pageNum <= 1;
    nextBtn.disabled = pageNum >= pdfDoc.numPages;
    
    zoomVal.textContent = `${Math.round(scale * 100)}%`;
    zoomOutBtn.disabled = scale <= 0.3; // Allow extra zoom out for multiple pages
    zoomInBtn.disabled = scale >= 2.0;
}

function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    updateView();
}

function onNextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    updateView();
}

function zoomOut() {
    if (scale <= 0.3) return;
    scale = Math.max(0.3, scale - 0.15);
    updateView();
}

function zoomIn() {
    if (scale >= 2.0) return;
    scale = Math.min(2.0, scale + 0.15);
    updateView();
}

// Display error UI if loading PDF fails (e.g. file:// CORS block)
function showErrorState(error) {
    loadingOverlay.style.display = 'none';
    pagesContainer.style.height = 'auto';
    
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

// Touch Swipe Navigation for mobile devices
let touchStartX = 0;
let touchEndX = 0;

pagesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

pagesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50; // pixels required to trigger swipe
    if (touchStartX - touchEndX > swipeThreshold) {
        onNextPage(); // Swiped Left -> Go Next
    } else if (touchEndX - touchStartX > swipeThreshold) {
        onPrevPage(); // Swiped Right -> Go Prev
    }
}

// Debounced window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateView();
    }, 150);
});

// Initialize PDF Document
(async () => {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        pdfDoc = await loadingTask.promise;
        
        // Cache dimensions and initialize slides
        await cacheAspectRatios();
        initPageContainers();
        
        // Hide loading and show initial view
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 200);
        
        updateView();
    } catch (error) {
        console.error('Error loading PDF:', error);
        showErrorState(error);
    }
})();
