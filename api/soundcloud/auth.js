export default async function handler(req, res) {
  try {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    
    if (!clientId) {
      return res.status(500).json({ error: 'SOUNDCLOUD_CLIENT_ID is not set' });
    }
    
    const redirectUri = 'https://not-the-singer-api.vercel.app/api/soundcloud/callback';
    
    const authUrl = `https://secure.soundcloud.com/connect?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=non-expiring`;
    
    // Instead of using NextResponse.redirect, use standard res.redirect
    res.redirect(307, authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
}
