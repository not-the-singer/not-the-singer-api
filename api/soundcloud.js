import { NextResponse } from 'next/server';
import TokenManager from './soundcloud/token-manager';
import { corsHeaders } from './lib/cors';

export const runtime = 'edge';

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  // If we have a cached token that's not expired, use it
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Otherwise, get a new token
  const response = await fetch('/api/soundcloud/token');
  const data = await response.json();
  
  // Cache the new token and set expiry
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety
  
  return cachedToken;
}

export async function callSoundCloudApi(endpoint) {
  const token = await getAccessToken();
  
  const response = await fetch(`https://api.soundcloud.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

export default async function handler(req) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
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
    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('SoundCloud API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from SoundCloud', 
        details: error.message 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
