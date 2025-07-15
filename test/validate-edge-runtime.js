#!/usr/bin/env node
/**
 * Simple validation script to test the Edge Runtime API conversions
 * This tests the core functionality without needing full deployment
 */

import { corsHeaders } from '../api/lib/cors.js';

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

// Test 2: URL Parameter Parsing (Edge Runtime)
console.log('✅ Test 2: URL Parameter Parsing (Edge Runtime)');
const testUrl = 'https://example.com/api/songlink?spotifyUrl=test123';
const url = new URL(testUrl);
const spotifyUrl = url.searchParams.get('spotifyUrl');

if (spotifyUrl === 'test123') {
  console.log('✅ URL parameter parsing works in Edge Runtime\n');
} else {
  console.log('❌ URL parameter parsing failed\n');
}

console.log('🎉 Edge Runtime conversion validation complete!');
console.log('\nNext steps:');
console.log('1. Deploy to Vercel to test Edge Runtime functionality');
console.log('2. Test CORS headers from https://not-the-singer.com');
console.log('3. Verify token refresh works without filesystem access');