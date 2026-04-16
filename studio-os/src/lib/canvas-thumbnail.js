// Generates an SVG data-URL thumbnail from canvas cards.
// Stored in canvases.thumbnail (text column). Consumed by HomePage/ClientCanvasHub listings.

const CARD_COLORS = {
  note:               '#FFF2A8',
  image:              '#E8D4FF',
  link:               '#B4E4FF',
  todo:               '#FFD4A8',
  board:              '#D4F4DD',
  heading:            '#F0EFEB',
  budget:             '#FFD0D0',
  tasks:              '#FFE0B8',
  files:              '#D0E4FF',
  'project-overview': '#E4E0F4',
};

export function generateThumbnail(cards) {
  if (!cards || cards.length === 0) return null;

  const pad = 120;
  const minX = Math.min(...cards.map(c => c.x)) - pad;
  const minY = Math.min(...cards.map(c => c.y)) - pad;
  const maxX = Math.max(...cards.map(c => c.x + (c.w || 230))) + pad;
  const maxY = Math.max(...cards.map(c => c.y + (c.h || 150))) + pad;
  const vbW = Math.max(1, maxX - minX);
  const vbH = Math.max(1, maxY - minY);

  const rects = cards.map(c => {
    const color = CARD_COLORS[c.type] || '#EDE7DB';
    const x = Math.round(c.x - minX);
    const y = Math.round(c.y - minY);
    const w = Math.round(c.w || 230);
    const h = Math.round(c.h || 150);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${color}" stroke="#BFB29B" stroke-width="3"/>`;
  }).join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="xMidYMid slice">` +
      `<rect width="${vbW}" height="${vbH}" fill="#FAF6EE"/>` +
      rects +
    `</svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
