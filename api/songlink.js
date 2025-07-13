export default async function handler(req, res) {
  // Set specific CORS headers for your domain
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { spotifyUrl } = req.query;
  
  if (!spotifyUrl) {
    return res.status(400).json({ error: 'Missing spotifyUrl parameter' });
  }

  try {
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Songlink API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Songlink API error:', error);
    res.status(500).json({ error: 'Failed to fetch from Songlink', details: error.message });
  }
}
