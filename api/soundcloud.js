export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(`https://api.soundcloud.com/users/not-the-singer/tracks?client_id=vEx486GxbqAU2g0jtqYm3Vro4Lfc3Aty&limit=50`);
    
    if (!response.ok) {
      throw new Error(`SoundCloud API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('SoundCloud API error:', error);
    res.status(500).json({ error: 'Failed to fetch from SoundCloud', details: error.message });
  }
}
