const KEY = 'venganza_webhook_url';

export const getWebhookUrl = ()  => localStorage.getItem(KEY) ?? '';
export const saveWebhookUrl = url =>
  url?.trim() ? localStorage.setItem(KEY, url.trim()) : localStorage.removeItem(KEY);

export async function fireWebhook(payload) {
  const url = getWebhookUrl();
  if (!url) return;
  try {
    // mode: no-cors perché Zapier/Make non restituiscono header CORS
    await fetch(url, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'content-type': 'application/json' },
      body:    JSON.stringify({ ...payload, source: 'Venganza OS', ts: new Date().toISOString() }),
    });
  } catch (e) {
    console.warn('[webhook] failed:', e.message);
  }
}
