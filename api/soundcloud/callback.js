export default async function handler(req, res) {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
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
      return res.status(500).json({ error: 'Failed to exchange code for tokens' });
    }

    const data = await response.json();
    
    // Return the tokens in a readable format
    return res.status(200).json({
      message: 'Authorization successful! Here are your tokens:',
      refresh_token: data.refresh_token,
      access_token: data.access_token,
    });
  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).json({ error: error.message });
  }
}
