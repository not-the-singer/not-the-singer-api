import TokenManager from './token-manager.js';
import { createCorsResponse, createErrorResponse, handleOptions } from '../utils/cors.js';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const newTokens = await TokenManager.refreshToken();
    await TokenManager.saveTokens(newTokens);
    
    return createCorsResponse({ 
      success: true,
      message: 'Token refreshed and saved successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return createErrorResponse('Failed to refresh token', 500);
  }
}
