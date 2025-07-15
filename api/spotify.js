export default async function handler(req, res) {
  // Set CORS headers for https://not-the-singer.com
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const ARTIST_ID = '50imQLsQADUBJTKncqsb3I';

  try {
    // Get access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();

    // Get albums
    const albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&limit=50`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const albumsData = await albumsResponse.json();

    res.status(200).json(albumsData.items);
  } catch (error) {
    console.error('Spotify API Error:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
}
