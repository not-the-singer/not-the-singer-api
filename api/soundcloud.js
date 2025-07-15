import TokenManager from './soundcloud/token-manager.js';
import { createCorsResponse, createErrorResponse, handleOptions } from './utils/cors.js';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return handleOptions();
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
    return createCorsResponse(data);
  } catch (error) {
    console.error('SoundCloud API error:', error);
    return createErrorResponse({
      error: 'Failed to fetch from SoundCloud',
      details: error.message
    }, 500);
  }
}
