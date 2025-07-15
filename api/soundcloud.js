export const config = {
  runtime: 'edge',
};

// Helper function to add CORS headers
function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Simple token manager for Edge Runtime
class EdgeTokenManager {
  static async refreshTokenIfNeeded() {
    // For Edge Runtime, we'll use environment variables directly
    // In a production environment, you might want to use Vercel KV or another edge-compatible storage
    const refreshToken = process.env.SOUNDCLOUD_REFRESH_TOKEN;
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return await this.refreshToken(refreshToken);
  }

  static async refreshToken(refreshToken) {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;

    const response = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }
}

export default async function handler(request) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new Response(null, { status: 200 });
    return addCorsHeaders(response);
  }

  try {
    // Get fresh access token using EdgeTokenManager
    const accessToken = await EdgeTokenManager.refreshTokenIfNeeded();
    
    // Use the fresh token for the API call
    const response = await fetch('https://api.soundcloud.com/me/tracks?limit=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
      throw new Error(`SoundCloud API returned ${response.status}`);
    }
    
    const data = await response.json();
    const jsonResponse = new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(jsonResponse);
  } catch (error) {
    console.error('SoundCloud API error:', error);
    const errorResponse = new Response(JSON.stringify({ 
      error: 'Failed to fetch from SoundCloud', 
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(errorResponse);
  }
}
