import { NextResponse } from 'next/server';
import TokenManager from './token-manager';
import { corsHeaders } from '../lib/cors';

export const runtime = 'edge';

export default async function handler(req) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const accessToken = await TokenManager.refreshToken();
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Token refreshed successfully',
        access_token: accessToken
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500, headers: corsHeaders }
    );
  }
}
