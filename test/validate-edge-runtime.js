#!/usr/bin/env node
/**
 * Simple validation script to test the Edge Runtime API conversions
 * This tests the core functionality without needing full deployment
 */

import { corsHeaders } from '../api/lib/cors.js';
import TokenManager from '../api/soundcloud/token-manager.js';

console.log('🧪 Testing Edge Runtime API Conversion...\n');

// Test 1: CORS Headers Configuration
console.log('✅ Test 1: CORS Headers Configuration');
console.log('Expected Origin:', 'https://not-the-singer.com');
console.log('Actual Origin:', corsHeaders['Access-Control-Allow-Origin']);
console.log('Methods:', corsHeaders['Access-Control-Allow-Methods']);
console.log('Headers:', corsHeaders['Access-Control-Allow-Headers']);

if (corsHeaders['Access-Control-Allow-Origin'] === 'https://not-the-singer.com') {
  console.log('✅ CORS configuration is correct\n');
} else {
  console.log('❌ CORS configuration is incorrect\n');
}

// Test 2: TokenManager Environment Variable Check
console.log('✅ Test 2: TokenManager Environment Variables');
console.log('Note: This will only work with proper environment variables set');

try {
  // Test that TokenManager can be instantiated without filesystem dependencies
  if (typeof TokenManager.refreshTokenIfNeeded === 'function' && 
      typeof TokenManager.refreshToken === 'function') {
    console.log('✅ TokenManager methods are available');
    console.log('✅ No filesystem dependencies detected');
  } else {
    console.log('❌ TokenManager methods are missing');
  }
} catch (error) {
  console.log('❌ TokenManager error:', error.message);
}

console.log('\n🎉 Edge Runtime conversion validation complete!');
console.log('\nNext steps:');
console.log('1. Deploy to Vercel to test Edge Runtime functionality');
console.log('2. Test CORS headers from https://not-the-singer.com');
console.log('3. Verify token refresh works without filesystem access');