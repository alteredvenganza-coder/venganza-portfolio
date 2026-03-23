/**
 * GitHub API client for reading/writing content to the repo.
 * Uses a Personal Access Token (fine-grained, repo scope).
 */

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const REPO_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'alteredvenganza-coder';
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO || 'venganza-portfolio';
const BRANCH = 'main';

const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

function headers() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

async function apiCall(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

// Get file content from repo
export async function getFile(path) {
  try {
    const data = await apiCall(`/contents/${path}?ref=${BRANCH}`);
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
    const data = await apiCall(`/contents/${path}?ref=${BRANCH}`);
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
    branch: BRANCH,
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
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
}

// Upload binary file (image) — base64 encoded
export async function uploadImage(path, base64Content, message) {
  let sha = null;
  try {
    const existing = await apiCall(`/contents/${path}?ref=${BRANCH}`);
    sha = existing.sha;
  } catch (e) {
    // File doesn't exist, that's fine
  }

  const body = {
    message,
    content: base64Content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  return apiCall(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
