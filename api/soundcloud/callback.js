import { NextResponse } from 'next/server';
import { corsHeaders } from '../lib/cors';

export const runtime = 'edge';

export default async function handler(req) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
    const redirectUri = 'https://not-the-singer-api.vercel.app/api/soundcloud/callback';

    // Exchange the code for tokens
    const response = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token exchange error:', error);
      return NextResponse.json(
        { error: 'Failed to exchange code for tokens' },
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await response.json();
    
    // Return the tokens in a readable format
    return NextResponse.json(
      {
        message: 'Authorization successful! Here are your tokens:',
        refresh_token: data.refresh_token,
        access_token: data.access_token,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
