export const config = {
  runtime: 'edge',
};

// Helper function to add CORS headers
function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Simple token manager for Edge Runtime
class EdgeTokenManager {
  static async refreshToken(refreshToken) {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
    refreshToken = refreshToken || process.env.SOUNDCLOUD_REFRESH_TOKEN;

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
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      access_token_expiry: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
  }
}

export default async function handler(request) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new Response(null, { status: 200 });
    return addCorsHeaders(response);
  }

  if (request.method !== 'POST') {
    const response = new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return addCorsHeaders(response);
  }

  try {
    const newTokens = await EdgeTokenManager.refreshToken();
    
    // In Edge Runtime, we can't easily save to filesystem
    // In production, you'd want to save these tokens to a database or KV store
    // For now, we'll just return them
    const successResponse = new Response(JSON.stringify({ 
      success: true,
      message: 'Token refreshed successfully',
      tokens: newTokens // In production, you might not want to return tokens in the response
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(successResponse);
  } catch (error) {
    console.error('Token refresh error:', error);
    const errorResponse = new Response(JSON.stringify({ 
      error: 'Failed to refresh token',
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
