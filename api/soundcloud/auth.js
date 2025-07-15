import { NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function handler(req) {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const redirectUri = 'https://not-the-singer-api.vercel.app/api/soundcloud/callback';
  
  const authUrl = `https://secure.soundcloud.com/connect?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=non-expiring`;
  
  return NextResponse.redirect(authUrl);
}
