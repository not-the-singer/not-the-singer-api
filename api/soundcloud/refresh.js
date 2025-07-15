import TokenManager from './token-manager';

export default async function handler(req, res) {
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
