import { NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
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
    
    const tokenData = await tokenResponse.json();
    
    return NextResponse.json({ 
      message: 'Success! Add these to your Vercel environment variables:',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token  // This is what we need!
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
