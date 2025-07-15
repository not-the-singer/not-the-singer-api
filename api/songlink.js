import { NextResponse } from 'next/server';
import { corsHeaders } from './lib/cors';

export const runtime = 'edge';

export default async function handler(req) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  const { searchParams } = new URL(req.url);
  const spotifyUrl = searchParams.get('spotifyUrl');
  
  if (!spotifyUrl) {
    return NextResponse.json(
      { error: 'Missing spotifyUrl parameter' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Songlink API returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('Songlink API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Songlink', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
