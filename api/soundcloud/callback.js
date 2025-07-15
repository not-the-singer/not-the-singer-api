import { createCorsResponse, createErrorResponse } from '../utils/cors.js';

export default async function handler(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return createErrorResponse('Missing authorization code', 400);
  }
  
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
  const redirectUri = 'https://not-the-singer-api.vercel.app/api/soundcloud/callback';
  
  try {
    const tokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code
      })
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    return createCorsResponse({ 
      message: 'Success! Add these to your Vercel environment variables:',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token  // This is what we need!
    });
    
  } catch (error) {
    return createErrorResponse(error.message, 500);
  }
}
