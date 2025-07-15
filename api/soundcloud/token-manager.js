// Remove filesystem dependencies and just use env vars
const TokenManager = {
  async refreshTokenIfNeeded() {
    return this.refreshToken();
  },
  
  async refreshToken() {
    const refreshToken = process.env.SOUNDCLOUD_REFRESH_TOKEN;
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Missing required SoundCloud environment variables');
    }

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
    return data.access_token;
  }
};

export default TokenManager;
