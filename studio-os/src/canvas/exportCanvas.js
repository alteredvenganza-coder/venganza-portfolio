// PNG export of the canvas. Lazy-loads html2canvas from CDN on demand
// so it never enters the main bundle.

let loadPromise = null;

function loadHtml2Canvas() {
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
    s.onload = () => resolve(window.html2canvas);
    s.onerror = () => { loadPromise = null; reject(new Error('Impossibile caricare html2canvas')); };
    document.head.appendChild(s);
  });
  return loadPromise;
}

/**
 * Exports the current canvas viewport as a PNG download.
 * Temporarily removes pan/zoom transform to capture full cards area.
 */
export async function exportCanvasPng(cards, canvasName = 'canvas') {
  if (!cards || cards.length === 0) {
    alert('Il canvas è vuoto.');
    return;
  }

  const root = document.querySelector('.canvas-root');
  const world = root?.querySelector('[data-canvas-world]') || root?.querySelector('svg')?.parentElement;
  if (!world) { alert('Canvas non trovato.'); return; }

  try {
    const h2c = await loadHtml2Canvas();

    // Compute bounding box (world coords) with padding
    const pad = 80;
    const minX = Math.min(...cards.map(c => c.x)) - pad;
    const minY = Math.min(...cards.map(c => c.y)) - pad;
    const maxX = Math.max(...cards.map(c => c.x + (c.w || 230))) + pad;
    const maxY = Math.max(...cards.map(c => c.y + (c.h || 220))) + pad;

    // Use html2canvas on the world element with computed bounds
    const canvas = await h2c(world, {
      backgroundColor: '#FAF6EE',
      x: minX,
      y: minY,
      width:  maxX - minX,
      height: maxY - minY,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(canvasName || 'canvas').replace(/[^\w\-]+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error('[exportCanvasPng] failed', e);
    alert('Errore export: ' + (e.message || e));
  }
}
