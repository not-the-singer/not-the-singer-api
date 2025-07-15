import TokenManager from './soundcloud/token-manager';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get fresh access token using TokenManager
    const accessToken = await TokenManager.refreshTokenIfNeeded();
    
    // Use the fresh token for the API call
    const response = await fetch('https://api.soundcloud.com/me/tracks?limit=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      throw new Error(`SoundCloud API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('SoundCloud API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from SoundCloud', 
      details: error.message 
    });
  }
}
