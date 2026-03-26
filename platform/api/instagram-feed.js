// In-memory cache (persists across warm invocations)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  const token = process.env.INSTAGRAM_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Instagram token not configured on server' });
  }

  // Return cached data if fresh
  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  try {
    // Paginated fetch to get ALL posts
    let allPosts = [];
    let url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=100&access_token=${token}`;

    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: `Instagram API error: ${response.status}`, details: err });
      }
      const data = await response.json();
      allPosts = [...allPosts, ...(data.data || [])];
      url = data.paging?.next || null;
    }

    // Filter posts with #premade
    const premades = allPosts.filter(post => {
      const caption = (post.caption || '').toLowerCase();
      return caption.includes('#premade') && (post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM');
    });

    const result = { data: premades, total: allPosts.length };

    // Update cache
    cache = { data: result, timestamp: now };

    // Tell Vercel Edge to cache for 5 min, serve stale for 10 min while revalidating
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(result);
  } catch (err) {
    console.error('Instagram feed error:', err);
    return res.status(500).json({ error: err.message });
  }
}
