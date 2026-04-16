// Canvas templates — ported from prototype HTML.
// Coordinates are absolute world coords centered around (3000, 3000).
// applyTemplate() in TemplatePanel translates them to the current viewport center.

export const TEMPLATES = [
  // ── FASHION ──
  {
    id: 'moodboard', cat: 'fashion', accent: '#D4B870',
    name: 'Moodboard SS/AW',
    desc: 'Board ispirativa con immagini, note colori e riferimenti stagionali.',
    tags: ['Mood', 'Visivo'],
    cards: [
      { type:'heading', x:2920, y:2870, w:300, title:'MOODBOARD SS26' },
      { type:'image',   x:2720, y:2950, w:220 },
      { type:'image',   x:2960, y:2950, w:220 },
      { type:'image',   x:3200, y:2950, w:220 },
      { type:'note',    x:2720, y:3140, w:220, text:'Toni sabbia, terracotta e off-white. Tessuti leggeri — lino, seta, organza.' },
      { type:'board',   x:2960, y:3140, w:460, title:'Palette Colori', subCards:['Sabbia #C9B99A','Terracotta #B04820','Off-white #F4F1EB','Salvia #4A6A4A'] },
    ]
  },
  {
    id: 'techpack', cat: 'production', accent: '#B04820',
    name: 'Tech Pack',
    desc: 'Scheda tecnica completa con misure, materiali e note.',
    tags: ['Produzione', 'Factory'],
    cards: [
      { type:'heading', x:2880, y:2860, w:380, title:'TECH PACK — JACKET AW25' },
      { type:'image',   x:2720, y:2940, w:260, title:'Vista Frontale' },
      { type:'image',   x:3000, y:2940, w:260, title:'Vista Retro' },
      { type:'note',    x:2720, y:3160, w:260, title:'Materiali', text:'Shell: 100% Wool Tweed\nLining: 100% Viscosa\nButton: Corozo 20mm' },
      { type:'note',    x:3000, y:3160, w:260, title:'Misure Base (IT 42)', text:'Chest: 96cm\nWaist: 82cm\nLength: 68cm\nSleeve: 62cm' },
      { type:'todo',    x:2720, y:3360, w:540, title:'Checklist Produzione', items:[{text:'Approvazione campione colore',done:false},{text:'Conferma fornitore bottoni',done:false},{text:'Grading taglie 38→46',done:false},{text:'Invio file al factory',done:false}] },
    ]
  },
  {
    id: 'brainstorm', cat: 'planning', accent: '#9A7310',
    name: 'Brainstorm Board',
    desc: 'Canvas libero per sessioni creative con note, cluster e connessioni.',
    tags: ['Ideation', 'Creative'],
    cards: [
      { type:'heading', x:2930, y:2870, w:280, title:'BRAINSTORM' },
      { type:'note',    x:2720, y:2960, w:220, text:'Idea 01\n\nScrivi qui la tua prima idea...' },
      { type:'note',    x:2960, y:2960, w:220, text:'Idea 02' },
      { type:'note',    x:3200, y:2960, w:220, text:'Idea 03' },
      { type:'note',    x:2720, y:3170, w:220, text:'Idea 04' },
      { type:'note',    x:2960, y:3170, w:220, text:'Idea 05' },
      { type:'note',    x:3200, y:3170, w:220, text:'Idea 06' },
    ]
  },
  {
    id: 'instagram', cat: 'social', accent: '#B83025',
    name: 'Instagram Content Plan',
    desc: 'Piano editoriale settimanale con copy, visual e hashtag per IG.',
    tags: ['Social', 'Content'],
    cards: [
      { type:'heading', x:2880, y:2860, w:360, title:'IG CONTENT PLAN — MARZO' },
      { type:'note',    x:2720, y:2950, w:260, title:'Post Lunedì', text:'🎨 Palette della settimana\nHook: "Il colore che definirà questa stagione..."\n#fashioncolor #moodoftheweek' },
      { type:'note',    x:3000, y:2950, w:260, title:'Post Mercoledì', text:'👗 Behind the scenes\nHook: "Dal bozzetto al prodotto finale"\n#behindthescenes #fashiondesign' },
      { type:'note',    x:3280, y:2950, w:260, title:'Post Venerdì', text:'✨ Product spotlight\nHook: "Un solo pezzo, infinite combinazioni"\n#ootd #slowfashion' },
      { type:'board',   x:2720, y:3190, w:820, title:'Hashtag Core', subCards:['#slowfashion','#fashiondesign','#madeinitaly','#sustainablefashion','#ootd'] },
    ]
  },
  {
    id: 'brandid', cat: 'branding', accent: '#1A1816',
    name: 'Brand Identity',
    desc: 'Definisce posizionamento, tono di voce, palette e valori del brand.',
    tags: ['Brand', 'Strategy'],
    cards: [
      { type:'heading', x:2880, y:2850, w:380, title:'BRAND IDENTITY' },
      { type:'note',    x:2720, y:2940, w:280, title:'Brand Positioning', text:'Target: ___\nFascia: ___\nValori: ___\nAnti: ___' },
      { type:'note',    x:3020, y:2940, w:280, title:'Tone of Voice', text:'• Sofisticato ma accessibile\n• Storie autentiche sul processo' },
      { type:'board',   x:2720, y:3170, w:280, title:'Palette Brand', subCards:['Écru #F4F1EB','Sabbia #C9B99A','Terracotta #B04820','Grafite #3A3633'] },
      { type:'board',   x:3020, y:3170, w:280, title:'Reference Brand', subCards:['The Row','Toteme','Loro Piana','Lemaire','Auralee'] },
    ]
  },
];

export const TEMPLATE_CATEGORIES = [
  { key: 'all',        label: 'Tutti' },
  { key: 'fashion',    label: 'Fashion' },
  { key: 'social',     label: 'Social Media' },
  { key: 'production', label: 'Produzione' },
  { key: 'planning',   label: 'Planning' },
  { key: 'branding',   label: 'Branding' },
];
