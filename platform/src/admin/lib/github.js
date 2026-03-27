/**
 * Admin API client — proxies through /api/admin/content
 * No secrets exposed to the browser.
 */

// List files in a directory
export async function listFiles(path) {
  const res = await fetch(`/api/admin/content?action=list&path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

// Get file content
export async function getFile(path) {
  const res = await fetch(`/api/admin/content?action=get&path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Get failed: ${res.status}`);
  }
  return res.json();
}

// Create or update a file
export async function saveFile(path, content, message, sha = null) {
  const res = await fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', path, content, message, sha }),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json();
}

// Delete a file
export async function deleteFile(path, sha, message) {
  const res = await fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', path, sha, message }),
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
}

// Upload binary file (image) — base64 encoded
export async function uploadImage(path, base64Content, message) {
  const res = await fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upload', path, base64: base64Content, message }),
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

// Trigger Vercel redeploy
export async function triggerDeploy() {
  const res = await fetch('/api/admin/deploy', { method: 'POST' });
  if (!res.ok) throw new Error(`Deploy failed: ${res.status}`);
  return res.json();
}

// Get theme config
export async function getTheme() {
  const res = await fetch('/api/admin/theme');
  if (!res.ok) throw new Error(`Get theme failed: ${res.status}`);
  return res.json();
}

// Save theme config
export async function saveTheme(theme, sha) {
  const res = await fetch('/api/admin/theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme, sha }),
  });
  if (!res.ok) throw new Error(`Save theme failed: ${res.status}`);
  return res.json();
}
