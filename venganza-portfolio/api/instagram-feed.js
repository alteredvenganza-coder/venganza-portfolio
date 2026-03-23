export default async function handler(req, res) {
  const token = process.env.VITE_INSTAGRAM_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Instagram token not configured on server' });
  }

  try {
    // Paginated fetch to get ALL posts
    let allPosts = [];
    let url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${token}`;

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

    return res.status(200).json({ data: premades, total: allPosts.length });
  } catch (err) {
    console.error('Instagram feed error:', err);
    return res.status(500).json({ error: err.message });
  }
}
