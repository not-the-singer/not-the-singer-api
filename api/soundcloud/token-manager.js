import { kv } from '@vercel/kv';

class TokenManager {
  constructor() {
    this.tokenKey = 'soundcloud:tokens';
  }

  async loadTokens() {
    try {
      // Try to load from KV store first
      const tokens = await kv.get(this.tokenKey);
      if (tokens) {
        return tokens;
      }
      
      // Fallback to environment variables if KV is not available
      const accessToken = process.env.SOUNDCLOUD_ACCESS_TOKEN;
      const refreshToken = process.env.SOUNDCLOUD_REFRESH_TOKEN;
      const expiry = process.env.SOUNDCLOUD_TOKEN_EXPIRY;
      
      if (accessToken && refreshToken) {
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          access_token_expiry: expiry || null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading tokens:', error);
      return null;
    }
  }

  async saveTokens(tokens) {
    try {
      await kv.set(this.tokenKey, tokens);
    } catch (error) {
      console.error('Error saving tokens to KV:', error);
      // KV might not be available in development or if not configured
      // This is acceptable as tokens can be managed via environment variables
    }
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

    if (!refreshToken) {
      throw new Error('No refresh token available');
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
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      access_token_expiry: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
  }
}

export default new TokenManager();
