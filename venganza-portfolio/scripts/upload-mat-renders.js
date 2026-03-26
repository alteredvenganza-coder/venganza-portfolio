#!/usr/bin/env node
/**
 * Local MAT Renders uploader — run with: node scripts/upload-mat-renders.js
 * Opens a browser page, drag & drop images → saves to public/mat-renders/
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/mat-renders');
fs.mkdirSync(OUT_DIR, { recursive: true });

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MAT Renders Upload</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:monospace;background:#0a0a0a;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:40px}
  h1{font-size:1.5rem;letter-spacing:.3em;text-transform:uppercase;color:#fff}
  p{font-size:.7rem;color:rgba(255,255,255,.4);letter-spacing:.15em;text-transform:uppercase}
  #drop{width:100%;max-width:600px;border:2px dashed rgba(255,255,255,.15);border-radius:16px;padding:60px 40px;text-align:center;cursor:pointer;transition:all .3s}
  #drop:hover,#drop.over{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.03)}
  #drop input{display:none}
  #log{width:100%;max-width:600px;display:flex;flex-direction:column;gap:8px}
  .item{padding:12px 16px;border-radius:10px;font-size:.7rem;letter-spacing:.1em;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px}
  .item.ok{border-color:rgba(74,222,128,.3);color:rgb(74,222,128)}
  .item.err{border-color:rgba(248,113,113,.3);color:rgb(248,113,113)}
  .item.loading{color:rgba(255,255,255,.4)}
  button{padding:12px 32px;background:#fff;color:#000;border:none;border-radius:999px;font-family:monospace;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;cursor:pointer}
  button:hover{background:rgba(255,255,255,.85)}
  #done{display:none;color:rgb(74,222,128);font-size:.75rem;letter-spacing:.2em;text-transform:uppercase}
</style>
</head>
<body>
<h1>MAT Renders Upload</h1>
<p>Drag & drop your renders or click to select</p>
<div id="drop" onclick="document.getElementById('fi').click()">
  <input type="file" id="fi" multiple accept="image/*" onchange="upload(this.files)">
  <p style="font-size:.9rem;margin-bottom:8px">📁 Drop images here</p>
  <p>JPG, PNG, WEBP accepted</p>
</div>
<div id="log"></div>
<p id="done">✓ All done — you can close this window. Claude will commit the images.</p>
<script>
const drop = document.getElementById('drop');
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); upload(e.dataTransfer.files); });

async function upload(files) {
  const log = document.getElementById('log');
  let all = Array.from(files);
  for (const file of all) {
    const item = document.createElement('div');
    item.className = 'item loading';
    item.textContent = '↑ ' + file.name;
    log.appendChild(item);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await fetch('/mat-upload', { method: 'POST', body: fd });
      const j = await r.json();
      item.className = 'item ok';
      item.textContent = '✓ ' + j.filename;
    } catch(e) {
      item.className = 'item err';
      item.textContent = '✗ ' + file.name + ' — ' + e.message;
    }
  }
  document.getElementById('done').style.display = 'block';
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(HTML);
  }

  if (req.method === 'POST' && req.url === '/mat-upload') {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const ct = req.headers['content-type'] || '';
      const boundary = ct.split('boundary=')[1];
      if (!boundary) return res.end(JSON.stringify({ error: 'no boundary' }));

      const parts = body.toString('binary').split('--' + boundary);
      for (const part of parts) {
        if (!part.includes('filename=')) continue;
        const nameMatch = part.match(/filename="([^"]+)"/);
        if (!nameMatch) continue;
        const filename = nameMatch[1].replace(/[^a-zA-Z0-9._-]/g, '_');
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;
        const fileContent = Buffer.from(part.slice(headerEnd + 4, part.lastIndexOf('\r\n')), 'binary');
        const outPath = path.join(OUT_DIR, filename);
        fs.writeFileSync(outPath, fileContent);
        console.log(`✓ Saved: ${filename} (${Math.round(fileContent.length/1024)}KB)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, filename }));
        return;
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'no file found' }));
    });
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

const PORT = 4242;
server.listen(PORT, () => {
  console.log(`\n🎨 MAT Renders Uploader`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`→ Open: http://localhost:${PORT}`);
  console.log(`→ Drag your images onto the page`);
  console.log(`→ Images save to: public/mat-renders/`);
  console.log(`\nCtrl+C to stop after uploading\n`);
});
