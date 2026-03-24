// Returns the latest VIDEO/REEL post from Instagram
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000;

export default async function handler(req, res) {
  const token = process.env.VITE_INSTAGRAM_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Instagram token not configured on server' });
  }

  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(cache.data);
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${token}`
    );
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Instagram API error: ${response.status}`, details: err });
    }
    const { data: posts } = await response.json();

    // Find latest VIDEO post (reel)
    const reel = (posts || []).find(p => p.media_type === 'VIDEO') || null;

    const result = { reel };
    cache = { data: result, timestamp: now };

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
