import { createCorsResponse, createErrorResponse, handleOptions } from './utils/cors.js';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  const url = new URL(req.url);
  const spotifyUrl = url.searchParams.get('spotifyUrl');
  
  if (!spotifyUrl) {
    return createErrorResponse('Missing spotifyUrl parameter', 400);
  }

  try {
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Songlink API returned ${response.status}`);
    }
    
    const data = await response.json();
    return createCorsResponse(data);
  } catch (error) {
    console.error('Songlink API error:', error);
    return createErrorResponse({
      error: 'Failed to fetch from Songlink',
      details: error.message
    }, 500);
  }
}
