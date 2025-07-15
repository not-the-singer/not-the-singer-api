const fs = require('fs').promises;
const path = require('path');

class TokenManager {
  constructor() {
    this.tokenPath = path.join(process.cwd(), 'data', 'soundcloud-tokens.json');
  }

  async loadTokens() {
    try {
      const data = await fs.readFile(this.tokenPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async saveTokens(tokens) {
    await fs.mkdir(path.dirname(this.tokenPath), { recursive: true });
    await fs.writeFile(this.tokenPath, JSON.stringify(tokens, null, 2));
  }

  async refreshTokenIfNeeded() {
    const tokens = await this.loadTokens();
    
    // If no tokens exist or access token is expired/near expiry
    if (!tokens || this.isTokenExpired(tokens.access_token_expiry)) {
      const newTokens = await this.refreshToken(tokens?.refresh_token);
      await this.saveTokens(newTokens);
      return newTokens.access_token;
    }

    return tokens.access_token;
  }

  isTokenExpired(expiryTime) {
    // Check if token expires in less than 1 hour
    return !expiryTime || new Date(expiryTime).getTime() - Date.now() < 3600000;
  }

  async refreshToken(refreshToken) {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
    refreshToken = refreshToken || process.env.SOUNDCLOUD_REFRESH_TOKEN;

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
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      access_token_expiry: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
  }
}

module.exports = new TokenManager();
