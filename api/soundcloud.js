export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    let accessToken = process.env.SOUNDCLOUD_ACCESS_TOKEN;
    
    // Try the API call first
    let response = await fetch('https://api.soundcloud.com/me/tracks?limit=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    // If token expired (401), refresh it
    if (response.status === 401) {
      console.log('Token expired, refreshing...');
      
      const refreshResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.SOUNDCLOUD_CLIENT_ID,
          client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
          refresh_token: process.env.SOUNDCLOUD_REFRESH_TOKEN
        })
      });
      
      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json();
        accessToken = tokenData.access_token;
        
        // Try the API call again with new token
        response = await fetch('https://api.soundcloud.com/me/tracks?limit=50', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
      }
    }
    
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
