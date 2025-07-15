export default async function handler(req, res) {
  try {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
    const refreshToken = process.env.SOUNDCLOUD_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(500).json({ error: 'Missing required environment variables' });
    }

    // Exchange refresh token for a new access token
    const response = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token refresh error:', error);
      return res.status(500).json({ error: 'Failed to refresh access token' });
    }

    const data = await response.json();
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: error.message });
  }
}
