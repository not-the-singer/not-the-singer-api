import { createCorsResponse, createErrorResponse, handleOptions } from './utils/cors.js';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return handleOptions();
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
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Spotify token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    // Get albums
    const albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&limit=50`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!albumsResponse.ok) {
      throw new Error(`Spotify albums request failed: ${albumsResponse.status}`);
    }

    const albumsData = await albumsResponse.json();

    return createCorsResponse(albumsData.items);
  } catch (error) {
    console.error('Spotify API Error:', error);
    return createErrorResponse({
      error: 'Failed to fetch albums',
      details: error.message
    }, 500);
  }
}
