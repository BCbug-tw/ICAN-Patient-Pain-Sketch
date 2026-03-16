// DOM Elements
const pdfCanvas = document.getElementById('pdf-render');
const marksCanvas = document.getElementById('marks-layer');
const container = document.getElementById('canvas-container');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');
const sketchSelect = document.getElementById('sketch-select');

// Contexts
const pdfCtx = pdfCanvas.getContext('2d');
const marksCtx = marksCanvas.getContext('2d');

// State
let pdfDoc = null;
let pageNum = 1;
let scale = 1.5; // Initial scale, can be adjusted or made responsive
let marks = []; // Store marks: { type: 'point', x, y } OR { type: 'arrow', start: {x,y}, end: {x,y} }
let currentStartPoint = null; // Track start point for current drawing
let currentMousePos = null; // Track mouse for rubber-banding

// Load Initial PDF
let url = sketchSelect.value;
loadPDF(url);

sketchSelect.addEventListener('change', (e) => {
    url = e.target.value;
    marks = []; // Clear marks on change
    currentStartPoint = null;
    drawMarks(); // Update canvas
    loadPDF(url);
});

// Mode Selection
const modeRadios = document.getElementsByName('marker-mode');
let currentMode = 'point'; // 'point' or 'arrow'

modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        currentStartPoint = null; // Reset dragging if switching modes
        drawMarks();
    });
});

function loadPDF(pdfUrl) {
    pdfjsLib.getDocument(pdfUrl).promise.then(doc => {
        pdfDoc = doc;
        renderPage(pageNum);
    }).catch(err => {
        console.error('Error loading PDF:', err);
        alert(`Error loading ${pdfUrl}. Please make sure the file exists.`);
    });
}


// Render Page Function
function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: scale });

        // Set dimensions for both canvases
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;
        marksCanvas.height = viewport.height;
        marksCanvas.width = viewport.width;

        // Resize container
        container.style.width = `${viewport.width}px`;
        container.style.height = `${viewport.height}px`;

        // Render PDF
        const renderContext = {
            canvasContext: pdfCtx,
            viewport: viewport
        };
        page.render(renderContext);

        // Re-draw marks if any (useful if we implement page switching later)
        drawMarks();
    });
}

// Drawing Helpers
function drawX(ctx, x, y, color = 'red') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    const size = 10;
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
}

function drawArrow(ctx, fromX, fromY, toX, toY, color = 'red') {
    const headLength = 15; // Length of arrow head
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw Arrow Head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawMarks() {
    marksCtx.clearRect(0, 0, marksCanvas.width, marksCanvas.height);

    // Draw completed marks
    marks.forEach(mark => {
        if (mark.type === 'point') {
            drawX(marksCtx, mark.x, mark.y);
        } else if (mark.type === 'arrow') {
            drawX(marksCtx, mark.start.x, mark.start.y);
            drawArrow(marksCtx, mark.start.x, mark.start.y, mark.end.x, mark.end.y);
        }
    });

    // Draw current drawing state (rubber band for arrow mode)
    if (currentMode === 'arrow' && currentStartPoint && currentMousePos) {
        drawX(marksCtx, currentStartPoint.x, currentStartPoint.y, 'blue'); // Show start as blue
        drawArrow(marksCtx, currentStartPoint.x, currentStartPoint.y, currentMousePos.x, currentMousePos.y, 'blue');
    } else if (currentMode === 'arrow' && currentStartPoint) {
        drawX(marksCtx, currentStartPoint.x, currentStartPoint.y, 'blue');
    }
}

// Event Listeners
marksCanvas.addEventListener('mousemove', (e) => {
    const rect = marksCanvas.getBoundingClientRect();
    currentMousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    if (currentStartPoint && currentMode === 'arrow') {
        drawMarks();
    }
});

marksCanvas.addEventListener('mousedown', (e) => {
    const rect = marksCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check hit test for removal first (works in both modes)
    const hitIndex = marks.findIndex(m => {
        if (m.type === 'point') {
            const dist = Math.sqrt(Math.pow(m.x - x, 2) + Math.pow(m.y - y, 2));
            return dist < 15;
        } else if (m.type === 'arrow') {
            const dist = Math.sqrt(Math.pow(m.start.x - x, 2) + Math.pow(m.start.y - y, 2));
            return dist < 15;
        }
        return false;
    });

    if (hitIndex !== -1) {
        marks.splice(hitIndex, 1);
        currentStartPoint = null; // Reset any current drawing
        drawMarks();
        return;
    }

    // New Mark Logic
    if (currentMode === 'point') {
        marks.push({ type: 'point', x, y });
        drawMarks();
    } else if (currentMode === 'arrow') {
        if (!currentStartPoint) {
            currentStartPoint = { x, y };
            currentMousePos = { x, y };
            drawMarks();
        } else {
            marks.push({
                type: 'arrow',
                start: currentStartPoint,
                end: { x, y }
            });
            currentStartPoint = null;
            drawMarks();
        }
    }
});

clearBtn.addEventListener('click', () => {
    marks = [];
    currentStartPoint = null;
    drawMarks();
});

saveBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;

    // Create a temporary canvas to merge PDF and Marks
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pdfCanvas.width;
    tempCanvas.height = pdfCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw PDF layer
    tempCtx.drawImage(pdfCanvas, 0, 0);

    // Draw Marks Manually onto temp canvas to ensure they are baked in
    marks.forEach(mark => {
        if (mark.type === 'point') {
            drawX(tempCtx, mark.x, mark.y);
        } else if (mark.type === 'arrow') {
            drawX(tempCtx, mark.start.x, mark.start.y);
            drawArrow(tempCtx, mark.start.x, mark.start.y, mark.end.x, mark.end.y);
        }
    });

    // Create PDF
    const pdf = new jsPDF({
        orientation: pdfCanvas.width > pdfCanvas.height ? 'l' : 'p',
        unit: 'px',
        format: [pdfCanvas.width, pdfCanvas.height]
    });

    const imgData = tempCanvas.toDataURL('image/jpeg', 0.8);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfCanvas.width, pdfCanvas.height);
    pdf.save('Marked_Pain_Sketch.pdf');
});
