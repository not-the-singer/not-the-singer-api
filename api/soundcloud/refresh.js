import TokenManager from './token-manager';

export default async function handler(req, res) {
  // Set CORS headers for https://not-the-singer.com
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const newTokens = await TokenManager.refreshToken();
    await TokenManager.saveTokens(newTokens);
    
    res.status(200).json({ 
      success: true,
      message: 'Token refreshed and saved successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
}
