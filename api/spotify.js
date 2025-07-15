import { NextResponse } from 'next/server';
import { corsHeaders } from './lib/cors';

export const runtime = 'edge';

export default async function handler(req) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
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

    const tokenData = await tokenResponse.json();

    // Get albums
    const albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&limit=50`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const albumsData = await albumsResponse.json();

    return NextResponse.json(albumsData.items, { headers: corsHeaders });
  } catch (error) {
    console.error('Spotify API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500, headers: corsHeaders }
    );
  }
}
