export default async function handler(req, res) {
  const { spotifyUrl } = req.query;
  
  if (!spotifyUrl) {
    return res.status(400).json({ error: 'Missing spotifyUrl parameter' });
  }

  try {
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Songlink' });
  }
}
