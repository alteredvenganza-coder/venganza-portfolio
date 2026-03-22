/**
 * Git Gateway API client for reading/writing content to the GitHub repo.
 * Uses the Netlify Git Gateway proxy (no GitHub token needed — uses Identity token).
 */

const GIT_GATEWAY_URL = '/.netlify/git/github';

let identityToken = null;

export function setToken(token) {
  identityToken = token;
}

function headers() {
  return {
    Authorization: `Bearer ${identityToken}`,
    'Content-Type': 'application/json',
  };
}

async function apiCall(endpoint, options = {}) {
  const res = await fetch(`${GIT_GATEWAY_URL}${endpoint}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Git Gateway ${res.status}: ${text}`);
  }
  return res.json();
}

// Get file content from repo
export async function getFile(path) {
  try {
    const data = await apiCall(`/contents/${path}?ref=main`);
    return {
      content: atob(data.content),
      sha: data.sha,
    };
  } catch (e) {
    if (e.message.includes('404')) return null;
    throw e;
  }
}

// List files in a directory
export async function listFiles(path) {
  try {
    const data = await apiCall(`/contents/${path}?ref=main`);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e.message.includes('404')) return [];
    throw e;
  }
}

// Create or update a file
export async function saveFile(path, content, message, sha = null) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: 'main',
  };
  if (sha) body.sha = sha;

  return apiCall(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// Delete a file
export async function deleteFile(path, sha, message) {
  return apiCall(`/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: 'main' }),
  });
}

// Upload binary file (image) — base64 encoded
export async function uploadImage(path, base64Content, message) {
  // Check if file exists to get SHA
  let sha = null;
  try {
    const existing = await apiCall(`/contents/${path}?ref=main`);
    sha = existing.sha;
  } catch (e) {
    // File doesn't exist, that's fine
  }

  const body = {
    message,
    content: base64Content, // Already base64
    branch: 'main',
  };
  if (sha) body.sha = sha;

  return apiCall(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
