import { NextResponse } from 'next/server';
import { corsHeaders } from '../lib/cors';

export const runtime = 'edge';

export default async function handler(req) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  try {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'SOUNDCLOUD_CLIENT_ID is not set' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    const redirectUri = 'https://not-the-singer-api.vercel.app/api/soundcloud/callback';
    
    const authUrl = `https://secure.soundcloud.com/connect?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=non-expiring`;
    
    return NextResponse.redirect(authUrl, { status: 307 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
