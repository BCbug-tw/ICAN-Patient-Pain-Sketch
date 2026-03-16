import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// For Vite, we can directly point the workerSrc to the locally installed pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const CanvasSketch = forwardRef(({ pdfUrl, mode = 'point', maxMarks = null, onMarksChange }, ref) => {
  const pdfCanvasRef = useRef(null);
  const marksCanvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [pdfDoc, setPdfDoc] = useState(null);
  const [marks, setMarks] = useState([]);
  const [currentStartPoint, setCurrentStartPoint] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);

  // Expose a method to get the merged data URL
  useImperativeHandle(ref, () => ({
    getMergedImage: () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = pdfCanvasRef.current.width;
      tempCanvas.height = pdfCanvasRef.current.height;
      const ctx = tempCanvas.getContext('2d');
      // Draw PDF
      ctx.drawImage(pdfCanvasRef.current, 0, 0);
      // Draw Marks
      drawAllMarks(ctx, marks, null, null, currentStartPoint);
      return tempCanvas.toDataURL('image/jpeg', 0.8);
    },
    clearMarks: () => {
      setMarks([]);
      setCurrentStartPoint(null);
      if (onMarksChange) onMarksChange([]);
    },
    getMarks: () => marks
  }));

  useEffect(() => {
    if (!pdfUrl) return;
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(doc => {
      setPdfDoc(doc);
    }).catch(err => {
      console.error('Error loading PDF:', err);
    });
  }, [pdfUrl]);

  useEffect(() => {
    let renderTask = null;
    let isCancelled = false;

    if (pdfDoc) {
      pdfDoc.getPage(1).then(page => {
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const pdfCanvas = pdfCanvasRef.current;
        const marksCanvas = marksCanvasRef.current;
        
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        marksCanvas.width = viewport.width;
        marksCanvas.height = viewport.height;

        if (containerRef.current) {
          // Remove max-width and let the parent determine bounds if needed. Width 100% fits container.
          containerRef.current.style.width = '100%';
          containerRef.current.style.maxWidth = `${viewport.width}px`; 
          // Do NOT rigidly set aspect-ratio here via px formulas which mismatch CSS width sizing
        }

        const renderContext = {
          canvasContext: pdfCanvas.getContext('2d'),
          viewport: viewport
        };
        
        // Prevent concurrent renders
        renderTask = page.render(renderContext);
        renderTask.promise.catch(err => {
          if (err.name !== 'RenderingCancelledException') {
            console.error(err);
          }
        });
      });
    }

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc]);

  // Redraw when state changes
  useEffect(() => {
    if (marksCanvasRef.current) {
      const ctx = marksCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, marksCanvasRef.current.width, marksCanvasRef.current.height);
      drawAllMarks(ctx, marks, mode, currentMousePos, currentStartPoint);
    }
  }, [marks, mode, currentMousePos, currentStartPoint]);



  const getMarkerSize = () => {
    if (marksCanvasRef.current) {
      return Math.max(12, marksCanvasRef.current.width * 0.015);
    }
    return 12;
  };

  const drawX = (ctx, x, y, color = 'red') => {
    ctx.strokeStyle = color;
    const size = getMarkerSize();
    ctx.lineWidth = Math.max(2, size * 0.25);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY, color = 'blue') => {
    const size = getMarkerSize();
    const headLength = size * 1.5;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, size * 0.25);
    ctx.lineCap = 'round';
    
    // Main line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  // Helper function to calculate distance from a point (x, y) to a line segment (x1, y1) -> (x2, y2)
  const distToSegment = (x, y, x1, y1, x2, y2) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const drawAllMarks = (ctx, currentMarks, actMode, actMouse, startPt) => {
    currentMarks.forEach(mark => {
      if (mark.type === 'point') {
        drawX(ctx, mark.x, mark.y, 'red');
      } else if (mark.type === 'arrow') {
        drawArrow(ctx, mark.start.x, mark.start.y, mark.end.x, mark.end.y, 'blue');
      }
    });

    if (actMode === 'arrow' && startPt && actMouse) {
      // Draw live arrow while dragging
      drawArrow(ctx, startPt.x, startPt.y, actMouse.x, actMouse.y, 'blue');
    }
  };

  // Centralized erasure hit-test logic
  const performHitTestAndErase = (x, y) => {
    const hitIndex = marks.findIndex(m => {
      if (m.type === 'point') {
        return Math.sqrt(Math.pow(m.x - x, 2) + Math.pow(m.y - y, 2)) < 25; 
      } else if (m.type === 'arrow') {
        // Check distance from pointer to the arrow's line segment
        const dist = distToSegment(x, y, m.start.x, m.start.y, m.end.x, m.end.y);
        return dist < 20; // Hit threshold for lines
      }
      return false;
    });

    if (hitIndex !== -1) {
      // Use functional state update to handle rapid synchronous calls during drag
      setMarks(prevMarks => {
        const newMarks = [...prevMarks];
        newMarks.splice(hitIndex, 1);
        if (onMarksChange) onMarksChange(newMarks);
        return newMarks;
      });
      return true;
    }
    return false;
  };

  const handlePointerDown = (e) => {
    // Prevent default touch behaviors like scrolling
    e.preventDefault();
    
    const canvas = marksCanvasRef.current;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Eraser Mode: Hit test to remove
    if (mode === 'eraser') {
      // Store state that we are actively erasing (dragging to erase)
      setCurrentStartPoint({ erasing: true }); 
      performHitTestAndErase(x, y);
      return;
    }

    if (mode === 'point') {
      const newMarks = [...marks, { type: 'point', x, y }];
      setMarks(newMarks);
      if (onMarksChange) onMarksChange(newMarks);
    } else if (mode === 'arrow') {
      setCurrentStartPoint({ x, y });
      setCurrentMousePos({ x, y });
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();

    if (!currentStartPoint) return;

    const canvas = marksCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (mode === 'eraser' && currentStartPoint.erasing) {
      // Continuous erase while dragging
      performHitTestAndErase(x, y);
    } else if (mode === 'arrow') {
      setCurrentMousePos({ x, y });
    }
  };

  const finalizeArrow = (e) => {
    if (currentStartPoint && mode === 'arrow') {
      const canvas = marksCanvasRef.current;
      canvas.releasePointerCapture(e.pointerId);

      // Only draw the arrow if there is some minimum distance dragged
      const dx = currentMousePos.x - currentStartPoint.x;
      const dy = currentMousePos.y - currentStartPoint.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist > 10) {
        const newMarks = [...marks, { type: 'arrow', start: currentStartPoint, end: currentMousePos }];
        setMarks(newMarks);
        if (onMarksChange) onMarksChange(newMarks);
      }
      
      setCurrentStartPoint(null);
      setCurrentMousePos(null);
    } else if (mode === 'eraser') {
      const canvas = marksCanvasRef.current;
      canvas.releasePointerCapture(e.pointerId);
      setCurrentStartPoint(null);
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    finalizeArrow(e);
  };

  const handlePointerCancel = (e) => {
    e.preventDefault();
    finalizeArrow(e);
  };

  return (
    <div ref={containerRef} className="canvas-wrapper mx-auto" style={{ position: 'relative', width: '100%', maxWidth: 'max-content' }}>
      <canvas 
        ref={pdfCanvasRef} 
        style={{ display: 'block', width: '100%', height: 'auto' }} 
      />
      <canvas 
        ref={marksCanvasRef} 
        style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, cursor: mode === 'eraser' ? 'cell' : 'crosshair' }} 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
    </div>
  );
});

export default CanvasSketch;
